# PalHeim – Projektwissen

Webseite (Node.js, kein Build-Schritt) plus die Wartungs-Werkzeuge für die
Palworld-Gameserver. Details zur Webseite stehen im README.

## Betrieb (Stand: August 2026)

**Es gibt kein Docker mehr.** Beide Gameserver laufen als native Instanz:
SteamCMD + systemd-Unit `palworld.service`. Alles, was mit `docker compose`,
Containern oder GHCR-Image-Tags arbeitet, ist Geschichte – neue Skripte bitte
nur noch gegen systemd bauen.

```
Web-Server            palheim.de, Node.js + nginx, /opt/palworld-web
Gameserver 1 + 2      nativ, identisch aufgebaut
  /home/palworld/     palserver (Spiel), steamcmd, Spielstände
  /etc/palworld/      alle Skripte + palworld-scripts.conf (600)
  /opt/paltools/      reines Python-venv, jederzeit wegwerfbar
  root-crontab        Block zwischen "# >>> palworld" und "# <<< palworld"
```

Die REST-API läuft lokal (`127.0.0.1:8212`), RCON auf 25575 (Passwort =
AdminPassword, von der Webseite für Vote-Belohnungen genutzt). Zwischen
Web-Server und Gameservern liegt ein WireGuard-Tunnel (10.88.0.0/24); der
Tunnel selbst wird nicht von diesem Repo verwaltet.

## Aufbau der Skripte

- `deploy/gameserver/setup-palworld.sh` – richtet eine Maschine komplett ein
- `install-paltools.sh` – venv + alle Skripte nach `/etc/palworld`
- `palworld-autoupdate.sh` – SteamCMD-Update + geplante Neustarts
- `palworld-watchdog.sh` – REST-API tot → `systemctl restart`
- `palworld-announce.sh` – Ingame-Ansagen aus `announcements.txt`
- `palworld-backup.sh` – Live-Backup ohne Neustart
- `palworld-discord.sh` – Bibliothek: **eine** gepflegte Neustart-Nachricht
- `palworld-status.sh` / `palworld-upload.sh` – Wrapper um die Python-Werkzeuge

Alles Serverspezifische steht in `/etc/palworld/palworld-scripts.conf`, damit
Skripte und Cron auf beiden Maschinen identisch bleiben. Die Skripte suchen
die Conf in dieser Reihenfolge: `$PALWORLD_CONF` → neben dem Skript →
`/etc/palworld/palworld-scripts.conf`.

## Konventionen

- Kommentare und Log-Ausgaben der Bash-Skripte ohne Umlaute (ae/oe/ue),
  Texte für Discord und Ingame dagegen mit.
- Kommentare erklären das **Warum**, nicht das Was.
- Skripte laufen mit `set -euo pipefail` – bei `ls`/Pipes auf `|| true`
  achten, sonst reißt ein leeres Verzeichnis den Lauf mit.
- Jede Änderung an den Server-Skripten mit einem Trockenlauf belegen
  (`--dry-run` gibt es bei backup, status und upload).
