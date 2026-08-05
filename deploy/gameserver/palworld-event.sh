#!/usr/bin/env bash
# =============================================================================
# palworld-event.sh - automatische Event-Wochenenden
#
# Dreht JEDES Wochenende ausgewaehlte Raten in der PalWorldSettings.ini
# hoch und setzt sie danach EXAKT auf die gemerkten Originalwerte zurueck.
# Welches Event laeuft, rotiert automatisch nach Kalenderwoche (EVENT_LIST);
# EVENT_OFFSET verschiebt die Rotation (Kalibrierung, welches Event
# "als naechstes" dran ist).
#
# Ablauf (haengt sich an die regulaeren Wartungs-Neustarts, KEIN zusaetzlicher):
#   Freitag  17:50  start --no-restart -> nur Ini patchen; der 17:55-Neustart
#                             traegt die Werte mit seiner ueblichen Vorwarnung ein
#   Montag   04:45  stop   -> Originalwerte zuruecksetzen, ebenfalls ohne
#                             eigenen Neustart: der 04:55-Neustart uebernimmt
#                             (Server 2: 05:45 vor dessen 05:55-Neustart)
#
# Ohne --no-restart startet "start" selbst neu (fuer manuelle Eventstarts).
#   taeglich 12:00  guard  -> setzt verwaiste Events zwangsweise zurueck,
#                             falls der Montag-Lauf ausgefallen ist
#
# Alles idempotent: start bei laufendem Event und stop ohne Event sind stille
# No-Ops - doppelt feuernde Crons koennen nichts kaputt machen.
#
# Aufrufe:
#   palworld-event.sh start [--first-weekend-only] [--event NAME|NR]
#                           [--no-restart] [--dry-run]
#   palworld-event.sh stop [--restart] [--dry-run]  # --restart = sofort neu starten
#   palworld-event.sh guard
#   palworld-event.sh status
#
# --dry-run zeigt nur, was passieren wuerde (Event, Ini, alte -> neue Werte)
# und fasst weder Ini noch Server an.
#
# Vor dem Patchen legt "start" eine Kopie der Ini als <ini>.pre-event ab -
# Notnagel, falls die State-Datei verlorengeht: einfach zurueckkopieren.
#
# Konfiguration: palworld-scripts.conf (EVENT_*-Block, siehe Beispiel-Conf).
# Test-Hooks: EVENT_FORCE_DOM / EVENT_FORCE_MONTH ueberschreiben das Datum,
# EVENT_SKIP_RESTART=true unterdrueckt den Neustart (nur fuer Tests).
# =============================================================================
set -euo pipefail
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- Defaults (werden durch die Conf-Datei ueberschrieben) ---------------------
INSTALL_DIR="/home/palworld/palserver"
SAVED_DIR=""
DISCORD_WEBHOOK=""
DISCORD_SERVER_NAME=""
UPLOAD_URL=""
UPLOAD_SECRET=""

EVENT_ENABLED=true
EVENT_INI=""                                   # leer = automatisch suchen
EVENT_STATE="/var/lib/palworld/event.json"
EVENT_MAX_HOURS=70                             # Fr 18 -> Mo 5 sind 59 h + Puffer
EVENT_APPLY_GRACE_H=12                         # so lange darf ein gepatchtes
                                               # Event auf seinen Neustart warten
EVENT_BANNER=true                              # Website-Banner setzen/entfernen?
EVENT_OFFSET=0                                 # verschiebt die Wochen-Rotation
LOCKFILE="/var/lock/palworld-autoupdate.lock"  # Lock des Update-Skripts
RESTART_MARKER="/run/palworld-restart-done"    # wie in palworld-autoupdate.sh
EVENT_LOCK_WAIT=600                            # so lange auf ein laufendes
                                               # Update/Neustart warten
