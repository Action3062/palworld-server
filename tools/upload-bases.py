#!/usr/bin/env python3
"""
Basen-Uploader für die PalHeim-Live-Karte
-----------------------------------------
Läuft auf dem PALWORLD-Server: liest die Basen-Positionen (Basislager) aus
der Level.sav und lädt sie zur Webseite hoch.

Einrichtung (auf dem PALWORLD-Server, nicht auf dem Web-Server!):
  1. Debian 12+/Trixie (pip fehlt, System-Python ist geschützt):
       apt update && apt install -y python3-venv
       python3 -m venv /opt/paltools
       /opt/paltools/bin/pip install palworld-save-tools
     Skript dann mit  /opt/paltools/bin/python3 upload-bases.py …  starten
  2. In der config.json der WEBSEITE ein Upload-Geheimnis setzen:
       "map": { "enabled": true, "uploadSecret": "LANGES-ZUFALLS-TOKEN" }
  3. Auf dem Palworld-Server testen:
       python3 upload-bases.py \
         --sav ~/palworld/Saved/SaveGames/0/*/Level.sav \
         --url http://10.88.0.1/api/map/bases \
         --secret LANGES-ZUFALLS-TOKEN
     (10.88.0.1 = Web-Server über den WireGuard-Tunnel, Port 80 = nginx;
      alternativ die öffentliche HTTPS-URL der Webseite verwenden)
  4. Als Cronjob, z. B. alle 30 Minuten (crontab -e):
       */30 * * * * python3 /root/upload-bases.py --sav ... --url ... --secret ... >> /var/log/upload-bases.log 2>&1

Hinweis: Das Parsen einer großen Level.sav dauert je nach Weltgröße
ein bis zwei Minuten und braucht etwas RAM.
"""

import argparse
import glob
import json
import sys
import urllib.request

try:
    from palworld_save_tools.gvas import GvasFile
    from palworld_save_tools.palsav import decompress_sav_to_gvas
    from palworld_save_tools.paltypes import PALWORLD_CUSTOM_PROPERTIES, PALWORLD_TYPE_HINTS
except ImportError:
    sys.exit("palworld-save-tools fehlt. Installieren (Debian 12+/Trixie):\n"
             "  apt install -y python3-venv\n"
             "  python3 -m venv /opt/paltools\n"
             "  /opt/paltools/bin/pip install palworld-save-tools\n"
             "und das Skript mit  /opt/paltools/bin/python3  starten.")


def find_sav(pattern: str) -> str:
    matches = sorted(glob.glob(pattern))
    if not matches:
        sys.exit(f"Keine Level.sav unter '{pattern}' gefunden.")
    if len(matches) > 1:
        print(f"Hinweis: {len(matches)} Treffer, nehme {matches[0]}")
    return matches[0]


def load_world(sav_path: str):
    print(f"Lese {sav_path} …")
    with open(sav_path, "rb") as f:
        data = f.read()
    raw_gvas, _ = decompress_sav_to_gvas(data)
    print("Parse Spielstand (kann 1–2 Minuten dauern) …")
    gvas = GvasFile.read(raw_gvas, PALWORLD_TYPE_HINTS, PALWORLD_CUSTOM_PROPERTIES)
    return gvas.properties["worldSaveData"]["value"]


def guild_names(world) -> dict:
    """group_id → Gildenname"""
    names = {}
    try:
        groups = world["GroupSaveDataMap"]["value"]
    except KeyError:
        return names
    for entry in groups:
        try:
            raw = entry["value"]["RawData"]["value"]
            name = raw.get("guild_name")
            if name:
                names[str(entry["key"])] = str(name)
        except (KeyError, TypeError):
            continue
    return names


def base_camps(world, guilds: dict) -> list:
    bases = []
    try:
        camps = world["BaseCampSaveData"]["value"]
    except KeyError:
        sys.exit("BaseCampSaveData nicht gefunden – Struktur der Level.sav hat sich evtl. geändert.\n"
                 "Bitte die Ausgabe von  list(world.keys())  melden: " + str(list(world.keys())[:20]))
    for entry in camps:
        try:
            raw = entry["value"]["RawData"]["value"]
            t = raw["transform"]["translation"]
            group_id = str(raw.get("group_id_belong_to", ""))
            bases.append({
                "guild": guilds.get(group_id, "Unbekannte Gilde"),
                "x": round(float(t["x"])),
                "y": round(float(t["y"])),
            })
        except (KeyError, TypeError, ValueError) as err:
            print(f"Überspringe ein Basislager (unerwartete Struktur: {err})")
            continue
    return bases


def upload(url: str, secret: str, bases: list) -> None:
    body = json.dumps({"bases": bases}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={"Content-Type": "application/json", "X-Upload-Secret": secret},
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        print(f"Upload: HTTP {res.status} – {res.read().decode()}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Basen aus Level.sav zur Live-Karte hochladen")
    parser.add_argument("--sav", required=True, help="Pfad/Glob zur Level.sav")
    parser.add_argument("--url", required=True, help="Upload-URL, z. B. http://10.88.0.1/api/map/bases")
    parser.add_argument("--secret", required=True, help="uploadSecret aus der config.json der Webseite")
    parser.add_argument("--dry-run", action="store_true", help="nur anzeigen, nichts hochladen")
    args = parser.parse_args()

    world = load_world(find_sav(args.sav))
    guilds = guild_names(world)
    bases = base_camps(world, guilds)
    print(f"{len(bases)} Basen gefunden ({len(guilds)} Gilden).")
    for b in bases[:5]:
        print(f"  z. B. {b['guild']}: x={b['x']}, y={b['y']}")

    if args.dry_run:
        print("Dry-Run – kein Upload.")
        return
    upload(args.url, args.secret, bases)


if __name__ == "__main__":
    main()
