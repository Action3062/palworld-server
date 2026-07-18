#!/usr/bin/env bash
# =============================================================================
# palworld-backup.sh
# Regelmaessiges Spielstand-Backup im LAUFENDEN Betrieb (kein Neustart):
# Welt per REST-API speichern -> Saved-Verzeichnis in Staging kopieren ->
# Archiv packen -> alte Live-Backups rotieren.
#
# Abgrenzung zu palworld-autoupdate.sh:
#   Dessen Backups (palworld-saved-*) entstehen bei GESTOPPTEM Server
#   (Update bzw. naechtlicher Neustart) und rotieren ueber BACKUP_KEEP.
#   Dieses Skript erzeugt palworld-live-* und rotiert NUR diese
#   (LIVE_BACKUP_KEEP) - beide kommen sich nicht in die Quere.
#
# Verhalten:
#   - haelt waehrend des Backups das Update-Lock (Update/Neustart und Backup
#     koennen nie gleichzeitig am Spielstand arbeiten; der 30-min-Check holt
#     einen uebersprungenen Lauf einfach nach)
#   - Server offline -> Backup ohne API-Save (Spielstand ist dann eh statisch)
#   - Spielstand seit dem letzten Live-Backup unveraendert -> ueberspringen
#
# Konfiguration: palworld-scripts.conf (optional):
#   LIVE_BACKUP_KEEP=12        aufbewahrte Live-Backups (12 = 3 Tage bei 4/Tag)
#   LIVE_BACKUP_SAVE_WAIT=15   Sekunden Wartezeit nach dem API-Save
#
# Cron (alle 6 Stunden, bewusst versetzt zu Update :00/:30 und Announce :15/:45):
#   20 */6 * * * /root/palworld/palworld-backup.sh >> /var/log/palworld-backup.log 2>&1
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
BACKUP_DIR=""
SAVED_DIR=""
LIVE_BACKUP_KEEP=12
LIVE_BACKUP_SAVE_WAIT=15
DISCORD_WEBHOOK=""
LOCKFILE="/var/lock/palworld-autoupdate.lock"   # Lock des Update-Skripts

CONF="${PALWORLD_CONF:-${SCRIPT_DIR}/palworld-scripts.conf}"
# shellcheck disable=SC1090
[ -f "$CONF" ] && . "$CONF"
BACKUP_DIR="${BACKUP_DIR:-${COMPOSE_DIR}/backups}"
SAVED_DIR="${SAVED_DIR:-${COMPOSE_DIR}/Saved}"

BACKUP_LOCK="/var/lock/palworld-backup.lock"

log() { echo "[$(date '+%F %T')] $*"; }
dc()  { timeout 180 docker compose --project-directory "$COMPOSE_DIR" "$@"; }

notify_discord() {
  [ -n "$DISCORD_WEBHOOK" ] || return 0
  curl -fsS -m 10 -H 'Content-Type: application/json' \
    -d "$(jq -nc --arg c "$1" '{content:$c}')" "$DISCORD_WEBHOOK" >/dev/null || true
}

STAGING=""
cleanup() { if [ -n "$STAGING" ]; then rm -rf "$STAGING"; fi; }
on_error() {
  log "FEHLER: Live-Backup fehlgeschlagen."
  notify_discord "Palworld: Live-Backup fehlgeschlagen - bitte /var/log/palworld-backup.log pruefen."
}
trap cleanup EXIT
trap on_error ERR

# --- Eigenes Lock (kein Parallellauf) ------------------------------------------
exec 9>"$BACKUP_LOCK"
flock -n 9 || exit 0

# --- Update-Lock fuer die gesamte Backup-Dauer halten --------------------------
# Anders als Watchdog/Announce (kurzer Probe-Check) darf hier waehrend des
# Kopierens kein Update/Neustart dazwischenfunken. Ist das Update-Skript
# gerade aktiv, faellt dieses Backup still aus - der naechste Lauf kommt.
exec 8>"$LOCKFILE"
if ! flock -n 8; then
  log "Update-/Restart-Skript aktiv, ueberspringe diesen Backup-Lauf."
  exit 0
fi

# --- Vorbedingungen -------------------------------------------------------------
if [ ! -d "$SAVED_DIR" ]; then
  log "FEHLER: Spielstand-Verzeichnis fehlt: ${SAVED_DIR}"
  exit 1
fi
mkdir -p "$BACKUP_DIR"

# --- Welt speichern lassen (nur wenn der Server laeuft) --------------------------
CID=$(dc ps -q "$SERVICE" 2>/dev/null || true)
RUNNING="false"
if [ -n "$CID" ]; then
  RUNNING=$(docker inspect -f '{{.State.Running}}' "$CID" 2>/dev/null || echo "false")
fi

if [ "$RUNNING" = "true" ]; then
  if [ -z "$REST_HOST" ]; then
    if [ "$(docker inspect -f '{{.HostConfig.NetworkMode}}' "$CID")" = "host" ]; then
      REST_HOST="127.0.0.1"
    else
      REST_HOST=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$CID")
    fi
  fi
  API="http://${REST_HOST}:${REST_PORT}/v1/api"
  if curl -fsS -m 10 -u "admin:${ADMIN_PASSWORD}" -H 'Content-Type: application/json' \
       -X POST -d '{}' "${API}/save" >/dev/null 2>&1; then
    sleep "$LIVE_BACKUP_SAVE_WAIT"   # dem Server Zeit geben, den Save zu schreiben
  else
    log "WARNUNG: API-Save fehlgeschlagen, sichere den letzten Autosave-Stand."
  fi
fi

# --- Unveraendert seit dem letzten Live-Backup? Dann sparen wir uns das ----------
LATEST=$(ls -1t "${BACKUP_DIR}"/palworld-live-*.tar.gz 2>/dev/null | head -n1 || true)
if [ -n "$LATEST" ] && [ -z "$(find "$SAVED_DIR" -type f -newer "$LATEST" -print -quit)" ]; then
  log "Spielstand unveraendert seit $(basename "$LATEST"), ueberspringe."
  exit 0
fi

# --- Staging-Kopie + Archiv -------------------------------------------------------
# Erst kopieren, dann packen: haelt das Zeitfenster klein, in dem der laufende
# Server eine Datei genau waehrend des Lesens ersetzt.
STAGING=$(mktemp -d "${BACKUP_DIR}/.live-staging.XXXXXX")
SAVED_BASE=$(basename "$SAVED_DIR")
cp -a "$SAVED_DIR" "$STAGING/"

BFILE="${BACKUP_DIR}/palworld-live-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "${BFILE}.part" -C "$STAGING" "$SAVED_BASE"
mv "${BFILE}.part" "$BFILE"
log "Backup erstellt: ${BFILE} ($(du -sh "$BFILE" | cut -f1), Server $( [ "$RUNNING" = "true" ] && echo laeuft || echo aus ))"

# --- Rotation (nur die Live-Backups; palworld-saved-* bleibt unberuehrt) ----------
ls -1t "${BACKUP_DIR}"/palworld-live-*.tar.gz 2>/dev/null \
  | tail -n +$((LIVE_BACKUP_KEEP + 1)) | xargs -r rm -f
