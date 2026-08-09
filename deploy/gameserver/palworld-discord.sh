#!/usr/bin/env bash
# =============================================================================
# palworld-discord.sh - gemeinsame Discord-Anbindung der Serverskripte
#
# Wird von palworld-autoupdate.sh und palworld-watchdog.sh eingebunden
# (source, kein eigener Aufruf noetig).
#
# Warum: Frueher hat jeder Neustart eine NEUE Nachricht in den Kanal gepostet.
# Damit rutschte die Status-Nachricht von tools/discord-status.py (Spieler,
# FPS, CPU/RAM) nach und nach nach oben aus dem Blick. Gepflegt wird deshalb
# ein dauerhafter Zustand, der immer zeigt:
#   - wann der letzte Neustart war (mit Grund/Version/Spielerzahl)
#   - wann der naechste geplante Neustart ist
#
# Mit DISCORD_COMBINED_MESSAGE=true (Standard) gibt es dafuer KEINE eigene
# Nachricht mehr: der Zustand landet nur in DISCORD_STATE_FILE, und
# discord-status.py stellt ihn zusammen mit Spielerzahl, FPS und dem
# Event-Wochenende in EINER Nachricht pro Server dar. Nach jeder Aenderung
# wird die Status-Nachricht sofort neu gezeichnet, damit nichts nachhinkt.
# Auf false gestellt bleibt es beim alten Verhalten mit zwei Nachrichten.
#
# Die Zeiten gehen als Discord-Zeitstempel raus (<t:1234567890:R>). Discord
# rechnet die im Client selbst um ("vor 2 Std", "in 3 Std") - die Nachricht
# bleibt also aktuell, ohne dass ein Cronjob sie staendig neu schreiben muss.
#
# Konfiguration (palworld-scripts.conf):
#   DISCORD_WEBHOOK="https://discord.com/api/webhooks/..."
#   DISCORD_SERVER_NAME="Server 1 · PvE 4x"  # Titelzusatz (optional)
#   RESTART_SCHEDULE="05:05 17:05"           # geplante Neustarts, lokale Zeit
#   DISCORD_RESTART_MESSAGE=true             # false = altes Verhalten
#   DISCORD_COMBINED_MESSAGE=true            # false = eigene Neustart-Nachricht
#   DISCORD_ALERT_NEW_MESSAGE=false          # Fehler zusaetzlich als neue Nachricht
#   DISCORD_STATE_FILE="/var/lib/palworld/discord-restart.json"
#
# RESTART_SCHEDULE ist die Zeit, zu der der Server WIRKLICH runtergeht, also
# Cron-Zeit + Vorwarnzeit (Cron 04:55 + 10 min Warnung -> "05:05").
# Ohne RESTART_SCHEDULE zeigt die Nachricht "kein fester Termin".
#
# Braucht curl und jq (wie die aufrufenden Skripte auch).
# =============================================================================

# --- Einstellungen (Conf gewinnt, deshalb hier nur Defaults setzen) -----------
DC_GREEN=3066993; DC_BLUE=3447003; DC_ORANGE=15105570; DC_RED=15158332

DISCORD_WEBHOOK="${DISCORD_WEBHOOK:-}"
DISCORD_SERVER_NAME="${DISCORD_SERVER_NAME:-}"
RESTART_SCHEDULE="${RESTART_SCHEDULE:-}"
DISCORD_RESTART_MESSAGE="${DISCORD_RESTART_MESSAGE:-true}"
DISCORD_ALERT_NEW_MESSAGE="${DISCORD_ALERT_NEW_MESSAGE:-false}"
DISCORD_STATE_FILE="${DISCORD_STATE_FILE:-/var/lib/palworld/discord-restart.json}"
# true = keine eigene Neustart-Nachricht mehr; der Zustand wird nur noch
# gespeichert und die Status-Nachricht (discord-status.py) stellt ihn mit dar.
DISCORD_COMBINED_MESSAGE="${DISCORD_COMBINED_MESSAGE:-true}"
# Verzeichnis DIESER Datei - die Skripte daneben (palworld-status.sh) werden
# fuer das sofortige Neuzeichnen gebraucht.
_PALDC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd 2>/dev/null)" || _PALDC_DIR=""
# Wird vom aufrufenden Skript gesetzt (--min-gap), damit der naechste Termin
# nicht angekuendigt wird, wenn er ohnehin uebersprungen wuerde.
DISCORD_MIN_GAP_HOURS="${DISCORD_MIN_GAP_HOURS:-0}"

