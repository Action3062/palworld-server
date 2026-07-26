#!/usr/bin/env python3
"""
Event-Scanner für die PalHeim-Karte
-----------------------------------
Läuft auf dem PALWORLD-Server. Beantwortet die Frage: Stehen Meteoriten-
Events (bzw. Versorgungskisten) überhaupt in der Level.sav – so wie die
Basislager, die der Uploader schon ausliest?

Warum ein eigenes Werkzeug?
  Für Basislager ist der Fall klar: BaseCampSaveData → transform.translation.
  Für Meteoriten ist NICHT dokumentiert, ob und wo der Spielstand etwas
  speichert. Bekannt ist nur SupplySaveData (Versorgungskisten:
  LastSupplyTime, LastLotteryTime, SupplyInfos). Statt zu raten, schaut
  dieses Skript in EUREM Spielstand nach.

Zwei Stufen:
  1. Roh-Scan (schnell, Sekunden): Der entpackte Spielstand wird byteweise
     nach Schlüsselwörtern (Meteor, Supply, Lottery, …) durchsucht und die
     gefundenen Namen werden aufgelistet. Taucht "Meteor" nirgends auf,
     steht es auch nicht im Save – Frage beantwortet, ohne 2 Minuten zu
     parsen.
  2. Struktur-Parse (langsam, 1–2 Minuten, --parse): listet alle
     Top-Level-Schlüssel von worldSaveData auf und gibt zu den
     interessanten Blöcken (Supply/Spawner/Meteor/Event) alle enthaltenen
     Koordinaten aus – umgerechnet in die In-Game-Kartenkoordinaten, die
     auch die Webseite verwendet.

Der aussagekräftige Test ist ein VORHER/NACHHER-Vergleich:
  1. Ohne aktives Event laufen lassen:   scan-events.py --sav '…' --json /tmp/vorher.json
  2. Während ein Meteorit auf der Karte liegt (vorher im Spiel speichern
     lassen bzw. /api/save auslösen!):   scan-events.py --sav '…' --json /tmp/waehrend.json
  3. Unterschiede ansehen:               diff /tmp/vorher.json /tmp/waehrend.json
  Wichtig: Der Spielstand wird nur beim Speichern geschrieben. Ohne ein
  Save zwischendurch kann im Spielstand nichts Neues stehen.

Aufs Spiel-Server holen bzw. AKTUALISIEREN (Repo ist öffentlich; -f sorgt
dafür, dass bei einem 404 keine kaputte Datei geschrieben wird):
  curl -fsSLo /root/scan-events.py \
    https://raw.githubusercontent.com/Action3062/palworld-server/refs/heads/claude/meteoriten-events-map-4g1kaj/tools/scan-events.py

Einrichtung – identisch zum Basen-Uploader (gleiche venv nutzen):
  apt update && apt install -y python3-venv git build-essential python3-dev
  python3 -m venv /opt/paltools
  /opt/paltools/bin/pip install "git+https://github.com/MRHRTZ/pyooz.git"
  /opt/paltools/bin/pip install "git+https://github.com/MRHRTZ/palworld-save-tools.git"

Aufruf (Glob-Muster bitte QUOTEN, damit die Shell es nicht selbst
expandiert – ~ wird vom Skript aufgelöst):
  /opt/paltools/bin/python3 /root/scan-events.py \
      --sav '~/palworld/Saved/SaveGames/0/*/Level.sav' --parse

  --keyword WORT   zusätzliches Suchwort für den Roh-Scan (mehrfach möglich)
  --parse          zusätzlich strukturiert parsen (dauert 1–2 Minuten)
  --json datei     Ergebnis als JSON schreiben (für den diff-Vergleich)
  --max-names N    höchstens N gefundene Namen je Suchwort anzeigen (Std. 40)

Dieses Skript ist read-only: es liest den Spielstand und ändert nichts.
"""

import argparse
import contextlib
import glob
import io
import json
import os
import sys

try:
    from palworld_save_tools.gvas import GvasFile
    from palworld_save_tools.palsav import decompress_sav_to_gvas
    from palworld_save_tools.paltypes import PALWORLD_TYPE_HINTS
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

    Identisch zu upload-bases.py: prop_value() der Fork-Version kennt nur eine
    Handvoll Typen und wirft bei allem anderen "Unknown property value type".
    Palworld 1.0 hat Maps mit z. B. Int64Property als Wert.
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
    matches = glob.glob(os.path.expanduser(pattern))
    if not matches:
        sys.exit(f"Keine .sav unter '{pattern}' gefunden.")
    # Bei mehreren Welt-Ordnern den ZULETZT GESPEICHERTEN nehmen (wie bei den
    # anderen Werkzeugen) – der alphabetisch erste ist oft ein alter Spielstand.
    matches.sort(key=os.path.getmtime, reverse=True)
    if len(matches) > 1:
        print(f"Hinweis: {len(matches)} Spielstände gefunden, "
              f"nehme den zuletzt gespeicherten: {matches[0]}")
    return matches[0]