# Rotation nach Kalenderwoche: Eintrag = "Name|Ansage-/Banner-Text|Aenderungen"
# Aenderungen: KEY*FAKTOR (multipliziert den aktuellen Wert) oder KEY=WERT
EVENT_LIST=(
  "Drop-Wochenende|💰 Event-Wochenende: Doppelte Drops von Gegnern – bis Montag früh!|EnemyDropItemRate*2"
  "Ranch-Wochenende|🥚 Event-Wochenende: Farm-Pals produzieren 3x so schnell – bis Montag früh!|MonsterFarmActionSpeedRate*3"
  "Safari-Wochenende|🎯 Event-Wochenende: Fangrate um 50 % erhöht – bis Montag früh!|PalCaptureRate*1.5"
  "Sammler-Wochenende|⛏️ Event-Wochenende: Doppelte Sammel-Erträge & halbes Gewicht – bis Montag früh!|CollectionDropRate*2 ItemWeightRate*0.5"
  "Supply-Wochenende|📦 Event-Wochenende: Versorgungsabwürfe alle 10 Minuten – bis Montag früh!|SupplyDropSpan=10"
)

# Conf-Suche: $PALWORLD_CONF, dann neben dem Skript, dann /etc/palworld.
CONF="${PALWORLD_CONF:-}"
if [ -z "$CONF" ]; then
  for c in "${SCRIPT_DIR}/palworld-scripts.conf" /etc/palworld/palworld-scripts.conf; do
    if [ -f "$c" ]; then CONF="$c"; break; fi
  done
fi
# shellcheck disable=SC1090
[ -n "$CONF" ] && [ -f "$CONF" ] && . "$CONF"
SAVED_DIR="${SAVED_DIR:-${INSTALL_DIR}/Pal/Saved}"

DRY_RUN=false
log() { echo "[$(date '+%F %T')] $*"; }

# Discord-Helfer der anderen Skripte mitbenutzen (weiche Abhaengigkeit)
if [ -f "${SCRIPT_DIR}/palworld-discord.sh" ]; then
  # shellcheck disable=SC1091
  . "${SCRIPT_DIR}/palworld-discord.sh"
else
  DC_GREEN=3066993; DC_BLUE=3447003; DC_ORANGE=15105570; DC_RED=15158332
  notify_discord() { :; }
fi
DC_GREEN=3066993
DC_ORANGE=15105570

# --- Ini finden ----------------------------------------------------------------
find_ini() {
  if [ -n "$EVENT_INI" ]; then
    echo "$EVENT_INI"
    return
  fi
  local hit
  hit=$(find "$SAVED_DIR/Config" -name PalWorldSettings.ini 2>/dev/null | head -1 || true)
  if [ -z "$hit" ]; then
    echo "FEHLER: PalWorldSettings.ini nicht unter ${SAVED_DIR}/Config gefunden." >&2
    echo "        EVENT_INI in der Conf setzen." >&2
    exit 1
  fi
  echo "$hit"
}

# --- Werte in der OptionSettings-Zeile lesen/schreiben --------------------------
ini_get() {  # ini_get DATEI KEY -> aktueller Zahlenwert
  grep -oE "[(,]${2}=[^,)]*" "$1" | head -1 | cut -d= -f2
}

ini_set() {  # ini_set DATEI KEY WERT (nur Zahlen erlaubt)
  local file="$1" key="$2" val="$3"
  case "$val" in
    ''|*[!0-9.]*) echo "FEHLER: unerlaubter Wert '$val' fuer $key" >&2; return 1 ;;
  esac
  sed -E -i "s/([(,])${key}=[^,)]*/\1${key}=${val}/" "$file"
  [ "$(ini_get "$file" "$key")" = "$val" ] || {
    echo "FEHLER: $key liess sich nicht auf $val setzen." >&2
    return 1
  }
}

# --- Datum (mit Test-Hooks) -----------------------------------------------------
today_dom()  { echo "${EVENT_FORCE_DOM:-$(date +%-d)}"; }
today_week() { echo "$(( 10#${EVENT_FORCE_WEEK:-$(date +%V)} ))"; }

