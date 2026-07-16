# PalHeim – Palworld Server Webseite

Eine moderne Webseite für deinen Palworld Dedicated Server auf Hetzner Cloud –
mit **Live-Serverstatus** (Spielerzahl, Version, Uptime, Spielerliste) über die
offizielle Palworld REST-API.

**Kein Framework, kein Build-Schritt, keine npm-Abhängigkeiten** – nur Node.js.
Dadurch ist das Deployment auf dem Hetzner-Server in wenigen Minuten erledigt.

## Features

- ⚡ **Live-Status**: Online/Offline, Spielerzahl, Version, Uptime – automatisch alle 30 s aktualisiert
- 👥 **Spielerliste**: zeigt, wer gerade online ist (abschaltbar per Config)
- 📊 **Statistiken**: Spielerzahl-Verlauf (24 h / 7 Tage) als interaktives Chart,
  Peak heute & Rekord, Spieler gesamt, Gesamtspielzeit, In-Game-Tage und ein
  Top-Spieler-Leaderboard – gesammelt vom eigenen Backend, keine externen Dienste
- 📋 **Server-Adresse mit Kopier-Button**
- 🎮 **Beitritts-Anleitung** in 3 Schritten
- ⚙️ **Raten-Übersicht** (EP, Fangrate, Drops, …)
- 📜 **Regeln**, **FAQ** (Akkordeon), **Discord-CTA**
- 📄 Impressum- & Datenschutz-Vorlagen
- 📱 Vollständig responsiv, mobiles Menü, Scroll-Animationen
- 🔒 Das Palworld-Admin-Passwort bleibt auf dem Server (Backend-Proxy) und
  gelangt nie in den Browser

## Architektur

```
Browser ──HTTPS──> nginx ──> Node.js (server.js, Port 3000)
                                │  statische Seite aus ./public
                                ├─ /api/status ──> Palworld REST-API (Port 8212, nur lokal)
                                └─ /api/stats  ──> gesammelte Statistiken (data/stats.json)
```

Für die Statistiken fragt das Backend die Palworld REST-API einmal pro Minute ab
und speichert aggregierte Daten in `data/stats.json` (Spielerzahl in
5-Minuten-Buckets für 7 Tage, Peak, pro Spieler Name/Level/Spielzeit/zuletzt
gesehen – bewusst keine IPs oder Account-IDs).

## Voraussetzungen

1. **Palworld Dedicated Server** läuft bereits auf dem Hetzner-Server
2. **REST-API aktivieren** – in der `PalWorldSettings.ini` innerhalb von `OptionSettings=(...)`:

   ```ini
   RESTAPIEnabled=True,
   RESTAPIPort=8212,
   AdminPassword="dein-geheimes-passwort",
   ```

   Danach den Palworld-Server neu starten.
   ⚠️ Port 8212 **nicht** in der Firewall öffnen – die Webseite fragt ihn nur lokal ab!

3. **Node.js ≥ 18** installieren:

   ```bash
   sudo apt update && sudo apt install -y nodejs
   node --version   # sollte >= 18 sein
   ```

## Lokal testen

```bash
cp config.example.json config.json   # Passwort eintragen
node server.js
# → http://localhost:3000
```

Ohne laufenden Palworld-Server zeigt die Seite einfach „Offline“ an – alles
andere funktioniert trotzdem.

## Schnellinstallation (ein Befehl)

Auf dem Hetzner-Server als root ausführen – installiert alles automatisch
(Node.js, nginx, Benutzer, systemd-Service) und erkennt einen lokal laufenden
Palworld-Server samt Admin-Passwort:

```bash
bash <(curl -sL https://raw.githubusercontent.com/Action3062/palworld-server/refs/heads/claude/palworld-server-website-j2gox0/deploy/setup.sh)
```

