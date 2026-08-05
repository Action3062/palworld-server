#!/usr/bin/env bash
# =============================================================================
# setup-palworld.sh
# Einmaliges Setup fuer einen NATIVEN Palworld Dedicated Server (ohne Docker)
# auf Debian 13 "Trixie" (amd64). Ubuntu 22.04+ laeuft in der Regel auch.
#
# Was das Script macht:
#   1. Systemchecks       (root, systemd, Architektur, RAM, Plattenplatz, Docker)
#   2. Pakete             (curl, jq, lib32gcc-s1, cron, logrotate, nftables)
#   3. Benutzer 'palworld'
#   4. SteamCMD           nach /home/palworld/steamcmd
#   5. Palworld-Server    (Steam-App 2394010) nach /home/palworld/palserver
#   6. PalWorldSettings.ini (REST-API + RCON aktiv, AdminPassword gesetzt)
#   7. systemd-Unit       'palworld.service'
#   8. Portschutz         REST- und RCON-Port nur lokal (bzw. aus --trusted-net)
#   9. Werkzeuge          venv + ALLE Skripte per install-paltools.sh nach
#                         /etc/palworld, dazu Conf, root-crontab und Logrotate
#  10. Start + Zusammenfassung
#
# Struktur nach dem Lauf:
#   /etc/palworld/   Skripte, Python-Werkzeuge, palworld-scripts.conf (600)
#   /opt/paltools/   reines Python-venv (jederzeit wegwerfbar)
#   /home/palworld/  Server, Spielstaende, Backups
#
# Aufruf (als root):
#   bash setup-palworld.sh [Optionen]
#
# Optionen:
#   --admin-password PW   REST-/RCON-/Admin-Passwort (Default: wird generiert)
#                         erlaubt: A-Z a-z 0-9 _ -  (8-64 Zeichen)
#   --server-name NAME    Servername (Default: "Palworld Server")
#   --server-password PW  Beitritts-Passwort (Default: keins)
#   --max-players N       Spieler-Limit 1-32 (Default: 32)
#   --game-port PORT      Spiel-Port UDP (Default: 8211)
#   --rest-port PORT      REST-API-Port TCP (Default: 8212)
#   --rcon-port PORT      RCON-Port TCP (Default: 25575)
#   --no-rcon             RCON nicht aktivieren
#   --trusted-net CIDR    Netz, das REST/RCON zusaetzlich erreichen darf,
#                         z. B. 10.88.0.0/24 fuer den Tunnel zur Webseite
#   --no-firewall         Keine nftables-Regeln setzen
#   --branch NAME         Git-Branch, aus dem die Skripte geladen werden
#   --no-cron             root-crontab nicht anfassen
#   --no-start            Server am Ende nicht starten
#   -h | --help           Diese Hilfe
#
# Idempotent: ein zweiter Lauf aktualisiert Skripte, Unit und Cron, laesst
# aber Spielstaende, eine vorhandene palworld-scripts.conf und
# announcements.txt in Ruhe (das Admin-Passwort wird synchronisiert).
# =============================================================================
set -euo pipefail
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export DEBIAN_FRONTEND=noninteractive

# --- Feste Pfade / Konstanten -------------------------------------------------
PAL_USER="palworld"
PAL_HOME="/home/${PAL_USER}"
STEAMCMD_DIR="${PAL_HOME}/steamcmd"
STEAMCMD="${STEAMCMD_DIR}/steamcmd.sh"
INSTALL_DIR="${PAL_HOME}/palserver"
BACKUP_DIR="${PAL_HOME}/backups"
TOOLS_DIR="/etc/palworld"
VENV="/opt/paltools"
SERVICE_NAME="palworld"
UNIT_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
LOGROTATE_FILE="/etc/logrotate.d/palworld"
NFT_FILE="/etc/palworld-firewall.nft"
APP_ID=2394010
REPO="Action3062/palworld-server"
STEAMCMD_URLS=(
  "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz"
  "https://media.steampowered.com/installer/steamcmd_linux.tar.gz"
)

# --- Defaults (per Optionen aenderbar) -----------------------------------------
ADMIN_PASSWORD=""
SERVER_NAME="Palworld Server"
SERVER_PASSWORD=""
MAX_PLAYERS=32
GAME_PORT=8211
REST_PORT=8212
RCON_PORT=25575
ENABLE_RCON=true
TRUSTED_NET=""
INSTALL_FW=true
INSTALL_CRON=true
START_SERVER=true
BRANCH="${BRANCH:-claude/discord-restart-message-update-bixh4e}"
# Merker, welche Werte der Aufrufer explizit gesetzt hat. Alles andere wird bei
# einem Re-Run aus der vorhandenen Installation uebernommen statt zurueckgesetzt.
NAME_SET=false; PLAYERS_SET=false; GAMEPORT_SET=false; RESTPORT_SET=false; RCONPORT_SET=false

