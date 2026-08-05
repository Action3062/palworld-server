#!/usr/bin/env bash
# =============================================================================
# palworld-autoupdate.sh (nativ/systemd)
# Auto-Update + geplanter Neustart fuer den nativen Palworld-Server
# (SteamCMD, App 2394010) mit Ingame-Spielerwarnung via REST-API.
#
# Modi:
#   (ohne Argumente)   Update-Check via SteamCMD (Buildid-Vergleich); bei neuem
#                      Build: warnen, speichern, stoppen, updaten, starten
#   --force-restart    Neustart ohne Update (gegen RAM-Wachstum), gleiche
#                      Warn-/Save-Logik
#   --if-empty         Nur handeln, wenn 0 Spieler online sind (sonst exit 0,
#                      der naechste Cron-Lauf versucht es erneut)
#   --reason "Text"    Eigener Grund fuer die Ingame-Ankuendigung
#
# Hinweis: Anders als beim Docker-Image kann das Update nicht vorab geladen
# werden - waehrend des SteamCMD-Downloads ist der Server offline.
#
# Konfiguration: palworld-scripts.conf im Script-Verzeichnis (oder $PALWORLD_CONF)
#
# Cron-Beispiele:
#   */30 * * * * /home/scripts/palworld-autoupdate.sh >> /var/log/palworld-update.log 2>&1
#   10 4-9 * * * /home/scripts/palworld-autoupdate.sh --force-restart --if-empty >> /var/log/palworld-update.log 2>&1
# =============================================================================
set -euo pipefail
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- Defaults (werden durch die Conf-Datei ueberschrieben) ---------------------
SERVICE="palworld"
PAL_USER="palworld"
INSTALL_DIR="/home/palworld/palserver"
STEAMCMD="/home/palworld/steamcmd/steamcmd.sh"
APP_ID=2394010
ADMIN_PASSWORD="CHANGE_ME"
REST_PORT=8212
REST_HOST="127.0.0.1"
WARN_MINUTES=(10 5)
FINAL_COUNTDOWN=60
ALLOW_RESTART_WITHOUT_API=false
BACKUP_KEEP=10
BACKUP_ON_FORCE_RESTART=false
DISCORD_WEBHOOK=""
LOCKFILE="/var/lock/palworld-autoupdate.lock"

# Conf-Suche: $PALWORLD_CONF, dann neben dem Skript, dann /etc/palworld.
CONF="${PALWORLD_CONF:-}"
if [ -z "$CONF" ]; then
  for c in "${SCRIPT_DIR}/palworld-scripts.conf" /etc/palworld/palworld-scripts.conf; do
    if [ -f "$c" ]; then CONF="$c"; break; fi
  done
fi
# shellcheck disable=SC1090
[ -n "$CONF" ] && [ -f "$CONF" ] && . "$CONF"
# Leeres REST_HOST (z. B. aus der Docker-Vorlage, wo es die Container-IP
# bedeutet) wuerde hier eine kaputte URL "http://:8212" ergeben - und der
# Watchdog wuerde einen kerngesunden Server neu starten.
REST_HOST="${REST_HOST:-127.0.0.1}"
BACKUP_DIR="${BACKUP_DIR-${SCRIPT_DIR}/backups}"   # BACKUP_DIR="" in der Conf = Backups aus
SAVED_DIR="${SAVED_DIR:-${INSTALL_DIR}/Pal/Saved}"
MANIFEST="${INSTALL_DIR}/steamapps/appmanifest_${APP_ID}.acf"
FAIL_STATE="/run/palworld-update-failed"   # Cooldown-Marker nach fehlgeschlagenem Update
DAILY_STAMP="/var/lib/palworld-daily-restart"   # ein Wartungs-Neustart pro Tag
RESTART_MARKER="/run/palworld-restart-done"     # Unix-Zeit des letzten Neustarts
mkdir -p "$(dirname "$DAILY_STAMP")" 2>/dev/null || true

