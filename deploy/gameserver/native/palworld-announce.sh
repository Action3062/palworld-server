#!/usr/bin/env bash
# =============================================================================
# palworld-announce.sh (nativ/systemd)
# Sendet rotierend Ingame-Nachrichten (z.B. Discord-Hinweis) via REST-API.
#
# Nachrichtenquelle: announcements.txt im Script-Verzeichnis, eine Nachricht
# pro Zeile. '#'-Zeilen und Leerzeilen werden ignoriert. Aenderungen an der
# Datei greifen sofort, kein Neustart noetig.
#
# Platzhalter in Nachrichten:
#   {PLAYERS}     aktuelle Spielerzahl
#   {MAXPLAYERS}  Spieler-Limit
#   {DAYS}        Ingame-Tage
#
# Verhalten:
#   - Standard: nur senden, wenn Spieler online sind (ANNOUNCE_ONLY_WITH_PLAYERS)
#   - pausiert still, waehrend das Update-/Restart-Skript arbeitet (Lock-Check)
#   - Rotation der Reihe nach ueber State-File; ANNOUNCE_ORDER=random fuer Zufall
#
# Konfiguration: palworld-scripts.conf im Script-Verzeichnis (oder $PALWORLD_CONF)
#
# Cron (halbstuendlich, bewusst versetzt zum Update-Check auf :00/:30):
#   15,45 * * * * /home/scripts/palworld-announce.sh >> /var/log/palworld-announce.log 2>&1
# =============================================================================
set -euo pipefail
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- Defaults (werden durch die Conf-Datei ueberschrieben) ---------------------
SERVICE="palworld"
ADMIN_PASSWORD="CHANGE_ME"
REST_PORT=8212
REST_HOST="127.0.0.1"
ANNOUNCE_FILE=""
ANNOUNCE_ORDER="rotate"
ANNOUNCE_ONLY_WITH_PLAYERS=true
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
# Leeres REST_HOST (z. B. aus der Docker-Vorlage, wo es die Container-IP
# bedeutet) wuerde hier eine kaputte URL "http://:8212" ergeben - und der
# Watchdog wuerde einen kerngesunden Server neu starten.
REST_HOST="${REST_HOST:-127.0.0.1}"
ANNOUNCE_FILE="${ANNOUNCE_FILE:-${SCRIPT_DIR}/announcements.txt}"

ANNOUNCE_LOCK="/var/lock/palworld-announce.lock"
STATE_FILE="/run/palworld-announce.idx"

log() { echo "[$(date '+%F %T')] $*"; }

# --- Eigenes Lock + Pause waehrend Update/Restart ------------------------------
exec 9>"$ANNOUNCE_LOCK"
flock -n 9 || exit 0
exec 8>"$LOCKFILE"
flock -n 8 || exit 0
flock -u 8

# --- Nachrichten laden -----------------------------------------------------------
if [ ! -f "$ANNOUNCE_FILE" ]; then
  log "FEHLER: Nachrichtendatei fehlt: ${ANNOUNCE_FILE}"
  exit 1
fi
mapfile -t MSGS < <(grep -vE '^[[:space:]]*(#|$)' "$ANNOUNCE_FILE")
if [ "${#MSGS[@]}" -eq 0 ]; then
  log "FEHLER: Keine Nachrichten in ${ANNOUNCE_FILE}."
  exit 1
fi

# --- Server-Zustand ----------------------------------------------------------------
systemctl is-active --quiet "$SERVICE" || exit 0   # Server aus -> still ueberspringen

API="http://${REST_HOST}:${REST_PORT}/v1/api"
# Passwort via stdin-Config statt -u (nicht in der Prozessliste sichtbar)
curl_auth() { printf 'user = "admin:%s"\n' "$ADMIN_PASSWORD"; }
api_get()  { curl_auth | curl -fsS -m 10 -K - "${API}/$1"; }
api_post() { curl_auth | curl -fsS -m 10 -K - -H 'Content-Type: application/json' -X POST -d "$2" "${API}/$1"; }

METRICS=$(api_get metrics 2>/dev/null) || { log "REST-API nicht erreichbar, ueberspringe."; exit 0; }
PLAYERS=$(jq -r '.currentplayernum // 0' <<<"$METRICS")
MAXP=$(jq -r '.maxplayernum // 0'    <<<"$METRICS")
DAYS=$(jq -r '.days // 0'            <<<"$METRICS")
[[ "$PLAYERS" =~ ^[0-9]+$ ]] || PLAYERS=0
[[ "$MAXP"    =~ ^[0-9]+$ ]] || MAXP=0
[[ "$DAYS"    =~ ^[0-9]+$ ]] || DAYS=0

if [ "$ANNOUNCE_ONLY_WITH_PLAYERS" = "true" ] && [ "$PLAYERS" -eq 0 ]; then
  exit 0   # niemand da -> still ueberspringen
fi

# --- Nachricht waehlen ----------------------------------------------------------------
IDX=$(cat "$STATE_FILE" 2>/dev/null || echo 0)
[[ "$IDX" =~ ^[0-9]+$ ]] || IDX=0
if [ "$ANNOUNCE_ORDER" = "random" ]; then
  PICK=$(( RANDOM % ${#MSGS[@]} ))
else
  PICK=$(( IDX % ${#MSGS[@]} ))
fi
MSG="${MSGS[$PICK]}"
MSG="${MSG//\{PLAYERS\}/${PLAYERS}}"
MSG="${MSG//\{MAXPLAYERS\}/${MAXP}}"
MSG="${MSG//\{DAYS\}/${DAYS}}"

# --- Senden -------------------------------------------------------------------------------
if ! api_post announce "$(jq -nc --arg m "$MSG" '{message:$m}')" >/dev/null; then
  log "WARNUNG: Announce fehlgeschlagen."
  exit 1
fi
echo $(( (PICK + 1) % ${#MSGS[@]} )) > "$STATE_FILE"
log "Announce gesendet [$((PICK + 1))/${#MSGS[@]}]: ${MSG}"