# --- Rohversand ---------------------------------------------------------------
# discord_send <payload> [POST|PATCH] [message-id]  -> Antwort auf stdout
discord_send() {
  local payload="$1" method="${2:-POST}" id="${3:-}" url="$DISCORD_WEBHOOK"
  [ -n "$url" ] || return 1
  if [ "$method" = "PATCH" ]; then
    url="${url}/messages/${id}"
  else
    url="${url}?wait=true"
  fi
  curl -fsS -m 10 -X "$method" -H 'Content-Type: application/json' \
    -d "$payload" "$url" 2>/dev/null
}

# Klassische Einzelnachricht (fuer echte Alarme bzw. DISCORD_RESTART_MESSAGE=false).
#   notify_discord <Titel (mit Emoji)> <Text> [Farbe]
notify_discord() {
  [ -n "$DISCORD_WEBHOOK" ] || return 0
  local title="$1" desc="${2:-}" color="${3:-$DC_BLUE}" payload
  payload=$(jq -nc --arg t "$title" --arg d "$desc" --argjson c "$color" \
    --arg ts "$(date -u +%FT%TZ)" \
    '{embeds:[{title:$t, description:$d, color:$c, timestamp:$ts, footer:{text:"PalHeim"}}]}')
  discord_send "$payload" POST >/dev/null 2>&1 || true
  return 0
}

# --- Zustand (Nachrichten-ID + letzter Neustart) ------------------------------
discord_state() {
  jq -c . "$DISCORD_STATE_FILE" 2>/dev/null || echo '{}'
}

discord_state_save() {
  local json="$1" dir
  dir="$(dirname "$DISCORD_STATE_FILE")"
  mkdir -p "$dir" 2>/dev/null || true
  if printf '%s\n' "$json" > "${DISCORD_STATE_FILE}.tmp" 2>/dev/null; then
    mv "${DISCORD_STATE_FILE}.tmp" "$DISCORD_STATE_FILE" 2>/dev/null || true
  fi
  return 0
}

# --- Naechster geplanter Neustart aus RESTART_SCHEDULE -------------------------
# next_restart_ts [nicht-vor-Unixzeit]  -> Unixzeit oder leer
next_restart_ts() {
  local not_before="${1:-0}" now best="" t d day ts
  [ -n "${RESTART_SCHEDULE// /}" ] || return 0
  now=$(date +%s)
  [ "$not_before" -lt "$now" ] && not_before="$now"
  for t in $RESTART_SCHEDULE; do
    [[ "$t" =~ ^([01]?[0-9]|2[0-3]):[0-5][0-9]$ ]] || continue
    # bis zu drei Tage vorausschauen (deckt auch --min-gap > 24 h ab)
    for d in 0 1 2 3; do
      day=$(date -d "@$(( now + d * 86400 ))" +%F 2>/dev/null) || continue
      ts=$(date -d "${day} ${t}" +%s 2>/dev/null) || continue
      if [ "$ts" -gt "$not_before" ]; then
        if [ -z "$best" ] || [ "$ts" -lt "$best" ]; then best="$ts"; fi
        break
      fi
    done
  done
  [ -n "$best" ] && printf '%s' "$best"
  return 0
}

# --- Embed bauen ---------------------------------------------------------------
_kind_label() {
  case "${1:-}" in
    update)   echo "⬆️ Update" ;;
    watchdog) echo "⚠️ Watchdog" ;;
    restart)  echo "🔧 Wartung" ;;
    *)        echo "" ;;
  esac
}

