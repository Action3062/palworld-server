#!/usr/bin/env bash
# ============================================================================
# install-paltools.sh – alle Server-Werkzeuge nach /opt/paltools einrichten
# ============================================================================
# Auf einem PALWORLD-SERVER ausführen. Richtet das Python-venv ein und holt
# alle Skripte, die dort laufen – auf jedem Gameserver dieselben:
#
#   Python (brauchen das venv):
#   • upload-bases.py     – Basen-Positionen für die Live-Karte hochladen
#   • upload-rankings.py  – Spielerwerte für die Ranglisten hochladen
#   • base-report.py      – Bericht: welche Basen sind wie lange inaktiv?
#   • discord-status.py   – Status-Nachricht im Discord pflegen
#
#   Wartung (Bash, lesen /etc/palworld/palworld-scripts.conf):
#   • palworld-autoupdate.sh  palworld-watchdog.sh  palworld-backup.sh
#   • palworld-discord.sh (Bibliothek)  palworld-status.sh  palworld-upload.sh
#
# Ein zweiter Lauf aktualisiert alle Skripte; die Konfiguration unter
# /etc/palworld bleibt dabei unangetastet.
#
# Aufruf:
#   bash install-paltools.sh                 # Standard-Server (erster in der config)
#   bash install-paltools.sh classic         # Server-ID der Webseite (Mehrserver)
#
# Warum ein eigenes venv?  Seit Debian 12 ist das System-Python geschützt
# (PEP 668), pip-Installationen landen deshalb in /opt/paltools.
# Warum die MRHRTZ-Forks?  Seit Palworld 0.6 sind Spielstände Oodle-komprimiert
# (Magic "PlM"); nur der Fork + pyooz können dieses Format lesen.
# ============================================================================
set -euo pipefail

VENV="${VENV:-/opt/paltools}"
SERVER_ID="${1:-}"
BRANCH="${BRANCH:-claude/palworld-server-website-j2gox0}"
RAW_BASE="https://raw.githubusercontent.com/Action3062/palworld-server/refs/heads/${BRANCH}"
RAW="${RAW_BASE}/tools"                  # Python-Werkzeuge
RAW_SRV="${RAW_BASE}/deploy/gameserver"  # Wartungs-Skripte
CONF_DIR="${CONF_DIR:-/etc/palworld}"

c_red()    { printf '\033[31m%s\033[0m\n' "$*"; }
c_green()  { printf '\033[32m%s\033[0m\n' "$*"; }
c_yellow() { printf '\033[33m%s\033[0m\n' "$*"; }
step()     { printf '\n\033[1m== %s\033[0m\n' "$*"; }

[ "$(id -u)" -eq 0 ] || { c_red "Bitte als root ausführen (sudo)."; exit 1; }

# ----------------------------------------------------------------------------
step "1/6 – Systempakete"
# ----------------------------------------------------------------------------
# python3-venv: eigene Umgebung; git: Installation direkt von GitHub;
# build-essential + python3-dev: pyooz wird beim Installieren kompiliert.
MISSING=""
for pkg in python3-venv git build-essential python3-dev curl; do
  dpkg -s "$pkg" >/dev/null 2>&1 || MISSING="$MISSING $pkg"
done
if [ -n "$MISSING" ]; then
  echo "Installiere:$MISSING"
  apt-get update -qq
  # shellcheck disable=SC2086
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq $MISSING
  c_green "Systempakete installiert."
else
  c_green "Alle Systempakete bereits vorhanden."
fi

# ----------------------------------------------------------------------------
step "2/6 – Python-Umgebung (${VENV})"
# ----------------------------------------------------------------------------
if [ ! -x "${VENV}/bin/python3" ]; then
  python3 -m venv "$VENV"
  c_green "Neue Umgebung angelegt."
else
  c_green "Vorhandene Umgebung wird weiterverwendet."
fi
"${VENV}/bin/pip" install --quiet --upgrade pip

# ----------------------------------------------------------------------------
step "3/6 – Save-Bibliotheken (Oodle-fähige Forks)"
# ----------------------------------------------------------------------------
echo "pyooz (Oodle-Dekomprimierung, wird kompiliert – dauert einen Moment) …"
"${VENV}/bin/pip" install --quiet "git+https://github.com/MRHRTZ/pyooz.git"
echo "palworld-save-tools (Fork mit PlM-Unterstützung) …"
"${VENV}/bin/pip" install --quiet "git+https://github.com/MRHRTZ/palworld-save-tools.git"