# --- Argumente ------------------------------------------------------------------
MODE="update"
IF_EMPTY=false
MIN_GAP_HOURS=0
REASON=""
usage() {
  cat <<'USAGE_EOF'
palworld-autoupdate.sh [--force-restart] [--if-empty] [--reason "Text"]

  (ohne Argumente)   Update-Check via SteamCMD; bei neuem Build: warnen,
                     speichern, stoppen, updaten, starten
  --force-restart    Neustart ohne Update, gleiche Warn-/Save-Logik
  --if-empty         Nur handeln, wenn 0 Spieler online sind
  --min-gap H        Neustart nur, wenn der letzte laenger als H Stunden her
                     ist (fuer mehrere geplante Neustarts pro Tag)
  --reason "Text"    Eigener Grund fuer die Ingame-Ankuendigung
  --discord-refresh  Nichts am Server tun, nur die Discord-Neustart-Nachricht
                     neu zeichnen (naechster Termin)
USAGE_EOF
}
while [ $# -gt 0 ]; do
  case "$1" in
    --force-restart)   MODE="restart" ;;
    --discord-refresh) MODE="discord-refresh" ;;
    --if-empty)      IF_EMPTY=true ;;
    --min-gap)       MIN_GAP_HOURS="${2:-0}"; shift ;;
    --reason)        REASON="${2:-}"; shift ;;
    -h|--help)       usage; exit 0 ;;
    *) echo "Unbekannte Option: $1" >&2; usage; exit 2 ;;
  esac
  shift
done
[[ "$MIN_GAP_HOURS" =~ ^[0-9]+$ ]] || { echo "Ungueltiger Wert fuer --min-gap: ${MIN_GAP_HOURS}" >&2; exit 2; }

log()    { echo "[$(date '+%F %T')] $*"; }
as_pal() { runuser -l "$PAL_USER" -c "$*"; }

# palworld-discord.sh pflegt EINE Neustart-Nachricht im Kanal (bearbeiten statt
# neu posten). Fehlt sie, bleibt es bei einfachen Textnachrichten.
if [ -f "${SCRIPT_DIR}/palworld-discord.sh" ]; then
  # shellcheck disable=SC1091
  . "${SCRIPT_DIR}/palworld-discord.sh"
  notify_discord_text() { notify_discord "⚠️ Palworld" "${1:-}" "$DC_ORANGE"; }
else
  DISCORD_RESTART_MESSAGE=false
  notify_discord_text() {
    [ -n "$DISCORD_WEBHOOK" ] || return 0
    curl -fsS -m 10 -H 'Content-Type: application/json' \
      -d "$(jq -nc --arg c "$1" '{content:$c}')" "$DISCORD_WEBHOOK" >/dev/null || true
  }
  discord_restart_event() { :; }
fi

# --- Nur die Discord-Nachricht neu zeichnen, den Server nicht anfassen ----------
if [ "$MODE" = "discord-refresh" ]; then
  discord_restart_event refresh
  exit 0
fi

# --- Doppelstart verhindern (Watchdog/Announce pruefen dieses Lock ebenfalls) ----
exec 9>"$LOCKFILE"
# -w 5 statt -n: uebersteht die kurzen Lock-Proben von Watchdog/Announce
flock -w 5 9 || { log "Skript laeuft bereits, Abbruch."; exit 0; }

# --- --min-gap: liegt der letzte Neustart noch nicht lange genug zurueck? --------
if [ "$MODE" = "restart" ] && [ "$MIN_GAP_HOURS" -gt 0 ]; then
  LAST_RESTART=$(cat "$RESTART_MARKER" 2>/dev/null || true)
  [[ "$LAST_RESTART" =~ ^[0-9]{9,}$ ]] || LAST_RESTART=0
  if [ "$LAST_RESTART" -gt 0 ] && \
     [ $(( $(date +%s) - LAST_RESTART )) -lt $(( MIN_GAP_HOURS * 3600 )) ]; then
    log "Letzter Neustart ist weniger als ${MIN_GAP_HOURS} h her, ueberspringe (--min-gap)."
    discord_restart_event refresh
    exit 0
  fi
fi

