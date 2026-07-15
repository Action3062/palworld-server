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

## Inhalte anpassen

Alle Texte liegen direkt im HTML – einfach editieren:

| Was | Wo |
|---|---|
| Servername „PalHeim“ | `public/index.html` (Titel, Hero, Footer) + `public/impressum.html` / `datenschutz.html` |
| Server-Adresse `play.deinedomain.de:8211` | `public/index.html` (Hero-Chip + Schritt 2) |
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
