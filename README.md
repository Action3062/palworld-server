# PalHeim – Palworld Server Webseite

Eine moderne Webseite für deinen Palworld Dedicated Server auf eigener Hardware –
mit **Live-Serverstatus** (Spielerzahl, Version, Uptime, Spielerliste) über die
offizielle Palworld REST-API.

**Kein Framework, kein Build-Schritt, keine npm-Abhängigkeiten** – nur Node.js.
Dadurch ist das Deployment auf dem eigenen Server in wenigen Minuten erledigt.

## Features

- ⚡ **Live-Status**: Online/Offline, Spielerzahl, Version, Uptime – automatisch alle 30 s aktualisiert
- 👥 **Spielerliste**: zeigt, wer gerade online ist (abschaltbar per Config)
- 📊 **Statistiken**: Verlauf von Spielerzahl **und Server-FPS** (24 h / 7 Tage)
  als interaktives Chart, Peak heute & Rekord, Spieler gesamt, Gesamtspielzeit,
  In-Game-Tage und Ranglisten in sechs Kategorien (Spielzeit, Paldeck,
  💀 Hall of Shame, Angeln u. a.) – gesammelt vom eigenen Backend
- 📈 **Verfügbarkeit & Ausfälle**: Uptime der letzten 24 h / 7 Tage plus eine
  Chronik der letzten Ausfälle – direkt aus den Messpunkten berechnet
- 🧑‍🚀 **Spieler-Profile** (`/spieler/<name>`): Level, Spielzeit, Distanz,
  aktive Tage, Erkundung und alle Erfolge – verlinkt aus Leaderboard & Live-Liste
- 📣 **Broadcast-Seite** (`/broadcast.html`): passwortgeschützt eine In-Game-Ansage
  an alle Online-Spieler senden
- 🚧 **Hinweis-Banner** oben auf der Seite für Wartung/Events (per Config)
- 👀 **Besucher-Zähler** (Aufrufe + eindeutige Besucher) im Footer – ohne Cookies/IP
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

1. **Palworld Dedicated Server** läuft bereits auf deinem Server
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

Auf dem Web-Server als root ausführen – installiert alles automatisch
(Node.js, nginx, Benutzer, systemd-Service) und erkennt einen lokal laufenden
Palworld-Server samt Admin-Passwort:

```bash
bash <(curl -sL https://raw.githubusercontent.com/Action3062/palworld-server/refs/heads/claude/palworld-server-website-j2gox0/deploy/setup.sh)
```

