#!/usr/bin/env python3
"""
Ranglisten-Uploader für die PalHeim-Webseite
--------------------------------------------
Läuft auf dem PALWORLD-Server: liest Level/EP aus der Level.sav sowie die
Spieler-Zähler (Paldeck, Turmbosse, geschlachtete Pals, Angeln, Dungeons,
Raidbosse) aus den Players/*.sav und lädt alles zur Webseite hoch.

Einrichtung wie beim Basen-Uploader (gleiches /opt/paltools-venv, gleiches
uploadSecret). Auf dem Palworld-Server testen:
  /opt/paltools/bin/python3 upload-rankings.py \
    --sav '~/palworld/Saved/SaveGames/0/*/Level.sav' \
    --url http://10.88.0.1/api/rankings/upload \
    --secret LANGES-ZUFALLS-TOKEN --server pve --dry-run

Als Cronjob reicht 1x pro Stunde (versetzt zum Basen-Upload, beide Jobs
parsen die große Level.sav):
  40 * * * * /opt/paltools/bin/python3 /root/upload-rankings.py --sav ... --url ... --secret ... --server pve >> /var/log/upload-rankings.log 2>&1

Hinweis: Level.sav-Parsen dauert 1–2 Minuten; die vielen kleinen
Players/*.sav gehen deutlich schneller.
"""

import argparse
import contextlib
import glob
import io
import json
import os
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
    """Ergänzt fehlende Map-Wert-Typen (Int64 u. a.) – wie im Basen-Uploader."""
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
    matches = glob.glob(os.path.expanduser(pattern))
    if not matches:
        sys.exit(f"Keine Level.sav unter '{pattern}' gefunden.")
    matches.sort(key=os.path.getmtime, reverse=True)
    if len(matches) > 1:
        print(f"Hinweis: {len(matches)} Spielstände gefunden, "
              f"nehme den zuletzt gespeicherten: {matches[0]}")
    return matches[0]


def read_gvas(path: str, custom: dict):
    with open(path, "rb") as f:
        data = f.read()
    raw_gvas, _ = decompress_sav_to_gvas(data)
    # Bibliotheks-Warnungen ("Struct type … assuming Guid") wegfiltern –
    # echte Fehler kommen weiterhin als Exception.
    with contextlib.redirect_stdout(io.StringIO()), \
            contextlib.redirect_stderr(io.StringIO()):
        return GvasFile.read(raw_gvas, PALWORLD_TYPE_HINTS, custom)


def unwrap(prop, default=None):
    """Property-Wert holen; ByteProperty-Werte sind nochmal verschachtelt."""
    if not isinstance(prop, dict):
        return default
    v = prop.get("value", default)
    if isinstance(v, dict) and "value" in v:  # z. B. Level (ByteProperty)
        v = v.get("value", default)
    return v if v is not None else default


def norm_uid(uid) -> str:
    """GUID → Players-Dateiname-Format (Hex, groß, ohne Bindestriche)."""
    return str(uid).replace("-", "").upper()


def level_players(sav_path: str) -> dict:
    """Level.sav → uid → {name, level, exp}"""
    print(f"Lese {sav_path} …")
    custom = {k: v for k, v in PALWORLD_CUSTOM_PROPERTIES.items()
              if "CharacterSaveParameterMap" in k}
    print("Parse Spielstand (nur Spieler-Charaktere) …")
    gvas = read_gvas(sav_path, custom)
    world = gvas.properties["worldSaveData"]["value"]
    chars = world.get("CharacterSaveParameterMap", {}).get("value", [])

    players = {}
    for entry in chars:
        try:
            key = entry["key"]
            p = entry["value"]["RawData"]["value"]["object"]["SaveParameter"]["value"]
            if not unwrap(p.get("IsPlayer"), False):
                continue
            uid = norm_uid(unwrap(key.get("PlayerUId"), ""))
            name = str(unwrap(p.get("NickName"), "")).strip()
            if not uid or not name:
                continue
            players[uid] = {
                "name": name[:32],
                "level": int(unwrap(p.get("Level"), 0) or 0),
                "exp": int(unwrap(p.get("Exp"), 0) or 0),
            }
        except (KeyError, TypeError, ValueError):
            continue
    return players


def map_sum(rec: dict, key: str) -> int:
    """Summe aller Zahlenwerte einer MapProperty (z. B. PalCaptureCount)."""
    entries = rec.get(key, {}).get("value") or []
    total = 0
    for e in entries:
        v = e.get("value")
        if isinstance(v, bool):
            total += 1 if v else 0
        elif isinstance(v, (int, float)):
            total += int(v)
    return total


def map_true_count(rec: dict, key: str) -> int:
    """Anzahl der auf True stehenden Flags einer MapProperty."""
    entries = rec.get(key, {}).get("value") or []
    return sum(1 for e in entries if e.get("value") is True)


def int_value(rec: dict, key: str) -> int:
    v = unwrap(rec.get(key), 0)
    return int(v) if isinstance(v, (int, float)) else 0


