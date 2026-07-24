#!/usr/bin/env bash
# =============================================================================
# palworld-autoupdate.sh (v3)
# Auto-Update + geplanter Neustart fuer den offiziellen Palworld-Container
# (ghcr.io/pocketpairjp/palserver) mit Ingame-Spielerwarnung via REST-API.
#
# Modi:
#   (ohne Argumente)   Update-Check gegen die GHCR-Registry; bei neuem
#                      Versions-Tag: warnen, speichern, Tag wechseln, Neustart
#   --force-restart    Neustart ohne Update (gegen RAM-Wachstum), gleiche
#                      Warn-/Save-Logik, Image-Tag bleibt unveraendert
#   --if-empty         Nur handeln, wenn 0 Spieler online sind (sonst exit 0)
#   --once-daily       Hoechstens EIN erfolgreicher Neustart pro Tag: wurde
#                      heute schon (durch Update oder Force-Restart) neu
#                      gestartet, beendet sich der Lauf still.
#   --min-gap H        Neustart nur, wenn der letzte erfolgreiche Neustart
#                      laenger als H Stunden her ist (fuer mehrere geplante
#                      Neustarts pro Tag; verhindert z. B., dass kurz nach
#                      einem Update-Neustart gleich wieder neu gestartet wird)
#   --reason "Text"    Eigener Grund fuer die Ingame-Ankuendigung
#
# Konfiguration: palworld-scripts.conf im Script-Verzeichnis (oder $PALWORLD_CONF)
# COMPOSE_DIR ist standardmaessig das Verzeichnis, in dem dieses Script liegt.
#
# Cron-Beispiele:
#   */30 * * * * /root/palworld/palworld-autoupdate.sh >> /var/log/palworld-update.log 2>&1
#
#   Fester Neustart um ~05:05 (Warnungen ab 04:55, mit Spielern):
#   55 4 * * *   /root/palworld/palworld-autoupdate.sh --force-restart --min-gap 4 --reason "Täglicher Wartungs-Neustart" >> /var/log/palworld-update.log 2>&1
#
#   Mehrere Neustarts pro Tag (Zeiten an die Spielerlast anpassen);
#   --min-gap 4 sorgt dafuer, dass nach Update-/anderen Neustarts
#   mindestens 4 h Ruhe ist, bevor der naechste geplante greift:
#   55 10 * * *  /root/palworld/palworld-autoupdate.sh --force-restart --min-gap 4 --reason "Wartungs-Neustart" >> /var/log/palworld-update.log 2>&1
# =============================================================================
set -euo pipefail
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- Defaults (werden durch die Conf-Datei ueberschrieben) ---------------------
COMPOSE_DIR="$SCRIPT_DIR"
SERVICE="palworld-server"
IMAGE_REPO="ghcr.io/pocketpairjp/palserver"
ADMIN_PASSWORD="CHANGE_ME"
REST_PORT=8212
REST_HOST=""
WARN_MINUTES=(10 5)
FINAL_COUNTDOWN=60
ALLOW_RESTART_WITHOUT_API=false
BACKUP_DIR=""
SAVED_DIR=""
BACKUP_KEEP=10
BACKUP_ON_FORCE_RESTART=false
DISCORD_WEBHOOK=""
LOCKFILE="/var/lock/palworld-autoupdate.lock"
RESTART_MARKER="/run/palworld-restart-done"

CONF="${PALWORLD_CONF:-${SCRIPT_DIR}/palworld-scripts.conf}"
# shellcheck disable=SC1090
[ -f "$CONF" ] && . "$CONF"
ENV_FILE="${ENV_FILE:-${COMPOSE_DIR}/.env}"
BACKUP_DIR="${BACKUP_DIR:-${COMPOSE_DIR}/backups}"
SAVED_DIR="${SAVED_DIR:-${COMPOSE_DIR}/Saved}"

# --- Argumente ------------------------------------------------------------------
MODE="update"
IF_EMPTY=false
ONCE_DAILY=false
MIN_GAP_HOURS=0
REASON=""
usage() { sed -n '2,34p' "$0" | sed 's/^# \{0,1\}//'; }
while [ $# -gt 0 ]; do
  case "$1" in
    --force-restart) MODE="restart" ;;
    --if-empty)      IF_EMPTY=true ;;
    --once-daily)    ONCE_DAILY=true ;;
    --min-gap)       MIN_GAP_HOURS="${2:-0}"; shift ;;
    --reason)        REASON="${2:-}"; shift ;;
    -h|--help)       usage; exit 0 ;;
    *) echo "Unbekannte Option: $1" >&2; usage; exit 2 ;;
  esac
  shift
