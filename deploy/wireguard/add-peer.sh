#!/usr/bin/env bash
# ============================================================================
# add-peer.sh – einen WEITEREN Palworld-Server an den bestehenden Tunnel hängen
# ============================================================================
# Auf dem WEB-SERVER ausführen. Ergänzt die vorhandene WireGuard-Konfiguration
# um einen zusätzlichen Peer – bereits eingetragene Server bleiben erhalten
# (setup-wg.sh würde die Datei komplett neu schreiben und Server 1 verlieren).
#
#   Web-Server (10.88.0.1) ──┬── Tunnel ──> Palworld-Server 1 (10.88.0.2)
#                            └── Tunnel ──> Palworld-Server 2 (10.88.0.3)
#
# Ablauf für einen neuen Spielserver:
#   1. AUF DEM NEUEN SPIELSERVER (legt dessen Tunnel-Seite an und zeigt am Ende
#      seinen Public Key):
#        API_WG_IP=10.88.0.3 bash setup-wg.sh api
#   2. AUF DEM WEB-SERVER (dieses Skript, mit dem Key aus Schritt 1):
#        bash add-peer.sh 10.88.0.3 <PUBLIC-KEY-VOM-NEUEN-SERVER> <öffentliche-IP-des-neuen-Servers>
#   3. Auf dem neuen Spielserver den Public Key des Web-Servers eintragen,
#      falls in Schritt 1 noch nicht geschehen (setup-wg.sh erneut ausführen).
#
# Das Skript ist idempotent: Ein erneuter Aufruf mit demselben Peer aktualisiert
# den Eintrag, statt ihn zu verdoppeln.
# ============================================================================
set -euo pipefail

WG_IF="${WG_IF:-wg-palweb}"
WG_PORT="${WG_PORT:-51821}"
CONF_FILE="/etc/wireguard/${WG_IF}.conf"
API_PORT="${API_PORT:-8212}"

c_red()    { printf '\033[31m%s\033[0m\n' "$*"; }
c_green()  { printf '\033[32m%s\033[0m\n' "$*"; }
c_yellow() { printf '\033[33m%s\033[0m\n' "$*"; }
step()     { printf '\n\033[1m== %s\033[0m\n' "$*"; }

PEER_IP="${1:-}"
PEER_KEY="${2:-}"
ENDPOINT="${3:-}"

if [ -z "$PEER_IP" ] || [ -z "$PEER_KEY" ] || [ -z "$ENDPOINT" ]; then
  c_red "Aufruf: bash add-peer.sh <TUNNEL-IP> <PUBLIC-KEY> <ENDPOINT-HOST-ODER-IP>"
  echo   "Beispiel: bash add-peer.sh 10.88.0.3 abc...= 203.0.113.77"
  exit 1
fi

[ "$(id -u)" -eq 0 ] || { c_red "Bitte als root ausführen (sudo)."; exit 1; }

if ! [[ "$PEER_IP" =~ ^10\.88\.0\.[0-9]{1,3}$ ]]; then
  c_red "Tunnel-IP sieht falsch aus: ${PEER_IP} (erwartet z. B. 10.88.0.3)"
  exit 1
fi
if ! [[ "$PEER_KEY" =~ ^[A-Za-z0-9+/]{43}=$ ]]; then
  c_red "Das sieht nicht wie ein WireGuard-Public-Key aus (44 Base64-Zeichen)."
  exit 1
fi
if [ ! -f "$CONF_FILE" ]; then
  c_red "${CONF_FILE} fehlt – es gibt noch keinen Tunnel."
  c_yellow "Zuerst den ersten Server einrichten:  bash setup-wg.sh web <IP-SERVER-1>"
  exit 1
fi
if [ "$PEER_IP" = "10.88.0.1" ]; then
  c_red "10.88.0.1 ist der Web-Server selbst – bitte eine andere Tunnel-IP wählen."
  exit 1
fi

# ----------------------------------------------------------------------------
step "Sicherung anlegen"
# ----------------------------------------------------------------------------
BACKUP="${CONF_FILE}.$(date +%Y%m%d-%H%M%S).bak"
cp -a "$CONF_FILE" "$BACKUP"
echo "Backup: ${BACKUP}"

BEFORE=$(grep -c '^\[Peer\]' "$CONF_FILE" || true)
echo "Bisher eingetragene Server: ${BEFORE}"