# --- Laufenden Server + installierten Build ermitteln ----------------------------
if ! systemctl cat "$SERVICE" >/dev/null 2>&1; then
  log "FEHLER: systemd-Unit '${SERVICE}' existiert nicht."
  exit 1
fi
ACTIVE_STATE="$(systemctl show -p ActiveState --value "$SERVICE" 2>/dev/null || echo unknown)"
CRASHING=false
case "$ACTIVE_STATE" in
  active) ;;
  activating|deactivating|failed)
    # Crash-Loop oder haengender Stop: hier hilft ein Update/Neustart gerade am
    # meisten - Spieler koennen ohnehin nicht drauf sein.
    CRASHING=true
    log "Service ist im Zustand '${ACTIVE_STATE}' (Crash-Loop?) - fahre ohne Spielerwarnung fort." ;;
  *)
    log "FEHLER: Service '${SERVICE}' laeuft nicht (manuell gestoppt?). Keine Aktion."
    exit 1 ;;
esac

local_build() { awk -F'"' '/"buildid"/{print $4; exit}' "$MANIFEST" 2>/dev/null || true; }
CURRENT_BUILD="$(local_build)"
CURRENT_BUILD="${CURRENT_BUILD:-unbekannt}"

# --- Update-Modus: neuesten Build aus Steam ermitteln -----------------------------
TARGET_BUILD="$CURRENT_BUILD"
if [ "$MODE" = "update" ]; then
  # appinfo-Cache loeschen, sonst liefert SteamCMD gern veraltete Buildids
  rm -f "/home/${PAL_USER}/Steam/appcache/appinfo.vdf" \
        "$(dirname "$STEAMCMD")/appcache/appinfo.vdf" 2>/dev/null || true
  APPINFO="$(as_pal "'${STEAMCMD}' +login anonymous +app_info_update 1 +app_info_print ${APP_ID} +quit" 2>/dev/null || true)"
  REMOTE_BUILD="$(printf '%s\n' "$APPINFO" \
    | awk -F'"' '/"branches"/{b=1} b && /"public"/{p=1} p && /"buildid"/{print $4; exit}')"

  if [ -z "$REMOTE_BUILD" ]; then
    log "FEHLER: Konnte die aktuelle Buildid nicht aus SteamCMD lesen."
    exit 1
  fi
  if [ "$CURRENT_BUILD" = "$REMOTE_BUILD" ]; then
    log "Server ist aktuell (Build ${CURRENT_BUILD})."
    exit 0
  fi
  TARGET_BUILD="$REMOTE_BUILD"
  # Cooldown: nach fehlgeschlagenem Update nicht alle 30 min erneut stoppen/warnen,
  # sondern 6h warten (oder bis Steam einen anderen Build liefert)
  if [ -f "$FAIL_STATE" ]; then
    read -r F_BUILD F_TS < "$FAIL_STATE" || true
    if [ "${F_BUILD:-}" = "$REMOTE_BUILD" ] && [ $(( $(date +%s) - ${F_TS:-0} )) -lt 21600 ]; then
      log "Update auf Build ${REMOTE_BUILD} ist zuletzt fehlgeschlagen - Cooldown aktiv, ueberspringe."
      exit 0
    fi
  fi
  log "Update gefunden: Build ${CURRENT_BUILD} -> ${TARGET_BUILD}"
else
  log "Geplanter Neustart angefordert (Build bleibt ${CURRENT_BUILD})."
fi

# --- REST-API vorbereiten ---------------------------------------------------------
API="http://${REST_HOST}:${REST_PORT}/v1/api"
# Passwort via stdin-Config statt -u, damit es nicht in der Prozessliste auftaucht
curl_auth() { printf 'user = "admin:%s"\n' "$ADMIN_PASSWORD"; }
api_get()  { curl_auth | curl -fsS -m 10 -K - "${API}/$1"; }
api_post() { curl_auth | curl -fsS -m 10 -K - -H 'Content-Type: application/json' -X POST -d "$2" "${API}/$1"; }
announce() { api_post announce "$(jq -nc --arg m "$1" '{message:$m}')" >/dev/null 2>&1 || true; }