done
[[ "$MIN_GAP_HOURS" =~ ^[0-9]+$ ]] || { echo "Ungueltiger Wert fuer --min-gap: ${MIN_GAP_HOURS}" >&2; exit 2; }

log() { echo "[$(date '+%F %T')] $*"; }
dc()  { timeout 180 docker compose --project-directory "$COMPOSE_DIR" "$@"; }

notify_discord() {
  [ -n "$DISCORD_WEBHOOK" ] || return 0
  curl -fsS -m 10 -H 'Content-Type: application/json' \
    -d "$(jq -nc --arg c "$1" '{content:$c}')" "$DISCORD_WEBHOOK" >/dev/null || true
}

# --- Doppelstart verhindern (Watchdog prueft dieses Lock ebenfalls) --------------
exec 9>"$LOCKFILE"
flock -n 9 || { log "Skript laeuft bereits, Abbruch."; exit 0; }

# --- Marker des letzten Neustarts pruefen (--once-daily / --min-gap) --------------
# Der Marker enthaelt die Unix-Zeit des letzten erfolgreichen Neustarts.
# (Aeltere Marker im Datumsformat werden ignoriert = zaehlen als "kein Marker".)
if [ "$MODE" = "restart" ]; then
  LAST_RESTART=$(cat "$RESTART_MARKER" 2>/dev/null || true)
  [[ "$LAST_RESTART" =~ ^[0-9]{9,}$ ]] || LAST_RESTART=0
  if [ "$ONCE_DAILY" = "true" ] && [ "$LAST_RESTART" -gt 0 ] && \
     [ "$(date -d "@${LAST_RESTART}" +%F)" = "$(date +%F)" ]; then
    log "Heute wurde bereits neu gestartet, ueberspringe (--once-daily)."
    exit 0
  fi
  if [ "$MIN_GAP_HOURS" -gt 0 ] && [ "$LAST_RESTART" -gt 0 ] && \
     [ $(( $(date +%s) - LAST_RESTART )) -lt $(( MIN_GAP_HOURS * 3600 )) ]; then
    log "Letzter Neustart ist weniger als ${MIN_GAP_HOURS} h her, ueberspringe (--min-gap)."
    exit 0
  fi
fi

# --- Laufenden Container + aktuelles Tag ermitteln --------------------------------
CID=$(dc ps -q "$SERVICE" 2>/dev/null || true)
if [ -z "$CID" ]; then
  log "FEHLER: Service '${SERVICE}' laeuft nicht (COMPOSE_DIR=${COMPOSE_DIR})."
  exit 1
fi
CURRENT_IMAGE=$(docker inspect -f '{{.Config.Image}}' "$CID")
CURRENT_TAG="${CURRENT_IMAGE##*:}"

# --- Update-Modus: neuestes Versions-Tag aus GHCR ermitteln -----------------------
TARGET_TAG="$CURRENT_TAG"
if [ "$MODE" = "update" ]; then
  REPO_PATH="${IMAGE_REPO#ghcr.io/}"
  TOKEN=$(curl -fsS -m 20 "https://ghcr.io/token?scope=repository:${REPO_PATH}:pull" | jq -r '.token')
  NEW_TAG=$(curl -fsS -m 20 -H "Authorization: Bearer ${TOKEN}" \
    "https://ghcr.io/v2/${REPO_PATH}/tags/list?n=1000" \
    | jq -r '.tags[]' \
    | grep -E '^v?[0-9]+(\.[0-9]+){2,3}$' \
    | awk '{orig=$0; sub(/^v/,""); print $0, orig}' \
    | sort -V | tail -n1 | awk '{print $2}')

  if [ -z "$NEW_TAG" ]; then
    log "FEHLER: Konnte kein Versions-Tag aus der Registry lesen."
    exit 1
  fi

  if [[ "$CURRENT_TAG" =~ ^v?[0-9]+(\.[0-9]+){2,3}$ ]]; then
    if [ "${CURRENT_TAG#v}" = "${NEW_TAG#v}" ]; then
      log "Server ist aktuell (${CURRENT_TAG})."
      exit 0
    fi
    HIGHEST=$(printf '%s\n%s\n' "${CURRENT_TAG#v}" "${NEW_TAG#v}" | sort -V | tail -n1)
    if [ "$HIGHEST" != "${NEW_TAG#v}" ]; then
      log "Laufende Version (${CURRENT_TAG}) ist neuer als Registry (${NEW_TAG}), nichts zu tun."
      exit 0
    fi
  else
    log "Laufendes Tag '${CURRENT_TAG}' ist nicht versioniert, wechsle auf ${NEW_TAG}."
  fi

  TARGET_TAG="$NEW_TAG"
  log "Update gefunden: ${CURRENT_TAG} -> ${NEW_TAG}"
