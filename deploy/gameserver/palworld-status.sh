#!/usr/bin/env bash
# =============================================================================
# palworld-status.sh - Discord-Status-Nachricht aktualisieren
#
# Duenner Wrapper um discord-status.py (im paltools-venv). Zweck: Passwort,
# Webhook und Server-Name kommen aus der palworld-scripts.conf statt aus der
# Cron-Zeile - so steht kein Geheimnis in der Cron-Zeile, und der Cron ist auf
# allen Gameservern identisch.
#
# Cron (alle 5 Minuten):
#   */5 * * * * /etc/palworld/palworld-status.sh >> /var/log/palworld-status.log 2>&1
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
STATUS_STATE=""
# Standard: die .py-Werkzeuge liegen neben diesem Skript, der
# Interpreter im venv. Beides ueber die Conf umstellbar.
PALTOOLS_DIR="$SCRIPT_DIR"
PALTOOLS_PYTHON="/opt/paltools/bin/python3"

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

PYTHON="$PALTOOLS_PYTHON"
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
[ -n "$STATUS_STATE"     ] && ARGS+=(--state     "$STATUS_STATE")

exec "$PYTHON" "$SCRIPT" "${ARGS[@]}" "$@"