API_OK=true
[ "$CRASHING" = "true" ] && API_OK=false
[ "$API_OK" = "true" ] && { api_get info >/dev/null 2>&1 || API_OK=false; }

PLAYERS=0
if [ "$API_OK" = "true" ]; then
  PLAYERS=$(api_get players 2>/dev/null | jq -r '.players | length' 2>/dev/null || echo 0)
  [[ "$PLAYERS" =~ ^[0-9]+$ ]] || PLAYERS=0
fi

# --- --if-empty: nur bei leerem Server handeln ---------------------------------------
if [ "$IF_EMPTY" = "true" ]; then
  # Der Cron probiert es mehrmals in den fruehen Stunden; ein Tagesstempel
  # sorgt dafuer, dass daraus trotzdem genau ein Neustart pro Tag wird.
  if [ "$MODE" = "restart" ] && [ "$(cat "$DAILY_STAMP" 2>/dev/null || true)" = "$(date +%F)" ]; then
    exit 0
  fi
  if [ "$API_OK" != "true" ]; then
    log "FEHLER: --if-empty gesetzt, aber REST-API nicht erreichbar. Spielerzahl unbekannt, breche ab."
    exit 1
  fi
  if [ "$PLAYERS" -gt 0 ]; then
    log "${PLAYERS} Spieler online, ueberspringe (--if-empty). Naechster Lauf versucht es erneut."
    exit 0
  fi
  [ "$MODE" = "restart" ] && date +%F > "$DAILY_STAMP"
fi

# --- Spieler warnen + sauber herunterfahren --------------------------------------------
if [ "$MODE" = "update" ]; then
  ANNOUNCE_REASON="${REASON:-SERVER UPDATE (Build ${TARGET_BUILD})}"
else
  ANNOUNCE_REASON="${REASON:-Geplanter Wartungs-Neustart}"
fi

if [ "$MODE" = "update" ]; then
  RESTART_KIND="update"
  RESTART_NOTE="Build \`${CURRENT_BUILD}\` → \`${TARGET_BUILD}\`"
else
  RESTART_KIND="restart"
  RESTART_NOTE="Build \`${CURRENT_BUILD}\`"
fi
discord_restart_event running "$RESTART_KIND" "$ANNOUNCE_REASON" \
  "${RESTART_NOTE} · ${PLAYERS} Spieler online"

if [ "$API_OK" = "true" ]; then
  log "Spieler online: ${PLAYERS}"

  if [ "$PLAYERS" -gt 0 ] && [ "${#WARN_MINUTES[@]}" -gt 0 ]; then
    mapfile -t WARNS < <(printf '%s\n' "${WARN_MINUTES[@]}" | sort -rn)
    for i in "${!WARNS[@]}"; do
      M="${WARNS[$i]}"
      # Ingame-Messages bewusst ohne Umlaute (Anzeige-Sicherheit)
      announce "${ANNOUNCE_REASON}: Neustart in ${M} Minuten! Bitte Fortschritt sichern."
      log "Ingame-Warnung gesendet: Neustart in ${M} min."
      NEXT_IDX=$((i + 1))
      if [ "$NEXT_IDX" -lt "${#WARNS[@]}" ]; then
        sleep $(( (M - WARNS[NEXT_IDX]) * 60 ))
      else
        REST_SLEEP=$(( M * 60 - FINAL_COUNTDOWN ))
        if [ "$REST_SLEEP" -gt 0 ]; then sleep "$REST_SLEEP"; fi
      fi
    done
  fi

  log "Speichere Welt und starte Shutdown-Countdown (${FINAL_COUNTDOWN}s)..."
  api_post save '{}' >/dev/null 2>&1 || true
  api_post shutdown "$(jq -nc \
      --arg m "${ANNOUNCE_REASON}: Neustart in ${FINAL_COUNTDOWN} Sekunden!" \
      --argjson w "$FINAL_COUNTDOWN" '{waittime:$w, message:$m}')" >/dev/null \
    || { log "WARNUNG: Shutdown-Befehl fehlgeschlagen, stoppe Service per systemctl."; systemctl stop "$SERVICE" || true; }
