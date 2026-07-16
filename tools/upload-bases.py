#!/usr/bin/env python3
"""
Basen-Uploader für die PalHeim-Live-Karte
-----------------------------------------
Läuft auf dem PALWORLD-Server: liest die Basen-Positionen (Basislager) aus
der Level.sav und lädt sie zur Webseite hoch.

Einrichtung (auf dem PALWORLD-Server, nicht auf dem Web-Server!):
  1. Debian 12+/Trixie (pip fehlt, System-Python ist geschützt):
       apt update && apt install -y python3-venv git build-essential python3-dev
       python3 -m venv /opt/paltools
       /opt/paltools/bin/pip install "git+https://github.com/MRHRTZ/pyooz.git"
       /opt/paltools/bin/pip install "git+https://github.com/MRHRTZ/palworld-save-tools.git"
     Skript dann mit  /opt/paltools/bin/python3 upload-bases.py …  starten.
     Hintergrund: Seit Palworld 0.6 sind Spielstände Oodle-komprimiert
     (Magic "PlM"); die PyPI-Version von palworld-save-tools kann nur das
     alte "PlZ"-Format. Der MRHRTZ-Fork (PR #215 upstream) + pyooz können
     beide Formate.
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
    import palworld_save_tools.archive as _pst_archive
except ImportError:
    sys.exit("palworld-save-tools fehlt. Installieren (Debian 12+/Trixie):\n"
             "  apt install -y python3-venv git build-essential python3-dev\n"
             "  python3 -m venv /opt/paltools\n"
             "  /opt/paltools/bin/pip install git+https://github.com/MRHRTZ/pyooz.git\n"
             "  /opt/paltools/bin/pip install git+https://github.com/MRHRTZ/palworld-save-tools.git\n"
             "und das Skript mit  /opt/paltools/bin/python3  starten.\n"
             "(Der Fork kann das neue PlM/Oodle-Save-Format von Palworld 0.6+.)")


def patch_missing_map_value_types() -> None:
    """
    Ergänzt fehlende Map-Wert-Typen in der Fork-Version von palworld-save-tools.

    Deren FArchiveReader.prop_value() (liest Werte innerhalb einer MapProperty)
    kennt nur eine Handvoll Typen und wirft bei allem anderen
    "Unknown property value type". Palworld 1.0 hat neue Maps mit z. B.
    Int64Property als Wert (PlayerLastUsedTimes). Die Reader-Klasse bringt die
    passenden Primitive (i64/u64/float/…) bereits mit – wir müssen sie nur an
    prop_value durchreichen. Behebt das Problem an der Wurzel für alle Maps.
    """
    reader = getattr(_pst_archive, "FArchiveReader", None)
    if reader is None or not hasattr(reader, "prop_value"):
        return
    original = reader.prop_value
    extra = {
        "Int64Property": lambda r: r.i64(),
        "UInt64Property": lambda r: r.u64(),
        "Int16Property": lambda r: r.i16(),
        "UInt16Property": lambda r: r.u16(),
        "FloatProperty": lambda r: r.float(),
        "DoubleProperty": lambda r: r.double(),
    }

    def patched(self, type_name, struct_type_name, path):
        fn = extra.get(type_name)
        if fn is not None:
            return fn(self)
        return original(self, type_name, struct_type_name, path)

    reader.prop_value = patched


patch_missing_map_value_types()


def find_sav(pattern: str) -> str:
    matches = sorted(glob.glob(pattern))
    if not matches:
        sys.exit(f"Keine Level.sav unter '{pattern}' gefunden.")
    if len(matches) > 1:
        print(f"Hinweis: {len(matches)} Treffer, nehme {matches[0]}")
    return matches[0]


# Nur die Abschnitte strukturiert dekodieren, die wir wirklich brauchen
# (Basislager-Positionen + Gildennamen). Alles andere – insbesondere das
# riesige MapObjectSaveData – bleibt als Rohdaten liegen. Das ist deutlich
# schneller und umgeht Parser-Bugs bei neuen Spielfeatures (z. B.
# "EOF not reached for module type ...GuildSecurity" in Palworld 1.0).
def needed_properties(keys) -> dict:
    return {
        key: PALWORLD_CUSTOM_PROPERTIES[key]
        for key in PALWORLD_CUSTOM_PROPERTIES
        if any(marker in key for marker in keys)
    }


def load_world(sav_path: str):
    print(f"Lese {sav_path} …")
    with open(sav_path, "rb") as f:
        data = f.read()
    raw_gvas, _ = decompress_sav_to_gvas(data)

    attempts = [
        ("Basislager + Gilden", needed_properties(["BaseCampSaveData", "GroupSaveDataMap"])),
        ("nur Basislager (Gildennamen entfallen)", needed_properties(["BaseCampSaveData"])),
        ("minimal (nur Basislager-Kerndaten)", needed_properties(["BaseCampSaveData.Value.RawData"])),
    ]
    last_error = None
    for label, custom in attempts:
        print(f"Parse Spielstand ({label}) …")
        try:
            gvas = GvasFile.read(raw_gvas, PALWORLD_TYPE_HINTS, custom)
            return gvas.properties["worldSaveData"]["value"]
        except Exception as err:  # noqa: BLE001 – bewusst breit für Retry
            print(f"  fehlgeschlagen: {err}")
            last_error = err
    sys.exit(f"Spielstand konnte nicht geparst werden: {last_error}\n"
             "Bitte diese Meldung weitergeben – vermutlich hat sich das "
             "Save-Format erneut geändert.")


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
        except (KeyError, TypeError, AttributeError):
            # AttributeError: RawData blieb undecodiert (Fallback-Parsing)
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