# discord_restart_embed <state-json>  -> Embed-JSON
discord_restart_embed() {
  local st="$1" status last_ts next_ts kind reason detail note
  status=$(jq -r '.status // "idle"'      <<<"$st")
  last_ts=$(jq -r '.last_ts // 0'         <<<"$st")
  next_ts=$(jq -r '.next_ts // 0'         <<<"$st")
  kind=$(jq -r '.last_kind // ""'         <<<"$st")
  reason=$(jq -r '.last_reason // ""'     <<<"$st")
  detail=$(jq -r '.last_detail // ""'     <<<"$st")
  note=$(jq -r '.note // ""'              <<<"$st")

  local title="🔄 Neustarts"
  [ -n "$DISCORD_SERVER_NAME" ] && title="${title} · ${DISCORD_SERVER_NAME}"

  local color desc
  case "$status" in
    running)
      color=$DC_ORANGE
      desc="🟠 **Neustart läuft** – der Server ist gleich kurz offline."
      ;;
    failed)
      color=$DC_RED
      desc="🔴 **Letzte Aktion fehlgeschlagen** – bitte prüfen."
      ;;
    ok)
      color=$DC_GREEN
      desc="🟢 Server läuft."
      ;;
    *)
      color=$DC_BLUE
      desc="Noch kein Neustart erfasst."
      ;;
  esac
  [ -n "$note" ] && desc="${desc}"$'\n'"${note}"

  local last_val="noch keiner erfasst"
  if [ "$last_ts" != "0" ] && [ -n "$last_ts" ]; then
    last_val="<t:${last_ts}:f>"$'\n'"**<t:${last_ts}:R>**"
    local label; label=$(_kind_label "$kind")
    [ -n "$label" ] && last_val="${last_val}"$'\n'"${label}"
    [ -n "$reason" ] && last_val="${last_val}"$'\n'"${reason}"
    [ -n "$detail" ] && last_val="${last_val}"$'\n'"${detail}"
  fi

  local next_val
  if [ "$next_ts" != "0" ] && [ -n "$next_ts" ]; then
    next_val="<t:${next_ts}:f>"$'\n'"**<t:${next_ts}:R>**"
    next_val="${next_val}"$'\n'"Vorwarnung im Spiel läuft rechtzeitig."
  elif [ -n "${RESTART_SCHEDULE// /}" ]; then
    next_val="wird nach dem nächsten Lauf berechnet"
  else
    next_val="kein fester Termin"$'\n'"(\`RESTART_SCHEDULE\` in \`palworld-scripts.conf\` setzen)"
  fi

  jq -nc \
    --arg title "$title" --arg desc "$desc" --argjson color "$color" \
    --arg lval "$last_val" --arg nval "$next_val" \
    --arg ts "$(date -u +%FT%TZ)" \
    '{title:$title, description:$desc, color:$color,
      fields:[{name:"🕒 Letzter Neustart", value:$lval, inline:true},
              {name:"⏭️ Nächster Neustart", value:$nval, inline:true}],
      footer:{text:"PalHeim · diese Nachricht wird aktualisiert, nicht neu gepostet"},
      timestamp:$ts}'
}

# Zusammengelegte Nachricht: die Status-Nachricht sofort neu zeichnen lassen.
# Ohne das haengt ein Neustart bis zu 5 Minuten hinter der Anzeige zurueck -
# ausgerechnet in dem Moment, in dem die Leute hinschauen.
discord_refresh_status() {
  local s="${_PALDC_DIR}/palworld-status.sh"
  [ -n "$_PALDC_DIR" ] && [ -x "$s" ] || return 0
  timeout 60 "$s" >/dev/null 2>&1 || true
  return 0
}

# discord_restart_write <state-json> - Nachricht anlegen (POST) oder pflegen (PATCH)
discord_restart_write() {
  [ -n "$DISCORD_WEBHOOK" ] || return 0
  local st="$1" embed payload id new_id code

  if [ "$DISCORD_COMBINED_MESSAGE" = "true" ]; then
    local old_id
    old_id=$(jq -r '.message_id // empty' <<<"$st")
    if [ -n "$old_id" ]; then
      # Umstellung von zwei Nachrichten auf eine: die alte Neustart-Nachricht
      # wird nicht mehr gepflegt und bliebe sonst fuer immer eingefroren stehen.
      curl -fsS -m 10 -X DELETE "${DISCORD_WEBHOOK}/messages/${old_id}" \
        >/dev/null 2>&1 || true
      st=$(jq -c 'del(.message_id)' <<<"$st") || return 0
      echo "Discord: separate Neustart-Nachricht ${old_id} entfernt - der Inhalt steht jetzt in der Status-Nachricht."
    fi
    discord_state_save "$st"
    discord_refresh_status
    return 0
  fi
  embed=$(discord_restart_embed "$st") || return 0
  payload=$(jq -nc --argjson e "$embed" \
    '{embeds:[$e], username:"PalHeim Neustarts", allowed_mentions:{parse:[]}}') || return 0

  id=$(jq -r '.message_id // empty' <<<"$st")
  if [ -n "$id" ]; then
    code=$(curl -sS -m 10 -o /dev/null -w '%{http_code}' -X PATCH \
      -H 'Content-Type: application/json' -d "$payload" \
      "${DISCORD_WEBHOOK}/messages/${id}" 2>/dev/null) || code="000"
    if [ "$code" != "404" ]; then
      # 2xx = gepflegt; alles andere (Timeout, 429, 5xx) ist voruebergehend -
      # dann lieber diesen Lauf auslassen als eine zweite Nachricht posten.
      [ "${code:0:1}" = "2" ] || echo "Discord: Nachricht ${id} nicht aktualisiert (HTTP ${code})." >&2
      discord_state_save "$st"
      return 0
    fi
    # 404 = Nachricht wurde im Discord geloescht -> neu anlegen
  fi
  new_id=$(discord_send "$payload" POST 2>/dev/null | jq -r '.id // empty' 2>/dev/null) || new_id=""
  st=$(jq -c --arg id "${new_id:-}" '.message_id = $id' <<<"$st") || return 0
  discord_state_save "$st"
  return 0
}