else
  log "Geplanter Neustart angefordert (Tag bleibt ${CURRENT_TAG})."
fi

# --- REST-API vorbereiten ----------------------------------------------------------
if [ -z "$REST_HOST" ]; then
  if [ "$(docker inspect -f '{{.HostConfig.NetworkMode}}' "$CID")" = "host" ]; then
    REST_HOST="127.0.0.1"
  else
    REST_HOST=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$CID")
  fi
fi
API="http://${REST_HOST}:${REST_PORT}/v1/api"
api_get()  { curl -fsS -m 10 -u "admin:${ADMIN_PASSWORD}" "${API}/$1"; }
api_post() { curl -fsS -m 10 -u "admin:${ADMIN_PASSWORD}" -H 'Content-Type: application/json' -X POST -d "$2" "${API}/$1"; }
announce() { api_post announce "$(jq -nc --arg m "$1" '{message:$m}')" >/dev/null 2>&1 || true; }

API_OK=true
api_get info >/dev/null 2>&1 || API_OK=false

PLAYERS=0
if [ "$API_OK" = "true" ]; then
  PLAYERS=$(api_get players 2>/dev/null | jq -r '.players | length' 2>/dev/null || echo 0)
  [[ "$PLAYERS" =~ ^[0-9]+$ ]] || PLAYERS=0
fi

# --- --if-empty: nur bei leerem Server handeln ---------------------------------------
if [ "$IF_EMPTY" = "true" ]; then
  if [ "$API_OK" != "true" ]; then
    log "FEHLER: --if-empty gesetzt, aber REST-API nicht erreichbar. Spielerzahl unbekannt, breche ab."
    exit 1
  fi
  if [ "$PLAYERS" -gt 0 ]; then
    log "${PLAYERS} Spieler online, ueberspringe (--if-empty). Naechster Lauf versucht es erneut."
    exit 0
  fi
fi

# --- Update-Modus: neues Image vorab ziehen (Server laeuft weiter) --------------------
if [ "$MODE" = "update" ]; then
  log "Ziehe ${IMAGE_REPO}:${TARGET_TAG} ..."
  docker pull "${IMAGE_REPO}:${TARGET_TAG}" >/dev/null
  log "Image lokal verfuegbar."
fi

STARTED_BEFORE=$(docker inspect -f '{{.State.StartedAt}}' "$CID")

# --- Spieler warnen + sauber herunterfahren --------------------------------------------
if [ "$MODE" = "update" ]; then
  ANNOUNCE_REASON="${REASON:-SERVER UPDATE auf ${TARGET_TAG}}"
else
  ANNOUNCE_REASON="${REASON:-Geplanter Wartungs-Neustart}"
fi

if [ "$API_OK" = "true" ]; then
  log "Spieler online: ${PLAYERS}"

  if [ "$PLAYERS" -gt 0 ] && [ "${#WARN_MINUTES[@]}" -gt 0 ]; then
    mapfile -t WARNS < <(printf '%s\n' "${WARN_MINUTES[@]}" | sort -rn)
    for i in "${!WARNS[@]}"; do
      M="${WARNS[$i]}"
      # Umlaute in Ansagen sind okay (UTF-8 über die REST-API)
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
    || { log "WARNUNG: Shutdown-Befehl fehlgeschlagen, stoppe Container per SIGTERM."; dc stop -t 60 "$SERVICE"; }
