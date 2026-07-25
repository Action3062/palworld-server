#!/usr/bin/env bash
# ============================================================================
# check-tunnel.sh – findet heraus, warum die REST-API eines Palworld-Servers
#                   über den Tunnel nicht antwortet
# ============================================================================
# Auf BEIDEN Seiten ausführbar – das Skript erkennt selbst, wo es läuft:
#
#   Auf dem WEB-SERVER:      bash check-tunnel.sh 10.88.0.3
#   Auf dem SPIELSERVER:     bash check-tunnel.sh
#
# Es prüft Schicht für Schicht (Tunnel → Erreichbarkeit → Port → HTTP) und
# nennt bei der ersten fehlschlagenden Schicht die konkrete Ursache.
# ============================================================================
set -uo pipefail

WG_IF="${WG_IF:-wg-palweb}"
API_PORT="${API_PORT:-8212}"
PEER_IP="${1:-}"

c_red()    { printf '\033[31m%s\033[0m\n' "$*"; }
c_green()  { printf '\033[32m%s\033[0m\n' "$*"; }
c_yellow() { printf '\033[33m%s\033[0m\n' "$*"; }
step()     { printf '\n\033[1m== %s\033[0m\n' "$*"; }
ok()       { printf '  \033[32m[OK]\033[0m   %s\n' "$*"; }
fail()     { printf '  \033[31m[FEHLT]\033[0m %s\n' "$*"; }
info()     { printf '         %s\n' "$*"; }

# TCP-Port prüfen, ohne nc/telnet vorauszusetzen
tcp_open() {   # $1=host $2=port
  timeout 3 bash -c "exec 3<>/dev/tcp/$1/$2" 2>/dev/null && exec 3<&- 2>/dev/null
}

http_code() { # $1=url – "000" wenn keine Verbindung zustande kam
  local code
  code=$(curl -sS -o /dev/null -m 5 -w '%{http_code}' "$1" 2>/dev/null)
  echo "${code:-000}"
}

# ----------------------------------------------------------------------------
step "Wo läuft dieses Skript?"
# ----------------------------------------------------------------------------
MY_WG_IP=$(ip -4 -o addr show "$WG_IF" 2>/dev/null | awk '{print $4}' | cut -d/ -f1)
if [ -z "$MY_WG_IP" ]; then
  fail "Kein Tunnel-Interface '${WG_IF}' auf dieser Maschine aktiv."
  info "Status ansehen:  systemctl status wg-quick@${WG_IF}"
  info "Einrichten:      bash setup-wg.sh api      (auf dem Spielserver)"
  info "                 bash setup-wg.sh web IP   (auf dem Web-Server)"
  exit 1
fi

if [ "$MY_WG_IP" = "10.88.0.1" ]; then
  ROLE="web"; echo "  Web-Server (Tunnel-IP ${MY_WG_IP})"
else
  ROLE="game"; echo "  Spielserver (Tunnel-IP ${MY_WG_IP})"
fi
ok "Interface ${WG_IF} ist aktiv."

