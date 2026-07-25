# WireGuard-Tunnel: Webseite ↔ Palworld-Server

Die Webseite fragt die Palworld REST-API (Port 8212) über einen privaten
Tunnel ab – die API bleibt aus dem Internet unerreichbar.

## Aufbau

Der **Web-Server ist der Hub** und lauscht auf UDP 51821. Die **Gameserver
wählen sich dort ein** (`PersistentKeepalive = 25`). Damit brauchen die
Gameserver keinen eingehend offenen Port und dürfen hinter NAT oder einem
Front-Server stehen.

```
   Palworld-Server 1 (10.88.0.2) ─┐
                                  ├──dial-in──> Web-Server (10.88.0.1)
   Palworld-Server 2 (10.88.0.3) ─┘             lauscht auf UDP 51821
```

Interface-Name: **`wg-palweb`** → `/etc/wireguard/wg-palweb.conf`.
Ein vorhandenes `wg0` (z. B. der Tunnel zum Front-Server) bleibt unangetastet.

| Rolle | Tunnel-IP | ListenPort | Endpoint beim Peer |
|---|---|---|---|
| Web-Server | 10.88.0.1/24 | 51821 | – (lernt die Peers aus dem Handshake) |
| Palworld-Server 1 (PvE) | 10.88.0.2/24 | – | `palheim.de:51821` |
| Palworld-Server 2 (Classic) | 10.88.0.3/24 | – | `palheim.de:51821` |

Wichtig: Auf den Gameservern darf **kein `ListenPort`** stehen – sonst warten
beide Seiten aufeinander und es kommt nie ein Handshake zustande. Der
`Endpoint` gehört ausschließlich auf die Gameserver.

Der Endpoint `palheim.de` funktioniert nur, wenn der A-Record direkt auf den
Web-Server zeigt (kein Proxy/CDN davor – WireGuard ist UDP). Prüfen mit
`dig +short palheim.de`; im Zweifel dort die öffentliche IP eintragen.

## Firewall

| Server | eingehend offen | nicht öffnen |
|---|---|---|
| Web-Server | **UDP 51821** | – |
| Gameserver 1 + 2 | nichts (nur ausgehend) | TCP 8212 |

Auf den Gameservern die REST-API nur über den Tunnel erlauben:

```bash
ufw allow in on wg-palweb to any port 8212 proto tcp comment "Palworld REST-API nur via Tunnel"
ufw delete allow 8212/tcp    # falls sie mal öffentlich offen war
ufw delete allow 51821/udp   # wird beim Dial-in-Aufbau nicht mehr gebraucht
```

Auf dem Web-Server:

```bash
ufw allow 51821/udp comment "WireGuard Palworld-Tunnel"
```

---

## `/etc/wireguard/wg-palweb.conf` – Web-Server

```ini
[Interface]
Address = 10.88.0.1/24
ListenPort = 51821
PrivateKey = PRIVATER-KEY-WEB-SERVER

[Peer]
# Palworld-Server 1 (PvE)
PublicKey = PUBLIC-KEY-SERVER-1
AllowedIPs = 10.88.0.2/32

[Peer]
# Palworld-Server 2 (Classic)
PublicKey = PUBLIC-KEY-SERVER-2
AllowedIPs = 10.88.0.3/32
```

Kein `Endpoint` bei den Peers – die Gameserver melden sich selbst.

## `/etc/wireguard/wg-palweb.conf` – Palworld-Server 1

```ini
[Interface]
Address = 10.88.0.2/24
PrivateKey = PRIVATER-KEY-SERVER-1

[Peer]
# Web-Server
PublicKey = PUBLIC-KEY-WEB-SERVER
AllowedIPs = 10.88.0.1/32
Endpoint = palheim.de:51821
PersistentKeepalive = 25
```

## `/etc/wireguard/wg-palweb.conf` – Palworld-Server 2

```ini
[Interface]
Address = 10.88.0.3/24
PrivateKey = PRIVATER-KEY-SERVER-2

[Peer]
# Web-Server
PublicKey = PUBLIC-KEY-WEB-SERVER
AllowedIPs = 10.88.0.1/32
Endpoint = palheim.de:51821
PersistentKeepalive = 25
```

---

## Schlüssel erzeugen

```bash
umask 077
wg genkey | tee /etc/wireguard/wg-palweb.key | wg pubkey
```

Die erste Zeile ist der **private** Key (bleibt auf dem Server), die zweite
der **öffentliche** Key (kommt in die Config der Gegenstelle).

## Aktivieren

```bash
chmod 600 /etc/wireguard/wg-palweb.conf
systemctl enable --now wg-quick@wg-palweb
systemctl restart wg-quick@wg-palweb   # nach jeder Änderung
```

## Testen

Auf dem Web-Server:

```bash
wg show wg-palweb          # je Peer ein "latest handshake"
ping -c 3 10.88.0.2
ping -c 3 10.88.0.3
curl -s -u admin:ADMIN-PASSWORT http://10.88.0.3:8212/v1/api/info
```

## Webseite anbinden

In `/opt/palworld-web/config.json` zeigt jeder Server auf seine Tunnel-IP:

```json
"servers": [
  { "id": "pve",  "palworldApiUrl": "http://10.88.0.2:8212", "...": "..." },
  { "id": "pve2", "palworldApiUrl": "http://10.88.0.3:8212", "...": "..." }
]
```

Danach `systemctl restart palworld-web`.

## Gameserver zu Hause?

Steht ein Gameserver im Heimnetz ohne Portfreigabe, übernimmt ein kleiner
V-Server die öffentliche Adresse und reicht den Spieler-Traffic durch einen
zweiten Tunnel weiter → [`front-server.md`](front-server.md).

> Das interaktive Skript `setup-wg.sh` in diesem Ordner stammt aus dem
> früheren Aufbau (Web-Server wählt sich beim Gameserver ein) und passt
> nicht mehr zur obigen Topologie. Für den Hub-Aufbau die Configs oben
> direkt verwenden.
