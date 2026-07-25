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
import contextlib
import glob
import io
import json
import sys
import urllib.error
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


def patch_guild_name_fallback() -> None:
    """
    Macht das Auslesen der Gildennamen tolerant gegenüber neuen 1.0-Feldern.

    group.decode_bytes() wirft "EOF not reached", wenn Palworld am Ende der
    Gilden-Struktur neue Felder angehängt hat (players/trailing_bytes). Der
    guild_name steht aber DAVOR – schlägt der vollständige Decoder fehl, lesen
    wir nur die stabilen Felder bis zum Namen und ignorieren den Rest.
    """
    try:
        from palworld_save_tools.rawdata import group as gmod
    except ImportError:
        return
    original = gmod.decode_bytes

    def read_until_guild_name(parent_reader, group_bytes, group_type):
        r = parent_reader.internal_copy(bytes(group_bytes), debug=False)
        data = {
            "group_type": group_type,
            "group_id": r.guid(),
            "group_name": r.fstring(),
            "individual_character_handle_ids": r.tarray(gmod.instance_id_reader),
        }
        if group_type in (
            "EPalGroupType::Guild",
            "EPalGroupType::IndependentGuild",
            "EPalGroupType::Organization",
        ):
            data["org_type"] = r.byte()
        if group_type == "EPalGroupType::Guild":
            r.byte_list(4)              # leading_bytes
            r.tarray(gmod.uuid_reader)  # base_ids
            r.i32()                     # unknown_1
            r.i32()                     # base_camp_level
            r.tarray(gmod.uuid_reader)  # map_object_instance_ids_base_camp_points
            data["guild_name"] = r.fstring()
        elif group_type == "EPalGroupType::IndependentGuild":
            r.i32()                     # base_camp_level
            r.tarray(gmod.uuid_reader)  # map_object_instance_ids_base_camp_points
            data["guild_name"] = r.fstring()
        return data

    def patched(parent_reader, group_bytes, group_type):
        try:
            return original(parent_reader, group_bytes, group_type)
        except Exception:
            try:
                return read_until_guild_name(parent_reader, group_bytes, group_type)
            except Exception:
                return {"group_type": group_type}

    gmod.decode_bytes = patched


patch_missing_map_value_types()
patch_guild_name_fallback()


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
            # Die Bibliothek gibt beim Parsen viele harmlose Warnungen aus
            # ("EOF not reached for …, falling back to raw bytes", "Struct type
            # … assuming Guid"). Für ein sauberes Cronjob-Log wegfiltern –
            # echte Fehler kommen weiterhin als Exception.
            with contextlib.redirect_stdout(io.StringIO()), \
                    contextlib.redirect_stderr(io.StringIO()):
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


def upload(url: str, secret: str, bases: list, server: str = "") -> None:
    if server:
        # Mehrserver-Betrieb der Webseite: Ziel-Server explizit angeben
        url += ("&" if "?" in url else "?") + "server=" + server
    body = json.dumps({"bases": bases}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "X-Upload-Secret": secret,
            # Eigener User-Agent: Der Python-Standard ("Python-urllib/…") wird von
            # Schutzdiensten wie Cloudflare gern als Bot geblockt (HTTP 403).
            "User-Agent": "PalHeim-BaseUploader/1.0 (+https://palheim.de)",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            print(f"Upload: HTTP {res.status} – {res.read().decode()}")
    except urllib.error.HTTPError as err:
        # Klartext statt Traceback – die Webseite schickt einen Grund mit
        detail = ""
        raw = b""
        try:
            raw = err.read()
            payload = json.loads(raw.decode("utf-8", "replace"))
            detail = str(payload.get("message") or "")
        except Exception:  # noqa: BLE001 – Body ist optional
            pass

        # Wer hat geantwortet? Ein Fehler OHNE JSON-Grund kommt nicht von der
        # Webseite selbst, sondern von einem Dienst davor (nginx, Cloudflare …).
        headers = getattr(err, "headers", None)
        via = ""
        if headers is not None:
            server_hdr = headers.get("Server") or ""
            cf_ray = headers.get("CF-Ray") or headers.get("cf-ray") or ""
            if cf_ray:
                via = f"Cloudflare (CF-Ray {cf_ray})"
            elif server_hdr:
                via = server_hdr
        if not detail:
            print(f"\n[Hinweis] Die Antwort enthielt keinen Grund der Webseite"
                  f"{' – sie kam von: ' + via if via else ''}.")
            print("          Die Webseite selbst schickt bei Fehlern immer eine "
                  "Klartext-Meldung mit.")
            print("          Es blockiert also vermutlich ein Dienst DAVOR "
                  "(Reverse-Proxy/Schutzdienst).")

        hints = {
            403: ("Zugriff verweigert.\n"
                  "  Kam die Meldung von der Webseite (Zeile 'Server meldet' oben)?\n"
                  "  -> Dann stimmt das Upload-Secret nicht:\n"
                  "     1. --secret exakt gegen map.uploadSecret in der config.json prüfen\n"
                  "        (Secret in EINFACHE Anführungszeichen setzen, damit die Shell\n"
                  "         Zeichen wie $ ! ` nicht verändert).\n"
                  "     2. Secret gerade geändert? systemctl restart palworld-web\n"
                  "        (die config.json wird nur beim Start gelesen).\n"
                  "  Kam KEIN Grund von der Webseite?\n"
                  "  -> Dann blockt ein Dienst davor (Cloudflare/WAF/nginx). Lösung:\n"
                  "     die Webseite direkt über den WireGuard-Tunnel ansprechen, z. B.\n"
                  "     --url 'http://10.88.0.1/api/map/bases'"),
            404: ("Der Upload-Endpunkt hat die Anfrage abgelehnt.\n"
                  "  Mögliche Gründe: Live-Karte deaktiviert (map.enabled), kein uploadSecret\n"
                  "  gesetzt, unbekannte --server-ID – oder die URL zeigt nicht auf\n"
                  "  /api/map/bases (bzw. auf die falsche Seite)."),
            413: "Der Upload war zu groß – bitte melden, dann wird das Limit angehoben.",
        }
        print(f"\nFEHLER: Upload fehlgeschlagen (HTTP {err.code}).")
        if detail:
            print(f"  Server meldet: {detail}")
        hint = hints.get(err.code)
        if hint:
            print(f"  {hint}")
        print(f"  Ziel-URL war: {url}")
        sys.exit(1)
    except urllib.error.URLError as err:
        print(f"\nFEHLER: Webseite nicht erreichbar ({err.reason}).")
        print(f"  Ziel-URL war: {url}")
        print("  Läuft der Web-Dienst, und ist die URL von diesem Server aus erreichbar?")
        sys.exit(1)


def main() -> None:
    parser = argparse.ArgumentParser(description="Basen aus Level.sav zur Live-Karte hochladen")
    parser.add_argument("--sav", required=True, help="Pfad/Glob zur Level.sav")
    parser.add_argument("--url", required=True, help="Upload-URL, z. B. http://10.88.0.1/api/map/bases")
    parser.add_argument("--secret", required=True, help="uploadSecret aus der config.json der Webseite")
    parser.add_argument("--server", default="", help="Server-ID der Webseite bei Mehrserver-Betrieb (z. B. pve, pvp)")
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
    upload(args.url, args.secret, bases, args.server)


if __name__ == "__main__":
    main()