# --- Event aus der Rotation waehlen ---------------------------------------------
pick_event() {  # [NAME|NR] -> setzt EV_NAME, EV_TEXT, EV_CHANGES
  local want="${1:-}" idx
  local count=${#EVENT_LIST[@]}
  if [ -n "$want" ]; then
    if [[ "$want" =~ ^[0-9]+$ ]]; then
      idx=$(( (want - 1) % count ))
    else
      idx=-1
      for i in "${!EVENT_LIST[@]}"; do
        [[ "${EVENT_LIST[$i]}" == "${want}|"* ]] && idx=$i
      done
      [ "$idx" -ge 0 ] || { echo "FEHLER: Event '$want' nicht in EVENT_LIST." >&2; exit 1; }
    fi
  else
    idx=$(( ($(today_week) + EVENT_OFFSET) % count ))
  fi
  IFS='|' read -r EV_NAME EV_TEXT EV_CHANGES <<< "${EVENT_LIST[$idx]}"
}

# --- Website-Banner -------------------------------------------------------------
banner() {  # banner true|false [TEXT]
  [ "$EVENT_BANNER" = "true" ] || return 0
  [ -n "$UPLOAD_URL" ] && [ -n "$UPLOAD_SECRET" ] || return 0
  curl -sS -m 15 -X POST "${UPLOAD_URL%/}/api/banner/event" \
    -H "Content-Type: application/json" \
    -H "X-Upload-Secret: ${UPLOAD_SECRET}" \
    -d "$(jq -nc --argjson e "$1" --arg t "${2:-}" \
          '{enabled:$e, text:$t, level:"event"}')" >/dev/null \
    || log "WARNUNG: Website-Banner liess sich nicht setzen (Webseite erreichbar?)"
}

# --- Neustart ueber das Update-Skript -------------------------------------------
# palworld-autoupdate.sh endet auch dann mit 0, wenn es wegen eines belegten
# Locks gar nichts getan hat. Deshalb den Neustart-Marker vorher/nachher
# vergleichen - nur eine neue Zeitmarke heisst "wirklich neu gestartet".
restart_server() {  # restart_server GRUND -> 0 = neu gestartet, 1 = nicht
  if [ "${EVENT_SKIP_RESTART:-false}" = "true" ]; then
    log "Test-Modus: Neustart uebersprungen (${1})"
    return 0
  fi
  local before after
  before=$(cat "$RESTART_MARKER" 2>/dev/null || echo 0)
  "${SCRIPT_DIR}/palworld-autoupdate.sh" --force-restart --reason "$1" || true
  after=$(cat "$RESTART_MARKER" 2>/dev/null || echo 0)
  [ "$after" != "$before" ]
}

# Vermerkt im Zustand, dass die Werte durch einen Neustart wirksam wurden.
mark_restarted() {
  [ -f "$EVENT_STATE" ] || return 0
  local tmp; tmp=$(jq -c '.restarted = true' "$EVENT_STATE") || return 0
  printf '%s\n' "$tmp" > "$EVENT_STATE"
}

# --- Kommandos ------------------------------------------------------------------
cmd_start() {
  local first_only=false want="" do_restart=true
  while [ $# -gt 0 ]; do
    case "$1" in
      --first-weekend-only) first_only=true ;;
      --no-restart) do_restart=false ;;
      --dry-run) DRY_RUN=true ;;
      --event) want="$2"; shift ;;
      *) echo "Unbekannte Option: $1" >&2; exit 2 ;;
    esac
    shift
  done

  [ "$EVENT_ENABLED" = "true" ] || { log "Events sind deaktiviert (EVENT_ENABLED)."; return 0; }
  if [ "$first_only" = "true" ] && [ "$(today_dom)" -gt 7 ]; then
    log "Kein Event-Wochenende (nicht das erste im Monat)."
    return 0
  fi
  if [ -f "$EVENT_STATE" ]; then
    log "Event laeuft bereits ($(jq -r .name "$EVENT_STATE" 2>/dev/null || echo '?')) - nichts zu tun."
    return 0
  fi

  # Waehrend Update/Neustart nicht an der Ini schrauben - der Server liest sie
  # beim Start. Das Lock wird VOR dem eigenen Neustart wieder freigegeben,
  # sonst wuerde palworld-autoupdate.sh am eigenen Lock haengenbleiben.
  exec 9>"$LOCKFILE"
  if [ "$DRY_RUN" = "true" ]; then
    if flock -n 9; then
      flock -u 9; log "[dry-run] Update-Lock ist frei, ein echter Lauf koennte sofort starten."
    else
      log "[dry-run] Update/Neustart laeuft - ein echter Lauf wuerde bis zu ${EVENT_LOCK_WAIT}s warten."
    fi
  elif ! flock -w "$EVENT_LOCK_WAIT" 9; then
    log "Update/Neustart laeuft seit ueber ${EVENT_LOCK_WAIT}s - Event-Start verschoben."
    return 0
  fi

  pick_event "$want"
  local ini; ini=$(find_ini)
  [ "$DRY_RUN" = "true" ] || log "Starte ${EV_NAME}: ${EV_CHANGES} (Ini: ${ini})"

  # Aenderungen berechnen (Originalwerte VOR dem Patchen einsammeln)
  local changes="[]" key spec cur new
  for spec in $EV_CHANGES; do
    if [[ "$spec" == *"*"* ]]; then
      key="${spec%%\**}"
      cur=$(ini_get "$ini" "$key")
      [ -n "$cur" ] || { echo "FEHLER: ${key} nicht in der Ini gefunden." >&2; exit 1; }
      # LC_ALL=C: gawk wuerde unter de_DE "1,875000" ausgeben - ein Komma in der
      # OptionSettings-Zeile waere fatal. ini_set faengt es zwar ab, aber dann
      # startet das Event gar nicht erst.
      new=$(LC_ALL=C awk -v a="$cur" -v f="${spec#*\*}" 'BEGIN{printf "%.6f", a*f}')
    else
      key="${spec%%=*}"
      cur=$(ini_get "$ini" "$key")
      [ -n "$cur" ] || { echo "FEHLER: ${key} nicht in der Ini gefunden." >&2; exit 1; }
      new="${spec#*=}"
    fi
    changes=$(jq -c --arg k "$key" --arg o "$cur" --arg n "$new" \
      '. + [{key:$k, old:$o, new:$n}]' <<< "$changes")
  done

  if [ "$DRY_RUN" = "true" ]; then
    log "[dry-run] Event:  ${EV_NAME}"
    log "[dry-run] Ini:    ${ini}"
    jq -r '.[] | "  \(.key): \(.old) -> \(.new)"' <<< "$changes" \
      | while IFS= read -r line; do log "[dry-run] Wert: ${line#  }"; done
    log "[dry-run] Danach: Neustart ueber palworld-autoupdate.sh, Discord-Embed$([ "$EVENT_BANNER" = "true" ] && echo " und Website-Banner")"
    log "[dry-run] Fertig - es wurde nichts veraendert."
    return 0
  fi

  # Erst den Zustand sichern, DANN patchen - bricht das Patchen ab, weiss
  # der naechste Lauf trotzdem, was zurueckzusetzen ist
  mkdir -p "$(dirname "$EVENT_STATE")"
  jq -nc --arg name "$EV_NAME" --arg text "$EV_TEXT" --arg ini "$ini" \
    --arg started "$(date -Is)" --argjson patched "$(date +%s)" \
    --argjson changes "$changes" \
    '{name:$name, text:$text, ini:$ini, started:$started, patched_at:$patched,
      restarted:false, changes:$changes}' \
    > "$EVENT_STATE"
  cp -p "$ini" "${ini}.pre-event"

  local n
  for n in $(jq -c '.changes[]' "$EVENT_STATE"); do
    ini_set "$ini" "$(jq -r .key <<< "$n")" "$(jq -r .new <<< "$n")"
  done
  log "Ini gepatcht: $(jq -r '[.changes[] | "\(.key) \(.old)->\(.new)"] | join(", ")' "$EVENT_STATE")"

  flock -u 9   # freigeben, damit das Update-Skript neu starten kann
  if [ "$do_restart" != "true" ]; then
    log "Kein eigener Neustart (--no-restart) - der naechste Wartungs-Neustart"
    log "traegt die Werte ein. Der Waechter meldet sich, falls das ausbleibt."
  elif restart_server "Event-Start: ${EV_NAME}"; then
    mark_restarted
    log "Server mit den Event-Werten neu gestartet."
  else
    log "WARNUNG: Neustart kam nicht zustande (laeuft gerade ein Update?)."
    log "Die Werte stehen in der Ini und greifen beim naechsten Neustart."
  fi
  banner true "$EV_TEXT"
  notify_discord "🎉 ${EV_NAME} gestartet${DISCORD_SERVER_NAME:+ – $DISCORD_SERVER_NAME}" \
    "${EV_TEXT}"$'\n'"$(jq -r '[.changes[] | "\(.key): \(.old) → \(.new)"] | join("\n")' "$EVENT_STATE")" \
    "$DC_GREEN" || true
  log "${EV_NAME} laeuft."
}

