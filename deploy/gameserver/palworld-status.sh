#!/usr/bin/env bash
# =============================================================================
# palworld-status.sh - Discord-Status-Nachricht aktualisieren
#
# Duenner Wrapper um discord-status.py (im paltools-venv). Zweck: Passwort,
# Webhook und Server-Name kommen aus der palworld-scripts.conf statt aus der
# Cron-Zeile - so steht kein Geheimnis in einer 644-Datei wie /etc/cron.d/*,
# und der Cron ist auf allen Gameservern identisch.
#
# Cron (alle 5 Minuten):
#   */5 * * * * root /opt/palworld/palworld-status.sh >> /var/log/palworld-status.log 2>&1
#
# Zusaetzliche Argumente werden durchgereicht:
#   ./palworld-status.sh --dry-run
# =============================================================================
set -euo pipefail
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ADMIN_PASSWORD=""
DISCORD_WEBHOOK=""
DISCORD_SERVER_NAME=""
SERVER_ADDRESS=""
STATUS_API=""
STATUS_CONTAINER=""
STATUS_STATE=""
PALTOOLS_DIR="/opt/paltools"

CONF="${PALWORLD_CONF:-${SCRIPT_DIR}/palworld-scripts.conf}"
# shellcheck disable=SC1090
[ -f "$CONF" ] && . "$CONF"

PYTHON="${PALTOOLS_DIR}/bin/python3"
[ -x "$PYTHON" ] || PYTHON="$(command -v python3 || true)"
SCRIPT="${PALTOOLS_DIR}/discord-status.py"

fail() { echo "[$(date '+%F %T')] FEHLER: $*" >&2; exit 1; }
[ -n "$PYTHON" ] || fail "kein python3 gefunden (PALTOOLS_DIR=${PALTOOLS_DIR})."
[ -f "$SCRIPT" ] || fail "discord-status.py fehlt: ${SCRIPT}"
[ -n "$DISCORD_WEBHOOK" ] || fail "DISCORD_WEBHOOK ist nicht gesetzt (${CONF})."
[ -n "$DISCORD_SERVER_NAME" ] || fail "DISCORD_SERVER_NAME ist nicht gesetzt (${CONF})."

ARGS=(--password "$ADMIN_PASSWORD" --webhook "$DISCORD_WEBHOOK"
      --name "$DISCORD_SERVER_NAME")
[ -n "$SERVER_ADDRESS"   ] && ARGS+=(--address   "$SERVER_ADDRESS")
[ -n "$STATUS_API"       ] && ARGS+=(--api       "$STATUS_API")
[ -n "$STATUS_CONTAINER" ] && ARGS+=(--container "$STATUS_CONTAINER")
[ -n "$STATUS_STATE"     ] && ARGS+=(--state     "$STATUS_STATE")
[ -n "${REST_PORT:-}"    ] && ARGS+=(--port      "$REST_PORT")

exec "$PYTHON" "$SCRIPT" "${ARGS[@]}" "$@"
