# Front-Server (V-Server) für einen Gameserver zu Hause

Der Palworld-Server läuft zu Hause hinter einem Router ohne Portfreigabe.
Ein kleiner V-Server im Rechenzentrum ist die öffentliche Adresse: Spieler
verbinden sich dorthin, der V-Server reicht die Pakete durch einen
WireGuard-Tunnel ans Heimnetz weiter.

**Der Tunnel wird vom Gameserver aus aufgebaut** (`PersistentKeepalive = 25`).
Zu Hause ist damit **keine einzige Portfreigabe im Router nötig** – auch
DS-Lite oder wechselnde IPs sind kein Problem.

```
   Spieler ──UDP 8211──> V-Server (öffentlich)
                             │  DNAT + MASQUERADE
                             │  10.20.0.2
                             ▼
                     WireGuard wg-front (UDP 51820)
                             ▲
                             │  10.20.0.1
                    Gameserver 2 zu Hause  ──dial-out──┘
```

Der Gameserver hat damit zwei Tunnel nebeneinander, die sich nicht ins
Gehege kommen:

| Interface | Netz | Zweck | Gegenstelle |
|---|---|---|---|
| `wg-palweb` | 10.88.0.0/24 | REST-API für die Webseite | Web-Server (`palheim.de:51821`) |
| `wg-front` | 10.20.0.0/24 | Spieler-Traffic | V-Server (`V-SERVER-IP:51820`) |

Die Adressvergabe folgt der Konvention von Gameserver 1
(Gameserver = `.1`, Front-Server = `.2`), nur in einem eigenen Netz, damit
sich nichts mit `10.10.0.0/24` oder `10.88.0.0/24` überschneidet.

---

## `/etc/wireguard/wg-front.conf` – V-Server

```ini
[Interface]
Address = 10.20.0.2/24
ListenPort = 51820
PrivateKey = PRIVATER-KEY-V-SERVER

# IP-Forwarding und Portweiterleitung an den Gameserver zu Hause
PostUp   = sysctl -q -w net.ipv4.ip_forward=1
PostUp   = iptables -t nat -A PREROUTING -p udp --dport 8211 -j DNAT --to-destination 10.20.0.1
PostUp   = iptables -t nat -A PREROUTING -p udp --dport 27015 -j DNAT --to-destination 10.20.0.1
PostUp   = iptables -t nat -A POSTROUTING -o %i -j MASQUERADE
PostUp   = iptables -A FORWARD -i %i -j ACCEPT
PostUp   = iptables -A FORWARD -o %i -j ACCEPT

PostDown = iptables -t nat -D PREROUTING -p udp --dport 8211 -j DNAT --to-destination 10.20.0.1
PostDown = iptables -t nat -D PREROUTING -p udp --dport 27015 -j DNAT --to-destination 10.20.0.1
PostDown = iptables -t nat -D POSTROUTING -o %i -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT
PostDown = iptables -D FORWARD -o %i -j ACCEPT

[Peer]
# Gameserver 2 (zu Hause)
PublicKey = PUBLIC-KEY-GAMESERVER-2
AllowedIPs = 10.20.0.1/32
```

Kein `Endpoint` beim Peer – der Gameserver meldet sich selbst, seine
Heim-IP darf sich jederzeit ändern.

Die NAT-Regeln hängen an `wg-quick` und werden beim Stoppen sauber wieder
entfernt – es braucht kein `iptables-persistent`.

## `/etc/wireguard/wg-front.conf` – Gameserver 2 (zu Hause)

```ini
[Interface]
Address = 10.20.0.1/24
PrivateKey = PRIVATER-KEY-GAMESERVER-2

[Peer]
# V-Server (Front)
PublicKey = PUBLIC-KEY-V-SERVER
AllowedIPs = 10.20.0.2/32
Endpoint = V-SERVER-IP:51820
PersistentKeepalive = 25
```

Kein `ListenPort` – der Gameserver ruft an, er wird nicht angerufen.

---

## Ports

| Port | Protokoll | auf dem V-Server öffnen | Zweck |
|---|---|---|---|
| 51820 | UDP | **ja** | WireGuard-Tunnel |
| 8211 | UDP | **ja** | Palworld Spiel-Port |
| 27015 | UDP | optional | Steam-Serverbrowser |
| 8212 | TCP | **nein** | REST-API – läuft über `wg-palweb` |
| 25575 | TCP | **nein** | RCON – niemals öffentlich |

Auf dem V-Server:

```bash
ufw allow 51820/udp comment "WireGuard Front-Tunnel"
ufw allow 8211/udp  comment "Palworld"
ufw allow 27015/udp comment "Steam Query"
ufw route allow in on eth0 out on wg-front
```

Läuft `ufw` mit der Standardeinstellung `DEFAULT_FORWARD_POLICY="DROP"`, muss
diese in `/etc/default/ufw` auf `ACCEPT` stehen (oder die `ufw route`-Regel
oben gesetzt sein), sonst blockt ufw die weitergeleiteten Pakete.

Zu Hause: **keine Portfreigabe im Router**, nur ausgehend UDP 51820.

## Aktivieren

Auf beiden Seiten:

```bash
chmod 600 /etc/wireguard/wg-front.conf
systemctl enable --now wg-quick@wg-front
```

## DNS und Palworld-Einstellungen

- `classic.palheim.de` als A-Record auf die **öffentliche IP des V-Servers**
  zeigen lassen.
- In `PalWorldSettings.ini` die öffentliche Adresse eintragen, damit sich der
  Server korrekt in der Serverliste meldet:
  `PublicIP="V-SERVER-IP"` und `PublicPort=8211`.

## Testen

Auf dem V-Server:

```bash
wg show wg-front          # "latest handshake" + endpoint der Heim-IP
ping -c 3 10.20.0.1
ss -lunp | grep 8211      # nichts – der Port lauscht zu Hause, nicht hier
```

Von außen (nicht aus dem Heimnetz heraus):

```bash
nc -zvu V-SERVER-IP 8211
```

## Stolperfallen

- **MTU:** Bei PPPoE oder DS-Lite zu Hause kann die Standard-MTU zu groß
  sein. Zeigen sich Verbindungsabbrüche, im `[Interface]`-Block des
  Gameservers `MTU = 1380` ergänzen.
- **Spieler-IPs:** Durch das MASQUERADE sieht der Gameserver alle Spieler als
  `10.20.0.2`. Für Bans nach IP ist das relevant – Bans nach Steam-ID
  funktionieren normal weiter.
- **Autostart:** `systemctl is-enabled wg-quick@wg-front` prüfen. Zieht sich
  der Gameserver zu Hause seine Adresse per DHCP, lohnt zusätzlich ein
  Drop-in mit `Restart=on-failure` / `RestartSec=10` (siehe `README.md`).
- Der Tunnel zur Webseite (`wg-palweb`, 10.88.0.3) bleibt davon völlig
  unberührt und läuft weiterhin direkt vom Heim-Gameserver zum Web-Server.