log()  { echo "[$(date '+%F %T')] $*"; }
warn() { echo "[$(date '+%F %T')] WARNUNG: $*" >&2; }
die()  { echo "[$(date '+%F %T')] FEHLER: $*" >&2; exit 1; }
as_pal() { runuser -l "$PAL_USER" -c "$*"; }
usage() { awk 'NR>2 && /^# ={10,}/{exit} NR>2{sub(/^# ?/,""); print}' "$0"; }

# --- Argumente ------------------------------------------------------------------
while [ $# -gt 0 ]; do
  case "$1" in
    --admin-password)  ADMIN_PASSWORD="${2:-}"; shift ;;
    --server-name)     SERVER_NAME="${2:-}"; NAME_SET=true; shift ;;
    --server-password) SERVER_PASSWORD="${2:-}"; shift ;;
    --max-players)     MAX_PLAYERS="${2:-}"; PLAYERS_SET=true; shift ;;
    --game-port)       GAME_PORT="${2:-}"; GAMEPORT_SET=true; shift ;;
    --rest-port)       REST_PORT="${2:-}"; RESTPORT_SET=true; shift ;;
    --rcon-port)       RCON_PORT="${2:-}"; RCONPORT_SET=true; shift ;;
    --no-rcon)         ENABLE_RCON=false ;;
    --trusted-net)     TRUSTED_NET="${2:-}"; shift ;;
    --no-firewall)     INSTALL_FW=false ;;
    --branch)          BRANCH="${2:-}"; shift ;;
    --no-cron)         INSTALL_CRON=false ;;
    --no-start)        START_SERVER=false ;;
    -h|--help)         usage; exit 0 ;;
    *) die "Unbekannte Option: $1 (siehe --help)" ;;
  esac
  shift
done
RAW="https://raw.githubusercontent.com/${REPO}/refs/heads/${BRANCH}"

# --- Eingaben validieren ---------------------------------------------------------
PW_RE='^[A-Za-z0-9_-]{8,64}$'
NAME_RE='^[A-Za-z0-9. _-]{1,64}$'
NUM_RE='^[0-9]+$'
CONF_FILE="${TOOLS_DIR}/palworld-scripts.conf"