# ----------------------------------------------------------------------------
step "Peer eintragen (vorhandene bleiben erhalten)"
# ----------------------------------------------------------------------------
# Einen eventuell schon vorhandenen Eintrag mit demselben Key ODER derselben
# Tunnel-IP entfernen, damit ein zweiter Aufruf aktualisiert statt verdoppelt.
TMP=$(mktemp)
awk -v key="$PEER_KEY" -v allowed="${PEER_IP}/32" '
  function flush() {
    if (buf != "" && !(is_peer && (has_key || has_allowed))) printf "%s", buf
    buf = ""; is_peer = 0; has_key = 0; has_allowed = 0
  }
  /^\[/ { flush(); if ($0 ~ /^\[Peer\]/) is_peer = 1 }
  {
    buf = buf $0 "\n"
    if (is_peer && index($0, key) > 0)     has_key = 1
    if (is_peer && index($0, allowed) > 0) has_allowed = 1
  }
  END { flush() }
' "$CONF_FILE" > "$TMP"

{
  echo ""
  echo "[Peer]"
  echo "# Palworld-Server ${PEER_IP} (hinzugefügt am $(date +%Y-%m-%d))"
  echo "PublicKey = ${PEER_KEY}"
  echo "AllowedIPs = ${PEER_IP}/32"
  echo "Endpoint = ${ENDPOINT}:${WG_PORT}"
  echo "PersistentKeepalive = 25"
} >> "$TMP"

install -m 600 "$TMP" "$CONF_FILE"
rm -f "$TMP"

AFTER=$(grep -c '^\[Peer\]' "$CONF_FILE" || true)
c_green "Server im Tunnel: ${BEFORE} → ${AFTER}"

# ----------------------------------------------------------------------------
step "Tunnel neu laden"
# ----------------------------------------------------------------------------
if ! systemctl restart "wg-quick@${WG_IF}"; then
  c_red "Neustart des Tunnels fehlgeschlagen – Konfiguration wird zurückgesetzt."
  cp -a "$BACKUP" "$CONF_FILE"
  systemctl restart "wg-quick@${WG_IF}" || true
  exit 1
fi
c_green "Interface ${WG_IF} neu geladen."

# ----------------------------------------------------------------------------
step "Verbindung prüfen"
# ----------------------------------------------------------------------------
echo "Warte auf den ersten Handshake …"
OK=false
for _ in $(seq 1 10); do
  if ping -c1 -W1 "$PEER_IP" >/dev/null 2>&1; then OK=true; break; fi
  sleep 2
done

if [ "$OK" = true ]; then
  c_green "Tunnel zu ${PEER_IP} steht (ping erfolgreich)."
else
  c_yellow "Noch keine Antwort von ${PEER_IP}. Prüfen:"
  c_yellow "  • Läuft auf dem neuen Server  systemctl status wg-quick@${WG_IF}  ?"
  c_yellow "  • Ist dort der Public Key DIESES Web-Servers als Peer eingetragen?"
  c_yellow "    (auf dem Web-Server anzeigen mit:  wg show ${WG_IF} public-key )"
  c_yellow "  • Ist UDP ${WG_PORT} zum neuen Server offen (Firewall des Hosters)?"
fi

echo
echo "REST-API des neuen Servers testen:"
if command -v curl >/dev/null; then
  CODE=$(curl -sS -o /dev/null -m 5 -w '%{http_code}' "http://${PEER_IP}:${API_PORT}/v1/api/info" 2>/dev/null)
  CODE="${CODE:-000}"
  case "$CODE" in
    401) c_green "  Port ${API_PORT} erreichbar (401 = API antwortet, Passwort nötig – genau richtig)." ;;
    200) c_green "  Port ${API_PORT} erreichbar und offen." ;;
    000) c_yellow "  Keine Antwort auf ${PEER_IP}:${API_PORT}."
         c_yellow "  Auf dem neuen Spielserver prüfen: RESTAPIEnabled=True in der PalWorldSettings.ini,"
         c_yellow "  und der Docker-Container muss den Port veröffentlichen, z. B.:"
         c_yellow "    ports: [\"${PEER_IP}:${API_PORT}:${API_PORT}\"]   (Container danach neu erstellen)" ;;
    *)   c_yellow "  Antwort mit HTTP ${CODE} – API läuft, Details bitte prüfen." ;;
  esac
fi

step "Nächster Schritt"
cat <<EOF
In der config.json der Webseite den neuen Server eintragen bzw. ergänzen:

  { "id": "classic",
    "palworldApiUrl": "http://${PEER_IP}:${API_PORT}",
    "palworldAdminPassword": "<AdminPassword des neuen Servers>",
    "uploadSecret": "<eigenes, langes Zufalls-Secret>" }

Danach:  systemctl restart palworld-web
EOF