Mit Domain (richtet zusätzlich HTTPS via Let's Encrypt ein):

```bash
bash <(curl -sL https://raw.githubusercontent.com/Action3062/palworld-server/refs/heads/claude/palworld-server-website-j2gox0/deploy/setup.sh) palheim.de
```

`www.palheim.de` wird automatisch ins Zertifikat aufgenommen, sobald es per DNS
auf denselben Server zeigt. Für Ablauf-/Widerruf-Warnungen von Let's Encrypt
optional die eigene E-Mail voranstellen: `LE_EMAIL=du@example.de bash <(…) palheim.de`.

Das Skript ist idempotent: erneut ausführen aktualisiert die Webseite auf den
neuesten Stand, ohne die `config.json` zu überschreiben.

### HTTPS nachträglich aktivieren

Läuft die Webseite bereits über HTTP (z. B. per `setup.sh` **ohne** Domain
installiert) und zeigt die Domain jetzt auf den Server, aktiviert dieses Skript
HTTPS – es setzt `server_name`, holt das Zertifikat (inkl. `www`, falls
vorhanden), erzwingt die HTTP→HTTPS-Weiterleitung und prüft die
Auto-Erneuerung. Der Node-Dienst bleibt unberührt:

```bash
# Standard-Domain palheim.de:
sudo bash <(curl -sL https://raw.githubusercontent.com/Action3062/palworld-server/refs/heads/claude/palheim-https-setup-h7x4r6/deploy/enable-https.sh)

# mit E-Mail für Ablauf-Warnungen:
sudo LE_EMAIL=du@example.de bash <(curl -sL https://raw.githubusercontent.com/Action3062/palworld-server/refs/heads/claude/palheim-https-setup-h7x4r6/deploy/enable-https.sh)
```

Voraussetzung: Der A-Record von `palheim.de` (und optional `www.palheim.de`)
zeigt auf die Server-IP, und Port **80** und **443** sind in der Firewall offen
(Firewall deines Hosters bzw. `ufw`). Das Skript ist idempotent – ein erneuter
Aufruf erneuert nichts, solange das Zertifikat gültig ist.

## Manuelles Deployment

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

# 7. HTTPS mit Let's Encrypt – am einfachsten per Skript (server_name, www und
#    Auto-Erneuerung inklusive):
sudo bash deploy/enable-https.sh
# … oder manuell mit certbot:
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d palheim.de -d www.palheim.de --redirect

# 8. Firewall (Hoster-Firewall oder ufw)
#    Offen:  80/tcp, 443/tcp (Web), 8211/udp (Palworld), SSH
#    Zu:     3000/tcp und 8212/tcp von außen NICHT erreichbar machen
```

## Zweiter Server (Mehrserver-Betrieb)

Die Webseite kann mehrere Palworld-Server gleichzeitig anzeigen: Die
Startseite bekommt dann „Unsere Server"-Karten, und Status, Statistiken,
Live-Karte, Erfolge und die Admin-Seite bekommen Umschalt-Tabs – jeder
Server mit eigener Farbe. In der `config.json` einfach eine `servers`-Liste
ergänzen (der erste Eintrag ist der Standard-Server und erbt fehlende Werte
aus den klassischen Feldern, bestehende Daten bleiben erhalten):

```json
"servers": [
  {
    "id": "pve",
    "name": "PalHeim",
    "shortName": "PvE",
    "mode": "PvE · Koop",
    "description": "Der Klassiker: gemeinsam bauen und erkunden – ohne Wipes.",
    "facts": ["3× EP", "2× Fangrate", "Keine Todesstrafe"],
    "address": "pve.palheim.de:8211"
  },
  {
    "id": "pve2",
    "name": "PalHeim",
    "shortName": "Classic",
    "mode": "PvE · Vanilla-nah",
    "description": "Die Herausforderung: gleiche Community, knappere Raten.",
    "facts": ["3× EP", "3× Drop-Rate"],
    "color": "#2e7d35",
    "colorDeep": "#1d5423",
    "address": "pvee.palheim.de:8211",
    "palworldApiUrl": "http://10.88.0.3:8212",
    "palworldAdminPassword": "ADMINPASSWORT-VOM-ZWEITEN-SERVER",
    "uploadSecret": "EIGENES-UPLOAD-SECRET-FUER-SERVER-2"
  }
]
```

`facts` sind freie Chips auf der Server-Karte – ideal, um die
unterschiedlichen Raten der Server nebeneinander zu zeigen. `mode`,
Farben und Namen sind ebenfalls frei (nichts ist auf PvP festgelegt).

- Pro Server einstellbar: `palworldApiUrl`, `palworldAdminPassword`,
  `address`, `color`/`colorDeep` (Standard: Blau für den ersten, Glutrot
  für den zweiten), `statsFile`, `basesFile`, `uploadSecret`
- Daten liegen getrennt: `data/stats-<id>.json`, `data/bases-<id>.json`
  (der erste Server behält `data/stats.json`/`data/bases.json`)
- Alle APIs verstehen `?server=<id>`; `/api/servers` liefert alle Server
  mit Live-Status
- Basen-Upload pro Server: `upload-bases.py … --server pvp` mit dem
  jeweiligen `uploadSecret`
- Votes (palserver.de) bleiben an den ersten Server gebunden
- Läuft der zweite Palworld-Server auf einer weiteren Maschine, braucht er
  einen eigenen WireGuard-Zugang (nächster Abschnitt), z. B. als 10.88.0.3

### Weiteren Spielserver an den Tunnel hängen

1. **Auf dem neuen Spielserver** (legt dessen Tunnel-Seite an, zeigt am Ende
   seinen Public Key):

   ```bash
   API_WG_IP=10.88.0.3 bash setup-wg.sh api
   ```

2. **Auf dem Web-Server** – ergänzt den Peer, ohne den ersten Server zu
   verlieren (`setup-wg.sh web` würde die Datei neu schreiben!):

   ```bash
   sudo bash deploy/wireguard/add-peer.sh 10.88.0.3 <PUBLIC-KEY-SERVER-2> <öffentliche-IP-Server-2>
   ```

   Das Skript legt vorher eine Sicherung an, prüft nach dem Neustart die
   Verbindung und testet, ob die REST-API über den Tunnel antwortet.

3. Auf dem neuen Spielserver `RESTAPIEnabled=True` setzen und den REST-Port im
   Docker-Container veröffentlichen (`ports: ["10.88.0.3:8212:8212"]`, Container
   danach **neu erstellen** – nachträglich lassen sich Ports nicht öffnen).

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
(Hoster-Firewall bzw. ufw – das Skript richtet ufw automatisch ein).
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
| `banner.enabled` | `false` | Hinweis-Banner oben auf der Seite anzeigen? |
| `banner.text` | – | Banner-Text (kurz halten; kein HTML) |
| `banner.level` | `info` | Optik: `info` (blau), `event` (grün), `warn` (orange) |
| `admin.broadcastSecret` | – | Passwort für die Broadcast-Seite; leer = deaktiviert |
| `admin.password` | – | Passwort für die Admin-Seite `/admin`; leer = deaktiviert |
| `visitorCounter` | `true` | Besucher-Zähler (Aufrufe + eindeutige Besucher) im Footer |
| `support.enabled` | `false` | „Unterstützen"-Karte (z. B. Ko-fi, Buy Me a Coffee) anzeigen? |
| `support.url` | – | Link zur Spenden-Seite (nur ein Link, keine externen Skripte) |
| `support.text` | (Vorgabe) | Optionaler eigener Text auf der Karte |
| `support.label` | `☕ Buy me a coffee` | Beschriftung des Buttons, z. B. `❤️ Auf Ko-fi unterstützen` |

Alternativ per Umgebungsvariablen: `PORT`, `HOST`, `PALWORLD_API_URL`,
`PALWORLD_ADMIN_PASSWORD`, `CACHE_SECONDS`, `SHOW_PLAYER_LIST`, `STATS_ENABLED`,
`STATS_POLL_SECONDS`.

### Wartungs-/Event-Banner

Ein Hinweis-Banner (z. B. „Wartung heute 20 Uhr") pflegst du am bequemsten
über die Admin-Seite (`/admin`, Karte „Seiten-Banner") – sofort wirksam,
ohne Neustart. Alternativ statisch in der `config.json` (gilt nur, solange
über die Admin-Seite noch nie ein Banner gespeichert wurde; danach hat
`data/banner.json` Vorrang):

```json
"banner": { "enabled": true, "text": "Wartung heute ab 20 Uhr", "level": "warn" }
```

Besucher können das Banner wegklicken; eine neue/​geänderte Nachricht erscheint
wieder.

### Admin-Seite (`/admin`)

`https://palheim.de/admin` ist das Cockpit fürs Server-Team – absichtlich
nirgends verlinkt, auf `noindex` und per `robots.txt` ausgeschlossen.
Aktiviert wird sie über ein eigenes Passwort in der `config.json`:

```json
"admin": {
  "password": "LANGES-EIGENES-PASSWORT",
  "name": "Action",
  "users": { "Lisa": "lisas-langes-passwort", "Tom": "toms-langes-passwort" }
}
```

- `password` + `name`: der **Hauptadmin** (darf alles; `name` erscheint im
  Protokoll, Login mit leerem Namensfeld oder dem Namen)
- `users`: beliebig viele **Unter-Admins** mit eigenem Namen und Passwort –
  sie dürfen alles außer den Server neu starten. Jede Aktion wird im
  Protokoll dem jeweiligen Namen zugeordnet

Ohne gesetzte Passwörter ist die Seite (und alle `/api/admin/*`-Endpunkte
außer dem Broadcast) komplett deaktiviert. Nicht das Palworld-`AdminPassword`
wiederverwenden! Nach dem Login (Session-Cookie, 12 h gültig, Neustart des
Web-Diensts meldet ab; max. 5 Login-Versuche pro 10 Minuten) zeigt die Seite:

- **Live-Status**: online/offline, Spielerzahl, Server-FPS, Version
- **Basen & Besucher**: Stand der Live-Karte und des Besucher-Zählers
- **Seiten-Banner**: das Hinweis-Banner der Webseite (Wartung/Event/Info)
  direkt ein-/ausschalten und den Text ändern – wirkt sofort, ohne Neustart.
  Der Zustand liegt in `data/banner.json` und hat Vorrang vor dem
  `banner`-Block der `config.json`
- **In-Game-Ansage**: Nachricht an alle Online-Spieler senden
- **Spielstand sichern**: Welt sofort speichern (vor Wartungen/Neustarts)
- **Server neustarten** (nur Hauptadmin): mit wählbarer Vorwarnzeit
  (10–600 s) und doppelter Bestätigung. Warnt die Spieler im Spiel,
  speichert die Welt und fährt den Server per REST-API herunter – die
  Docker-Restart-Policy startet ihn automatisch wieder (derselbe
  Mechanismus wie beim nächtlichen Wartungs-Neustart, Downtime
  ca. 1–2 Minuten)
- **Spielerliste**: alle bekannten Spieler mit Level, Spielzeit, Sessions
  und „zuletzt gesehen" – Online-Spieler zuerst
- **Kick & Bann**: bei Online-Spielern direkt aus der Liste (mit Grund, der
  dem Spieler angezeigt wird). Beides geht nur bei Spielern, die gerade
  online sind – nur dann liefert die REST-API ihre User-ID (die Website
  speichert bewusst keine IDs). Über die Website ausgesprochene Banns
  landen in `data/bans.json` und lassen sich auf der Seite wieder aufheben
  („Entbannen")
- **Ping-Spalte**: Live-Ping der Online-Spieler (wer laggt gerade?)
- **Aktions-Protokoll**: was wurde über die Website ausgeführt (Kicks,
  Banns, Neustarts, Ansagen, Banner, An-/Fehlanmeldungen) – neueste zuerst,
  bewusst ohne IP-Adressen, max. 200 Einträge in `data/admin-log.json`
- **Server-Einstellungen (read-only)**: aufklappbare Live-Ansicht von
  `/v1/api/settings` – Raten, Schwierigkeit, Limits, wie der Server
  gerade wirklich läuft

### Broadcast (In-Game-Ansage von der Website)

`https://palheim.de/broadcast.html` sendet – nach Eingabe des
`admin.broadcastSecret` – eine Nachricht als In-Game-Ansage an alle Online-Spieler
(über die REST-API, `/v1/api/announce`). Die Seite ist absichtlich **nicht**
verlinkt und auf `noindex`; ohne gesetztes Secret ist der Endpunkt deaktiviert.
Setze ein langes Zufalls-Token als `broadcastSecret`.

## Live-Karte

`/karte.html` zeigt Spieler-Positionen in Echtzeit (alle 30 s, aus der
REST-API) und die Basen aller Gilden. Die Ansicht skaliert automatisch auf
die vorhandenen Punkte (1-km-Raster, Norden oben) – es wird keine
kalibrierte Weltkarte benötigt. Die Karte respektiert `showPlayerList`.

### Echte Palworld-Karte als Hintergrund

Standardmäßig zeigt die Karte ein neutrales km-Raster. Legst du ein Bild der
Palworld-Weltkarte als `public/assets/map.webp` (oder `.jpg`/`.png`) ab, wird es
automatisch als Hintergrund verwendet – mit Zoom (Mausrad) und Verschieben
(Ziehen). Spieler- und Basen-Marker sitzen dann geografisch korrekt darauf.

**1. Kartenbild besorgen.** Ein einzelner In-Game-Screenshot reicht meist nicht
(die Karte ist zu groß). Bewährte Quellen für ein **quadratisches Vollbild**:

- Ein Community-/Wiki-Kartenexport der Palworld-Weltkarte (nach „Palworld full
  map image" suchen) – die volle Auflösung herunterladen.
- Aus den Spieldaten extrahiert (die Kartentextur aus `DT_WorldMapUIData`).
- Notfalls mehrere In-Game-Screenshots (M) zu einem Bild zusammensetzen.

Das Bild **exakt auf die Kartenränder zuschneiden** (keine UI/Ränder), sodass es
quadratisch ist, dann als `public/assets/map.webp` ablegen. (Nur für dich
privat auf dem Server – nicht ins Repo committen.)

**2. Ausrichtung prüfen mit dem eingebauten Werkzeug.** Ruf die Karte mit
`?align` auf, z. B. `https://palheim.de/karte?align`. Es rahmt die volle
Ausdehnung, zeigt **Fadenkreuze** an den vier Ecken + Mitte (mit In-Game-Koordinaten)
und ein **Live-Koordinaten-Readout** unter der Maus. Fahr über bekannte Orte
(z. B. Fast-Travel-Statuen) und vergleiche die angezeigten Karten-Koordinaten
mit denen aus dem Wiki. Passen sie, ist alles korrekt.

**3. Bei Bedarf justieren.** Stimmt es nicht ganz, verschieb im Panel die vier
Ränder (`xTop`/`xBottom` = Nord/Süd, `yLeft`/`yRight` = West/Ost), bis die Orte
auf ihren Fadenkreuzen liegen, und klick **„calibration kopieren"**. Den
kopierten Block trägst du in der `config.json` unter `map` → `calibration` ein
und startest den Dienst neu (`systemctl restart palworld-web`).

Die Standard-Kalibrierung passt bereits zum vollständigen Kartenbild von
Palworld 1.0 (alle Inseln; Quelle: `DT_WorldMapUIData`):
Welt-Koordinaten X ∈ [−1.099.400, +349.400], Y ∈ [−724.400, +724.400].
Umrechnung zu den In-Game-Kartenkoordinaten: `karte_x = (welt_y − 158000) / 459`,
`karte_y = (welt_x + 123888) / 459`.

**Basen-Positionen** stehen nicht in der REST-API, sondern nur im Spielstand.
Dafür läuft auf dem **Palworld-Server** ein Uploader:

```bash
# Debian 12+: venv + Fork mit Unterstützung für das neue PlM/Oodle-Save-Format
apt update && apt install -y python3-venv git build-essential python3-dev
python3 -m venv /opt/paltools
/opt/paltools/bin/pip install "git+https://github.com/MRHRTZ/pyooz.git"
/opt/paltools/bin/pip install "git+https://github.com/MRHRTZ/palworld-save-tools.git"
# testen (Web-Server über den WireGuard-Tunnel):
/opt/paltools/bin/python3 tools/upload-bases.py \
  --sav "~/palworld/Saved/SaveGames/0/*/Level.sav" \
  --url http://10.88.0.1/api/map/bases \
  --secret DEIN-UPLOAD-SECRET --dry-run
# als Cronjob alle 30 Minuten (crontab -e):
*/30 * * * * /opt/paltools/bin/python3 /pfad/zu/upload-bases.py --sav "…" --url "…" --secret "…"
```

Das `uploadSecret` wird in der `config.json` der Webseite unter `map`
gesetzt; ohne Secret ist der Upload-Endpunkt deaktiviert.

## Ranglisten

Die Startseite zeigt unter „Statistiken" Ranglisten in sechs Kategorien:
Spielzeit, Paldeck-Arten, geschlachtete Pals (💀 Hall of Shame), geangelte
Fische, Dungeons und Raidbosse. Level und Turmbosse werden bewusst nicht
gelistet – beides ist gecapt und wäre bald überall gleich; bei Gleichständen
sortieren die mit hochgeladenen Erfahrungspunkte fein.

Die Spielzeit misst die Website selbst; alle anderen Werte stehen nur im
Spielstand. Dafür läuft auf dem **Palworld-Server** ein zweiter Uploader
(gleiches venv und gleiches `uploadSecret` wie der Basen-Uploader – er liest
zusätzlich zur `Level.sav` auch die kleinen `Players/*.sav`):

```bash
# testen:
/opt/paltools/bin/python3 tools/upload-rankings.py \
  --sav "~/palworld/Saved/SaveGames/0/*/Level.sav" \
  --url http://10.88.0.1/api/rankings/upload \
  --secret DEIN-UPLOAD-SECRET --server pve --dry-run
# als Cronjob 1x pro Stunde, zeitversetzt zum Basen-Upload (crontab -e):
40 * * * * /opt/paltools/bin/python3 /pfad/zu/upload-rankings.py --sav "…" --url "…" --secret "…" --server pve
```

Endpunkte: `POST /api/rankings/upload` (Secret wie Basen-Upload),
`GET /api/rankings?server=<id>` (öffentlich, fertig sortierte Top-15-Listen).
Die Daten liegen pro Server in `data/rankings*.json`.

### Team-Anzeige auf Spielerprofilen

Der Ranglisten-Uploader nimmt automatisch das **ausgerüstete Team** jedes
Spielers mit (bis zu 5 Pals): Art, Spitzname, Level, Geschlecht, Alpha/Lucky,
Kondensator-Sterne, Seelen-Stufen, IVs und Passive Skills. Die Profilseite
(`/spieler/<Name>`) zeigt daraus Pal-Karten mit Icon, berechneten Kampfwerten
(Community-Formel: Basiswerte × Level × IV, +5 % je Stern, +3 % je
Seelen-Stufe), IV-Balken und Passiv-Chips.

Auf der Admin-Seite lässt sich die Anzeige unter **🧩 Funktionen** jederzeit
für alle Besucher an-/abschalten (gespeichert in `data/features.json`).

Icons, Basiswerte und Passiv-Namen liegen lokal unter `public/assets/pals/`
(keine externen Dienste). Das Paket wird mit `tools/build-paldata.py` aus
einem Checkout von
[PalworldSaveTools](https://github.com/deafdudecomputers/PalworldSaveTools)
(MIT) generiert – die enthaltenen Icons sind Spiel-Assets von Pocketpair
(nicht-kommerzielle Fan-Content-Nutzung). Nach großen Palworld-Updates
einfach neu generieren:

```bash
python3 tools/build-paldata.py --source /pfad/zu/PalworldSaveTools/resources
```

## Server-Status im Discord (tools/discord-status.py)

Spiegelt den Live-Status jedes Servers als **eine sich selbst
aktualisierende Nachricht** in einen Discord-Kanal (Embed wird bearbeitet,
kein Nachrichten-Spam): Spieler, Version, In-Game-Tage, Server-FPS, Uptime,
API-Latenz sowie **CPU und RAM** der Maschine und des PalServer-Prozesses
(mit Balkenanzeige). Ist der Spielserver down, wird die Nachricht rot und
zeigt weiterhin die Hardware – inklusive Hinweis, falls der Prozess gar
nicht mehr läuft.

Läuft auf dem **Palworld-Server** (nur Python-Standardbibliothek, kein
venv nötig):

```bash
# 1. Discord: Kanal → Einstellungen → Integrationen → Webhook anlegen, URL kopieren
# 2. Testen:
python3 tools/discord-status.py \
  --api http://127.0.0.1:8212 --password 'ADMINPASSWORT' \
  --webhook 'https://discord.com/api/webhooks/…' \
  --name 'Server 1 · PvE 4x' --address pve.palheim.de:8211
# 3. Cron, alle 5 Minuten (crontab -e):
*/5 * * * * python3 /root/palworld/discord-status.py --api … --password '…' --webhook '…' --name '…' --address … >> /var/log/discord-status.log 2>&1
```

Beide Server können denselben Webhook/Kanal nutzen – jeder pflegt seine
eigene Nachricht (unterschieden über `--name`). Die Nachrichten-ID merkt
sich das Skript in `~/.palheim-discord-status.json`; wird die Nachricht im
Discord gelöscht, legt der nächste Lauf automatisch eine neue an.

### Neustarts im selben Kanal (ohne Nachrichten-Spam)

Früher hat jeder Neustart eine **neue** Nachricht gepostet – dadurch rutschte
die Status-Nachricht mit Spielern, FPS und CPU/RAM nach und nach nach oben aus
dem Blick. Jetzt pflegen `palworld-autoupdate.sh` und `palworld-watchdog.sh`
über `deploy/gameserver/palworld-discord.sh` **eine** Neustart-Nachricht, die
bearbeitet statt neu gepostet wird:

> 🔄 **Neustarts · Server 1 · PvE 4x** · 🟢 Server läuft.
> **🕒 Letzter Neustart** – 4. Aug 2026, 05:05 · *vor 6 Std* · ⬆️ Update ·
> `v0.6.1` → `v0.6.2` · 3 Spieler waren online
> **⏭️ Nächster Neustart** – 4. Aug 2026, 17:05 · *in 6 Std*

Die Zeiten gehen als Discord-Zeitstempel (`<t:…:R>`) raus – Discord rechnet
sie im Client selbst um, „vor 6 Std“ bleibt also aktuell, ohne dass ein
Cronjob die Nachricht ständig neu schreiben muss. Während eines Neustarts wird
die Nachricht orange („Neustart läuft“), bei Fehlern rot.

Damit das läuft, muss `palworld-discord.sh` neben den beiden Skripten liegen
(gleiches Verzeichnis, meist `/root/palworld/`). Fehlt die Datei, bleibt alles
beim alten Verhalten. Einstellungen in der `palworld-scripts.conf`:

```bash
DISCORD_WEBHOOK="https://discord.com/api/webhooks/…"  # derselbe Kanal wie oben
DISCORD_SERVER_NAME="Server 1 · PvE 4x"    # Titelzusatz, optional
RESTART_SCHEDULE="05:05 17:05"             # geplante Neustarts (lokale Zeit)
# DISCORD_RESTART_MESSAGE=false            # zurück zum alten Verhalten
# DISCORD_ALERT_NEW_MESSAGE=true           # Fehler zusätzlich als eigene Nachricht
# DISCORD_STATE_FILE="/var/lib/palworld/discord-restart.json"
```

`RESTART_SCHEDULE` ist die Zeit, zu der der Server **wirklich** runtergeht,
also Cron-Zeit + Vorwarnzeit (Cron `55 4 * * *` + 10 min Warnung → `05:05`).
Ohne die Angabe zeigt die Nachricht „kein fester Termin“. Ein `--min-gap`
wird berücksichtigt: liegt der nächste Termin zu dicht am letzten Neustart,
wird gleich der übernächste angezeigt.

Optional hält ein kleiner Cronjob den nächsten Termin frisch (nötig z. B.,
wenn ein Lauf wegen `--if-empty` übersprungen wurde):

```bash
*/15 * * * * /root/palworld/palworld-autoupdate.sh --discord-refresh >/dev/null 2>&1
```

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
| Server-Adresse `pve.palheim.de:8211` | `public/index.html` (Hero-Chip + Schritt 2) |
| Discord-Link `discord.gg/b8WYXN3Q3e` | `public/index.html` + `public/karte.html` (mehrfach – suchen & ersetzen) |
| Raten & Server-Infos | `public/index.html`, Sektion `#server` |
| Regeln | `public/index.html`, Sektion `#regeln` |
| FAQ | `public/index.html`, Sektion `#faq` |
| Farben / Design | `public/css/style.css`, CSS-Variablen in `:root` |
| Hero-Hintergrund | Standard: `public/assets/hero.webp` (KI-Artwork). Alternative Variante: `hero-alt.webp` (umbenennen zu `hero.webp`). Eigenes Bild als `hero.jpg` ablegen überstimmt alles; ohne Bilddateien greift die SVG-Szene `hero-scene.svg` |
| Impressum / Datenschutz | `public/impressum.html`, `public/datenschutz.html` (TODOs ausfüllen!) |

## SEO & KI-Sichtbarkeit

Die Seite bringt die technische Basis mit, um in Suchmaschinen **und**
KI-Suchen (ChatGPT, Perplexity, Google AI Overviews, …) gefunden und
empfohlen zu werden:

- `public/robots.txt` – alle Crawler inkl. KI-Bots erlaubt, Sitemap verlinkt
- `public/sitemap.xml` – bei neuen Seiten erweitern (`lastmod` aktualisieren)
- `public/llms.txt` – kompakte Server-Fakten für KI-Crawler
- Strukturierte Daten (JSON-LD: `GameServer`, `FAQPage`, `WebSite`) und
  vollständige Open-Graph-/Twitter-Tags in `public/index.html`
- Saubere kanonische URLs: `/karte` statt `/karte.html` – alte `.html`-Pfade
  leiten per 301 weiter (macht `server.js`)
- OG-Vorschaubild `public/assets/og-image.jpg` – nach einem Wechsel des
  Hero-Bildes mit `python3 tools/make-og-image.py` neu erzeugen

⚠️ Inhalte wie Raten, Regeln und FAQ stehen jetzt zusätzlich als JSON-LD und
in `llms.txt` – **bei Änderungen an diesen Fakten alle drei Stellen anpassen**
(Sichtbarer Text, JSON-LD im `<head>`, `public/llms.txt`), sonst zeigen
Google & KIs veraltete Werte an.

Die einmaligen Schritte außerhalb des Codes (Google Search Console, Bing
Webmaster Tools, Serverlisten, Discord-Discovery) stehen in
**[docs/seo-checkliste.md](docs/seo-checkliste.md)**.

## Sicherheit

- Der `/api/status`-Endpunkt gibt nur unkritische Daten weiter
  (keine IPs, keine Steam-/Player-IDs der Spieler)
- `config.json` enthält das Admin-Passwort → `chmod 600`, nie committen
- Ports 3000 (Web-Backend) und 8212 (REST-API) nur lokal erreichbar lassen
- systemd-Unit läuft ohne Root-Rechte und mit gehärteten Einstellungen

## Lizenz

MIT – mach damit, was du willst. Palworld ist eine Marke von Pocketpair, Inc.
