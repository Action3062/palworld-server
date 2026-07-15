#!/usr/bin/env bash
# ============================================================================
# PalHeim – automatisches Server-Setup (Ubuntu/Debian, z. B. Hetzner Cloud)
#
# Installiert die Palworld-Webseite komplett:
#   Node.js + git + nginx, Benutzer, Code nach /opt/palworld-web,
#   config.json (Palworld-Admin-Passwort wird automatisch erkannt),
#   systemd-Service, nginx-Reverse-Proxy, optional HTTPS via Let's Encrypt.
#
# Aufruf als root:
#   bash setup.sh                 → Webseite über http://<Server-IP>
#   bash setup.sh deinedomain.de  → + nginx server_name + HTTPS-Zertifikat
#
# Das Skript ist idempotent – erneut ausführen aktualisiert den Code und
# lässt eine vorhandene config.json unangetastet.
# ============================================================================

set -euo pipefail

REPO_URL="https://github.com/Action3062/palworld-server.git"
BRANCH="claude/palworld-server-website-j2gox0"
INSTALL_DIR="/opt/palworld-web"
SERVICE_USER="palworld"
DOMAIN="${1:-}"

c_green() { printf '\033[1;32m%s\033[0m\n' "$*"; }
c_yellow() { printf '\033[1;33m%s\033[0m\n' "$*"; }
c_red() { printf '\033[1;31m%s\033[0m\n' "$*"; }
step() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }

[ "$(id -u)" -eq 0 ] || { c_red "Bitte als root ausführen (sudo bash setup.sh)"; exit 1; }

# ----------------------------------------------------------------------------
step "Pakete installieren (Node.js, git, nginx)"
# ----------------------------------------------------------------------------
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nodejs git nginx curl >/dev/null

NODE_MAJOR=$(node -e 'console.log(process.versions.node.split(".")[0])')
if [ "$NODE_MAJOR" -lt 18 ]; then
  c_red "Node.js $NODE_MAJOR ist zu alt (mindestens 18 nötig)."
  c_red "Bitte aktuelles Node.js installieren, z. B. über https://deb.nodesource.com – dann Skript erneut ausführen."
  exit 1
fi
echo "Node.js $(node --version), nginx $(nginx -v 2>&1 | grep -o '[0-9.]*' | head -1)"

# ----------------------------------------------------------------------------
step "Benutzer und Code einrichten"
# ----------------------------------------------------------------------------
id -u "$SERVICE_USER" >/dev/null 2>&1 || \
  useradd --system --home "$INSTALL_DIR" --shell /usr/sbin/nologin "$SERVICE_USER"

if [ -d "$INSTALL_DIR/.git" ]; then
  echo "Repository vorhanden – aktualisiere auf den neuesten Stand …"
  git -C "$INSTALL_DIR" fetch origin "$BRANCH"
  git -C "$INSTALL_DIR" checkout "$BRANCH"
  git -C "$INSTALL_DIR" reset --hard "origin/$BRANCH"
else
  git clone --branch "$BRANCH" "$REPO_URL" "$INSTALL_DIR"
fi

mkdir -p "$INSTALL_DIR/data"
chown -R "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR/data"

# ----------------------------------------------------------------------------
step "Palworld-Server suchen (für den Live-Status)"
# ----------------------------------------------------------------------------
PAL_INI=$(find /home /opt /srv /root /var -name PalWorldSettings.ini -path '*LinuxServer*' 2>/dev/null | head -1 || true)
ADMIN_PASSWORD=""
REST_ENABLED=""

if [ -n "$PAL_INI" ]; then
  echo "Gefunden: $PAL_INI"
  ADMIN_PASSWORD=$(grep -oP 'AdminPassword="\K[^"]*' "$PAL_INI" 2>/dev/null | head -1 || true)
  REST_ENABLED=$(grep -oP 'RESTAPIEnabled=\K[A-Za-z]+' "$PAL_INI" 2>/dev/null | head -1 || true)

  if [ "${REST_ENABLED,,}" != "true" ]; then
    c_yellow "Die REST-API des Palworld-Servers ist noch nicht aktiviert."
    c_yellow "Ohne sie zeigt die Webseite dauerhaft \"Offline\" an."
    if [ -t 0 ] || [ -e /dev/tty ]; then
      read -rp "REST-API jetzt in der PalWorldSettings.ini aktivieren? [j/N] " ANSWER < /dev/tty || ANSWER=""
      if [[ "${ANSWER,,}" == j* ]]; then
        cp "$PAL_INI" "$PAL_INI.bak.$(date +%s)"
        if grep -q 'RESTAPIEnabled=' "$PAL_INI"; then
          sed -i 's/RESTAPIEnabled=[A-Za-z]*/RESTAPIEnabled=True/' "$PAL_INI"
        else
          sed -i 's/OptionSettings=(/OptionSettings=(RESTAPIEnabled=True,RESTAPIPort=8212,/' "$PAL_INI"
        fi
        if [ -z "$ADMIN_PASSWORD" ]; then
          ADMIN_PASSWORD=$(tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 20)
          if grep -q 'AdminPassword=' "$PAL_INI"; then
            sed -i "s/AdminPassword=\"[^\"]*\"/AdminPassword=\"$ADMIN_PASSWORD\"/" "$PAL_INI"
          else
            sed -i "s/OptionSettings=(/OptionSettings=(AdminPassword=\"$ADMIN_PASSWORD\",/" "$PAL_INI"
          fi
          c_yellow "Neues Admin-Passwort gesetzt: $ADMIN_PASSWORD (steht auch in der config.json)"
        fi
        c_yellow "WICHTIG: Der Palworld-Server muss neu gestartet werden, damit die REST-API läuft!"
      fi
    fi
  fi
