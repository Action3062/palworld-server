#!/usr/bin/env bash
# ============================================================================
# install-paltools.sh – Server-Werkzeuge nach /etc/palworld einrichten
# ============================================================================
# Auf einem PALWORLD-SERVER ausführen. Legt zwei Verzeichnisse an:
#
#   /etc/palworld/   alles, was du pflegst: Skripte + Konfiguration
#   /opt/paltools/   reines Python-venv – jederzeit wegwerfbar und neu baubar
#
# Geholt werden – auf jedem Gameserver dieselben:
#
#   Python (brauchen das venv):
#   • upload-bases.py     – Basen-Positionen für die Live-Karte hochladen
#   • upload-rankings.py  – Spielerwerte für die Ranglisten hochladen
#   • base-report.py      – Bericht: welche Basen sind wie lange inaktiv?
#   • discord-status.py   – Status-Nachricht im Discord pflegen
#
#   Wartung (Bash, lesen /etc/palworld/palworld-scripts.conf):
#   • palworld-autoupdate.sh  palworld-watchdog.sh  palworld-announce.sh
#   • palworld-backup.sh  palworld-event.sh
#   • palworld-discord.sh (Bibliothek)  palworld-status.sh  palworld-upload.sh
#
#   Dazu: announcements.txt, crontab-palworld.txt (Vorlage zum Nachschlagen)
#   und /etc/logrotate.d/palworld, falls dort noch nichts liegt.
#
# Ein zweiter Lauf aktualisiert alle Skripte; die palworld-scripts.conf
# bleibt dabei unangetastet.
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

VENV="${VENV:-/opt/paltools}"          # nur das Python-venv (wegwerfbar)
TOOLS_DIR="${TOOLS_DIR:-/etc/palworld}" # Skripte + Konfiguration
SERVER_ID="${1:-}"
BRANCH="${BRANCH:-claude/palworld-server-website-j2gox0}"
RAW_BASE="https://raw.githubusercontent.com/Action3062/palworld-server/refs/heads/${BRANCH}"
RAW="${RAW_BASE}/tools"                  # Python-Werkzeuge
RAW_SRV="${RAW_BASE}/deploy/gameserver"  # Wartungs-Skripte
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
# pyooz wird beim Installieren kompiliert (dauert Minuten). Bei einem zweiten
# Lauf ist das unnoetig, solange sich beides importieren laesst.
if [ "${FORCE_LIBS:-0}" != "1" ] && \
   "${VENV}/bin/python3" -c "import ooz, palworld_save_tools" 2>/dev/null; then
  c_green "Bibliotheken sind bereits einsatzbereit (Neuinstallation: FORCE_LIBS=1)."
else
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
fi

# ----------------------------------------------------------------------------
step "4/6 – Werkzeuge holen (${TOOLS_DIR})"
# ----------------------------------------------------------------------------
fetch() {  # fetch <ziel> <url> - erst nach Temp, dann verschieben
  local tmp; tmp="$(mktemp)"
  if curl -fsSLo "$tmp" "$2" && [ -s "$tmp" ]; then
    mv "$tmp" "$1"
    chmod 644 "$1"          # mktemp legt 600 an; Rechte danach explizit setzen
    echo "  $(basename "$1")"
  else
    rm -f "$tmp"
    c_red "  $(basename "$1") konnte nicht geladen werden."
    c_red "  URL: $2"
    c_red "  (Branch falsch? Dann mit BRANCH=<branch> bash install-paltools.sh starten.)"
    exit 1
  fi
}
mkdir -p "$TOOLS_DIR"; chmod 750 "$TOOLS_DIR"
for script in upload-bases.py upload-rankings.py base-report.py discord-status.py; do
  fetch "${TOOLS_DIR}/${script}" "${RAW}/${script}"
done

# ----------------------------------------------------------------------------
step "5/6 – Wartungs-Skripte und Konfiguration"
# ----------------------------------------------------------------------------
for script in palworld-autoupdate.sh palworld-watchdog.sh palworld-announce.sh \
              palworld-backup.sh palworld-event.sh palworld-discord.sh \
              palworld-status.sh palworld-upload.sh; do
  fetch "${TOOLS_DIR}/${script}" "${RAW_SRV}/${script}"
  chmod 755 "${TOOLS_DIR}/${script}"
done
fetch "${TOOLS_DIR}/announcements.txt" "${RAW_SRV}/announcements.txt"
# Cron-Vorlage nur als Nachschlagewerk - eingetragen wird sie von Hand
# (crontab -e) bzw. von setup-palworld.sh.
fetch "${TOOLS_DIR}/crontab-palworld.txt" "${RAW_SRV}/crontab-palworld.txt"
c_green "Alle Skripte liegen in ${TOOLS_DIR}/."

# Logrotate: vorhandene Datei nicht ueberschreiben, eigene Anpassungen bleiben
if [ -f /etc/logrotate.d/palworld ]; then
  c_green "Logrotate bleibt unveraendert: /etc/logrotate.d/palworld"
else
  fetch /etc/logrotate.d/palworld "${RAW_SRV}/logrotate-palworld"
  c_green "Logrotate eingerichtet: /etc/logrotate.d/palworld"
fi

# Vorhandene Konfiguration wird NIE überschrieben (Passwörter!).
if [ -f "${TOOLS_DIR}/palworld-scripts.conf" ]; then
  c_green "Konfiguration bleibt unverändert: ${TOOLS_DIR}/palworld-scripts.conf"
else
  fetch "${TOOLS_DIR}/palworld-scripts.conf" "${RAW_SRV}/palworld-scripts.conf.example"
  c_yellow "Neue Vorlage: ${TOOLS_DIR}/palworld-scripts.conf – Werte mit [SERVER] anpassen!"
fi
chmod 600 "${TOOLS_DIR}/palworld-scripts.conf"

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
     nano ${TOOLS_DIR}/palworld-scripts.conf
   Mindestens: SERVICE, INSTALL_DIR, ADMIN_PASSWORD, DISCORD_WEBHOOK,
   DISCORD_SERVER_NAME, RESTART_SCHEDULE, UPLOAD_SECRET$([ -n "$SRV_ARG" ] && echo ", WEB_SERVER_ID=\"${SRV_ARG}\"")
     SAV_GLOB="${SAV_GLOB}"

2) Trockenlauf – schreibt nichts, postet nichts:
     ${TOOLS_DIR}/palworld-upload.sh bases --dry-run
     ${TOOLS_DIR}/palworld-status.sh --dry-run
     ${VENV}/bin/python3 ${TOOLS_DIR}/base-report.py --sav '${SAV_GLOB}' --threshold 14

3) Cron übernehmen (Vorlage: deploy/gameserver/crontab-palworld.txt):
     crontab -l > ~/crontab.backup-\$(date +%F)
     crontab -e

4) Cron uebernehmen ist der letzte Schritt - Vorlage liegt jetzt lokal:
     less ${TOOLS_DIR}/crontab-palworld.txt
EOF