elif [ "$CRASHING" = "true" ]; then
  log "Server laeuft nicht sauber - stoppe direkt, keine Spieler zu warnen."
  systemctl stop "$SERVICE" || true
else
  if [ "$ALLOW_RESTART_WITHOUT_API" = "true" ]; then
    log "WARNUNG: REST-API nicht erreichbar (${API}). Neustart OHNE Spielerwarnung/Save."
    systemctl stop "$SERVICE" || true
  else
    log "FEHLER: REST-API nicht erreichbar (${API})."
    log "RESTAPIEnabled=True, RESTAPIPort=${REST_PORT} und AdminPassword in PalWorldSettings.ini setzen,"
    log "oder ALLOW_RESTART_WITHOUT_API=true konfigurieren."
    notify_discord_text "Palworld: Aktion (${MODE}) angefordert, aber REST-API nicht erreichbar. Bitte manuell pruefen."
    exit 1
  fi
fi

# Ab hier ist der Server (gleich) aus. Egal wie das Script endet - Fehler,
# Kill, Reboot-Signal - der Server muss wieder hochkommen: sonst bemerkt es
# niemand, weil Watchdog und Cron bei gestopptem Service bewusst nichts tun.
resume_service() {
  systemctl is-active --quiet "$SERVICE" || {
    log "Abbruch erkannt - starte '${SERVICE}' wieder."
    systemctl start "$SERVICE" || true
    notify_discord_text "Palworld: Update/Neustart wurde unerwartet abgebrochen, Server wurde wieder gestartet. Bitte Log pruefen."
  }
}
trap resume_service EXIT INT TERM

# --- Warten bis der Serverprozess beendet ist ---------------------------------------------
log "Warte auf Server-Shutdown..."
INV_BEFORE="$(systemctl show -p InvocationID --value "$SERVICE" 2>/dev/null || true)"
DEADLINE=$(( $(date +%s) + FINAL_COUNTDOWN + 180 ))
while systemctl is-active --quiet "$SERVICE"; do
  INV_NOW="$(systemctl show -p InvocationID --value "$SERVICE" 2>/dev/null || true)"
  if [ -n "$INV_BEFORE" ] && [ -n "$INV_NOW" ] && [ "$INV_NOW" != "$INV_BEFORE" ]; then
    # systemd hat den Prozess bereits neu gestartet (Restart-Policy) -> weiter
    break
  fi
  if [ "$(date +%s)" -ge "$DEADLINE" ]; then
    log "WARNUNG: Server hat nicht selbststaendig gestoppt, erzwinge Stopp."
    break
  fi
  sleep 5
done
systemctl stop "$SERVICE" >/dev/null 2>&1 || true   # idempotent, normalisiert alle Faelle

# --- Optionales Backup des Spielstands (Server ist jetzt aus = konsistent) -----------------
DO_BACKUP=false
if [ "$MODE" = "update" ]; then DO_BACKUP=true; fi
if [ "$MODE" = "restart" ] && [ "$BACKUP_ON_FORCE_RESTART" = "true" ]; then DO_BACKUP=true; fi
if [ "$DO_BACKUP" = "true" ] && [ -n "$BACKUP_DIR" ] && [ -d "$SAVED_DIR" ]; then
  # Ein Backup-Fehler (z.B. volle Platte) darf den Neustart NIEMALS verhindern
  BFILE="${BACKUP_DIR}/palworld-saved-$(date +%Y%m%d-%H%M%S)-build${TARGET_BUILD}.tar.gz"
  # umask 077: die Tarballs enthalten auch die INI mit dem Admin-Passwort
  if (umask 077; mkdir -p "$BACKUP_DIR") \
     && (umask 077; tar -czf "$BFILE" -C "$(dirname "$SAVED_DIR")" "$(basename "$SAVED_DIR")"); then
    log "Backup erstellt: ${BFILE}"
    ls -1t "${BACKUP_DIR}"/palworld-saved-*.tar.gz 2>/dev/null | tail -n +$((BACKUP_KEEP + 1)) | xargs -r rm -f || true
  else
    rm -f "$BFILE" 2>/dev/null || true
    log "WARNUNG: Backup fehlgeschlagen (Plattenplatz?) - fahre trotzdem mit dem Neustart fort."
    notify_discord_text "Palworld: Backup vor dem Neustart FEHLGESCHLAGEN (Plattenplatz pruefen!)."
  fi
