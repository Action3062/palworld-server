#!/usr/bin/env bash
# =============================================================================
# palworld-watchdog.sh
# Haenger-Erkennung fuer den Palworld-Container: Prozess laeuft, aber die
# REST-API antwortet nicht mehr -> nach N Fehlchecks erzwungener Neustart.
#
# Abgrenzung (bewusst so gebaut):
#   - Crash (Prozess-Exit)      -> faengt die Docker restart-Policy ab
#   - Manuell gestoppt          -> Watchdog greift NICHT ein
#   - Update/Neustart laeuft    -> Watchdog pausiert (prueft das Update-Lock)
#   - Frisch gestartet          -> Schonfrist (WATCHDOG_GRACE_SECONDS),
#                                  die Welt-Ladezeit darf kein Fehlalarm sein
#
# Bei Erfolg keine Ausgabe (Cron-Log bleibt sauber).
# Konfiguration: /etc/palworld/palworld-scripts.conf (oder neben dem Skript,
# oder $PALWORLD_CONF)
# COMPOSE_DIR ist standardmaessig das Verzeichnis, in dem dieses Script liegt.
#
# Cron (jede Minute; bei FAILS_MAX=3 wird nach ~3 min Haenger neu gestartet):
#   * * * * * /etc/palworld/palworld-watchdog.sh >> /var/log/palworld-watchdog.log 2>&1
# =============================================================================
set -euo pipefail
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- Defaults (werden durch die Conf-Datei ueberschrieben) ---------------------
COMPOSE_DIR="$SCRIPT_DIR"
SERVICE="palworld-server"
ADMIN_PASSWORD="CHANGE_ME"
REST_PORT=8212
REST_HOST=""
WATCHDOG_FAILS_MAX=3
WATCHDOG_GRACE_SECONDS=300
DISCORD_WEBHOOK=""
LOCKFILE="/var/lock/palworld-autoupdate.lock"   # Lock des Update-Skripts

# Conf-Suche: $PALWORLD_CONF, dann neben dem Skript, dann /etc/palworld.
# So ueberlebt die Konfiguration ein Neuanlegen des paltools-venv.
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

log() { echo "[$(date '+%F %T')] $*"; }
dc()  { docker compose --project-directory "$COMPOSE_DIR" "$@"; }

# --- Discord ------------------------------------------------------------------
# palworld-discord.sh pflegt EINE Neustart-Nachricht (bearbeiten statt neu
# posten). Fehlt die Datei (aeltere Installation), bleibt es beim alten
# Verhalten: eine neue Nachricht je Watchdog-Neustart.
DC_GREEN=3066993; DC_BLUE=3447003; DC_ORANGE=15105570; DC_RED=15158332
if [ -f "${SCRIPT_DIR}/palworld-discord.sh" ]; then
  # shellcheck disable=SC1091
  . "${SCRIPT_DIR}/palworld-discord.sh"
else
  DISCORD_RESTART_MESSAGE=false
  notify_discord() {
    [ -n "$DISCORD_WEBHOOK" ] || return 0
    local title="$1" desc="${2:-}" color="${3:-$DC_BLUE}"
    curl -fsS -m 10 -H 'Content-Type: application/json' \
      -d "$(jq -nc --arg t "$title" --arg d "$desc" --argjson c "$color" --arg ts "$(date -u +%FT%TZ)" \
        '{embeds:[{title:$t, description:$d, color:$c, timestamp:$ts, footer:{text:"PalHeim"}}]}')" \
      "$DISCORD_WEBHOOK" >/dev/null || true
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

# --- Container-Zustand ----------------------------------------------------------
CID=$(dc ps -q "$SERVICE" 2>/dev/null || true)
if [ -z "$CID" ]; then
  # Kein Container (down/entfernt) -> bewusste Entscheidung des Admins
  reset_fails; exit 0
fi
RUNNING=$(docker inspect -f '{{.State.Running}}' "$CID" 2>/dev/null || echo "false")
if [ "$RUNNING" != "true" ]; then
  # Gestoppt/crashed -> restart-Policy bzw. Admin zustaendig, kein Eingriff
  reset_fails; exit 0
fi

# --- Schonfrist nach (Neu-)Start: Welt laedt noch, REST kommt spaeter hoch ------
STARTED_AT=$(docker inspect -f '{{.State.StartedAt}}' "$CID")
AGE=$(( $(date +%s) - $(date -d "$STARTED_AT" +%s) ))
if [ "$AGE" -lt "$WATCHDOG_GRACE_SECONDS" ]; then
  reset_fails; exit 0
fi

# --- REST-Check ------------------------------------------------------------------
if [ -z "$REST_HOST" ]; then
  if [ "$(docker inspect -f '{{.HostConfig.NetworkMode}}' "$CID")" = "host" ]; then
    REST_HOST="127.0.0.1"
  else
    REST_HOST=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$CID")
  fi
fi
API="http://${REST_HOST}:${REST_PORT}/v1/api"

HTTP_CODE=$(curl -sS -m 8 -o /dev/null -w '%{http_code}' \
  -u "admin:${ADMIN_PASSWORD}" "${API}/info" 2>/dev/null) || HTTP_CODE="000"
if [ "$HTTP_CODE" = "200" ]; then
  reset_fails
  exit 0
fi
if [ "$HTTP_CODE" = "401" ]; then
  # API antwortet -> Server lebt, nur das Passwort passt nicht. NIEMALS neu starten!
  log "REST-API meldet 401 - ADMIN_PASSWORD in palworld-scripts.conf passt nicht zur PalWorldSettings.ini. Kein Neustart."
  reset_fails
  exit 0
fi

# --- Fehlerpfad --------------------------------------------------------------------
FAILS=$(( $(cat "$STATE_FILE" 2>/dev/null || echo 0) + 1 ))
echo "$FAILS" > "$STATE_FILE"
log "REST-API nicht erreichbar (${FAILS}/${WATCHDOG_FAILS_MAX}), Container laeuft seit ${AGE}s."

if [ "$FAILS" -lt "$WATCHDOG_FAILS_MAX" ]; then
  exit 0
fi

log "Schwelle erreicht, erzwinge Neustart von '${SERVICE}'."
# Save-Versuch (schlaegt bei echtem Haenger vermutlich fehl, kostet nichts)
curl -fsS -m 8 -u "admin:${ADMIN_PASSWORD}" -H 'Content-Type: application/json' \
  -X POST -d '{}' "${API}/save" >/dev/null 2>&1 || true

dc restart -t 60 "$SERVICE"
echo 0 > "$STATE_FILE"
log "Neustart ausgefuehrt."
WD_TEXT="REST-API war ${WATCHDOG_FAILS_MAX}× in Folge nicht erreichbar. Datenverlust höchstens bis zum letzten Autosave (alle 30 s)."
if [ "${DISCORD_RESTART_MESSAGE:-false}" = "true" ]; then
  discord_restart_event ok watchdog "Automatischer Neustart durch den Watchdog" "$WD_TEXT"
else
  notify_discord "⚠️ Watchdog: automatischer Neustart" "Die ${WD_TEXT}" "$DC_ORANGE"
fi