# --- Oeffentliche API ----------------------------------------------------------
# discord_restart_event <running|ok|failed|refresh> [kind] [grund] [details]
#   running - Neustart wurde eingeleitet (Ansagen laufen)
#   ok      - Neustart erfolgreich, "letzter Neustart" = jetzt
#   failed  - Aktion fehlgeschlagen, "letzter Neustart" bleibt stehen
#   refresh - nur neu zeichnen (naechster Termin), Status bleibt
discord_restart_event() {
  [ "$DISCORD_RESTART_MESSAGE" = "true" ] || return 0
  [ -n "$DISCORD_WEBHOOK" ] || return 0
  command -v jq >/dev/null 2>&1 || return 0

  local status="$1" kind="${2:-}" reason="${3:-}" detail="${4:-}"
  local st now next base gap not_before
  st=$(discord_state)
  now=$(date +%s)

  case "$status" in
    ok)
      st=$(jq -c --argjson ts "$now" --arg k "$kind" --arg r "$reason" \
                 --arg d "$detail" --argjson g "${DISCORD_MIN_GAP_HOURS:-0}" \
        '.status="ok" | .last_ts=$ts | .last_kind=$k | .last_reason=$r
         | .last_detail=$d | .min_gap=$g | .note=""' <<<"$st") || return 0
      ;;
    running)
      st=$(jq -c --arg r "$reason" --arg d "$detail" \
        '.status="running" | .note=(if $d == "" then $r else $d end)' <<<"$st") || return 0
      ;;
    failed)
      st=$(jq -c --arg r "$reason" --arg d "$detail" \
        '.status="failed" | .note=(if $d == "" then $r else "**" + $r + "** – " + $d end)' \
        <<<"$st") || return 0
      ;;
    refresh) : ;;
    *) return 0 ;;
  esac

  # Naechster Termin: nach dem letzten Neustart darf --min-gap noch greifen
  base=$(jq -r '.last_ts // 0' <<<"$st")
  gap=$(jq -r '.min_gap // 0'  <<<"$st")
  [[ "$base" =~ ^[0-9]+$ ]] || base=0
  [[ "$gap"  =~ ^[0-9]+$ ]] || gap=0
  not_before=$now
  if [ "$base" -gt 0 ] && [ "$gap" -gt 0 ]; then
    not_before=$(( base + gap * 3600 ))
  fi
  next=$(next_restart_ts "$not_before")
  st=$(jq -c --argjson n "${next:-0}" --argjson u "$now" \
    '.next_ts=$n | .updated=$u' <<<"$st") || return 0

  discord_restart_write "$st"
}

# discord_alert <Titel> <Text> - Fehler melden
# Landet in der Dauer-Nachricht; als zusaetzliche Einzelnachricht nur, wenn
# DISCORD_ALERT_NEW_MESSAGE=true (oder die Dauer-Nachricht abgeschaltet ist).
discord_alert() {
  local title="$1" desc="${2:-}"
  discord_restart_event failed "" "$title" "$desc"
  if [ "$DISCORD_RESTART_MESSAGE" != "true" ] || [ "$DISCORD_ALERT_NEW_MESSAGE" = "true" ]; then
    notify_discord "$title" "$desc" "$DC_RED"
  fi
  return 0
}