if [ -z "$ADMIN_PASSWORD" ] && [ -f "$CONF_FILE" ]; then
  # Re-Run: vorhandenes Passwort weiterverwenden - sonst kennt der laufende
  # Server nur das alte und der Watchdog sieht ueberall HTTP 401
  EXISTING_PW="$(sed -n 's/^ADMIN_PASSWORD="\([^"]*\)".*/\1/p' "$CONF_FILE" | head -n1)"
  if [ -n "$EXISTING_PW" ] && [ "$EXISTING_PW" != "CHANGE_ME" ]; then
    ADMIN_PASSWORD="$EXISTING_PW"
    log "Vorhandenes Admin-Passwort aus der Conf uebernommen."
  fi
fi
if [ -z "$ADMIN_PASSWORD" ]; then
  ADMIN_PASSWORD="$(tr -dc 'A-Za-z0-9' </dev/urandom | head -c 24 || true)"
  [ -n "$ADMIN_PASSWORD" ] || die "Konnte kein Admin-Passwort generieren."
fi

# Re-Run: nicht explizit gesetzte Werte aus der vorhandenen INI uebernehmen,
# sonst horcht der Server ploetzlich woanders als Conf und Watchdog erwarten.
EXISTING_INI="${INSTALL_DIR}/Pal/Saved/Config/LinuxServer/PalWorldSettings.ini"
if [ -f "$EXISTING_INI" ]; then
  ini_get()     { sed -n "s/.*[,(]$1=\\([^,)]*\\).*/\\1/p" "$EXISTING_INI" | head -n1; }
  ini_get_str() { sed -n "s/.*[,(]$1=\"\\([^\"]*\\)\".*/\\1/p" "$EXISTING_INI" | head -n1; }
  if [ "$NAME_SET" != "true" ];      then V="$(ini_get_str ServerName)";        [ -n "$V" ] && SERVER_NAME="$V"; fi
  if [ "$PLAYERS_SET" != "true" ];   then V="$(ini_get ServerPlayerMaxNum)";    [[ "$V" =~ $NUM_RE ]] && MAX_PLAYERS="$V"; fi
  if [ "$GAMEPORT_SET" != "true" ];  then V="$(ini_get PublicPort)";            [[ "$V" =~ $NUM_RE ]] && GAME_PORT="$V"; fi
  if [ "$RESTPORT_SET" != "true" ];  then V="$(ini_get RESTAPIPort)";           [[ "$V" =~ $NUM_RE ]] && REST_PORT="$V"; fi
  if [ "$RCONPORT_SET" != "true" ];  then V="$(ini_get RCONPort)";              [[ "$V" =~ $NUM_RE ]] && RCON_PORT="$V"; fi
  log "Bestehende Installation erkannt - nicht angegebene Einstellungen aus der INI uebernommen."
fi

[[ "$ADMIN_PASSWORD" =~ $PW_RE ]] || die "Admin-Passwort ungueltig (erlaubt: A-Za-z0-9_-, 8-64 Zeichen)."
[[ "$SERVER_NAME" =~ $NAME_RE ]] || die "Servername ungueltig (erlaubt: A-Za-z0-9 Punkt Leerzeichen _ -, max 64)."
if [ -n "$SERVER_PASSWORD" ]; then
  [[ "$SERVER_PASSWORD" =~ $PW_RE ]] || die "Server-Passwort ungueltig (erlaubt: A-Za-z0-9_-, 8-64 Zeichen)."
fi
{ [[ "$MAX_PLAYERS" =~ $NUM_RE ]] && [ "$MAX_PLAYERS" -ge 1 ] && [ "$MAX_PLAYERS" -le 32 ]; } \
  || die "Spieler-Limit muss 1-32 sein."
for P in "$GAME_PORT" "$REST_PORT" "$RCON_PORT"; do
  { [[ "$P" =~ $NUM_RE ]] && [ "$P" -ge 1024 ] && [ "$P" -le 65535 ]; } \
    || die "Port '${P}' ungueltig (1024-65535)."
done
[ "$GAME_PORT" != "$REST_PORT" ] || die "Spiel-Port und REST-Port duerfen nicht gleich sein."
if [ "$ENABLE_RCON" = "true" ]; then
  { [ "$RCON_PORT" != "$GAME_PORT" ] && [ "$RCON_PORT" != "$REST_PORT" ]; } \
    || die "RCON-Port darf nicht gleich Spiel- oder REST-Port sein."
fi
if [ -n "$TRUSTED_NET" ]; then
  [[ "$TRUSTED_NET" =~ ^[0-9]{1,3}(\.[0-9]{1,3}){3}/[0-9]{1,2}$ ]] \
    || die "--trusted-net erwartet ein IPv4-Netz in CIDR-Schreibweise, z. B. 10.88.0.0/24."
fi

# =============================================================================
log "==> [1/10] Systemchecks"
# =============================================================================
[ "$(id -u)" -eq 0 ] || die "Bitte als root ausfuehren."
command -v systemctl >/dev/null 2>&1 || die "systemd (systemctl) nicht gefunden."

# Am selben Lock teilnehmen wie die Wartungsjobs: ein laufendes Update darf
# nicht mitten im Betrieb von diesem Script ueberholt werden (und umgekehrt).
mkdir -p /var/lock
exec 9>/var/lock/palworld-autoupdate.lock
flock -w 60 9 || die "Ein Wartungsjob (Update/Neustart) laeuft gerade - bitte in ein paar Minuten erneut ausfuehren."

[ "$(uname -m)" = "x86_64" ] || die "Nur x86_64/amd64 wird unterstuetzt (gefunden: $(uname -m))."

if [ -r /etc/os-release ]; then
  # shellcheck disable=SC1091
  . /etc/os-release
  if [ "${ID:-}" != "debian" ]; then
    warn "Getestet fuer Debian 13, gefunden: ${PRETTY_NAME:-unbekannt}. Weiter auf eigene Gefahr."
  elif [ "${VERSION_ID:-}" != "13" ]; then
    warn "Getestet fuer Debian 13, gefunden: ${PRETTY_NAME:-Debian ${VERSION_ID:-?}}."
  fi
fi

# Laeuft hier noch ein Palworld im Container? Dann wuerden zwei Server um
# Ports und Spielstand streiten - das muss der Admin bewusst entscheiden.
if command -v docker >/dev/null 2>&1; then
  RUNNING_CT="$(docker ps --format '{{.Image}} {{.Names}}' 2>/dev/null | grep -i -m1 'palserver\|palworld' || true)"
  if [ -n "$RUNNING_CT" ]; then
    warn "Es laeuft bereits ein Palworld-CONTAINER: ${RUNNING_CT}"
    warn "Dieses Script richtet eine NATIVE Instanz ein. Vor dem Start des Dienstes:"
    warn "  1. Container stoppen:  docker compose -f <compose.yml> down"
    warn "  2. Spielstand kopieren: <compose-dir>/Saved -> ${INSTALL_DIR}/Pal/Saved"
    warn "  3. Erst danach: systemctl start ${SERVICE_NAME}"
    START_SERVER=false
    log "Automatischer Start deaktiviert (--no-start wirkt implizit)."
  fi
fi

MEM_GB=$(( $(awk '/^MemTotal:/{print $2}' /proc/meminfo) / 1024 / 1024 ))
[ "$MEM_GB" -ge 14 ] || warn "Nur ~${MEM_GB} GB RAM erkannt. Palworld braucht min. 16 GB (32 GB empfohlen)."

DISK_REF="/"; [ -d /home ] && DISK_REF="/home"
AVAIL_GB="$(df -BG --output=avail "$DISK_REF" | tail -n1 | tr -dc '0-9')"
AVAIL_GB="${AVAIL_GB:-0}"
[ "$AVAIL_GB" -ge 15 ] || die "Zu wenig freier Plattenplatz: ${AVAIL_GB} GB (min. 15 GB, empfohlen 30+)."
[ "$AVAIL_GB" -ge 30 ] || warn "Nur ${AVAIL_GB} GB frei. Fuer Updates + Backups sind 30+ GB empfohlen."

# =============================================================================
log "==> [2/10] Pakete installieren (apt)"
# =============================================================================
apt-get update -qq
apt-get install -y -qq --no-install-recommends \
  ca-certificates curl jq tar gzip xz-utils \
  lib32gcc-s1 lib32stdc++6 \
  cron logrotate
[ "$INSTALL_FW" = "true" ] && apt-get install -y -qq --no-install-recommends nftables
systemctl enable --now cron >/dev/null 2>&1 || true

# =============================================================================
log "==> [3/10] Benutzer '${PAL_USER}' anlegen"
# =============================================================================
if ! id -u "$PAL_USER" >/dev/null 2>&1; then
  useradd --create-home --home-dir "$PAL_HOME" --shell /bin/bash "$PAL_USER"
  log "Benutzer '${PAL_USER}' angelegt."
else
  log "Benutzer '${PAL_USER}' existiert bereits."
  CUR_SHELL="$(getent passwd "$PAL_USER" | cut -d: -f7)"
  case "$CUR_SHELL" in
    */nologin|*/false) usermod -s /bin/bash "$PAL_USER"; log "Shell auf /bin/bash gesetzt." ;;
  esac
fi
passwd -l "$PAL_USER" >/dev/null 2>&1 || true   # Passwort-Login sperren
install -d -o "$PAL_USER" -g "$PAL_USER" -m 750 "$BACKUP_DIR"

# =============================================================================
log "==> [4/10] SteamCMD installieren"
# =============================================================================
if [ ! -x "$STEAMCMD" ]; then
  install -d -o "$PAL_USER" -g "$PAL_USER" "$STEAMCMD_DIR"
  TARBALL="$(mktemp)"
  DL_OK=false
  for URL in "${STEAMCMD_URLS[@]}"; do
    if curl -fsSL -m 180 "$URL" -o "$TARBALL"; then DL_OK=true; break; fi
    warn "Download fehlgeschlagen: ${URL}"
  done
  [ "$DL_OK" = "true" ] || { rm -f "$TARBALL"; die "SteamCMD-Download fehlgeschlagen (Internet? Firewall?)."; }
  tar -xzf "$TARBALL" -C "$STEAMCMD_DIR"
  rm -f "$TARBALL"
  chown -R "$PAL_USER":"$PAL_USER" "$STEAMCMD_DIR"
  log "SteamCMD nach ${STEAMCMD_DIR} entpackt."
else
  log "SteamCMD bereits vorhanden."
fi

log "SteamCMD Selbstupdate (erster Lauf kann etwas dauern) ..."
as_pal "'${STEAMCMD}' +quit" >/dev/null 2>&1 || warn "SteamCMD-Erstlauf endete mit Fehlercode (oft harmlos)."
[ -f "${STEAMCMD_DIR}/linux64/steamclient.so" ] \
  || die "SteamCMD unvollstaendig (linux64/steamclient.so fehlt). Log: ${STEAMCMD_DIR}/logs/"

# =============================================================================
log "==> [5/10] Palworld Dedicated Server (App ${APP_ID}) installieren"
# =============================================================================
install -d -o "$PAL_USER" -g "$PAL_USER" "$INSTALL_DIR"

SERVICE_STATE="$(systemctl is-active "$SERVICE_NAME" 2>/dev/null || true)"
if [ "$SERVICE_STATE" = "active" ] || [ "$SERVICE_STATE" = "activating" ]; then
  log "Service laeuft bereits (${SERVICE_STATE}) - ueberspringe app_update (uebernimmt palworld-autoupdate.sh)."
else
  STEAM_LOG="$(mktemp)"
  INSTALL_OK=false
  for ATTEMPT in 1 2 3; do
    as_pal "'${STEAMCMD}' +force_install_dir '${INSTALL_DIR}' +login anonymous +app_update ${APP_ID} validate +quit" 2>&1 | tee "$STEAM_LOG" || true
    # Exit-Code allein reicht nicht: SteamCMD meldet manche Fehler trotzdem mit 0
    if grep -q "Success! App '${APP_ID}'" "$STEAM_LOG"; then INSTALL_OK=true; break; fi
    warn "SteamCMD app_update fehlgeschlagen (Versuch ${ATTEMPT}/3), neuer Versuch in 10s ..."
    sleep 10
  done
  rm -f "$STEAM_LOG"
  [ "$INSTALL_OK" = "true" ] || die "Palworld-Installation fehlgeschlagen."
fi

chmod +x "${INSTALL_DIR}/PalServer.sh" 2>/dev/null || true
[ -x "${INSTALL_DIR}/PalServer.sh" ] || die "PalServer.sh fehlt nach der Installation (${INSTALL_DIR})."
# steamclient.so, sonst meckert der Server beim Start (dlopen failed)
as_pal "mkdir -p ~/.steam/sdk64 && ln -sfn '${STEAMCMD_DIR}/linux64/steamclient.so' ~/.steam/sdk64/steamclient.so"

# =============================================================================
log "==> [6/10] PalWorldSettings.ini konfigurieren (REST-API + RCON)"
# =============================================================================
CFG_DIR="${INSTALL_DIR}/Pal/Saved/Config/LinuxServer"
INI_FILE="${CFG_DIR}/PalWorldSettings.ini"
DEFAULT_INI="${INSTALL_DIR}/DefaultPalWorldSettings.ini"

as_pal "mkdir -p '${CFG_DIR}'"
if [ ! -s "$INI_FILE" ]; then
  [ -f "$DEFAULT_INI" ] || die "DefaultPalWorldSettings.ini fehlt - Installation unvollstaendig?"
  cp "$DEFAULT_INI" "$INI_FILE"
  log "PalWorldSettings.ini aus Default-Vorlage erzeugt."
else
  log "PalWorldSettings.ini existiert - Werte werden aktualisiert, Rest bleibt."
fi

# String-Werte stehen im OptionSettings-Block in Anfuehrungszeichen, Zahlen/Bools nicht.
set_ini_str() {
  local key="$1" val="$2"
  if grep -q "${key}=\"" "$INI_FILE"; then
    sed -i "s|${key}=\"[^\"]*\"|${key}=\"${val}\"|" "$INI_FILE"
  else
    warn "Key ${key} nicht in ${INI_FILE} gefunden - bitte manuell setzen."
  fi
}
set_ini_raw() {
  local key="$1" val="$2"
  if grep -q "${key}=" "$INI_FILE"; then
    sed -i "s|${key}=[^,)]*|${key}=${val}|" "$INI_FILE"
  else
    warn "Key ${key} nicht in ${INI_FILE} gefunden - bitte manuell setzen."
  fi
}

set_ini_str AdminPassword "$ADMIN_PASSWORD"
set_ini_str ServerName "$SERVER_NAME"
[ -n "$SERVER_PASSWORD" ] && set_ini_str ServerPassword "$SERVER_PASSWORD"
set_ini_raw ServerPlayerMaxNum "$MAX_PLAYERS"
set_ini_raw RESTAPIEnabled True
set_ini_raw RESTAPIPort "$REST_PORT"
set_ini_raw PublicPort "$GAME_PORT"
# RCON nutzt dasselbe AdminPassword. Die Webseite braucht es fuer die
# Vote-Belohnungen (lib/rcon.js, config.json -> votes.reward.rcon).
if [ "$ENABLE_RCON" = "true" ]; then
  set_ini_raw RCONEnabled True
  set_ini_raw RCONPort "$RCON_PORT"
else
  set_ini_raw RCONEnabled False
fi
chown "$PAL_USER":"$PAL_USER" "$INI_FILE"
chmod 600 "$INI_FILE"   # enthaelt Admin-/Server-Passwort

# Harter Abbruch: ohne REST-API wuerde der Watchdog den gesunden Server
# fuer immer im Kreis neu starten, statt dass jemand den Fehler bemerkt.
grep -q "RESTAPIEnabled=True" "$INI_FILE" \
  || die "RESTAPIEnabled=True konnte nicht gesetzt werden. Watchdog und Auto-Update brauchen die REST-API - bitte den OptionSettings-Block in ${INI_FILE} pruefen."

# =============================================================================
log "==> [7/10] systemd-Unit ${SERVICE_NAME}.service anlegen"
# =============================================================================
cat > "$UNIT_FILE" <<UNIT_EOF
[Unit]
Description=Palworld Dedicated Server (nativ, ohne Docker)
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=${PAL_USER}
Group=${PAL_USER}
WorkingDirectory=${INSTALL_DIR}
# -publiclobby anhaengen, wenn der Server in der Community-Serverliste stehen soll
ExecStart=${INSTALL_DIR}/PalServer.sh -port=${GAME_PORT} -publicport=${GAME_PORT} -players=${MAX_PLAYERS} -useperfthreads -NoAsyncLoadingThread -UseMultithreadForDS
# always statt on-failure: auch ein Exit-Code 0 soll neu starten. Manuelles
# 'systemctl stop' startet NICHT neu; das Update-Script stoppt gezielt.
Restart=always
RestartSec=30
TimeoutStopSec=90
LimitNOFILE=100000

[Install]
WantedBy=multi-user.target
UNIT_EOF

systemctl daemon-reload
systemctl enable "$SERVICE_NAME" >/dev/null 2>&1

# =============================================================================
log "==> [8/10] Portschutz fuer REST- und RCON-Port"
# =============================================================================
# Bewusst KEINE Default-Deny-Policy: eine eigene Tabelle, die ausschliesslich
# REST- und RCON-Port betrifft. SSH und alles andere bleiben unangetastet, ein
# Aussperren ist damit ausgeschlossen. 'lo' muss erlaubt bleiben, sonst
# erreichen die Wartungsscripts die REST-API auf 127.0.0.1 nicht mehr.
# Der Spiel-Port bleibt offen - da sollen die Spieler ja drauf.
if [ "$INSTALL_FW" != "true" ]; then
  log "Portschutz uebersprungen (--no-firewall). REST-/RCON-Port sind dann oeffentlich erreichbar!"
else
  TRUSTED_RULE=""
  [ -n "$TRUSTED_NET" ] && TRUSTED_RULE="    ip saddr ${TRUSTED_NET} accept"
  RCON_RULE=""
  [ "$ENABLE_RCON" = "true" ] && RCON_RULE="    tcp dport ${RCON_PORT} drop"

  cat > "$NFT_FILE" <<NFT_EOF
#!/usr/sbin/nft -f
# Palworld: REST- und RCON-Port nur lokal (bzw. aus dem vertrauten Netz)
table inet palworld
delete table inet palworld
table inet palworld {
  chain input {
    type filter hook input priority filter; policy accept;
    iifname "lo" accept
${TRUSTED_RULE}
    tcp dport ${REST_PORT} drop
${RCON_RULE}
  }
}
NFT_EOF
  chmod 644 "$NFT_FILE"

  cat > /etc/systemd/system/palworld-firewall.service <<FWU_EOF
[Unit]
Description=Palworld Portschutz (REST-/RCON-Port nicht oeffentlich)
After=network-pre.target
Wants=network-pre.target

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/sbin/nft -f ${NFT_FILE}
ExecStop=/usr/sbin/nft delete table inet palworld

[Install]
WantedBy=multi-user.target
FWU_EOF
  systemctl daemon-reload
  systemctl enable --now palworld-firewall.service >/dev/null 2>&1 \
    || warn "palworld-firewall.service liess sich nicht aktivieren - REST-/RCON-Port sind dann oeffentlich!"
fi

# =============================================================================
log "==> [9/10] Werkzeuge und Skripte nach ${TOOLS_DIR}"
# =============================================================================
# install-paltools.sh macht die eigentliche Arbeit: Python-venv unter ${VENV},
# alle Skripte + Python-Werkzeuge nach ${TOOLS_DIR}, Conf-Vorlage nur, wenn
# noch keine existiert. SCRIPT_SET=native waehlt die systemd-Variante von
# autoupdate/watchdog/announce.
INSTALLER="$(mktemp)"
curl -fsSL -o "$INSTALLER" "${RAW}/deploy/gameserver/install-paltools.sh" \
  || die "install-paltools.sh konnte nicht geladen werden (Branch '${BRANCH}' richtig?)."
BRANCH="$BRANCH" SCRIPT_SET=native TOOLS_DIR="$TOOLS_DIR" VENV="$VENV" bash "$INSTALLER"
rm -f "$INSTALLER"

[ -f "$CONF_FILE" ] || die "Conf wurde nicht angelegt: ${CONF_FILE}"
# Werte, die dieses Setup kennt, in die Conf schreiben (auch bei Re-Runs).
conf_set() {  # conf_set <key> <wert-mit-quotes-oder-zahl>
  local key="$1" val="$2"
  if grep -q "^${key}=" "$CONF_FILE"; then
    sed -i "s|^${key}=.*|${key}=${val}|" "$CONF_FILE"
  else
    printf '%s=%s\n' "$key" "$val" >> "$CONF_FILE"
  fi
}
conf_set ADMIN_PASSWORD "\"${ADMIN_PASSWORD}\""
conf_set SERVICE        "\"${SERVICE_NAME}\""
conf_set PAL_USER       "\"${PAL_USER}\""
conf_set INSTALL_DIR    "\"${INSTALL_DIR}\""
conf_set STEAMCMD       "\"${STEAMCMD}\""
conf_set SAVED_DIR      "\"${INSTALL_DIR}/Pal/Saved\""
conf_set BACKUP_DIR     "\"${BACKUP_DIR}\""
conf_set SAV_GLOB       "\"${INSTALL_DIR}/Pal/Saved/SaveGames/0/*/Level.sav\""
conf_set REST_PORT      "${REST_PORT}"
conf_set REST_HOST      "\"127.0.0.1\""
conf_set STATUS_API     "\"http://127.0.0.1:${REST_PORT}\""
chmod 600 "$CONF_FILE"

# --- root-crontab ---------------------------------------------------------------
# Bewusst die root-crontab statt /etc/cron.d: so liegt die gesamte Automatik an
# einer Stelle (crontab -e). Ein alter /etc/cron.d/palworld wuerde alles doppelt
# ausfuehren und wird deshalb entfernt.
if [ "$INSTALL_CRON" != "true" ]; then
  log "Cron uebersprungen (--no-cron)."
else
  if [ -f /etc/cron.d/palworld ]; then
    mv /etc/cron.d/palworld "/root/cron.d-palworld.alt-$(date +%F)"
    log "Alte /etc/cron.d/palworld nach /root/cron.d-palworld.alt-$(date +%F) verschoben (lief sonst doppelt)."
  fi
  CRON_TMP="$(mktemp)"
  crontab -l 2>/dev/null > "${CRON_TMP}.alt" || true
  if [ -s "${CRON_TMP}.alt" ]; then
    cp "${CRON_TMP}.alt" "/root/crontab.backup-$(date +%F)"
    log "Bisherige root-crontab gesichert: /root/crontab.backup-$(date +%F)"
  fi
  # Alten Palworld-Block entfernen, Rest der crontab unangetastet lassen
  awk '/^# >>> palworld/{skip=1} /^# <<< palworld/{skip=0; next} !skip' \
    "${CRON_TMP}.alt" > "$CRON_TMP" 2>/dev/null || true
  cat >> "$CRON_TMP" <<CRON_EOF
# >>> palworld (von setup-palworld.sh verwaltet - Block nicht umbenennen)
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
MAILTO=""
# Update-Check
*/30 *     * * * ${TOOLS_DIR}/palworld-autoupdate.sh >> /var/log/palworld-update.log 2>&1
# Geplante Neustarts (Warnung ab :55, Server geht ~10 min spaeter runter).
# Muss zu RESTART_SCHEDULE in der Conf passen (dort Cron-Zeit + Vorwarnzeit).
55   4,9,17 * * * ${TOOLS_DIR}/palworld-autoupdate.sh --force-restart --min-gap 4 --reason "Wartungs-Neustart" >> /var/log/palworld-update.log 2>&1
# Haenger-Erkennung
*    *      * * * ${TOOLS_DIR}/palworld-watchdog.sh >> /var/log/palworld-watchdog.log 2>&1
# Ingame-Ansagen
15,45 *     * * * ${TOOLS_DIR}/palworld-announce.sh >> /var/log/palworld-announce.log 2>&1
# Live-Backup alle 6 Stunden
20   */6    * * * ${TOOLS_DIR}/palworld-backup.sh >> /var/log/palworld-backup.log 2>&1
# Discord: Status-Nachricht und Neustart-Nachricht frisch halten
*/5  *      * * * ${TOOLS_DIR}/palworld-status.sh >> /var/log/palworld-status.log 2>&1
*/15 *      * * * ${TOOLS_DIR}/palworld-autoupdate.sh --discord-refresh >/dev/null 2>&1
# Uploads zur Webseite
10   *      * * * ${TOOLS_DIR}/palworld-upload.sh bases    >> /var/log/palworld-upload.log 2>&1
40   *      * * * ${TOOLS_DIR}/palworld-upload.sh rankings >> /var/log/palworld-upload.log 2>&1
# <<< palworld
CRON_EOF
  crontab "$CRON_TMP"
  rm -f "$CRON_TMP" "${CRON_TMP}.alt"
  log "root-crontab aktualisiert (Block '>>> palworld')."
fi

cat > "$LOGROTATE_FILE" <<'EOF_LOGROTATE'
/var/log/palworld-*.log {
    weekly
    rotate 8
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
    su root root
}
EOF_LOGROTATE

# =============================================================================
log "==> [10/10] Server starten"
# =============================================================================
HEALTH_OK=skipped
if [ "$START_SERVER" = "true" ]; then
  if systemctl is-active --quiet "$SERVICE_NAME"; then
    log "Service laeuft bereits."
    warn "Geaenderte Ports/Spielerlimit greifen erst nach: systemctl restart ${SERVICE_NAME}"
  else
    log "Starte ${SERVICE_NAME}.service ..."
    systemctl start "$SERVICE_NAME"
    log "Erster Start: Weltgenerierung kann 1-2 Minuten dauern, REST-API kommt danach hoch."
  fi

  # Nicht "fertig" melden, ohne es geprueft zu haben: ohne funktionierende
  # REST-API arbeiten Watchdog und Auto-Update nicht.
  log "Warte auf die REST-API (max. 4 Minuten) ..."
  HEALTH_OK=false
  for _ in $(seq 1 48); do
    sleep 5
    systemctl is-active --quiet "$SERVICE_NAME" || continue
    if printf 'user = "admin:%s"\n' "$ADMIN_PASSWORD" \
       | curl -fsS -m 5 -K - "http://127.0.0.1:${REST_PORT}/v1/api/info" >/dev/null 2>&1; then
      HEALTH_OK=true; break
    fi
  done
  if [ "$HEALTH_OK" = "true" ]; then
    log "Server laeuft, REST-API antwortet."
  else
    warn "Server/REST-API kam nicht hoch! Watchdog und Auto-Update funktionieren so NICHT."
    warn "Bitte pruefen: journalctl -u ${SERVICE_NAME} -n 100 --no-pager"
  fi
else
  log "Start uebersprungen."
fi

SERVER_IP="$(hostname -I 2>/dev/null | awk '{print $1}' || true)"
SERVER_IP="${SERVER_IP:-<SERVER-IP>}"
case "$HEALTH_OK" in
  true)    HEALTH_TEXT="Server laeuft, REST-API antwortet." ;;
  skipped) HEALTH_TEXT="Nicht gestartet. Start mit: systemctl start ${SERVICE_NAME}" ;;
  *)       HEALTH_TEXT="ACHTUNG - Server/REST-API antwortet NICHT. Siehe 'journalctl -u ${SERVICE_NAME} -n 100'" ;;
