#!/usr/bin/env bash
# =============================================================================
# palworld-watchdog.sh (nativ/systemd)
# Haenger-Erkennung fuer den Palworld-Server: Prozess laeuft, aber die
# REST-API antwortet nicht mehr -> nach N Fehlchecks erzwungener Neustart.
#
# Abgrenzung (bewusst so gebaut):
#   - Crash (Prozess-Exit)      -> faengt systemd ab (Restart=always)
#   - Manuell gestoppt          -> Watchdog greift NICHT ein
#   - Update/Neustart laeuft    -> Watchdog pausiert (prueft das Update-Lock)
#   - Frisch gestartet          -> Schonfrist (WATCHDOG_GRACE_SECONDS),
#                                  die Welt-Ladezeit darf kein Fehlalarm sein
#
# Bei Erfolg keine Ausgabe (Cron-Log bleibt sauber).
# Konfiguration: palworld-scripts.conf im Script-Verzeichnis (oder $PALWORLD_CONF)
#
# Cron (jede Minute; bei FAILS_MAX=3 wird nach ~3 min Haenger neu gestartet):
#   * * * * * /home/scripts/palworld-watchdog.sh >> /var/log/palworld-watchdog.log 2>&1
# =============================================================================
set -euo pipefail
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- Defaults (werden durch die Conf-Datei ueberschrieben) ---------------------
SERVICE="palworld"
ADMIN_PASSWORD="CHANGE_ME"
REST_PORT=8212
REST_HOST="127.0.0.1"
WATCHDOG_FAILS_MAX=3
WATCHDOG_GRACE_SECONDS=300
DISCORD_WEBHOOK=""
LOCKFILE="/var/lock/palworld-autoupdate.lock"   # Lock des Update-Skripts

# Conf-Suche: $PALWORLD_CONF, dann neben dem Skript, dann /etc/palworld.
CONF="${PALWORLD_CONF:-}"
if [ -z "$CONF" ]; then
  for c in "${SCRIPT_DIR}/palworld-scripts.conf" /etc/palworld/palworld-scripts.conf; do
    if [ -f "$c" ]; then CONF="$c"; break; fi
  done
fi
# shellcheck disable=SC1090
[ -n "$CONF" ] && [ -f "$CONF" ] && . "$CONF"

WATCHDOG_LOCK="/var/lock/palworld-watchdog.lock"
STATE_FILE="/run/palworld-watchdog.fails"
RESTART_STATE="/run/palworld-watchdog.restarts"
WATCHDOG_MAX_RESTARTS=3          # erfolglose Neustarts pro Stunde, dann aufgeben

log() { echo "[$(date '+%F %T')] $*"; }

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

reset_fails() {
  PREV=$(cat "$STATE_FILE" 2>/dev/null || echo 0)
  if [ "$PREV" != "0" ]; then
    log "REST-API wieder erreichbar (nach ${PREV} Fehlcheck(s))."
  fi
  echo 0 > "$STATE_FILE"
}

# --- Eigenes Lock (kein Parallellauf des Watchdogs) ---------------------------
exec 9>"$WATCHDOG_LOCK"
flock -n 9 || exit 0

# --- Pausieren, wenn Update-/Restart-Skript gerade arbeitet -------------------
exec 8>"$LOCKFILE"
if ! flock -n 8; then
  exit 0
fi
flock -u 8

# --- Service-Zustand ----------------------------------------------------------
if ! systemctl cat "$SERVICE" >/dev/null 2>&1; then
  # Unit (noch) nicht installiert -> nichts zu tun
  reset_fails; exit 0
fi
if ! systemctl is-active --quiet "$SERVICE"; then
  # Gestoppt/crashed -> systemd-Restart-Policy bzw. Admin zustaendig, kein Eingriff
  reset_fails; exit 0
fi

# --- Schonfrist nach (Neu-)Start: Welt laedt noch, REST kommt spaeter hoch ------
# Monotonic-Timestamp statt 'date -d' (unabhaengig von Locale/Zeitzonen-Format)
MONO_US="$(systemctl show -p ActiveEnterTimestampMonotonic --value "$SERVICE" 2>/dev/null || echo 0)"
[[ "$MONO_US" =~ ^[0-9]+$ ]] || MONO_US=0
if [ "$MONO_US" -gt 0 ]; then
  UPTIME_S="$(awk '{print int($1)}' /proc/uptime)"
  AGE=$(( UPTIME_S - MONO_US / 1000000 ))
else
  AGE=-1   # unbekannt -> keine Schonfrist, Checks laufen normal weiter
fi
if [ "$AGE" -ge 0 ] && [ "$AGE" -lt "$WATCHDOG_GRACE_SECONDS" ]; then
  reset_fails; exit 0
fi

