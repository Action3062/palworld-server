#!/usr/bin/env bash
# ============================================================================
# install-paltools.sh – Werkzeuge zum Auslesen der Level.sav einrichten
# ============================================================================
# Auf einem PALWORLD-SERVER ausführen. Richtet alles ein, was die beiden
# Save-Skripte brauchen, und lädt sie gleich mit herunter:
#
#   • upload-bases.py  – Basen-Positionen für die Live-Karte hochladen
#   • base-report.py   – Bericht: welche Basen sind wie lange inaktiv?
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
BRANCH="claude/palworld-server-website-j2gox0"
RAW="https://raw.githubusercontent.com/Action3062/palworld-server/refs/heads/${BRANCH}/tools"

c_red()    { printf '\033[31m%s\033[0m\n' "$*"; }
c_green()  { printf '\033[32m%s\033[0m\n' "$*"; }
c_yellow() { printf '\033[33m%s\033[0m\n' "$*"; }
step()     { printf '\n\033[1m== %s\033[0m\n' "$*"; }

[ "$(id -u)" -eq 0 ] || { c_red "Bitte als root ausführen (sudo)."; exit 1; }

# ----------------------------------------------------------------------------
step "1/5 – Systempakete"
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
step "2/5 – Python-Umgebung (${VENV})"
# ----------------------------------------------------------------------------
if [ ! -x "${VENV}/bin/python3" ]; then
  python3 -m venv "$VENV"
  c_green "Neue Umgebung angelegt."
else
  c_green "Vorhandene Umgebung wird weiterverwendet."
fi
"${VENV}/bin/pip" install --quiet --upgrade pip

# ----------------------------------------------------------------------------
step "3/5 – Save-Bibliotheken (Oodle-fähige Forks)"
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
step "4/5 – Skripte holen"
# ----------------------------------------------------------------------------
for script in upload-bases.py base-report.py; do
  if curl -fsSLo "${VENV}/${script}" "${RAW}/${script}"; then
    echo "  ${script}"
  else
    c_red "  ${script} konnte nicht geladen werden (Netzwerk/URL prüfen)."
    exit 1
  fi
done
c_green "Skripte liegen in ${VENV}/."

# ----------------------------------------------------------------------------
step "5/5 – Spielstand suchen"
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
[ -n "$SERVER_ID" ] && SRV_ARG=" --server ${SERVER_ID}"

cat <<EOF

$(c_green "Fertig.")

Basen-Bericht testen (zeigt inaktive Basen, ändert nichts):
  ${VENV}/bin/python3 ${VENV}/base-report.py \\
      --sav '${SAV_GLOB}' --threshold 14

Basen für die Live-Karte hochladen (erst mit --dry-run testen):
  ${VENV}/bin/python3 ${VENV}/upload-bases.py \\
      --sav '${SAV_GLOB}' \\
      --url 'http://10.88.0.1/api/map/bases' \\
      --secret 'UPLOAD-SECRET-AUS-DER-CONFIG'${SRV_ARG} --dry-run

Als Cronjob alle 30 Minuten (crontab -e), ohne --dry-run:
  */30 * * * * ${VENV}/bin/python3 ${VENV}/upload-bases.py --sav '${SAV_GLOB}' --url 'http://10.88.0.1/api/map/bases' --secret 'UPLOAD-SECRET-AUS-DER-CONFIG'${SRV_ARG} >> /var/log/upload-bases.log 2>&1

Hinweis: Das Secret in EINFACHE Anführungszeichen setzen$([ -n "$SERVER_ID" ] && echo "; --server ${SERVER_ID} sorgt dafür,
dass die Basen beim richtigen Server der Webseite landen").
EOF