else
  c_yellow "Keine PalWorldSettings.ini gefunden – läuft der Palworld-Server auf einer anderen Maschine?"
fi

if [ -z "$ADMIN_PASSWORD" ] && { [ -t 0 ] || [ -e /dev/tty ]; }; then
  read -rp "Palworld-Admin-Passwort (leer lassen zum Überspringen): " ADMIN_PASSWORD < /dev/tty || ADMIN_PASSWORD=""
fi

# ----------------------------------------------------------------------------
step "config.json schreiben"
# ----------------------------------------------------------------------------
if [ -f "$INSTALL_DIR/config.json" ]; then
  echo "config.json existiert bereits – bleibt unverändert."
else
  cat > "$INSTALL_DIR/config.json" <<EOF
{
  "port": 3000,
  "host": "127.0.0.1",
  "palworldApiUrl": "http://127.0.0.1:8212",
  "palworldAdminPassword": "$ADMIN_PASSWORD",
  "cacheSeconds": 15,
  "showPlayerList": true,
  "statsEnabled": true
}
EOF
  chown "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR/config.json"
  chmod 600 "$INSTALL_DIR/config.json"
  if [ -z "$ADMIN_PASSWORD" ]; then
    c_yellow "Kein Admin-Passwort gesetzt – bitte später in $INSTALL_DIR/config.json eintragen"
    c_yellow "und den Dienst neu starten: systemctl restart palworld-web"
  fi
fi

# ----------------------------------------------------------------------------
step "systemd-Service einrichten"
# ----------------------------------------------------------------------------
cp "$INSTALL_DIR/deploy/palworld-web.service" /etc/systemd/system/palworld-web.service
systemctl daemon-reload
systemctl enable --now palworld-web
sleep 1
systemctl restart palworld-web
sleep 1
if systemctl is-active --quiet palworld-web; then
  c_green "palworld-web läuft."
else
  c_red "palworld-web startet nicht – Logs: journalctl -u palworld-web -n 50"
  exit 1
fi

# ----------------------------------------------------------------------------
step "nginx konfigurieren"
# ----------------------------------------------------------------------------
SERVER_NAME="${DOMAIN:-_}"
cat > /etc/nginx/sites-available/palworld-web <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name $SERVER_NAME;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    gzip on;
    gzip_types text/css text/javascript application/javascript application/json image/svg+xml;
}
EOF
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/palworld-web /etc/nginx/sites-enabled/palworld-web
nginx -t
systemctl reload nginx

# ----------------------------------------------------------------------------
if [ -n "$DOMAIN" ]; then
  step "HTTPS-Zertifikat für $DOMAIN (Let's Encrypt)"
  apt-get install -y -qq certbot python3-certbot-nginx >/dev/null
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect \
    || c_yellow "certbot fehlgeschlagen – zeigt die Domain schon auf diesen Server? Später erneut: certbot --nginx -d $DOMAIN"
fi

# ----------------------------------------------------------------------------
step "Firewall prüfen"
# ----------------------------------------------------------------------------
if command -v ufw >/dev/null && ufw status | grep -q "Status: active"; then
  ufw allow 80/tcp >/dev/null
  ufw allow 443/tcp >/dev/null
  echo "ufw: Ports 80 und 443 freigegeben."
else
  echo "ufw nicht aktiv. Falls du die Hetzner Cloud Firewall nutzt:"
  echo "  → 80/tcp und 443/tcp eingehend erlauben (Ports 3000 und 8212 NICHT öffnen)"
fi

# ----------------------------------------------------------------------------
IP=$(curl -s -4 --max-time 5 https://ifconfig.me || hostname -I | awk '{print $1}')
echo
c_green "============================================="
c_green " Fertig! Die Webseite ist erreichbar unter:"
if [ -n "$DOMAIN" ]; then
  c_green "   https://$DOMAIN"
else
  c_green "   http://$IP"
fi
c_green "============================================="
echo
echo "Nützliche Befehle:"
echo "  systemctl status palworld-web      – Status des Web-Dienstes"
echo "  journalctl -u palworld-web -f      – Live-Logs"
echo "  nano $INSTALL_DIR/config.json      – Konfiguration (danach: systemctl restart palworld-web)"
echo "  bash $INSTALL_DIR/deploy/setup.sh  – Update auf den neuesten Stand"
if [ "${REST_ENABLED,,}" != "true" ] && [ -n "$PAL_INI" ]; then
  echo
  c_yellow "Denk daran, den Palworld-Server neu zu starten, falls die REST-API gerade aktiviert wurde."
fi
