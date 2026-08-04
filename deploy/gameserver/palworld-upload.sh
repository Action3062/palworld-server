#!/usr/bin/env bash
# =============================================================================
# palworld-upload.sh - Spielstand-Daten zur Webseite hochladen
#
# Duenner Wrapper um upload-bases.py / upload-rankings.py (im paltools-venv).
# Zweck wie bei palworld-status.sh: Secret und Pfade kommen aus der
# palworld-scripts.conf, nicht aus der Cron-Zeile.
#
# Aufruf:
#   ./palworld-upload.sh bases       # Basen fuer die Live-Karte
#   ./palworld-upload.sh rankings    # Spielerwerte fuer die Ranglisten
#   ./palworld-upload.sh bases --dry-run
#
# Cron (versetzt zu Announce :15/:45 und Update-Check :00/:30):
#   10 * * * * root /opt/palworld/palworld-upload.sh bases    >> /var/log/palworld-upload.log 2>&1
#   40 * * * * root /opt/palworld/palworld-upload.sh rankings >> /var/log/palworld-upload.log 2>&1
# =============================================================================
set -euo pipefail
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Standard: die .py-Werkzeuge liegen neben diesem Skript, der
# Interpreter im venv. Beides ueber die Conf umstellbar.
PALTOOLS_DIR="$SCRIPT_DIR"
PALTOOLS_PYTHON="/opt/paltools/bin/python3"
SAV_GLOB=""
UPLOAD_URL=""
UPLOAD_SECRET=""
WEB_SERVER_ID=""

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

fail() { echo "[$(date '+%F %T')] FEHLER: $*" >&2; exit 1; }

WHAT="${1:-}"; [ $# -gt 0 ] && shift
case "$WHAT" in
  bases)    SCRIPT="upload-bases.py";    ENDPOINT="/api/map/bases" ;;
  rankings) SCRIPT="upload-rankings.py"; ENDPOINT="/api/rankings/upload" ;;
  *) echo "Aufruf: $(basename "$0") bases|rankings [weitere Optionen]" >&2; exit 2 ;;
esac

PYTHON="$PALTOOLS_PYTHON"
[ -x "$PYTHON" ] || fail "paltools-venv fehlt: ${PYTHON} (install-paltools.sh ausfuehren)."
[ -f "${PALTOOLS_DIR}/${SCRIPT}" ] || fail "${SCRIPT} fehlt in ${PALTOOLS_DIR}."
[ -n "$SAV_GLOB" ]      || fail "SAV_GLOB ist nicht gesetzt (${CONF})."
[ -n "$UPLOAD_URL" ]    || fail "UPLOAD_URL ist nicht gesetzt (${CONF})."
[ -n "$UPLOAD_SECRET" ] || fail "UPLOAD_SECRET ist nicht gesetzt (${CONF})."

ARGS=(--sav "$SAV_GLOB" --url "${UPLOAD_URL%/}${ENDPOINT}" --secret "$UPLOAD_SECRET")
[ -n "$WEB_SERVER_ID" ] && ARGS+=(--server "$WEB_SERVER_ID")

exec "$PYTHON" "${PALTOOLS_DIR}/${SCRIPT}" "${ARGS[@]}" "$@"