# ============================================================================
if [ "$ROLE" = "game" ]; then
# ============================================================================
  step "1/3 – Läuft die REST-API lokal?"
  CODE=$(http_code "http://127.0.0.1:${API_PORT}/v1/api/info")
  case "$CODE" in
    401|200) ok "REST-API antwortet auf 127.0.0.1:${API_PORT} (HTTP ${CODE})." ;;
    000)
      fail "Keine Antwort auf 127.0.0.1:${API_PORT}."
      info "In der PalWorldSettings.ini (innerhalb von OptionSettings=(…)) muss stehen:"
      info "   RESTAPIEnabled=True,  RESTAPIPort=${API_PORT},  AdminPassword=\"…\""
      info "Danach den Palworld-Server neu starten."
      info "Womit lauscht der Prozess überhaupt?   ss -tlnp | grep -i palserver" ;;
    *) c_yellow "  REST-API antwortet mit HTTP ${CODE} – ungewöhnlich, aber sie läuft." ;;
  esac

  # Läuft der Server im Container oder direkt auf dem System? Die Ursachen bei
  # einem nicht erreichbaren Port sind völlig unterschiedlich.
  IN_DOCKER=false
  if command -v docker >/dev/null 2>&1 &&
     docker ps --format '{{.Image}} {{.Names}}' 2>/dev/null | grep -qi 'pal'; then
    IN_DOCKER=true
  fi

  step "2/3 – Ist der Port auf der Tunnel-IP erreichbar?"
  if tcp_open "$MY_WG_IP" "$API_PORT"; then
    ok "${MY_WG_IP}:${API_PORT} nimmt Verbindungen an."
  elif [ "$IN_DOCKER" = true ]; then
    fail "${MY_WG_IP}:${API_PORT} ist NICHT erreichbar – der Container veröffentlicht den Port nicht."
    info "In der docker-compose.yml eintragen und den Container NEU ERSTELLEN:"
    info "   ports:"
    info "     - \"${MY_WG_IP}:${API_PORT}:${API_PORT}\""
    info "   docker compose up -d --force-recreate"
    info "(Nachträglich lassen sich Ports an einem laufenden Container nicht öffnen.)"
    info "Wichtig: Das Tunnel-Interface muss VOR dem Container starten, sonst"
    info "kann Docker die Adresse ${MY_WG_IP} nicht binden."
  else
    fail "${MY_WG_IP}:${API_PORT} ist nicht erreichbar (Server läuft direkt auf dem System)."
    info "Ohne Container hängt das allein an der REST-API selbst:"
    info "  • Ist sie aktiv? (Schritt 1 oben)"
    info "  • Worauf lauscht der Prozess wirklich?"
    info "      ss -tlnp | grep -i palserver"
    info "    Steht dort NUR der RCON-Port, fehlt RESTAPIEnabled=True."
    info "  • Blockt eine lokale Firewall den Tunnel?"
    info "      ufw allow in on ${WG_IF} to any port ${API_PORT} proto tcp"
  fi

  if [ "$IN_DOCKER" = true ]; then
    echo "  Aktuell veröffentlichte Container-Ports:"
    docker ps --format '    {{.Names}}: {{.Ports}}' 2>/dev/null | head -5 || true
  else
    echo "  Offene TCP-Ports des Palworld-Prozesses:"
    ss -tlnp 2>/dev/null | grep -i 'palserver' | awk '{print "    " $4}' | head -5 ||
      echo "    (keine gefunden – läuft der Server gerade?)"
  fi

  step "3/4 – Lässt die Firewall den Tunnel durch?"
  # Wichtig: Der lokale Test oben läuft über loopback und sagt daher NICHTS
  # darüber aus, ob Pakete AUS dem Tunnel angenommen werden.
  FW_CHECKED=false
  if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q "Status: active"; then
    FW_CHECKED=true
    if ufw status 2>/dev/null | grep -E "${API_PORT}" | grep -q "${WG_IF}"; then
      ok "ufw erlaubt Port ${API_PORT} über ${WG_IF}."
    else
      fail "ufw ist aktiv, aber KEINE Regel erlaubt Port ${API_PORT} über ${WG_IF}."
      info "Das ist die typische Ursache, wenn ping funktioniert, der Port aber nicht:"
      info "   ufw allow in on ${WG_IF} to any port ${API_PORT} proto tcp"
      echo
      echo "  Aktuelle ufw-Regeln:"
      ufw status 2>/dev/null | sed -n '1,12p' | sed 's/^/    /'
    fi
  fi
  if [ "$FW_CHECKED" = false ]; then
    if command -v nft >/dev/null 2>&1 && nft list ruleset 2>/dev/null | grep -q 'chain input'; then
      c_yellow "  nftables ist im Einsatz – bitte prüfen, ob TCP ${API_PORT} auf ${WG_IF} erlaubt ist:"
      c_yellow "    nft list ruleset | head -40"
    elif command -v iptables >/dev/null 2>&1 &&
         [ "$(iptables -L INPUT -n 2>/dev/null | grep -c '^\(ACCEPT\|DROP\|REJECT\)')" -gt 0 ]; then
      c_yellow "  iptables-Regeln vorhanden – bitte prüfen, ob TCP ${API_PORT} auf ${WG_IF} erlaubt ist:"
      c_yellow "    iptables -L INPUT -n -v | head -30"
    else
      ok "Keine aktive Host-Firewall gefunden."
    fi
  fi

  step "4/4 – Sicherheit"
  PUBLIC_PORTS=$(ss -tlnp 2>/dev/null | grep -i 'palserver' |
    awk '$4 ~ /^(0\.0\.0\.0|\*|\[::\]):/ {split($4, a, ":"); print a[length(a)]}' | sort -u)
  if [ -n "$PUBLIC_PORTS" ]; then
    c_yellow "  ACHTUNG: Diese Palworld-Ports lauschen auf ALLEN Schnittstellen:"
    for p in $PUBLIC_PORTS; do c_yellow "    • ${p}/tcp"; done
    c_yellow "  REST-API und RCON gehören nicht ins offene Internet – beide schützen"
    c_yellow "  nur das Admin-Passwort. Empfehlung (ufw oder Hoster-Firewall):"
    c_yellow "    ufw allow in on ${WG_IF} to any port ${API_PORT} proto tcp"
    c_yellow "    ufw deny ${API_PORT}/tcp"
    c_yellow "  Der Spiel-Port (8211/udp) bleibt selbstverständlich offen."
  else
    ok "Keine Palworld-Verwaltungsports öffentlich gebunden."
  fi

  echo
  echo "Nächster Schritt: dieselbe Prüfung auf dem WEB-SERVER laufen lassen:"
  echo "  bash check-tunnel.sh ${MY_WG_IP}"
  exit 0