cmd_stop() {
  local do_restart=false
  while [ $# -gt 0 ]; do
    case "$1" in
      --restart) do_restart=true ;;
      --dry-run) DRY_RUN=true ;;
      *) echo "Unbekannte Option: $1" >&2; exit 2 ;;
    esac
    shift
  done
  if [ ! -f "$EVENT_STATE" ]; then
    log "Kein Event aktiv - nichts zu tun."
    return 0
  fi
  exec 9>"$LOCKFILE"
  if [ "$DRY_RUN" = "true" ]; then
    if flock -n 9; then
      flock -u 9; log "[dry-run] Update-Lock ist frei."
    else
      log "[dry-run] Update/Neustart laeuft - ein echter Lauf wuerde warten."
    fi
  elif ! flock -w "$EVENT_LOCK_WAIT" 9; then
    log "Update/Neustart laeuft seit ueber ${EVENT_LOCK_WAIT}s - Event-Ende verschoben."
    return 0
  fi

  local name ini n
  name=$(jq -r .name "$EVENT_STATE")
  ini=$(jq -r .ini "$EVENT_STATE")
  if [ "$DRY_RUN" = "true" ]; then
    log "[dry-run] Wuerde ${name} beenden und in ${ini} zuruecksetzen:"
    jq -r '.changes[] | "  \(.key): \(.new) -> \(.old)"' "$EVENT_STATE" \
      | while IFS= read -r line; do log "[dry-run] Wert: ${line#  }"; done
    log "[dry-run] Fertig - es wurde nichts veraendert."
    return 0
  fi
  log "Beende ${name}: setze Originalwerte zurueck."
  for n in $(jq -c '.changes[]' "$EVENT_STATE"); do
    ini_set "$ini" "$(jq -r .key <<< "$n")" "$(jq -r .old <<< "$n")"
  done
  rm -f "$EVENT_STATE" "${ini}.pre-event"
  banner false
  flock -u 9   # vor dem Neustart freigeben (siehe cmd_start)
  if [ "$do_restart" = "true" ]; then
    restart_server "Event-Ende: ${name}" || log "WARNUNG: Neustart kam nicht zustande."
    notify_discord "🏁 ${name} beendet${DISCORD_SERVER_NAME:+ – $DISCORD_SERVER_NAME}" \
      "Die Raten sind wieder normal. Danke fürs Mitspielen!" "$DC_ORANGE" || true
  else
    notify_discord "🏁 ${name} beendet${DISCORD_SERVER_NAME:+ – $DISCORD_SERVER_NAME}" \
      "Die normalen Raten greifen mit dem morgendlichen Neustart. Danke fürs Mitspielen!" \
      "$DC_ORANGE" || true
  fi
  log "${name} beendet."
}

