#!/usr/bin/env bash
# ============================================================================
# WireGuard-Tunnel zwischen Web-Server und Palworld-Server
#
# Zweck: Die Webseite (Web-Server) fragt die Palworld REST-API (Port 8212)
# über einen privaten Tunnel ab – die API bleibt aus dem Internet
# unerreichbar.
#
#   Web-Server (10.88.0.1)  ── WireGuard (UDP 51820) ──>  Palworld-Server (10.88.0.2)
#   z. B. 65.109.91.114                                   z. B. 178.105.238.174
#
# Ablauf (als root):
#   1. Auf dem PALWORLD-Server:  bash setup-wg.sh api
#      → zeigt den Public Key des Palworld-Servers an
#   2. Auf dem WEB-Server:       bash setup-wg.sh web <öffentliche-IP-des-Palworld-Servers>
#      → fragt nach dem Public Key aus Schritt 1, zeigt danach den eigenen an
#   3. Nochmal auf dem PALWORLD-Server:  bash setup-wg.sh api
#      → jetzt den Public Key des Web-Servers eintragen
#
# Das Skript ist idempotent: vorhandene Schlüssel bleiben erhalten,
# nur die Konfiguration wird neu geschrieben.
# ============================================================================

set -euo pipefail

ROLE="${1:-}"
ENDPOINT="${2:-}"

WG_IF="wg0"
WG_PORT=51820
WEB_WG_IP="10.88.0.1"
API_WG_IP="10.88.0.2"
API_PORT=8212

KEY_FILE="/etc/wireguard/${WG_IF}.key"
CONF_FILE="/etc/wireguard/${WG_IF}.conf"
PEER_FILE="/etc/wireguard/${WG_IF}.peer"

c_green() { printf '\033[1;32m%s\033[0m\n' "$*"; }
c_yellow() { printf '\033[1;33m%s\033[0m\n' "$*"; }
c_red() { printf '\033[1;31m%s\033[0m\n' "$*"; }
step() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }

usage() {
  echo "Aufruf:"
  echo "  bash setup-wg.sh api                     # auf dem Palworld-Server"
  echo "  bash setup-wg.sh web <ip-palworld-server> # auf dem Web-Server"
  exit 1
}

[ "$(id -u)" -eq 0 ] || { c_red "Bitte als root ausführen."; exit 1; }
case "$ROLE" in
  api) ;;
  web) [ -n "$ENDPOINT" ] || { c_red "Beim web-Aufruf die öffentliche IP des Palworld-Servers angeben."; usage; } ;;
  *) usage ;;
esac

# ----------------------------------------------------------------------------
step "WireGuard installieren"
# ----------------------------------------------------------------------------
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq wireguard >/dev/null
echo "wireguard-tools $(wg --version | head -1)"

# ----------------------------------------------------------------------------
step "Schlüssel erzeugen bzw. wiederverwenden"
# ----------------------------------------------------------------------------
umask 077
mkdir -p /etc/wireguard
if [ ! -f "$KEY_FILE" ]; then
  wg genkey > "$KEY_FILE"
  echo "Neues Schlüsselpaar erzeugt."
else
  echo "Vorhandener Schlüssel wird weiterverwendet."
fi
PRIVATE_KEY=$(cat "$KEY_FILE")
PUBLIC_KEY=$(wg pubkey <<< "$PRIVATE_KEY")

# ----------------------------------------------------------------------------
step "Public Key der Gegenseite"
# ----------------------------------------------------------------------------
SAVED_PEER=""
[ -f "$PEER_FILE" ] && SAVED_PEER=$(cat "$PEER_FILE")

if [ -n "$SAVED_PEER" ]; then
  echo "Gespeicherter Peer-Key: $SAVED_PEER"
  read -rp "Neuen Peer-Key eintragen? (Enter = behalten): " PEER_KEY < /dev/tty || PEER_KEY=""
  PEER_KEY="${PEER_KEY:-$SAVED_PEER}"
else
  read -rp "Public Key der Gegenseite (Enter = später eintragen): " PEER_KEY < /dev/tty || PEER_KEY=""
fi

if [ -n "$PEER_KEY" ]; then
  # Grobe Plausibilitätsprüfung (Base64, 44 Zeichen)
  if ! [[ "$PEER_KEY" =~ ^[A-Za-z0-9+/]{43}=$ ]]; then
    c_red "Das sieht nicht wie ein WireGuard-Public-Key aus (44 Base64-Zeichen erwartet)."
    exit 1
  fi
  printf '%s' "$PEER_KEY" > "$PEER_FILE"
fi

