#!/usr/bin/env python3
"""
Basen-Aktivitätsbericht für PalHeim
-----------------------------------
Läuft auf dem PALWORLD-Server. Liest die Level.sav und erstellt eine Liste,
welche Basen aktiv sind und welche schon länger nicht mehr bespielt wurden –
inklusive Anzahl der inaktiven Basen und wie viele Tage sie jeweils schon
brachliegen. Hilft, wenn das Basen-Limit (z. B. 128) erreicht ist und man
sehen will, welche Gilden man aufräumen kann.

Hintergrund
  Eine Basis (BaseCampSaveData) hat selbst KEINEN Zeitstempel. Sie gehört
  aber über  group_id_belong_to  zu einer Gilde (GroupSaveDataMap). Jede
  Gilde speichert pro Mitglied  last_online_real_time  (wann der Spieler
  zuletzt online war, im .NET-Ticks-Format). Der jüngste dieser Werte ist
  die „letzte Aktivität" der Gilde – und damit aller ihrer Basen.

Einrichtung – identisch zum Basen-Uploader (gleiche venv nutzen):
  apt update && apt install -y python3-venv git build-essential python3-dev
  python3 -m venv /opt/paltools
  /opt/paltools/bin/pip install "git+https://github.com/MRHRTZ/pyooz.git"
  /opt/paltools/bin/pip install "git+https://github.com/MRHRTZ/palworld-save-tools.git"

Aufruf (auf dem Palworld-Server):
  /opt/paltools/bin/python3 base-report.py \
      --sav ~/palworld/Saved/SaveGames/0/*/Level.sav \
      --threshold 14

  --threshold N   Basen, deren Gilde seit > N Tagen nicht online war, gelten
                  als „inaktiv" (Standard: 14).
  --csv datei     zusätzlich eine CSV mit allen Basen schreiben (für Excel).
  --json datei    zusätzlich Roh-Daten als JSON schreiben.
  --top N         nur die N inaktivsten Gilden auflisten (Standard: alle).

Alternative ohne Skript (Server räumt selbst auf):
  In der PalWorldSettings.ini / Config kann der Server inaktive Gilden
  automatisch entfernen:
      bAutoResetGuildNoOnlinePlayers=True
      AutoResetGuildTimeNoOnlinePlayers=72.0     # Stunden
  Damit werden Gilden gelöscht, deren Mitglieder seit X Stunden nicht mehr
  online waren – inklusive ihrer Basen. Dieses Skript ist die „read only"-
  Variante: es zeigt nur an, löscht nichts.
"""

import argparse
import contextlib
import csv
import glob
import io
import json
import sys
import time

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


# .NET-Ticks: 100-ns-Intervalle seit 0001-01-01. Sekunden-Differenz zu Unix-Epoche.
DOTNET_EPOCH_OFFSET = 62135596800          # Sekunden zwischen 0001-01-01 und 1970-01-01
FILETIME_EPOCH_OFFSET = 11644473600        # Sekunden zwischen 1601-01-01 und 1970-01-01
# Plausibilitätsfenster für einen echten „zuletzt online"-Zeitstempel.
PLAUSIBLE_MIN = 1704067200                 # 2024-01-01 (Palworld-Release war 2024)
PLAUSIBLE_SLACK = 172800                   # 2 Tage Toleranz in die Zukunft (Zeitzonen/Uhr)


def to_unix(raw_value: int, now: float):
    """
    Wandelt einen rohen last_online_real_time-Wert in eine Unix-Zeit um.

    Palworld nutzt .NET-Ticks. Falls sich das Format doch ändern sollte,
    probieren wir mehrere gängige Deutungen durch und nehmen die, die in ein
    plausibles Fenster (nach Palworld-Release, nicht in der Zukunft) fällt.
    So liefert der Bericht keine Unsinns-Tage, wenn ein Feld verrutscht.
    """
    if not raw_value:
        return None
    upper = now + PLAUSIBLE_SLACK
    candidates = (
        raw_value / 1e7 - DOTNET_EPOCH_OFFSET,    # .NET DateTime.Ticks (erwartet)
        raw_value / 1e7 - FILETIME_EPOCH_OFFSET,  # Windows FILETIME
        raw_value / 1000.0,                       # Unix-Millisekunden
        float(raw_value),                         # Unix-Sekunden
    )
    for unix in candidates:
        if PLAUSIBLE_MIN <= unix <= upper:
            return unix
    return None