else
  if [ "$ALLOW_RESTART_WITHOUT_API" = "true" ]; then
    log "WARNUNG: REST-API nicht erreichbar (${API}). Neustart OHNE Spielerwarnung/Save."
    dc stop -t 60 "$SERVICE"
  else
    log "FEHLER: REST-API nicht erreichbar (${API})."
    log "RESTAPIEnabled=True, RESTAPIPort=${REST_PORT} und AdminPassword in PalWorldSettings.ini setzen,"
    log "oder ALLOW_RESTART_WITHOUT_API=true konfigurieren."
    notify_discord "Palworld: Aktion (${MODE}) angefordert, aber REST-API nicht erreichbar. Bitte manuell pruefen."
    exit 1
  fi
fi

# --- Warten bis der Serverprozess beendet ist ---------------------------------------------
log "Warte auf Server-Shutdown..."
DEADLINE=$(( $(date +%s) + FINAL_COUNTDOWN + 180 ))
while :; do
  RUNNING=$(docker inspect -f '{{.State.Running}}' "$CID" 2>/dev/null || echo "false")
  STARTED_NOW=$(docker inspect -f '{{.State.StartedAt}}' "$CID" 2>/dev/null || echo "")
  # Container gestoppt ODER von der Restart-Policy bereits neu gestartet -> weiter
  if [ "$RUNNING" != "true" ] || [ "$STARTED_NOW" != "$STARTED_BEFORE" ]; then
    break
  fi
  if [ "$(date +%s)" -ge "$DEADLINE" ]; then
    log "WARNUNG: Server hat nicht selbststaendig gestoppt, erzwinge Recreate."
    break
  fi
  sleep 5
done

# --- Optionales Backup des Spielstands (Server ist jetzt aus = konsistent) -----------------
DO_BACKUP=false
if [ "$MODE" = "update" ]; then DO_BACKUP=true; fi
if [ "$MODE" = "restart" ] && [ "$BACKUP_ON_FORCE_RESTART" = "true" ]; then DO_BACKUP=true; fi
if [ "$DO_BACKUP" = "true" ] && [ -n "$BACKUP_DIR" ] && [ -d "$SAVED_DIR" ]; then
  mkdir -p "$BACKUP_DIR"
  BFILE="${BACKUP_DIR}/palworld-saved-$(date +%Y%m%d-%H%M%S)-${TARGET_TAG}.tar.gz"
  tar -czf "$BFILE" -C "$(dirname "$SAVED_DIR")" "$(basename "$SAVED_DIR")"
  log "Backup erstellt: ${BFILE}"
  ls -1t "${BACKUP_DIR}"/palworld-saved-*.tar.gz 2>/dev/null | tail -n +$((BACKUP_KEEP + 1)) | xargs -r rm -f
fi

# --- Neues Tag persistieren (nur Update) + Container (neu) starten ---------------------------
if [ "$MODE" = "update" ]; then
  if [ -f "$ENV_FILE" ] && grep -q '^PALSERVER_TAG=' "$ENV_FILE"; then
    sed -i "s|^PALSERVER_TAG=.*|PALSERVER_TAG=${TARGET_TAG}|" "$ENV_FILE"
  else
    echo "PALSERVER_TAG=${TARGET_TAG}" >> "$ENV_FILE"
  fi
fi

log "Starte Container mit ${IMAGE_REPO}:${TARGET_TAG} ..."
dc up -d "$SERVICE"

# Erfolgreichen Neustart vermerken (fuer --once-daily / --min-gap; gilt auch
# fuer Updates: ein Update-Neustart ersetzt den naechsten geplanten Neustart)
date +%s > "$RESTART_MARKER" 2>/dev/null || true

sleep 10
NEW_CID=$(dc ps -q "$SERVICE" 2>/dev/null || true)
RUNNING_IMAGE=$([ -n "$NEW_CID" ] && docker inspect -f '{{.Config.Image}}' "$NEW_CID" || echo "unbekannt")
log "Fertig. Laufendes Image: ${RUNNING_IMAGE}"
if [ "$MODE" = "update" ]; then
  notify_discord "Palworld-Server aktualisiert: ${CURRENT_TAG} -> ${TARGET_TAG}"
else
  notify_discord "Palworld-Server neu gestartet (geplanter Neustart, ${CURRENT_TAG})."
fi