# ----------------------------------------------------------------------------
step "Konfiguration schreiben (${CONF_FILE})"
# ----------------------------------------------------------------------------
if [ "$ROLE" = "api" ]; then
  {
    echo "[Interface]"
    echo "Address = ${API_WG_IP}/24"
    echo "ListenPort = ${WG_PORT}"
    echo "PrivateKey = ${PRIVATE_KEY}"
    if [ -n "$PEER_KEY" ]; then
      echo ""
      echo "[Peer]"
      echo "# Web-Server"
      echo "PublicKey = ${PEER_KEY}"
      echo "AllowedIPs = ${WEB_WG_IP}/32"
    fi
  } > "$CONF_FILE"
else
  {
    echo "[Interface]"
    echo "Address = ${WEB_WG_IP}/24"
    echo "PrivateKey = ${PRIVATE_KEY}"
    if [ -n "$PEER_KEY" ]; then
      echo ""
      echo "[Peer]"
      echo "# Palworld-Server"
      echo "PublicKey = ${PEER_KEY}"
      echo "AllowedIPs = ${API_WG_IP}/32"
      echo "Endpoint = ${ENDPOINT}:${WG_PORT}"
      echo "PersistentKeepalive = 25"
    fi
  } > "$CONF_FILE"
fi
chmod 600 "$CONF_FILE"

systemctl enable wg-quick@${WG_IF} >/dev/null 2>&1
systemctl restart wg-quick@${WG_IF}
c_green "Tunnel-Interface ${WG_IF} aktiv."

# ----------------------------------------------------------------------------
step "Firewall"
# ----------------------------------------------------------------------------
if [ "$ROLE" = "api" ]; then
  if command -v ufw >/dev/null && ufw status | grep -q "Status: active"; then
    ufw allow ${WG_PORT}/udp comment "WireGuard" >/dev/null
    ufw allow in on ${WG_IF} to any port ${API_PORT} proto tcp comment "Palworld REST-API nur via Tunnel" >/dev/null
    echo "ufw: ${WG_PORT}/udp offen, REST-API ${API_PORT} nur über ${WG_IF} erlaubt."
    if ufw status | grep -E "^${API_PORT}(/tcp)?\s+ALLOW" | grep -qv "on ${WG_IF}"; then
      c_yellow "ACHTUNG: Port ${API_PORT} ist zusätzlich öffentlich erlaubt – entfernen mit:"
      c_yellow "  ufw delete allow ${API_PORT}/tcp"
    fi
  else
    c_yellow "ufw ist nicht aktiv. In der Hetzner Cloud Firewall:"
    c_yellow "  → UDP ${WG_PORT} eingehend ERLAUBEN (WireGuard)"
    c_yellow "  → TCP ${API_PORT} eingehend NICHT öffnen (läuft durch den Tunnel)"
  fi
else
  echo "Web-Server braucht keine eingehende Freigabe (baut die Verbindung selbst auf)."
fi

# ----------------------------------------------------------------------------
# Web-Rolle: Webseiten-Konfiguration auf die Tunnel-IP umstellen
# ----------------------------------------------------------------------------
if [ "$ROLE" = "web" ] && [ -f /opt/palworld-web/config.json ]; then
  step "Webseiten-Konfiguration auf Tunnel-IP umstellen"
  sed -i "s#\"palworldApiUrl\":[^,]*#\"palworldApiUrl\": \"http://${API_WG_IP}:${API_PORT}\"#" /opt/palworld-web/config.json
  systemctl restart palworld-web 2>/dev/null && echo "palworld-web neu gestartet." || true
  echo "palworldApiUrl → http://${API_WG_IP}:${API_PORT}"
fi

# ----------------------------------------------------------------------------
echo
c_green "=============================================================="
c_green " Public Key dieses Servers (an die Gegenseite übertragen):"
c_green "   ${PUBLIC_KEY}"
c_green "=============================================================="
echo
if [ -z "$PEER_KEY" ]; then
  c_yellow "Noch kein Peer eingetragen – Skript nach dem Schlüsseltausch einfach erneut ausführen."
fi
echo "Testen (sobald beide Seiten eingerichtet sind):"
if [ "$ROLE" = "web" ]; then
  echo "  ping -c 3 ${API_WG_IP}"
  echo "  curl -s -u admin:DEIN-ADMIN-PASSWORT http://${API_WG_IP}:${API_PORT}/v1/api/info"
else
  echo "  wg show          # Handshake sichtbar, sobald der Web-Server verbunden ist"
  echo "  ping -c 3 ${WEB_WG_IP}"
fi