fi

# ============================================================================
# Web-Server
# ============================================================================
if [ -z "$PEER_IP" ]; then
  echo
  c_yellow "Bitte die Tunnel-IP des Spielservers angeben, z. B.:"
  c_yellow "  bash check-tunnel.sh 10.88.0.3"
  echo
  echo "Im Tunnel eingetragene Server:"
  wg show "$WG_IF" allowed-ips 2>/dev/null | awk '{print "  " $2}' || true
  exit 1
fi

step "1/4 – Ist der Server überhaupt im Tunnel eingetragen?"
if wg show "$WG_IF" allowed-ips 2>/dev/null | grep -q "${PEER_IP}/32"; then
  ok "${PEER_IP} ist als Peer konfiguriert."
else
  fail "${PEER_IP} ist NICHT als Peer eingetragen."
  info "Hinzufügen (ohne die vorhandenen Server zu verlieren):"
  info "   sudo bash add-peer.sh ${PEER_IP} <PUBLIC-KEY> <ÖFFENTLICHE-IP>"
  echo
  echo "Aktuell eingetragen:"
  wg show "$WG_IF" allowed-ips 2>/dev/null | awk '{print "  " $2}'
  exit 1
fi

step "2/4 – Gab es einen Handshake?"
PEER_KEY=$(wg show "$WG_IF" allowed-ips 2>/dev/null | grep "${PEER_IP}/32" | awk '{print $1}')
HS=$(wg show "$WG_IF" latest-handshakes 2>/dev/null | grep "^${PEER_KEY}" | awk '{print $2}')
if [ -n "${HS:-}" ] && [ "$HS" != "0" ]; then
  AGE=$(( $(date +%s) - HS ))
  ok "Letzter Handshake vor ${AGE} Sekunden."
else
  fail "Noch nie ein Handshake mit ${PEER_IP}."
  info "Das heißt: Die beiden Server haben sich nie erreicht. Prüfen:"
  info "  • Läuft der Tunnel drüben?   systemctl status wg-quick@${WG_IF}"
  info "  • Ist auf dem Spielserver der Public Key DIESES Servers eingetragen?"
  info "    Dieser Public Key:  $(wg show "$WG_IF" public-key 2>/dev/null)"
  info "  • Ist UDP $(wg show "$WG_IF" listen-port 2>/dev/null || echo 51821) zum Spielserver offen (Hoster-Firewall)?"
  info "  • Stimmt der Endpoint (öffentliche IP des Spielservers) in der Konfiguration?"
fi

step "3/4 – Antwortet der Server im Tunnel?"
if ping -c2 -W2 "$PEER_IP" >/dev/null 2>&1; then
  ok "${PEER_IP} antwortet auf ping."
else
  fail "${PEER_IP} antwortet nicht auf ping."
  info "Ohne Handshake (Schritt 2) ist das die Folgeerscheinung – dort zuerst ansetzen."
fi

step "4/4 – Ist die REST-API erreichbar?"
if tcp_open "$PEER_IP" "$API_PORT"; then
  ok "Port ${API_PORT} ist offen."
  CODE=$(http_code "http://${PEER_IP}:${API_PORT}/v1/api/info")
  case "$CODE" in
    401) c_green "  HTTP 401 – perfekt: Die API antwortet und verlangt das Passwort." ;;
    200) c_green "  HTTP 200 – die API antwortet." ;;
    000) c_yellow "  Port offen, aber keine HTTP-Antwort – lauscht dort wirklich die REST-API"
         c_yellow "  (und nicht z. B. RCON)? RCON spricht kein HTTP." ;;
    *)   c_yellow "  Antwort mit HTTP ${CODE}." ;;
  esac
  echo
  echo "Dann fehlt nur noch die config.json der Webseite:"
  echo "   \"palworldApiUrl\": \"http://${PEER_IP}:${API_PORT}\","
  echo "   \"palworldAdminPassword\": \"<AdminPassword dieses Servers>\""
  echo "   danach:  systemctl restart palworld-web"
else
  fail "Port ${API_PORT} auf ${PEER_IP} ist nicht erreichbar."
  if ping -c1 -W2 "$PEER_IP" >/dev/null 2>&1; then
    info "Der Tunnel selbst funktioniert (ping kommt an) – blockiert wird gezielt TCP."
    info "Häufigste Ursache: die Firewall auf dem SPIELSERVER lässt den Tunnel nicht durch."
    info "Dort ausführen:"
    info "   ufw allow in on ${WG_IF} to any port ${API_PORT} proto tcp"
    info "Seltener: die REST-API ist dort gar nicht aktiv, oder ein Container"
    info "veröffentlicht den Port nicht."
  else
    info "Auch ping schlägt fehl – zuerst den Tunnel in Ordnung bringen (Schritte 2–3)."
  fi
  info "Vollständige Prüfung auf dem SPIELSERVER:  bash check-tunnel.sh"
fi