def patch_missing_map_value_types() -> None:
    """
    Ergänzt fehlende Map-Wert-Typen in der Fork-Version von palworld-save-tools
    (identisch zum Basen-Uploader). Palworld 1.0 hat Maps mit Int64Property als
    Wert (z. B. PlayerLastUsedTimes), die der Reader sonst nicht kennt.
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


def patch_guild_activity() -> None:
    """
    Liest pro Gilde Name UND Mitglieder-Aktivität (last_online_real_time) aus –
    auch dann, wenn der volle Decoder an neuen 1.0-Feldern mit „EOF not reached"
    scheitert.

    group.decode_bytes() dekodiert die komplette Gilden-Struktur inkl.
    players[].player_info.last_online_real_time. Wirft es am Ende eine
    Exception (neue Felder angehängt), lesen wir die stabilen Felder bis
    einschließlich der players-Liste selbst nach. Jeder gelesene Zeitstempel
    wird später über to_unix() auf Plausibilität geprüft – verrutscht ein Feld,
    fällt der Wert einfach raus, statt den Bericht zu verfälschen.
    """
    try:
        from palworld_save_tools.rawdata import group as gmod
    except ImportError:
        return
    original = gmod.decode_bytes

    def player_info_reader(r):
        # Reihenfolge laut Fork (group.py): player_uid, dann player_info-Struct
        # mit last_online_real_time (i64) und player_name (fstring).
        uid = r.guid()
        last_online = r.i64()
        name = r.fstring()
        return {
            "player_uid": uid,
            "player_info": {
                "last_online_real_time": last_online,
                "player_name": name,
            },
        }

    def read_guild_fields(parent_reader, group_bytes, group_type):
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
            # ab hier optional – nur für die Aktivität, in try/except:
            try:
                r.guid()                # last_guild_name_modifier_player_uid
                r.byte_list(20)         # unknown_2
                data["players"] = r.tarray(player_info_reader)
            except Exception:
                pass
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
                return read_guild_fields(parent_reader, group_bytes, group_type)
            except Exception:
                return {"group_type": group_type}

    gmod.decode_bytes = patched


patch_missing_map_value_types()
patch_guild_activity()


def find_sav(pattern: str) -> str:
    matches = sorted(glob.glob(pattern))
    if not matches:
        sys.exit(f"Keine Level.sav unter '{pattern}' gefunden.")
    if len(matches) > 1:
        print(f"Hinweis: {len(matches)} Treffer, nehme {matches[0]}")
    return matches[0]


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
        ("nur Basislager (ohne Aktivität)", needed_properties(["BaseCampSaveData"])),
        ("minimal (nur Basislager-Kerndaten)", needed_properties(["BaseCampSaveData.Value.RawData"])),
    ]
    last_error = None
    for label, custom in attempts:
        print(f"Parse Spielstand ({label}) …")
        try:
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


def guild_activity(world, now: float) -> dict:
    """
    group_id → {name, last_online (unix|None), members [(name, unix)], player_count}
    """
    result = {}
    try:
        groups = world["GroupSaveDataMap"]["value"]
    except KeyError:
        return result
    for entry in groups:
        try:
            raw = entry["value"]["RawData"]["value"]
        except (KeyError, TypeError):
            continue
        if not isinstance(raw, dict):
            continue
        gid = str(entry["key"])
        name = raw.get("guild_name") or raw.get("group_name")
        members = []
        latest = None
        for p in raw.get("players", []) or []:
            try:
                info = p["player_info"]
                pname = str(info.get("player_name") or "?")
                unix = to_unix(int(info.get("last_online_real_time") or 0), now)
            except (KeyError, TypeError, ValueError):
                continue
            members.append((pname, unix))
            if unix is not None and (latest is None or unix > latest):
                latest = unix
        result[gid] = {
            "name": str(name) if name else None,
            "last_online": latest,
            "members": members,
            "player_count": len(members),
        }
    return result


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
            gid = str(raw.get("group_id_belong_to", ""))
            g = guilds.get(gid) or {}
            bases.append({
                "base_id": str(entry.get("key", "")),
                "group_id": gid,
                "guild": g.get("name") or "Unbekannte Gilde",
                "last_online": g.get("last_online"),
                "player_count": g.get("player_count", 0),
                "x": round(float(t["x"])),
                "y": round(float(t["y"])),
            })
        except (KeyError, TypeError, ValueError) as err:
            print(f"Überspringe ein Basislager (unerwartete Struktur: {err})")
            continue
    return bases


def days_since(unix, now: float):
    if unix is None:
        return None
    return max(0.0, (now - unix) / 86400.0)


def fmt_date(unix):
    if unix is None:
        return "unbekannt"
    return time.strftime("%Y-%m-%d", time.localtime(unix))


def report(bases: list, guilds: dict, threshold_days: int, top: int, now: float) -> None:
    # Nach Gilde gruppieren (die eigentliche Aufräum-Einheit).
    per_guild = {}
    for b in bases:
        gid = b["group_id"]
        grp = per_guild.setdefault(gid, {
            "name": b["guild"],
            "last_online": b["last_online"],
            "player_count": b["player_count"],
            "bases": [],
        })
        grp["bases"].append(b)

    total_bases = len(bases)
    total_guilds = len(per_guild)

    active_guilds = inactive_guilds = unknown_guilds = 0
    active_bases = inactive_bases = unknown_bases = 0
    inactive_over_30 = inactive_over_60 = 0

    inactive_list = []
    active_list = []
    unknown_list = []

    for gid, grp in per_guild.items():
        d = days_since(grp["last_online"], now)
        nbases = len(grp["bases"])
        row = {"gid": gid, "name": grp["name"], "days": d,
               "last_online": grp["last_online"], "nbases": nbases,
               "members": guilds.get(gid, {}).get("members", [])}
        if d is None:
            unknown_guilds += 1
            unknown_bases += nbases
            unknown_list.append(row)
        elif d > threshold_days:
            inactive_guilds += 1
            inactive_bases += nbases
            if d > 30:
                inactive_over_30 += nbases
            if d > 60:
                inactive_over_60 += nbases
            inactive_list.append(row)
        else:
            active_guilds += 1
            active_bases += nbases
            active_list.append(row)

    inactive_list.sort(key=lambda r: r["days"], reverse=True)
    active_list.sort(key=lambda r: r["days"], reverse=True)

    line = "=" * 62
    print()
    print(line)
    print("  PalHeim – Basen-Aktivitätsbericht")
    print(f"  Stand: {time.strftime('%Y-%m-%d %H:%M', time.localtime(now))}")
    print(f"  Schwellwert für „inaktiv\": > {threshold_days} Tage ohne Login")
    print(line)
    print(f"  Gesamt:   {total_bases:>3} Basen in {total_guilds} Gilden")
    print(f"  Aktiv:    {active_bases:>3} Basen ({active_guilds} Gilden)")
    print(f"  Inaktiv:  {inactive_bases:>3} Basen ({inactive_guilds} Gilden)")
    print(f"             ├─ > 30 Tage: {inactive_over_30} Basen")
    print(f"             └─ > 60 Tage: {inactive_over_60} Basen")
    if unknown_bases:
        print(f"  Ohne Zeitstempel: {unknown_bases} Basen ({unknown_guilds} Gilden)")
    print(line)

    if inactive_list:
        shown = inactive_list if top <= 0 else inactive_list[:top]
        print(f"\n  Inaktive Gilden – älteste zuerst"
              + (f" (Top {top} von {len(inactive_list)})" if top > 0 and len(inactive_list) > top else "")
              + ":\n")
        print(f"  {'Tage':>5} | {'Basen':>5} | {'zuletzt':<10} | Gilde / Spieler")
        print("  " + "-" * 58)
        for r in shown:
            names = ", ".join(n for n, _ in r["members"]) or "—"
            if len(names) > 26:
                names = names[:25] + "…"
            gname = (r["name"] or "Unbekannt")
            if len(gname) > 22:
                gname = gname[:21] + "…"
            print(f"  {int(round(r['days'])):>5} | {r['nbases']:>5} | "
                  f"{fmt_date(r['last_online']):<10} | {gname}  ({names})")
        reclaim = sum(r["nbases"] for r in inactive_list)
        print(f"\n  → {reclaim} Basen-Slots frei, wenn alle inaktiven Gilden "
              f"(> {threshold_days} Tage) entfernt werden.")

    if unknown_list:
        print(f"\n  Gilden ohne ermittelbaren Zeitstempel "
              f"({len(unknown_list)} Gilden, {unknown_bases} Basen):")
        for r in unknown_list:
            print(f"    - {r['name'] or 'Unbekannt'}  ({r['nbases']} Basen)")
        print("    (Für diese Gilden ließ sich last_online_real_time nicht "
              "sicher lesen – ggf. leere/aufgelöste Gilde.)")

    print()


def write_csv(path: str, bases: list, now: float) -> None:
    rows = sorted(
        bases,
        key=lambda b: (days_since(b["last_online"], now) is not None,
                       days_since(b["last_online"], now) or 0),
        reverse=True,
    )
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["Gilde", "Basis-ID", "Tage_inaktiv", "zuletzt_online",
                    "Mitglieder", "x", "y"])
        for b in rows:
            d = days_since(b["last_online"], now)
            w.writerow([
                b["guild"], b["base_id"],
                "" if d is None else int(round(d)),
                fmt_date(b["last_online"]),
                b["player_count"], b["x"], b["y"],
            ])
    print(f"CSV geschrieben: {path}")


def write_json(path: str, bases: list, now: float) -> None:
    out = []
    for b in bases:
        d = days_since(b["last_online"], now)
        out.append({
            "guild": b["guild"],
            "base_id": b["base_id"],
            "days_inactive": None if d is None else round(d, 1),
            "last_online": fmt_date(b["last_online"]),
            "last_online_unix": None if b["last_online"] is None else int(b["last_online"]),
            "player_count": b["player_count"],
            "x": b["x"], "y": b["y"],
        })
    with open(path, "w", encoding="utf-8") as f:
        json.dump({"generated": int(now), "bases": out}, f,
                  ensure_ascii=False, indent=2)
    print(f"JSON geschrieben: {path}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Zeigt aktive/inaktive Basen aus der Level.sav (Tage ohne Login).")
    parser.add_argument("--sav", required=True, help="Pfad/Glob zur Level.sav")
    parser.add_argument("--threshold", type=int, default=14,
                        help="Tage ohne Login, ab denen eine Basis als inaktiv gilt (Standard: 14)")
    parser.add_argument("--top", type=int, default=0,
                        help="nur die N inaktivsten Gilden auflisten (Standard: alle)")
    parser.add_argument("--csv", metavar="DATEI", help="zusätzlich CSV aller Basen schreiben")
    parser.add_argument("--json", metavar="DATEI", help="zusätzlich JSON aller Basen schreiben")
    args = parser.parse_args()

    now = time.time()
    world = load_world(find_sav(args.sav))
    guilds = guild_activity(world, now)
    bases = base_camps(world, guilds)

    if not bases:
        print("Keine Basen gefunden.")
        return

    report(bases, guilds, args.threshold, args.top, now)

    if args.csv:
        write_csv(args.csv, bases, now)
    if args.json:
        write_json(args.json, bases, now)


if __name__ == "__main__":
    main()