Mit Domain (richtet zusätzlich HTTPS via Let's Encrypt ein):

```bash
bash <(curl -sL https://raw.githubusercontent.com/Action3062/palworld-server/refs/heads/claude/palworld-server-website-j2gox0/deploy/setup.sh) deinedomain.de
```

Das Skript ist idempotent: erneut ausführen aktualisiert die Webseite auf den
neuesten Stand, ohne die `config.json` zu überschreiben.

## Manuelles Deployment auf Hetzner Cloud

```bash
# 1. Code auf den Server holen
sudo git clone https://github.com/action3062/palworld-server.git /opt/palworld-web
cd /opt/palworld-web

# 2. Eigenen Benutzer anlegen (Webseite nie als root laufen lassen)
sudo useradd --system --home /opt/palworld-web --shell /usr/sbin/nologin palworld || true

# 3. Konfiguration anlegen
sudo cp config.example.json config.json
sudo nano config.json          # palworldAdminPassword eintragen
sudo chown palworld:palworld config.json
sudo chmod 600 config.json

# 4. Statistik-Verzeichnis anlegen (der Service läuft sonst read-only)
sudo mkdir -p /opt/palworld-web/data
sudo chown palworld:palworld /opt/palworld-web/data

# 5. systemd-Service installieren
sudo cp deploy/palworld-web.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now palworld-web
systemctl status palworld-web  # sollte "active (running)" zeigen

# 6. nginx als Reverse-Proxy
sudo apt install -y nginx
sudo cp deploy/nginx-palworld-web.conf /etc/nginx/sites-available/palworld-web
sudo nano /etc/nginx/sites-available/palworld-web   # server_name anpassen!
sudo ln -s /etc/nginx/sites-available/palworld-web /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 7. HTTPS mit Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d deinedomain.de

# 8. Firewall (Hetzner Cloud Firewall oder ufw)
#    Offen:  80/tcp, 443/tcp (Web), 8211/udp (Palworld), SSH
#    Zu:     3000/tcp und 8212/tcp von außen NICHT erreichbar machen
```

## Palworld auf separatem Server? → WireGuard-Tunnel

Läuft der Palworld-Server auf einer **anderen Maschine** als die Webseite,
verbindet ein WireGuard-Tunnel beide privat – die REST-API (Port 8212) bleibt
aus dem Internet unerreichbar:

```
Web-Server (10.88.0.1) ── WireGuard (UDP 51821) ──> Palworld-Server (10.88.0.2)
```

Das Skript nutzt ein eigenes Interface **`wg-palweb`** auf **Port 51821** –
ein bereits vorhandenes `wg0` (z. B. ein bestehendes VPN) bleibt unangetastet.
Kollidiert Port oder Subnetz mit deinem Setup, bricht das Skript mit einem
Hinweis ab und lässt sich per Umgebungsvariablen anpassen
(`WG_PORT=…`, `API_WG_IP=…`, `WEB_WG_IP=…` – auf beiden Servern gleich setzen).

Einrichtung in 3 Schritten (jeweils als root):

```bash
# 1. Auf dem PALWORLD-Server – zeigt dessen Public Key an
#    (Frage nach dem Peer-Key erstmal mit Enter überspringen)
bash <(curl -sL https://raw.githubusercontent.com/Action3062/palworld-server/refs/heads/claude/palworld-server-website-j2gox0/deploy/wireguard/setup-wg.sh) api

# 2. Auf dem WEB-Server – Public Key aus Schritt 1 eintragen,
#    zeigt danach den Public Key des Web-Servers an
bash <(curl -sL https://raw.githubusercontent.com/Action3062/palworld-server/refs/heads/claude/palworld-server-website-j2gox0/deploy/wireguard/setup-wg.sh) web <IP-DES-PALWORLD-SERVERS>

# 3. Nochmal auf dem PALWORLD-Server – jetzt den Key aus Schritt 2 eintragen
bash <(curl -sL https://raw.githubusercontent.com/Action3062/palworld-server/refs/heads/claude/palworld-server-website-j2gox0/deploy/wireguard/setup-wg.sh) api
```

Das Skript stellt auf dem Web-Server automatisch die `config.json` auf
`http://10.88.0.2:8212` um und startet `palworld-web` neu. Test:

```bash
# auf dem Web-Server:
ping -c 3 10.88.0.2
curl -s -u admin:DEIN-ADMIN-PASSWORT http://10.88.0.2:8212/v1/api/info
```

Firewall: Auf dem Palworld-Server muss **UDP 51821** eingehend offen sein
(Hetzner Cloud Firewall bzw. ufw – das Skript richtet ufw automatisch ein).
Port 8212 dagegen **nicht** öffentlich öffnen.

### Updates einspielen

```bash
cd /opt/palworld-web
sudo git pull
sudo systemctl restart palworld-web
```

## Konfiguration

`config.json` (siehe `config.example.json`) – wird **nicht** eingecheckt (`.gitignore`):

| Schlüssel | Standard | Bedeutung |
|---|---|---|
| `port` | `3000` | Port der Webseite (nginx leitet hierher weiter) |
| `host` | `127.0.0.1` | Bind-Adresse (hinter nginx auf localhost lassen) |
| `palworldApiUrl` | `http://127.0.0.1:8212` | Adresse der Palworld REST-API |
| `palworldAdminPassword` | – | `AdminPassword` aus der PalWorldSettings.ini |
| `cacheSeconds` | `15` | Cache für Live-Daten (schont die Palworld-API) |
| `showPlayerList` | `true` | Namen der Online-Spieler anzeigen (Live-Liste + Leaderboard)? |
| `statsEnabled` | `true` | Statistiken sammeln und anzeigen? |
| `statsPollSeconds` | `60` | Abfrage-Intervall für die Statistik |
| `statsFile` | `data/stats.json` | Speicherort der gesammelten Daten |

Alternativ per Umgebungsvariablen: `PORT`, `HOST`, `PALWORLD_API_URL`,
`PALWORLD_ADMIN_PASSWORD`, `CACHE_SECONDS`, `SHOW_PLAYER_LIST`, `STATS_ENABLED`,
`STATS_POLL_SECONDS`.

## Vote-Belohnung (Serverlisten wie palserver.de)

Spieler voten auf der Serverliste und holen sich auf der Webseite eine
In-Game-Belohnung ab (Sektion „Vote & Belohnung“, erscheint automatisch,
sobald `votes.enabled: true` gesetzt ist).

**Ablauf:** Spieler votet (mit In-Game-Namen) → loggt sich auf dem Server ein
→ trägt seinen Namen auf der Webseite ein → Backend prüft Vote + Online-Status
→ Belohnung wird vergeben. Pro Spieler und Tag nur ein Claim; Claim-Anfragen
sind pro IP rate-limitiert.

### Vote-Prüfung – zwei Modi

**`"mode": "list"`** – die Serverliste bietet eine API, die die letzten Votes
als JSON liefert. Die URL findest du im Dashboard deiner Serverliste
(bei palserver.de im Server-Verwaltungsbereich):

```json
"check": {
  "mode": "list",
  "url": "https://…/api/…/votes?key={apiKey}",
  "apiKey": "DEIN-API-KEY",
  "nameField": "username",
  "timeField": "created_at",
  "maxAgeHours": 24
}
```

`{apiKey}` in der URL wird ersetzt, zusätzlich wird der Key als
`Authorization: Bearer` mitgeschickt. `nameField`/`timeField` an das
JSON-Format der Liste anpassen; Antworten in der Form `[...]`,
`{"votes": [...]}`, `{"data": [...]}` werden automatisch erkannt.

**`"mode": "webhook"`** – die Serverliste ruft bei jedem Vote unseren Endpunkt
auf. Im Dashboard der Liste als Webhook-URL eintragen:

```
https://deinedomain.de/api/vote/webhook?secret=DEIN-GEHEIMES-TOKEN
```

und in der `config.json` dasselbe Token als `"webhookSecret"` setzen.

### Belohnung – zwei Modi

**`"mode": "rcon"`** – echte Item-Belohnungen. Voraussetzung: Auf dem
Palworld-Server läuft ein Mod wie **PalDefender**/**PalGuard** (Vanilla-Palworld
hat keinen Give-Befehl!) und RCON ist aktiviert
(`RCONEnabled=True,RCONPort=25575` in der PalWorldSettings.ini; Port nur über
den WireGuard-Tunnel erreichbar machen, nie öffentlich!):

```json
"reward": {
  "mode": "rcon",
  "rcon": { "host": "10.88.0.2", "port": 25575, "password": "ADMIN-PASSWORT" },
  "commands": ["giveitem {steamid} Money 1000"],
  "announce": "{name} hat fuer den Server gevotet - danke!"
}
```

Platzhalter in `commands`: `{steamid}` (empfohlen), `{userid}`, `{name}`.
Die genaue Befehls-Syntax hängt vom Mod ab (PalDefender: `giveitem`,
`giveexp`, `give_relic`, …).

**`"mode": "announce"`** – funktioniert ohne Mods: nur eine
Broadcast-Danksagung über die offizielle REST-API; die eigentliche Belohnung
verteilt ihr manuell oder sie bleibt symbolisch.

## Inhalte anpassen

Alle Texte liegen direkt im HTML – einfach editieren:

| Was | Wo |
|---|---|
| Servername „PalHeim“ | `public/index.html` (Titel, Hero, Footer) + `public/impressum.html` / `datenschutz.html` |
| Server-Adresse `65.109.91.114:8211` | `public/index.html` (Hero-Chip + Schritt 2) |
| Discord-Link `discord.gg/DEIN-INVITE` | `public/index.html` (mehrfach – suchen & ersetzen) |
| Raten & Server-Infos | `public/index.html`, Sektion `#server` |
| Regeln | `public/index.html`, Sektion `#regeln` |
| FAQ | `public/index.html`, Sektion `#faq` |
| Farben / Design | `public/css/style.css`, CSS-Variablen in `:root` |
| Hero-Hintergrund | Standard: `public/assets/hero.webp` (KI-Artwork). Alternative Variante: `hero-alt.webp` (umbenennen zu `hero.webp`). Eigenes Bild als `hero.jpg` ablegen überstimmt alles; ohne Bilddateien greift die SVG-Szene `hero-scene.svg` |
| Impressum / Datenschutz | `public/impressum.html`, `public/datenschutz.html` (TODOs ausfüllen!) |

## Sicherheit

- Der `/api/status`-Endpunkt gibt nur unkritische Daten weiter
  (keine IPs, keine Steam-/Player-IDs der Spieler)
- `config.json` enthält das Admin-Passwort → `chmod 600`, nie committen
- Ports 3000 (Web-Backend) und 8212 (REST-API) nur lokal erreichbar lassen
- systemd-Unit läuft ohne Root-Rechte und mit gehärteten Einstellungen

## Lizenz

MIT – mach damit, was du willst. Palworld ist eine Marke von Pocketpair, Inc.