esac
RCON_TEXT="deaktiviert"
[ "$ENABLE_RCON" = "true" ] && RCON_TEXT="Port ${RCON_PORT} (Passwort = Admin-Passwort)"
TRUSTED_TEXT="nur lokal (127.0.0.1)"
[ -n "$TRUSTED_NET" ] && TRUSTED_TEXT="lokal + ${TRUSTED_NET}"

cat <<SUMMARY_EOF

=========================================================================
 Palworld-Server-Setup abgeschlossen
=========================================================================

 Status:           ${HEALTH_TEXT}
 Verbinden:        ${SERVER_IP}:${GAME_PORT}
 Servername:       ${SERVER_NAME}
 Admin-Passwort:   ${ADMIN_PASSWORD}
                   (JETZT NOTIEREN - steht auch in ${CONF_FILE}
                    und in der PalWorldSettings.ini)
 REST-API:         Port ${REST_PORT}, erreichbar: ${TRUSTED_TEXT}
 RCON:             ${RCON_TEXT}

 Pfade:
   Server:         ${INSTALL_DIR}
   Spielstaende:   ${INSTALL_DIR}/Pal/Saved
   Einstellungen:  ${INI_FILE}
   SteamCMD:       ${STEAMCMD_DIR}
   Skripte + Conf: ${TOOLS_DIR}
   Python-venv:    ${VENV}   (wegwerfbar: rm -rf + Setup erneut)
   Backups:        ${BACKUP_DIR}

 Service:
   systemctl status ${SERVICE_NAME}     # Zustand
   systemctl restart ${SERVICE_NAME}    # Neustart (ohne Spielerwarnung!)
   journalctl -u ${SERVICE_NAME} -f     # Server-Log

 Automatik (root-crontab, Block '>>> palworld'):
   :00/:30   Update-Check      :10  Basen-Upload     :15/:45  Ansagen
   :20 (6 h) Live-Backup       :40  Ranglisten       alle 5 min  Discord-Status
   55 4,9,17 Wartungs-Neustart mit Ingame-Warnung (10/5 min)
   Logs: /var/log/palworld-*.log

 NOCH ZU TUN:
   1. ${CONF_FILE} ausfuellen: DISCORD_WEBHOOK, DISCORD_SERVER_NAME,
      SERVER_ADDRESS, RESTART_SCHEDULE, UPLOAD_SECRET, WEB_SERVER_ID.
   2. Trockenlaeufe:
        ${TOOLS_DIR}/palworld-status.sh --dry-run
        ${TOOLS_DIR}/palworld-upload.sh bases --dry-run
        ${TOOLS_DIR}/palworld-backup.sh --dry-run
   3. Firewall des Hosters: ${GAME_PORT}/udp eingehend erlauben,
      ${REST_PORT}/tcp$([ "$ENABLE_RCON" = "true" ] && echo " und ${RCON_PORT}/tcp") NICHT oeffentlich.
   4. Discord-Link in ${TOOLS_DIR}/announcements.txt anpassen.
   5. Servereinstellungen (Raten, PvP, ...) in der PalWorldSettings.ini,
      danach: systemctl restart ${SERVICE_NAME}
   6. Community-Serverliste? '-publiclobby' in ${UNIT_FILE}
      an ExecStart anhaengen, dann daemon-reload + restart.

=========================================================================
SUMMARY_EOF