def player_record(sav_path: str) -> dict:
    """Players/<UID>.sav → Ranglisten-Zähler"""
    gvas = read_gvas(sav_path, {})
    sd = gvas.properties.get("SaveData", {}).get("value", {})
    rec = sd.get("RecordData", {}).get("value") or {}
    return {
        # Paldeck: wie viele Arten wurden freigeschaltet?
        "paldeck": map_true_count(rec, "PaldeckUnlockFlag"),
        # Gefangene Pals insgesamt (alle Arten aufsummiert)
        "caught": map_sum(rec, "PalCaptureCount"),
        # Besiegte Turmbosse (verschiedene Türme)
        "towers": map_true_count(rec, "TowerBossDefeatFlag"),
        # Hall of Shame: geschlachtete Pals
        "butcher": map_sum(rec, "PalButcherCount"),
        # Geangelte Fische
        "fishing": map_sum(rec, "FishingCountMap"),
        # Abgeschlossene Dungeons (normale + feste)
        "dungeons": int_value(rec, "NormalDungeonClearCount")
                    + int_value(rec, "FixedDungeonClearCount"),
        # Besiegte Raidbosse
        "raids": map_sum(rec, "RaidBossDefeatCount"),
    }


def collect(sav_pattern: str) -> list:
    level_sav = find_sav(sav_pattern)
    players = level_players(level_sav)
    print(f"{len(players)} Spieler in der Level.sav gefunden.")

    players_dir = os.path.join(os.path.dirname(level_sav), "Players")
    files = sorted(glob.glob(os.path.join(players_dir, "*.sav")))
    if not files:
        print(f"ACHTUNG: Keine Spieler-Dateien unter {players_dir} gefunden –\n"
              "  die Ranglisten enthalten dann nur Level/EP.")
    matched = skipped = failed = 0
    for f in files:
        uid = os.path.splitext(os.path.basename(f))[0].upper()
        entry = players.get(uid)
        if entry is None:
            skipped += 1   # alte/verwaiste Datei ohne Charakter in der Welt
            continue
        try:
            entry.update(player_record(f))
            matched += 1
        except Exception as err:  # noqa: BLE001 – einzelne kaputte Datei überspringen
            failed += 1
            print(f"  Überspringe {os.path.basename(f)}: {err}")
    print(f"Spieler-Dateien: {matched} gelesen, {skipped} ohne Welt-Charakter übersprungen"
          + (f", {failed} fehlerhaft" if failed else "") + ".")
    return list(players.values())


def upload(url: str, secret: str, players: list, server: str = "") -> None:
    if server:
        url += ("&" if "?" in url else "?") + "server=" + server
    body = json.dumps({"players": players}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "X-Upload-Secret": secret,
            "User-Agent": "PalHeim-RankingsUploader/1.0 (+https://palheim.de)",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            print(f"Upload: HTTP {res.status} – {res.read().decode()}")
    except urllib.error.HTTPError as err:
        detail = ""
        try:
            payload = json.loads(err.read().decode("utf-8", "replace"))
            detail = str(payload.get("message") or "")
        except Exception:  # noqa: BLE001 – Body ist optional
            pass
        print(f"\nFEHLER: Upload fehlgeschlagen (HTTP {err.code}).")
        if detail:
            print(f"  Server meldet: {detail}")
        else:
            print("  Keine Klartext-Meldung der Webseite – vermutlich blockt ein Dienst\n"
                  "  davor (Cloudflare/WAF/nginx). Lösung: die Webseite direkt über den\n"
                  "  WireGuard-Tunnel ansprechen, z. B. --url 'http://10.88.0.1/api/rankings/upload'")
        print(f"  Ziel-URL war: {url}")
        sys.exit(1)
    except urllib.error.URLError as err:
        print(f"\nFEHLER: Webseite nicht erreichbar ({err.reason}).")
        print(f"  Ziel-URL war: {url}")
        sys.exit(1)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Spieler-Ranglisten aus dem Spielstand zur Webseite hochladen")
    parser.add_argument("--sav", required=True, help="Pfad/Glob zur Level.sav")
    parser.add_argument("--url", required=True,
                        help="Upload-URL, z. B. http://10.88.0.1/api/rankings/upload")
    parser.add_argument("--secret", required=True,
                        help="uploadSecret aus der config.json der Webseite (wie Basen-Upload)")
    parser.add_argument("--server", default="",
                        help="Server-ID der Webseite bei Mehrserver-Betrieb (z. B. pve, pvee)")
    parser.add_argument("--dry-run", action="store_true", help="nur anzeigen, nichts hochladen")
    args = parser.parse_args()

    players = collect(args.sav)

    if args.dry_run:
        def top(key, label):
            best = sorted((p for p in players if p.get(key)),
                          key=lambda p: p[key], reverse=True)[:3]
            if best:
                print(f"  {label}: " + ", ".join(f"{p['name']} ({p[key]})" for p in best))
        print("Dry-Run – kein Upload. Kostprobe:")
        top("level", "Level")
        top("paldeck", "Paldeck")
        top("towers", "Turmbosse")
        top("butcher", "Geschlachtet")
        top("fishing", "Geangelt")
        top("dungeons", "Dungeons")
        top("raids", "Raidbosse")
        return

    upload(args.url, args.secret, players, args.server)


if __name__ == "__main__":
    main()