if "${VENV}/bin/python3" -c "import ooz, palworld_save_tools" 2>/dev/null; then
  c_green "Bibliotheken einsatzbereit."
else
  c_red "Die Bibliotheken lassen sich nicht importieren – bitte Ausgabe oben prüfen."
  exit 1
fi

# ----------------------------------------------------------------------------
step "4/6 – Python-Werkzeuge holen"
# ----------------------------------------------------------------------------
fetch() {  # fetch <ziel> <url>
  if curl -fsSLo "$1" "$2"; then
    echo "  $(basename "$1")"
  else
    c_red "  $(basename "$1") konnte nicht geladen werden (Netzwerk/URL prüfen)."
    exit 1
  fi
}
for script in upload-bases.py upload-rankings.py base-report.py discord-status.py; do
  fetch "${VENV}/${script}" "${RAW}/${script}"
done

# ----------------------------------------------------------------------------
step "5/6 – Wartungs-Skripte holen"
# ----------------------------------------------------------------------------
for script in palworld-autoupdate.sh palworld-watchdog.sh palworld-backup.sh \
              palworld-discord.sh palworld-status.sh palworld-upload.sh; do
  fetch "${VENV}/${script}" "${RAW_SRV}/${script}"
  chmod 755 "${VENV}/${script}"
done
fetch "${VENV}/announcements.txt" "${RAW_SRV}/announcements.txt"
c_green "Alle Skripte liegen in ${VENV}/."

# Konfiguration liegt bewusst NICHT im venv: ein neu angelegtes venv soll die
# Passwörter nicht mitreißen. Vorhandene Conf wird nie überschrieben.
mkdir -p "$CONF_DIR"; chmod 750 "$CONF_DIR"
if [ -f "${CONF_DIR}/palworld-scripts.conf" ]; then
  c_green "Konfiguration bleibt unverändert: ${CONF_DIR}/palworld-scripts.conf"
else
  fetch "${CONF_DIR}/palworld-scripts.conf" "${RAW_SRV}/palworld-scripts.conf.example"
  chmod 600 "${CONF_DIR}/palworld-scripts.conf"
  c_yellow "Neue Vorlage: ${CONF_DIR}/palworld-scripts.conf – Werte mit [SERVER] anpassen!"
fi

# ----------------------------------------------------------------------------
step "6/6 – Spielstand suchen"
# ----------------------------------------------------------------------------
# Ohne Docker liegt der Spielstand meist im Home des Server-Benutzers,
# mit Docker unter dem gemounteten Datenverzeichnis.
SAV=$(find / -name Level.sav -path '*SaveGames*' -not -path '*/backup*' \
        -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -1 | cut -d' ' -f2-)

if [ -n "$SAV" ]; then
  c_green "Gefunden: ${SAV}"
  SAV_GLOB="$(dirname "$(dirname "$SAV")")/*/Level.sav"
else
  c_yellow "Keine Level.sav gefunden – läuft der Server schon und wurde gespeichert?"
  SAV_GLOB="/pfad/zu/Saved/SaveGames/0/*/Level.sav"
fi

SRV_ARG=""
[ -n "$SERVER_ID" ] && SRV_ARG="$SERVER_ID"

cat <<EOF

$(c_green "Fertig.")

1) Konfiguration ausfüllen (dort steht ALLES Serverspezifische):
     nano ${CONF_DIR}/palworld-scripts.conf
   Mindestens: COMPOSE_DIR, SERVICE, ADMIN_PASSWORD, DISCORD_WEBHOOK,
   DISCORD_SERVER_NAME, RESTART_SCHEDULE, UPLOAD_SECRET$([ -n "$SRV_ARG" ] && echo ", WEB_SERVER_ID=\"${SRV_ARG}\"")
     SAV_GLOB="${SAV_GLOB}"

2) Trockenlauf – schreibt nichts, postet nichts:
     ${VENV}/palworld-upload.sh bases --dry-run
     ${VENV}/palworld-status.sh --dry-run
     ${VENV}/bin/python3 ${VENV}/base-report.py --sav '${SAV_GLOB}' --threshold 14

3) Cron übernehmen (Vorlage: deploy/gameserver/crontab-palworld.txt):
     crontab -l > ~/crontab.backup-\$(date +%F)
     crontab -e

4) Logs begrenzen:
     install -m 644 logrotate-palworld /etc/logrotate.d/palworld
EOF