# --- REST-Check ------------------------------------------------------------------
API="http://${REST_HOST}:${REST_PORT}/v1/api"
# Passwort via stdin-Config statt -u (nicht in der Prozessliste sichtbar)
curl_auth() { printf 'user = "admin:%s"\n' "$ADMIN_PASSWORD"; }
HTTP_WARN_FILE="/run/palworld-watchdog.httpwarn"

HTTP_CODE="$(curl_auth | curl -s -o /dev/null -w '%{http_code}' -m 8 -K - "${API}/info" 2>/dev/null || true)"
[[ "$HTTP_CODE" =~ ^[0-9]{3}$ ]] || HTTP_CODE=000

if [ "$HTTP_CODE" = "200" ]; then
  reset_fails
  rm -f "$HTTP_WARN_FILE" "$RESTART_STATE"
  exit 0
fi
if [ "$HTTP_CODE" != "000" ]; then
  # Server ANTWORTET (z.B. 401 = falsches Passwort): Konfig-Problem, KEIN Haenger.
  # Ein Neustart wuerde nichts beheben -> einmalig melden, nicht eingreifen.
  if [ "$(cat "$HTTP_WARN_FILE" 2>/dev/null || true)" != "$HTTP_CODE" ]; then
    log "REST-API antwortet mit HTTP ${HTTP_CODE} - AdminPassword/REST-Konfig pruefen. Kein Eingriff."
    notify_discord_text "Palworld-Watchdog: REST-API antwortet mit HTTP ${HTTP_CODE} (Passwort-/Konfigproblem). Bitte pruefen."
    echo "$HTTP_CODE" > "$HTTP_WARN_FILE"
  fi
  echo 0 > "$STATE_FILE"
  exit 0
fi

# --- Fehlerpfad --------------------------------------------------------------------
FAILS=$(( $(cat "$STATE_FILE" 2>/dev/null || echo 0) + 1 ))
echo "$FAILS" > "$STATE_FILE"
log "REST-API nicht erreichbar (${FAILS}/${WATCHDOG_FAILS_MAX}), Service laeuft seit ${AGE}s."

if [ "$FAILS" -lt "$WATCHDOG_FAILS_MAX" ]; then
  exit 0
fi

# Backoff: bringt ein Neustart die REST-API nicht zurueck (z.B. defekte Config,
# kaputte Installation), waere endloses Neustarten schlimmer als Stillstand.
R_N=0; R_TS=0
if [ -f "$RESTART_STATE" ]; then
  read -r R_N R_TS < "$RESTART_STATE" || { R_N=0; R_TS=0; }
fi
[[ "$R_N"  =~ ^[0-9]+$ ]] || R_N=0
[[ "$R_TS" =~ ^[0-9]+$ ]] || R_TS=0
if [ $(( $(date +%s) - R_TS )) -gt 3600 ]; then R_N=0; fi
if [ "$R_N" -ge "$WATCHDOG_MAX_RESTARTS" ]; then
  if [ "$(cat "$HTTP_WARN_FILE" 2>/dev/null || true)" != "giveup" ]; then
    log "Bereits ${R_N} erfolglose Neustarts in der letzten Stunde - kein weiterer Eingriff. Bitte 'journalctl -u ${SERVICE}' pruefen."
    notify_discord_text "Palworld-Watchdog: ${R_N} Neustarts brachten die REST-API nicht zurueck. Watchdog pausiert, bitte manuell pruefen!"
    echo "giveup" > "$HTTP_WARN_FILE"
  fi
  exit 0
fi
echo "$(( R_N + 1 )) $(date +%s)" > "$RESTART_STATE"

log "Schwelle erreicht, erzwinge Neustart von '${SERVICE}' (${R_N} vorherige erfolglose Versuche)."
# Save-Versuch (schlaegt bei echtem Haenger vermutlich fehl, kostet nichts)
curl_auth | curl -fsS -m 8 -K - -H 'Content-Type: application/json' \
  -X POST -d '{}' "${API}/save" >/dev/null 2>&1 || true

systemctl restart "$SERVICE"
echo 0 > "$STATE_FILE"
log "Neustart ausgefuehrt."
WD_TEXT="REST-API war ${WATCHDOG_FAILS_MAX}× in Folge nicht erreichbar. Datenverlust höchstens bis zum letzten Autosave."
if [ "${DISCORD_RESTART_MESSAGE:-false}" = "true" ]; then
  discord_restart_event ok watchdog "Automatischer Neustart durch den Watchdog" "$WD_TEXT"
else
  notify_discord_text "Palworld-Watchdog: Server hing (REST-API ${WATCHDOG_FAILS_MAX}x nicht erreichbar), Service wurde neu gestartet. Datenverlust maximal bis zum letzten Autosave."
fi