cmd_guard() {
  [ -f "$EVENT_STATE" ] || return 0

  # Gepatcht, aber nie neu gestartet? Dann laufen die Event-Werte nur auf dem
  # Papier. Der Neustart-Marker verraet, ob seit dem Patchen einer stattfand.
  if [ "$(jq -r '.restarted // false' "$EVENT_STATE")" != "true" ]; then
    local patched marker
    patched=$(jq -r '.patched_at // 0' "$EVENT_STATE")
    marker=$(cat "$RESTART_MARKER" 2>/dev/null || echo 0)
    [[ "$patched" =~ ^[0-9]+$ ]] || patched=0
    [[ "$marker"  =~ ^[0-9]+$ ]] || marker=0
    if [ "$marker" -gt "$patched" ]; then
      mark_restarted
      log "Event-Werte sind seit dem Neustart um $(date -d "@${marker}" '+%F %T') aktiv."
    elif [ "$patched" -gt 0 ] && \
         [ $(( ($(date +%s) - patched) / 3600 )) -ge "$EVENT_APPLY_GRACE_H" ]; then
      if [ "$(jq -r '.warned // false' "$EVENT_STATE")" != "true" ]; then
        log "WARNUNG: Event seit ueber ${EVENT_APPLY_GRACE_H} h gepatcht, aber kein Neustart - die Werte sind nicht aktiv."
        notify_discord "⚠️ Event-Wächter${DISCORD_SERVER_NAME:+ – $DISCORD_SERVER_NAME}" \
          "Die Event-Werte stehen in der Ini, aber seit ${EVENT_APPLY_GRACE_H} h gab es keinen Neustart – im Spiel gelten noch die normalen Raten." \
          "${DC_ORANGE:-15105570}" || true
        local tmp; tmp=$(jq -c '.warned = true' "$EVENT_STATE") && printf '%s\n' "$tmp" > "$EVENT_STATE"
      fi
    fi
  fi

  local started age_h
  started=$(jq -r .started "$EVENT_STATE")
  age_h=$(( ($(date +%s) - $(date -d "$started" +%s)) / 3600 ))
  if [ "$age_h" -ge "$EVENT_MAX_HOURS" ]; then
    log "WARNUNG: Event laeuft seit ${age_h} h (> ${EVENT_MAX_HOURS} h) - Zwangs-Ruecksetzung."
    notify_discord "⚠️ Event-Wächter${DISCORD_SERVER_NAME:+ – $DISCORD_SERVER_NAME}" \
      "Ein Event lief laenger als geplant (${age_h} h) und wurde automatisch zurueckgesetzt." \
      "$DC_ORANGE" || true
    cmd_stop
  fi
}

cmd_status() {
  if [ -f "$EVENT_STATE" ]; then
    jq . "$EVENT_STATE"
    local ini; ini=$(jq -r .ini "$EVENT_STATE")
    [ -f "${ini}.pre-event" ] \
      && echo "Sicherheitskopie der Ini vor dem Event: ${ini}.pre-event"
  else
    echo "Kein Event aktiv."
    pick_event
    echo "Naechstes Event laut Rotation (KW $(today_week)): ${EV_NAME}"
  fi
}

case "${1:-}" in
  start)  shift; cmd_start "$@" ;;
  stop)   shift; cmd_stop "$@" ;;
  guard)  cmd_guard ;;
  status) cmd_status ;;
  *) echo "Aufruf: $0 start [--first-weekend-only] [--event NAME|NR] [--dry-run] | stop [--restart] [--dry-run] | guard | status" >&2
     exit 2 ;;
esac
