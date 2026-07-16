#!/usr/bin/env bash
# ============================================================================
# PalHeim – HTTPS nachträglich aktivieren (Let's Encrypt)
#
# Für den Fall, dass die Webseite bereits über HTTP läuft (z. B. via setup.sh
# ohne Domain installiert) und die Domain jetzt auf den Server zeigt.
# Das Skript fasst NUR nginx + certbot an – der Node-Dienst bleibt unberührt.
#
# Aufruf als root auf dem WEB-Server:
#   sudo bash enable-https.sh                 → Domain palheim.de (Standard)
#   sudo bash enable-https.sh meine-domain.de → andere Domain
#
# Optional eine E-Mail für Ablauf-/Widerruf-Warnungen von Let's Encrypt:
#   sudo LE_EMAIL=du@example.de bash enable-https.sh
#
# www.<domain> wird automatisch mit ins Zertifikat genommen, sofern es per DNS
# auf denselben Server zeigt. Das Skript ist idempotent – erneut ausführen
# erneuert nichts, solange das Zertifikat noch gültig ist.
# ============================================================================

set -euo pipefail

DOMAIN="${1:-palheim.de}"
SITE="/etc/nginx/sites-available/palworld-web"

c_green() { printf '\033[1;32m%s\033[0m\n' "$*"; }
c_yellow() { printf '\033[1;33m%s\033[0m\n' "$*"; }
c_red() { printf '\033[1;31m%s\033[0m\n' "$*"; }
step() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }

[ "$(id -u)" -eq 0 ] || { c_red "Bitte als root ausführen (sudo bash enable-https.sh)"; exit 1; }
command -v nginx >/dev/null || { c_red "nginx ist nicht installiert – zuerst deploy/setup.sh ausführen."; exit 1; }

# ----------------------------------------------------------------------------
step "DNS prüfen (zeigt $DOMAIN auf diesen Server?)"
# ----------------------------------------------------------------------------
server_ip=$(curl -s -4 --max-time 5 https://ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
apex_ip=$(getent ahostsv4 "$DOMAIN" | awk '{print $1; exit}' || true)
www_ip=$(getent ahostsv4 "www.$DOMAIN" | awk '{print $1; exit}' || true)

echo "Server-IP:        ${server_ip:-unbekannt}"
echo "$DOMAIN → ${apex_ip:-nicht auflösbar}"
echo "www.$DOMAIN → ${www_ip:-nicht auflösbar}"

if [ -z "$apex_ip" ]; then
  c_red "$DOMAIN lässt sich nicht auflösen. Bitte den A-Record (auf $server_ip) setzen und die"
  c_red "DNS-Verbreitung abwarten, dann erneut ausführen."
  exit 1
fi
if [ -n "$server_ip" ] && [ "$apex_ip" != "$server_ip" ]; then
  c_yellow "Achtung: $DOMAIN zeigt auf $apex_ip, dieser Server hat aber $server_ip."
  c_yellow "certbot schlägt fehl, solange der A-Record nicht auf diesen Server zeigt."
fi

# www nur aufnehmen, wenn es auf denselben Server / dieselbe Apex-IP zeigt
DOMAINS=(-d "$DOMAIN")
if [ -n "$www_ip" ] && { [ "$www_ip" = "$apex_ip" ] || [ "$www_ip" = "$server_ip" ]; }; then
  DOMAINS+=(-d "www.$DOMAIN")
  SERVER_NAMES="$DOMAIN www.$DOMAIN"
  c_green "www.$DOMAIN wird ins Zertifikat aufgenommen."
else
  SERVER_NAMES="$DOMAIN"
  [ -z "$www_ip" ] && echo "www.$DOMAIN ist nicht gesetzt – wird übersprungen (nur $DOMAIN)."
fi

# ----------------------------------------------------------------------------
step "nginx server_name auf $SERVER_NAMES setzen"
# ----------------------------------------------------------------------------
if [ ! -f "$SITE" ]; then
  c_red "nginx-Konfiguration $SITE nicht gefunden."
  c_red "Bitte zuerst die Webseite einrichten: bash deploy/setup.sh"
  exit 1
fi

# certbot --nginx braucht ein passendes server_name, um den vhost zu finden.
# Solange noch kein HTTPS-Block existiert, setzen wir es korrekt (idempotent);
# ist bereits ein 443-Block da, bleibt die Datei unangetastet.
if grep -q "listen 443" "$SITE"; then
  echo "HTTPS-Block existiert bereits – server_name bleibt unverändert."
else
  sed -i "0,/[[:space:]]*server_name .*/s//    server_name $SERVER_NAMES;/" "$SITE"
  echo "server_name gesetzt: $SERVER_NAMES"
fi

nginx -t
systemctl reload nginx

# ----------------------------------------------------------------------------
step "certbot installieren und Zertifikat anfordern"
# ----------------------------------------------------------------------------
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq certbot python3-certbot-nginx >/dev/null

if [ -n "${LE_EMAIL:-}" ]; then
  EMAIL_ARGS=(--email "$LE_EMAIL" --no-eff-email)
  echo "E-Mail für Ablauf-Warnungen: $LE_EMAIL"
else
  EMAIL_ARGS=(--register-unsafely-without-email)
  c_yellow "Ohne E-Mail (keine Ablauf-Warnungen). Optional: LE_EMAIL=du@example.de setzen."
fi

# --redirect erzwingt HTTP→HTTPS, --keep-until-expiring macht Wiederholungen
# idempotent (kein Neu-Ausstellen, solange das Zertifikat gültig ist).
if certbot --nginx "${DOMAINS[@]}" "${EMAIL_ARGS[@]}" \
     --non-interactive --agree-tos --redirect --keep-until-expiring; then
  c_green "Zertifikat eingerichtet und HTTP→HTTPS-Weiterleitung aktiv."
else
  c_red "certbot ist fehlgeschlagen."
  c_red "Häufigste Ursache: Der A-Record von $DOMAIN zeigt (noch) nicht auf $server_ip,"
  c_red "oder Port 80/443 ist in der Firewall zu. Nach Korrektur erneut ausführen."
  exit 1
fi

# ----------------------------------------------------------------------------
step "Automatische Erneuerung prüfen"
# ----------------------------------------------------------------------------
if certbot renew --dry-run >/dev/null 2>&1; then
  c_green "Auto-Erneuerung funktioniert (certbot renew --dry-run erfolgreich)."
else
  c_yellow "Test der Auto-Erneuerung schlug fehl – bitte 'certbot renew --dry-run' manuell prüfen."
fi
if systemctl list-timers 2>/dev/null | grep -q certbot; then
  echo "certbot-Timer ist aktiv – Zertifikate erneuern sich automatisch."
fi

# ----------------------------------------------------------------------------
step "Firewall prüfen"
# ----------------------------------------------------------------------------
if command -v ufw >/dev/null && ufw status | grep -q "Status: active"; then
  ufw allow 80/tcp >/dev/null
  ufw allow 443/tcp >/dev/null
  echo "ufw: Ports 80 und 443 freigegeben."
else
  echo "ufw nicht aktiv. Bei Hetzner Cloud Firewall: 80/tcp und 443/tcp eingehend erlauben."
fi

echo
c_green "============================================="
c_green " Fertig! Die Webseite ist jetzt erreichbar unter:"
c_green "   https://$DOMAIN"
c_green "============================================="
echo "HTTP wird automatisch auf HTTPS umgeleitet."