# ----------------------------------------------------------------------
# Stufe 1: Roh-Scan über die entpackten Save-Bytes
# ----------------------------------------------------------------------

# Namen im Spielstand (Klassen-, Pfad- und Feldnamen) bestehen aus diesen
# Zeichen – daran erkennen wir, wie weit ein Treffer nach links/rechts reicht.
NAME_BYTES = set(b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_./:-")

DEFAULT_KEYWORDS = ["Meteor", "Supply", "Lottery", "Comet", "RandomEvent", "Impact"]


def expand_name(data: bytes, pos: int, length: int) -> str:
    """Den kompletten Namen um einen Treffer herum einsammeln."""
    start = pos
    while start > 0 and data[start - 1] in NAME_BYTES:
        start -= 1
    end = pos + length
    while end < len(data) and data[end] in NAME_BYTES:
        end += 1
    return data[start:end].decode("ascii", "replace")


def raw_scan(data: bytes, keywords: list, max_names: int) -> dict:
    """
    Sucht die Schlüsselwörter als ASCII und als UTF-16LE in den Rohbytes.

    GVAS speichert Strings längenpräfigiert – ASCII für reine ASCII-Namen,
    UTF-16LE sonst. Beides abzusuchen kostet fast nichts und ist unabhängig
    davon, ob der Parser die Struktur versteht.
    """
    result = {}
    for word in keywords:
        names = {}
        for encoding, needle in (("ascii", word.encode("ascii")),
                                 ("utf-16le", word.encode("utf-16-le"))):
            step = 1 if encoding == "ascii" else 2
            pos = data.find(needle)
            while pos != -1:
                if encoding == "ascii":
                    name = expand_name(data, pos, len(needle))
                else:
                    # UTF-16-Treffer: jedes zweite Byte ist 0 – Namen nur grob
                    # rekonstruieren, sie sind hier ohnehin die Ausnahme.
                    name = data[pos:pos + len(needle) * 2].decode("utf-16-le", "replace")
                names[name] = names.get(name, 0) + 1
                pos = data.find(needle, pos + step)
        result[word] = {
            "treffer": sum(names.values()),
            "namen": sorted(names.items(), key=lambda kv: -kv[1])[:max_names],
        }
    return result


# ----------------------------------------------------------------------
# Stufe 2: Struktur-Parse
# ----------------------------------------------------------------------

INTERESTING = ("supply", "meteor", "spawner", "event", "invader", "oilrig", "lottery")

# Welt- → In-Game-Kartenkoordinaten (M-Karte) – gleiche Formel wie public/js/map.js
def world_to_ingame(wx: float, wy: float) -> tuple:
    return ((wy - 158000) / 459, (wx + 123888) / 459)


def collect_coords(node, path="", out=None, depth=0):
    """Rekursiv alle {x, y, z}-Strukturen einsammeln (mit Pfadangabe)."""
    if out is None:
        out = []
    if depth > 12 or len(out) >= 200:
        return out
    if isinstance(node, dict):
        keys = node.keys()
        if {"x", "y"} <= set(keys) and all(isinstance(node[k], (int, float)) for k in ("x", "y")):
            out.append((path, float(node["x"]), float(node["y"])))
        for key, value in node.items():
            collect_coords(value, f"{path}.{key}", out, depth + 1)
    elif isinstance(node, list):
        for i, value in enumerate(node[:50]):
            collect_coords(value, f"{path}[{i}]", out, depth + 1)
    return out


def summarize(node, depth=0):
    """Kompakte Struktur-Übersicht statt eines riesigen JSON-Dumps."""
    if depth > 3:
        return "…"
    if isinstance(node, dict):
        return {k: summarize(v, depth + 1) for k, v in list(node.items())[:12]}
    if isinstance(node, list):
        head = summarize(node[0], depth + 1) if node else None
        return {"liste": len(node), "erstes": head}
    if isinstance(node, bytes):
        return f"<{len(node)} Rohbytes>"
    if isinstance(node, (int, float, bool)) or node is None:
        return node
    return str(node)[:120]


def parse_world(raw_gvas: bytes):
    """
    Ohne eigene Decoder parsen: RawData-Blöcke bleiben Rohbytes.

    Das ist schneller und robuster als der vollständige Parse – für die Frage
    „welche Blöcke gibt es überhaupt und was steht drin" reicht es.
    """
    print("Parse Spielstand (Struktur, ohne RawData-Decoder) …")
    with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
        gvas = GvasFile.read(raw_gvas, PALWORLD_TYPE_HINTS, {})
    return gvas.properties["worldSaveData"]["value"]


def main() -> None:
    ap = argparse.ArgumentParser(description="Sucht Event-Daten (Meteoriten, Versorgungskisten) in der Level.sav")
    ap.add_argument("--sav", required=True, help="Pfad/Glob zur Level.sav (bitte quoten)")
    ap.add_argument("--keyword", action="append", default=[], help="zusätzliches Suchwort (mehrfach möglich)")
    ap.add_argument("--parse", action="store_true", help="zusätzlich strukturiert parsen (1–2 Minuten)")
    ap.add_argument("--json", dest="json_out", default="", help="Ergebnis als JSON schreiben (für diff)")
    ap.add_argument("--max-names", type=int, default=40, help="max. Namen je Suchwort (Standard 40)")
    args = ap.parse_args()

    sav_path = find_sav(args.sav)
    print(f"Lese {sav_path} …")
    with open(sav_path, "rb") as f:
        data = f.read()
    raw_gvas, _ = decompress_sav_to_gvas(data)
    print(f"Entpackt: {len(raw_gvas) / 1_048_576:.1f} MB")

    keywords = DEFAULT_KEYWORDS + [k for k in args.keyword if k not in DEFAULT_KEYWORDS]
    scan = raw_scan(raw_gvas, keywords, args.max_names)

    print("\n=== Roh-Scan ===")
    for word in keywords:
        hits = scan[word]
        print(f"\n{word}: {hits['treffer']} Treffer")
        if not hits["namen"]:
            print("  (nichts gefunden – kommt im Spielstand nicht vor)")
        for name, count in hits["namen"]:
            print(f"  {count:5d}×  {name}")

    report = {"sav": sav_path, "scan": scan}

    if args.parse:
        print("\n=== Struktur ===")
        try:
            world = parse_world(raw_gvas)
        except Exception as err:  # noqa: BLE001 – Diagnose-Werkzeug, alles melden
            print(f"Parsen fehlgeschlagen: {err}")
            print("Der Roh-Scan oben gilt trotzdem. Bitte diese Meldung weitergeben.")
            world = None

        if world is not None:
            top = sorted(world.keys())
            report["top_level"] = top
            print(f"\nworldSaveData hat {len(top)} Blöcke:")
            print("  " + ", ".join(top))

            blocks = {}
            for key in top:
                if not any(marker in key.lower() for marker in INTERESTING):
                    continue
                value = world[key].get("value") if isinstance(world[key], dict) else world[key]
                coords = collect_coords(value, key)
                blocks[key] = {
                    "struktur": summarize(value),
                    "koordinaten": [
                        {
                            "pfad": path,
                            "welt": {"x": round(x), "y": round(y)},
                            "karte": {"x": round(world_to_ingame(x, y)[0]),
                                      "y": round(world_to_ingame(x, y)[1])},
                        }
                        for path, x, y in coords
                    ],
                }
                print(f"\n--- {key} ---")
                print(json.dumps(summarize(value), ensure_ascii=False, indent=2, default=str)[:2000])
                if coords:
                    print(f"  {len(coords)} Koordinaten gefunden (Welt → In-Game-Karte):")
                    for path, x, y in coords[:20]:
                        ig_x, ig_y = world_to_ingame(x, y)
                        print(f"    {path}: Welt {round(x)},{round(y)}  →  Karte {round(ig_x)},{round(ig_y)}")
                else:
                    print("  keine Koordinaten in diesem Block")
            report["blocks"] = blocks

    if args.json_out:
        with open(os.path.expanduser(args.json_out), "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2, default=str)
        print(f"\nJSON geschrieben: {args.json_out}")

    meteor_hits = scan.get("Meteor", {}).get("treffer", 0)
    print("\n=== Fazit ===")
    if meteor_hits:
        print(f"'Meteor' kommt {meteor_hits}× im Spielstand vor – die Namen oben zeigen, in "
              "welchem Zusammenhang.\nWenn dabei ein Objekt mit Koordinaten auftaucht "
              "(Stufe 2), lässt sich daraus ein Karten-Layer bauen.")
    else:
        print("'Meteor' kommt im Spielstand NICHT vor. Dann speichert Palworld das Event\n"
              "nicht persistent – über die Level.sav ist der Einschlagsort nicht zu bekommen.")
    print("Aussagekräftig wird es erst im Vergleich: einmal ohne und einmal MIT aktivem\n"
          "Meteoriten laufen lassen (dazwischen den Server speichern lassen) und die\n"
          "beiden --json-Dateien mit  diff  vergleichen.")


if __name__ == "__main__":
    main()