fi

# --- Update einspielen (nur Update-Modus) ---------------------------------------------------
UPDATE_OK=true
if [ "$MODE" = "update" ]; then
  log "SteamCMD-Update auf Build ${TARGET_BUILD} ..."
  UPDATE_OK=false
  for ATTEMPT in 1 2 3; do
    OUT="$(as_pal "'${STEAMCMD}' +force_install_dir '${INSTALL_DIR}' +login anonymous +app_update ${APP_ID} validate +quit" 2>&1 || true)"
    if printf '%s' "$OUT" | grep -q "Success! App '${APP_ID}'"; then
      NOW_BUILD="$(local_build)"
      [ -n "$NOW_BUILD" ] && TARGET_BUILD="$NOW_BUILD"
      UPDATE_OK=true
      break
    fi
    log "WARNUNG: SteamCMD-Update fehlgeschlagen (Versuch ${ATTEMPT}/3)."
    sleep 10
  done
  if [ "$UPDATE_OK" = "true" ]; then
    rm -f "$FAIL_STATE" 2>/dev/null || true
  else
    echo "${TARGET_BUILD} $(date +%s)" > "$FAIL_STATE"
    log "FEHLER: Update konnte nicht eingespielt werden, starte Server mit altem Stand (Cooldown 6h)."
    notify_discord_text "Palworld: Update auf Build ${TARGET_BUILD} FEHLGESCHLAGEN, Server laeuft mit altem Stand weiter (naechster Versuch in ~6h). Bitte manuell pruefen."
  fi
fi

# --- Server (wieder) starten -----------------------------------------------------------------
log "Starte Service '${SERVICE}' ..."
systemctl start "$SERVICE" || true   # Fehler meldet der Check unten (inkl. Discord)
sleep 10
trap - EXIT INT TERM                 # ab hier meldet der Check unten selbst
if systemctl is-active --quiet "$SERVICE"; then
  log "Fertig. Server laeuft (Build $(local_build))."
  # Fuer --min-gap: Zeitpunkt des erfolgreichen Neustarts vermerken
  date +%s > "$RESTART_MARKER" 2>/dev/null || true
  DISCORD_MIN_GAP_HOURS="$MIN_GAP_HOURS"
  if [ "${DISCORD_RESTART_MESSAGE:-false}" = "true" ]; then
    # Eine gepflegte Nachricht statt einer neuen pro Neustart
    if [ "$MODE" = "update" ] && [ "$UPDATE_OK" != "true" ]; then
      discord_restart_event ok "$RESTART_KIND" "$ANNOUNCE_REASON" \
        "Update fehlgeschlagen - Server laeuft mit Build \`${CURRENT_BUILD}\` weiter"
    else
      discord_restart_event ok "$RESTART_KIND" "$ANNOUNCE_REASON" \
        "${RESTART_NOTE} · ${PLAYERS} Spieler waren online"
    fi
  elif [ "$MODE" = "update" ] && [ "$UPDATE_OK" = "true" ]; then
    notify_discord_text "Palworld-Server aktualisiert: Build ${CURRENT_BUILD} -> ${TARGET_BUILD}"
  elif [ "$MODE" = "restart" ]; then
    notify_discord_text "Palworld-Server neu gestartet (geplanter Neustart, Build ${CURRENT_BUILD})."
  fi
else
  log "FEHLER: Service laeuft nach dem Start nicht. Bitte 'journalctl -u ${SERVICE}' pruefen!"
  notify_discord_text "Palworld: Server startet nach Aktion (${MODE}) NICHT. Bitte manuell eingreifen!"
  exit 1
fi
