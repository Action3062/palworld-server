#!/usr/bin/env bash
# =============================================================================
# palworld-backup.sh
# Regelmaessiges Spielstand-Backup im LAUFENDEN Betrieb (kein Neustart, systemd):
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
# --dry-run zeigt nur, was passieren wuerde: Pfade, Groesse des Spielstands,
# Name des Archivs, welche alten Backups die Rotation loeschen wuerde. Es wird
# nichts gespeichert, nichts gepackt und nichts geloescht.
#
# Cron (alle 6 Stunden, bewusst versetzt zu Update :00/:30 und Announce :15/:45):
#   20 */6 * * * /etc/palworld/palworld-backup.sh >> /var/log/palworld-backup.log 2>&1
# =============================================================================
set -euo pipefail
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- Defaults (werden durch die Conf-Datei ueberschrieben) ---------------------
SERVICE="palworld-server"
ADMIN_PASSWORD="CHANGE_ME"
REST_PORT=8212
REST_HOST=""
BACKUP_DIR=""
SAVED_DIR=""
LIVE_BACKUP_KEEP=12
LIVE_BACKUP_SAVE_WAIT=15
# So lange (Sekunden) auf ein laufendes Update/Neustart warten, statt sofort
# zu ueberspringen. Deckt die 10-min-Spielerwarnung eines Neustarts ab.
BACKUP_LOCK_WAIT=900
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
INSTALL_DIR="${INSTALL_DIR:-/home/palworld/palserver}"
BACKUP_DIR="${BACKUP_DIR:-/home/palworld/backups}"
SAVED_DIR="${SAVED_DIR:-${INSTALL_DIR}/Pal/Saved}"
REST_HOST="${REST_HOST:-127.0.0.1}"

BACKUP_LOCK="/var/lock/palworld-backup.lock"

DRY_RUN=false
case "${1:-}" in
  --dry-run) DRY_RUN=true ;;
  "")        ;;
  *) echo "Aufruf: $(basename "$0") [--dry-run]" >&2; exit 2 ;;
esac

log() { echo "[$(date '+%F %T')] $*"; }

# Discord-Benachrichtigung als farbiges Embed.
#   notify_discord <Titel (mit Emoji)> <Text> [Farbe]
DC_GREEN=3066993; DC_BLUE=3447003; DC_ORANGE=15105570; DC_RED=15158332
notify_discord() {
  [ -n "$DISCORD_WEBHOOK" ] || return 0
  local title="$1" desc="${2:-}" color="${3:-$DC_BLUE}"
  curl -fsS -m 10 -H 'Content-Type: application/json' \
    -d "$(jq -nc --arg t "$title" --arg d "$desc" --argjson c "$color" --arg ts "$(date -u +%FT%TZ)" \
      '{embeds:[{title:$t, description:$d, color:$c, timestamp:$ts, footer:{text:"PalHeim"}}]}')" \
    "$DISCORD_WEBHOOK" >/dev/null || true
}

STAGING=""
cleanup() { if [ -n "$STAGING" ]; then rm -rf "$STAGING"; fi; }
on_error() {
  log "FEHLER: Live-Backup fehlgeschlagen."
  # Ein Trockenlauf meldet nichts nach Discord - er soll nur zeigen, nicht laermen
  [ "$DRY_RUN" = "true" ] && return 0
  notify_discord "🔴 Live-Backup fehlgeschlagen" "Bitte ins Log schauen: \`/var/log/palworld-backup.log\`" "$DC_RED"
}
trap cleanup EXIT
trap on_error ERR

# --- Eigenes Lock (kein Parallellauf) ------------------------------------------
exec 9>"$BACKUP_LOCK"
flock -n 9 || exit 0

# --- Update-Lock fuer die gesamte Backup-Dauer halten --------------------------
# Anders als Watchdog/Announce (kurzer Probe-Check) darf hier waehrend des
# Kopierens kein Update/Neustart dazwischenfunken. Laeuft gerade ein
# Neustart (inkl. 10-min-Spielerwarnung), wird bis zu BACKUP_LOCK_WAIT
# Sekunden gewartet und DANACH gesichert (frisch gestarteter Stand = ideal),
# statt den Lauf sofort ausfallen zu lassen. Erst wenn wirklich etwas haengt,
# wird nach dem Timeout uebersprungen.
exec 8>"$LOCKFILE"
if [ "$DRY_RUN" = "true" ]; then
  # Nicht warten und nicht blockieren - nur berichten, wie die Lage ist
  if flock -n 8; then
    flock -u 8
    log "[dry-run] Update-Lock ist frei, ein echter Lauf koennte sofort starten."
  else
    log "[dry-run] Update-/Restart-Skript laeuft gerade - ein echter Lauf wuerde bis zu ${BACKUP_LOCK_WAIT}s warten."
  fi
