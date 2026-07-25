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

## Ausgehenden Palworld-Traffic durch den Tunnel zwingen

Der **eingehende Spieler-Traffic läuft bereits vollständig durch den Tunnel** –
durch das MASQUERADE auf dem V-Server sieht Palworld jedes Spielerpaket als von
`10.20.0.2` kommend und antwortet zwangsläufig dorthin. Dafür ist nichts zu tun.

Nicht durch den Tunnel geht dagegen der **ausgehende** Traffic von Palworld:
die Registrierung bei Epic Online Services / Steam für die Serverliste. Die
läuft über die Heimleitung und verrät die private IP. Wer das nicht will,
braucht Policy Routing.

### Schritt 1 – V-Server: Rückweg ins Internet erlauben

In `/etc/wireguard/wg-front.conf` auf dem V-Server ergänzen:

```ini
PostUp   = iptables -t nat -A POSTROUTING -s 10.20.0.0/24 ! -o %i -j MASQUERADE
PostDown = iptables -t nat -D POSTROUTING -s 10.20.0.0/24 ! -o %i -j MASQUERADE
```

Die bestehende Regel `POSTROUTING -o %i -j MASQUERADE` betrifft nur Traffic,
der *in* den Tunnel geht. Diese hier betrifft Traffic, der *aus* dem Tunnel
ins Internet weiterläuft.

### Schritt 2a – Palworld läuft in Docker

Der Container braucht ein festes Subnetz. In der `docker-compose.yml`:

```yaml
networks:
  palworld:
    ipam:
      config:
        - subnet: 172.30.0.0/24
```

Das aktuelle Subnetz auslesen:

```bash
docker network inspect <netzname> -f '{{range .IPAM.Config}}{{.Subnet}}{{end}}'
```

Dann in `/etc/wireguard/wg-front.conf` auf dem Gameserver:

```ini
[Interface]
Address = 10.20.0.1/24
PrivateKey = PRIVATER-KEY-GAMESERVER-2
Table = off
MTU = 1380

PostUp   = sysctl -q -w net.ipv4.conf.all.src_valid_mark=1
PostUp   = ip route add default dev %i table 200
PostUp   = ip rule add from 172.30.0.0/24 to 10.0.0.0/8     lookup main priority 100
PostUp   = ip rule add from 172.30.0.0/24 to 172.16.0.0/12  lookup main priority 101
PostUp   = ip rule add from 172.30.0.0/24 to 192.168.0.0/16 lookup main priority 102
PostUp   = ip rule add from 172.30.0.0/24                   lookup 200 priority 110

PostDown = ip rule del from 172.30.0.0/24                   lookup 200 priority 110
PostDown = ip rule del from 172.30.0.0/24 to 192.168.0.0/16 lookup main priority 102
PostDown = ip rule del from 172.30.0.0/24 to 172.16.0.0/12  lookup main priority 101
PostDown = ip rule del from 172.30.0.0/24 to 10.0.0.0/8     lookup main priority 100
PostDown = ip route flush table 200

[Peer]
PublicKey = PUBLIC-KEY-V-SERVER
AllowedIPs = 0.0.0.0/0
Endpoint = V-SERVER-IP:51820
PersistentKeepalive = 25
```

### Schritt 2b – Palworld läuft nativ unter eigenem User

Statt der `ip rule from …`-Zeilen wird nach User markiert:

```ini
PostUp   = iptables -t mangle -A OUTPUT -m owner --uid-owner palworld -d 10.0.0.0/8     -j RETURN
PostUp   = iptables -t mangle -A OUTPUT -m owner --uid-owner palworld -d 172.16.0.0/12  -j RETURN
PostUp   = iptables -t mangle -A OUTPUT -m owner --uid-owner palworld -d 192.168.0.0/16 -j RETURN
PostUp   = iptables -t mangle -A OUTPUT -m owner --uid-owner palworld -j MARK --set-mark 0x200
PostUp   = ip rule add fwmark 0x200 lookup 200 priority 110

PostDown = ip rule del fwmark 0x200 lookup 200 priority 110
PostDown = iptables -t mangle -D OUTPUT -m owner --uid-owner palworld -j MARK --set-mark 0x200
PostDown = iptables -t mangle -D OUTPUT -m owner --uid-owner palworld -d 192.168.0.0/16 -j RETURN
PostDown = iptables -t mangle -D OUTPUT -m owner --uid-owner palworld -d 172.16.0.0/12  -j RETURN
PostDown = iptables -t mangle -D OUTPUT -m owner --uid-owner palworld -d 10.0.0.0/8     -j RETURN
```

Der `Table = off`-Eintrag, `MTU`, die `default`-Route in Tabelle 200,
`src_valid_mark` und `AllowedIPs = 0.0.0.0/0` bleiben wie unter 2a.

Läuft Palworld als `root`, funktioniert `--uid-owner` nicht sinnvoll – dann
entweder einen eigenen Systembenutzer anlegen oder nach cgroup markieren:
`-m cgroup --path system.slice/palworld-server.service`.

### Warum die drei RETURN-/`to`-Ausnahmen wichtig sind

Ohne sie würde auch die Antwort an den Web-Server (`10.88.0.1`, REST-API über
`wg-palweb`) in den Front-Tunnel geraten und dort verworfen – die Webseite
würde den Server als offline anzeigen. Die Ausnahmen schicken alles, was an
private Netze geht, weiter über die normale Routing-Tabelle; nur öffentliche
Ziele wandern in den Tunnel.

### Prüfen

```bash
# Docker:
docker compose exec palworld-server curl -s https://ifconfig.me
# nativ:
sudo -u palworld curl -s https://ifconfig.me
```

Muss die **öffentliche IP des V-Servers** ausgeben. Zum Vergleich auf dem Host
selbst `curl -s https://ifconfig.me` – das zeigt weiterhin die Heim-IP, denn
nur Palworld wird umgeleitet.

Danach gegenprüfen, dass die Webseite den Server weiterhin sieht:

```bash
# auf dem Web-Server
curl -s -u admin:ADMIN-PASSWORT http://10.88.0.3:8212/v1/api/info
```

### Nebenwirkung: Updates

SteamCMD-Updates laufen damit ebenfalls über den V-Server. Bei einem
Traffic-Limit dort entweder eine Ausnahme für die Steam-Netze ergänzen oder
den Update-Lauf kurz ohne Tunnel fahren.

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
- **Autostart:** `systemctl enable --now wg-quick@wg-front` genügt, der Tunnel
  kommt nach einem Reboot von allein hoch – mit `systemctl is-enabled
  wg-quick@wg-front` prüfbar. Ein DNS-Problem beim Booten wie bei
  `wg-palweb` gibt es hier nicht, weil der Endpoint eine feste IP ist.
- **ufw-Eingriffe löschen die Weiterleitung:** Die `iptables`-Regeln stehen im
  `PostUp` und werden nur beim Start von `wg-quick` gesetzt. Nach jedem
  `ufw enable` / `ufw disable` / `ufw reload` baut ufw seine Ketten neu auf –
  der Tunnel steht dann zwar, aber die Spieler kommen nicht mehr durch.
  Danach immer `systemctl restart wg-quick@wg-front`. Beim Booten stimmt die
  Reihenfolge (ufw zuerst, dann wg-quick), das betrifft nur den laufenden
  Betrieb.
- Der Tunnel zur Webseite (`wg-palweb`, 10.88.0.3) bleibt davon völlig
  unberührt und läuft weiterhin direkt vom Heim-Gameserver zum Web-Server.