elif ! flock -w "$BACKUP_LOCK_WAIT" 8; then
  log "Update-/Restart-Skript laeuft seit ueber ${BACKUP_LOCK_WAIT}s, ueberspringe diesen Backup-Lauf."
  exit 0
fi

# --- Vorbedingungen -------------------------------------------------------------
if [ ! -d "$SAVED_DIR" ]; then
  log "FEHLER: Spielstand-Verzeichnis fehlt: ${SAVED_DIR}"
  exit 1
fi
if [ "$DRY_RUN" = "true" ]; then
  log "[dry-run] Spielstand:  ${SAVED_DIR} ($(du -sh "$SAVED_DIR" 2>/dev/null | cut -f1))"
  log "[dry-run] Backup-Ziel: ${BACKUP_DIR}$([ -d "$BACKUP_DIR" ] || echo ' (wird angelegt)')"
else
  mkdir -p "$BACKUP_DIR"
fi

# --- Welt speichern lassen (nur wenn der Server laeuft) --------------------------
RUNNING="false"
if systemctl is-active --quiet "$SERVICE" 2>/dev/null; then
  RUNNING="true"
fi

if [ "$RUNNING" = "true" ]; then
  API="http://${REST_HOST}:${REST_PORT}/v1/api"
  if [ "$DRY_RUN" = "true" ]; then
    if curl -fsS -m 10 -u "admin:${ADMIN_PASSWORD}" "${API}/info" >/dev/null 2>&1; then
      log "[dry-run] REST-API erreichbar (${API}) - der Lauf wuerde erst speichern lassen."
    else
      log "[dry-run] REST-API NICHT erreichbar (${API}) - es wuerde der letzte Autosave-Stand gesichert."
    fi
  elif curl -fsS -m 10 -u "admin:${ADMIN_PASSWORD}" -H 'Content-Type: application/json' \
       -X POST -d '{}' "${API}/save" >/dev/null 2>&1; then
    sleep "$LIVE_BACKUP_SAVE_WAIT"   # dem Server Zeit geben, den Save zu schreiben
  else
    log "WARNUNG: API-Save fehlgeschlagen, sichere den letzten Autosave-Stand."
  fi
else
  [ "$DRY_RUN" = "true" ] && log "[dry-run] Service '${SERVICE}' laeuft nicht - Sicherung ohne API-Save."
fi

# --- Unveraendert seit dem letzten Live-Backup? Dann sparen wir uns das ----------
LATEST=$(ls -1t "${BACKUP_DIR}"/palworld-live-*.tar.gz 2>/dev/null | head -n1 || true)
if [ -n "$LATEST" ] && [ -z "$(find "$SAVED_DIR" -type f -newer "$LATEST" -print -quit)" ]; then
  log "Spielstand unveraendert seit $(basename "$LATEST"), ueberspringe."
  exit 0
fi

if [ "$DRY_RUN" = "true" ]; then
  log "[dry-run] Wuerde anlegen: ${BACKUP_DIR}/palworld-live-$(date +%Y%m%d-%H%M%S).tar.gz"
  # Achtung pipefail: ohne "|| true" reisst ein leeres/fehlendes BACKUP_DIR
  # den ganzen Lauf mit in den ERR-Trap.
  EXISTING=$(ls -1t "${BACKUP_DIR}"/palworld-live-*.tar.gz 2>/dev/null || true)
  COUNT=$(printf '%s' "$EXISTING" | grep -c . || true)
  log "[dry-run] Live-Backups vorhanden: ${COUNT}, aufbewahrt werden ${LIVE_BACKUP_KEEP}."
  OLD=$(printf '%s\n' "$EXISTING" | tail -n +"$LIVE_BACKUP_KEEP" | grep . || true)
  if [ -n "$OLD" ]; then
    log "[dry-run] Die Rotation wuerde danach loeschen:"
    printf '  %s\n' $OLD
  else
    log "[dry-run] Die Rotation wuerde nichts loeschen."
  fi
  log "[dry-run] Fertig - es wurde nichts veraendert."
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
