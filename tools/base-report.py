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

  Weil Palworld 1.0 die Gilden-Struktur laufend um neue Felder erweitert
  (der volle Decoder scheitert dann mit „EOF not reached"), liest dieses
  Skript die Zeitstempel NICHT über feste Byte-Offsets, sondern erkennt die
  Spieler-Einträge an ihrer Signatur: ein plausibler .NET-Ticks-Wert, direkt
  gefolgt von einem gültigen Spielernamen-String. Das ist unabhängig davon,
  wo im Datensatz die Felder genau liegen.

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
  --top N         nur die N inaktivsten Gilden auflisten (Standard: alle).
  --csv datei     zusätzlich eine CSV mit allen Basen schreiben (für Excel).
  --json datei    zusätzlich Roh-Daten als JSON schreiben.
  --debug         Diagnose ausgeben (welcher Parse-Weg, wie viele Gilden mit
                  Aktivität, Beispiel-Zeitstempel) – bei Problemen bitte die
                  Ausgabe weitergeben.

Alternative ohne Skript (Server räumt selbst auf):
  In der PalWorldSettings.ini kann der Server inaktive Gilden automatisch
  entfernen:
      bAutoResetGuildNoOnlinePlayers=True
      AutoResetGuildTimeNoOnlinePlayers=168.0    # Stunden (=7 Tage)
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
    from palworld_save_tools.rawdata import group as _gmod
except ImportError:
    sys.exit("palworld-save-tools fehlt. Installieren (Debian 12+/Trixie):\n"
             "  apt install -y python3-venv git build-essential python3-dev\n"
             "  python3 -m venv /opt/paltools\n"
             "  /opt/paltools/bin/pip install git+https://github.com/MRHRTZ/pyooz.git\n"
             "  /opt/paltools/bin/pip install git+https://github.com/MRHRTZ/palworld-save-tools.git\n"
             "und das Skript mit  /opt/paltools/bin/python3  starten.\n"
             "(Der Fork kann das neue PlM/Oodle-Save-Format von Palworld 0.6+.)")


# --- Zeit ----------------------------------------------------------------
# .NET-Ticks: 100-ns-Intervalle seit 0001-01-01. Umrechnung auf Unix-Zeit.
DOTNET_EPOCH_OFFSET = 62135596800          # Sekunden zwischen 0001-01-01 und 1970-01-01
FILETIME_EPOCH_OFFSET = 11644473600        # Sekunden zwischen 1601-01-01 und 1970-01-01
# Plausibilitätsfenster für einen echten „zuletzt online"-Zeitstempel.
PLAUSIBLE_MIN = 1704067200                 # 2024-01-01 (Palworld-Release war 01/2024)
PLAUSIBLE_SLACK = 172800                   # 2 Tage Toleranz in die Zukunft (Zeitzonen)
_NOW = time.time()                         # einmal fixiert, für Scan-Plausibilität

GUILD = "EPalGroupType::Guild"
INDEPENDENT = "EPalGroupType::IndependentGuild"
ORGANIZATION = "EPalGroupType::Organization"
_ORG_LIKE = (GUILD, INDEPENDENT, ORGANIZATION)

DIAG = {"attempt": None, "has_groupmap": False, "guilds_total": 0,
        "with_activity": 0, "via_scan": 0, "raw_bytes_path": 0, "samples": []}


def to_unix(raw_value, now):
    """Rohen last_online_real_time-Wert (mehrere Deutungen) → Unix-Zeit oder None."""
    if not raw_value:
        return None
    upper = now + PLAUSIBLE_SLACK
    for unix in (
        raw_value / 1e7 - DOTNET_EPOCH_OFFSET,    # .NET DateTime.Ticks (erwartet)
        raw_value / 1e7 - FILETIME_EPOCH_OFFSET,  # Windows FILETIME
        raw_value / 1000.0,                       # Unix-Millisekunden
        float(raw_value),                         # Unix-Sekunden
    ):
        if PLAUSIBLE_MIN <= unix <= upper:
            return unix
    return None


# --- Byte-Scan: Spieler-Einträge an ihrer Signatur erkennen --------------
def _read_fstring_at(data, off):
    """
    Versucht, an Position off eine gültige UE-FString zu lesen (wie die
    Bibliothek: i32-Länge; >0 = ASCII inkl. Nullterminator, <0 = UTF-16-LE).
    Gibt den String zurück oder None, wenn es keine plausible Zeichenkette ist.
    """
    n = len(data)
    if off + 4 > n:
        return None
    size = int.from_bytes(data[off:off + 4], "little", signed=True)
    if size > 0:
        if not (2 <= size <= 64):            # inkl. Nullterminator → echte Namen
            return None
        end = off + 4 + size
        if end > n or data[end - 1] != 0:
            return None
        try:
            s = data[off + 4:end - 1].decode("utf-8")
        except Exception:
            return None
    elif size < 0:
        m = -size
        if not (2 <= m <= 64):
            return None
        end = off + 4 + m * 2
        if end > n or data[end - 2:end] != b"\x00\x00":
            return None
        try:
            s = data[off + 4:end - 2].decode("utf-16-le")
        except Exception:
            return None
    else:
        return None
    if not s or any(ord(c) < 0x20 for c in s):   # keine Steuerzeichen
        return None
    return s


def scan_player_infos(data):
    """
    Durchsucht die Gilden-Rohbytes nach Spieler-Einträgen. Ein player_info ist
    guid(16) + last_online_real_time(i64) + player_name(fstring). Wir erkennen
    ihn an: plausibler .NET-Ticks-i64, unmittelbar gefolgt von einem gültigen
    Namen-String. Rückgabe: Liste von (unix_zeit, name).
    """
    hits = []
    n = len(data)
    lo, hi = PLAUSIBLE_MIN, _NOW + PLAUSIBLE_SLACK
    i = 0
    limit = n - 8
    while i <= limit:
        ticks = int.from_bytes(data[i:i + 8], "little", signed=True)
        if ticks > 0:
            unix = ticks / 1e7 - DOTNET_EPOCH_OFFSET
            if lo <= unix <= hi:
                name = _read_fstring_at(data, i + 8)
                if name is not None:
                    hits.append((unix, name))
                    i += 8            # hinter diesen i64 springen
                    continue
        i += 1
    return hits


def _read_name_prefix(reader_bytes, group_type):
    """Liest den stabilen Anfang der Gilden-Struktur bis zum guild_name."""
    r = _pst_archive.FArchiveReader(bytes(reader_bytes))
    r.guid()                              # group_id
    r.fstring()                           # group_name (interner Name)
    r.tarray(_gmod.instance_id_reader)    # individual_character_handle_ids
    if group_type in _ORG_LIKE:
        r.byte()                          # org_type
    if group_type == ORGANIZATION:
        r.byte_list(12)
        return None
    if group_type == GUILD:
        r.byte_list(4)                    # leading_bytes
        r.tarray(_gmod.uuid_reader)       # base_ids
        r.i32()                           # unknown_1
        r.i32()                           # base_camp_level
        r.tarray(_gmod.uuid_reader)       # map_object_instance_ids_base_camp_points
        return r.fstring()                # guild_name
    if group_type == INDEPENDENT:
        r.i32()                           # base_camp_level
        r.tarray(_gmod.uuid_reader)       # map_object_instance_ids_base_camp_points
        return r.fstring()                # guild_name
    return None


def patch_missing_map_value_types():
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


def patch_guild_activity():
    """
    Robuste Gilden-Dekodierung: volle Struktur versuchen, sonst nur den Namen
    lesen. Zusätzlich immer die Spieler-Zeitstempel per Signatur-Scan aus den
    Rohbytes ziehen, falls der reguläre players-Block nicht (sauber) vorliegt.
    """
    original = _gmod.decode_bytes

    def patched(parent_reader, group_bytes, group_type):
        data_bytes = bytes(group_bytes)
        try:
            result = original(parent_reader, group_bytes, group_type)
        except Exception:
            try:
                r = parent_reader.internal_copy(data_bytes, debug=False)
                result = {"group_type": group_type, "group_id": r.guid()}
                try:
                    result["guild_name"] = _read_name_prefix(data_bytes, group_type)
                except Exception:
                    pass
            except Exception:
                result = {"group_type": group_type}
        has_players = bool(result.get("players")) or isinstance(result.get("player_info"), dict)
        if not has_players:
            result["_scanned_players"] = scan_player_infos(data_bytes)
        return result

    _gmod.decode_bytes = patched


patch_missing_map_value_types()
patch_guild_activity()


def find_sav(pattern):
    matches = sorted(glob.glob(pattern))
    if not matches:
        sys.exit(f"Keine Level.sav unter '{pattern}' gefunden.")
    if len(matches) > 1:
        print(f"Hinweis: {len(matches)} Treffer, nehme {matches[0]}")
    return matches[0]


def needed_properties(keys):
    return {
        key: PALWORLD_CUSTOM_PROPERTIES[key]
        for key in PALWORLD_CUSTOM_PROPERTIES
        if any(marker in key for marker in keys)
    }


def load_world(sav_path):
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
            DIAG["attempt"] = label
            return gvas.properties["worldSaveData"]["value"]
        except Exception as err:  # noqa: BLE001 – bewusst breit für Retry
            print(f"  fehlgeschlagen: {err}")
            last_error = err
    sys.exit(f"Spielstand konnte nicht geparst werden: {last_error}\n"
             "Bitte diese Meldung weitergeben – vermutlich hat sich das "
             "Save-Format erneut geändert.")


def _group_type_of(entry):
    try:
        return entry["value"]["GroupType"]["value"]["value"]
    except (KeyError, TypeError):
        return None


def guild_activity(world, now):
    """group_id → {name, last_online (unix|None), members, player_count}"""
    result = {}
    gm = world.get("GroupSaveDataMap")
    if not gm:
        return result
    DIAG["has_groupmap"] = True
    try:
        groups = gm["value"]
    except (KeyError, TypeError):
        return result

    for entry in groups:
        try:
            raw = entry["value"]["RawData"]["value"]
        except (KeyError, TypeError):
            continue
        gid = str(entry.get("key", ""))
        DIAG["guilds_total"] += 1

        name, latest, members, via_scan = None, None, [], False

        # Fall A: RawData wurde (ggf. teilweise) dekodiert → dict mit Feldern.
        decoded = isinstance(raw, dict) and (
            "guild_name" in raw or "group_name" in raw
            or "players" in raw or "player_info" in raw
            or "_scanned_players" in raw)
        if decoded:
            name = raw.get("guild_name") or raw.get("group_name")
            for p in raw.get("players", []) or []:
                try:
                    info = p["player_info"]
                    u = to_unix(int(info.get("last_online_real_time") or 0), now)
                    pn = str(info.get("player_name") or "?")
                except (KeyError, TypeError, ValueError):
                    continue
                members.append((pn, u))
                if u is not None and (latest is None or u > latest):
                    latest = u
            info = raw.get("player_info")   # IndependentGuild: einzelner Spieler
            if isinstance(info, dict):
                try:
                    u = to_unix(int(info.get("last_online_real_time") or 0), now)
                    members.append((str(info.get("player_name") or "?"), u))
                    if u is not None and (latest is None or u > latest):
                        latest = u
                except (KeyError, TypeError, ValueError):
                    pass
            if latest is None:
                for (u, pn) in raw.get("_scanned_players", []) or []:
                    members.append((pn, u))
                    via_scan = True
                    if latest is None or u > latest:
                        latest = u

        # Fall B: RawData blieb roh ({"values": [...]}) – Decoder lief nicht.
        elif isinstance(raw, dict) and "values" in raw:
            DIAG["raw_bytes_path"] += 1
            data_bytes = bytes(raw["values"])
            gtype = _group_type_of(entry)
            try:
                name = _read_name_prefix(data_bytes, gtype)
            except Exception:
                name = None
            for (u, pn) in scan_player_infos(data_bytes):
                members.append((pn, u))
                via_scan = True
                if latest is None or u > latest:
                    latest = u

        if latest is not None:
            DIAG["with_activity"] += 1
            if via_scan:
                DIAG["via_scan"] += 1
            if len(DIAG["samples"]) < 5:
                DIAG["samples"].append(
                    (name or gid[:8], time.strftime("%Y-%m-%d", time.localtime(latest)),
                     "scan" if via_scan else "decode"))

        result[gid] = {
            "name": str(name) if name else None,
            "last_online": latest,
            "members": members,
            "player_count": len(members),
        }
    return result


def base_camps(world, guilds):
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


def days_since(unix, now):
    if unix is None:
        return None
    return max(0.0, (now - unix) / 86400.0)


def fmt_date(unix):
    return "unbekannt" if unix is None else time.strftime("%Y-%m-%d", time.localtime(unix))


def report(bases, guilds, threshold_days, top, now):
    per_guild = {}
    for b in bases:
        grp = per_guild.setdefault(b["group_id"], {
            "name": b["guild"], "last_online": b["last_online"],
            "player_count": b["player_count"], "bases": []})
        grp["bases"].append(b)

    total_bases, total_guilds = len(bases), len(per_guild)
    active_guilds = inactive_guilds = unknown_guilds = 0
    active_bases = inactive_bases = unknown_bases = 0
    inactive_over_30 = inactive_over_60 = 0
    inactive_list, unknown_list = [], []

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
            inactive_over_30 += nbases if d > 30 else 0
            inactive_over_60 += nbases if d > 60 else 0
            inactive_list.append(row)
        else:
            active_guilds += 1
            active_bases += nbases

    inactive_list.sort(key=lambda r: r["days"], reverse=True)

    line = "=" * 62
    print("\n" + line)
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
        extra = f" (Top {top} von {len(inactive_list)})" if 0 < top < len(inactive_list) else ""
        print(f"\n  Inaktive Gilden – älteste zuerst{extra}:\n")
        print(f"  {'Tage':>5} | {'Basen':>5} | {'zuletzt':<10} | Gilde  (Spieler)")
        print("  " + "-" * 58)
        for r in shown:
            names = ", ".join(n for n, _ in r["members"]) or "—"
            names = names[:25] + "…" if len(names) > 26 else names
            gname = r["name"] or "Unbekannt"
            gname = gname[:21] + "…" if len(gname) > 22 else gname
            print(f"  {int(round(r['days'])):>5} | {r['nbases']:>5} | "
                  f"{fmt_date(r['last_online']):<10} | {gname}  ({names})")
        reclaim = sum(r["nbases"] for r in inactive_list)
        print(f"\n  → {reclaim} Basen-Slots frei, wenn alle inaktiven Gilden "
              f"(> {threshold_days} Tage) entfernt werden.")

    if unknown_list:
        print(f"\n  Gilden ohne ermittelbaren Zeitstempel "
              f"({len(unknown_list)} Gilden, {unknown_bases} Basen):")
        for r in unknown_list[:40]:
            print(f"    - {r['name'] or 'Unbekannt'}  ({r['nbases']} Basen)")
        if len(unknown_list) > 40:
            print(f"    … und {len(unknown_list) - 40} weitere")
    print()


def print_diag():
    print("  [Diagnose]")
    print(f"    Parse-Weg:          {DIAG['attempt']}")
    print(f"    GroupSaveDataMap:   {'vorhanden' if DIAG['has_groupmap'] else 'FEHLT'}")
    print(f"    Gilden gesamt:      {DIAG['guilds_total']}")
    print(f"    davon roh (Scan):   {DIAG['raw_bytes_path']}")
    print(f"    mit Aktivität:      {DIAG['with_activity']}  (per Scan: {DIAG['via_scan']})")
    for name, date, how in DIAG["samples"]:
        print(f"      Beispiel: {name:<20} zuletzt {date}  [{how}]")
    print()


def write_csv(path, bases, now):
    rows = sorted(bases, key=lambda b: (b["last_online"] is not None,
                                        days_since(b["last_online"], now) or 0), reverse=True)
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["Gilde", "Basis-ID", "Tage_inaktiv", "zuletzt_online",
                    "Mitglieder", "x", "y"])
        for b in rows:
            d = days_since(b["last_online"], now)
            w.writerow([b["guild"], b["base_id"], "" if d is None else int(round(d)),
                        fmt_date(b["last_online"]), b["player_count"], b["x"], b["y"]])
    print(f"CSV geschrieben: {path}")


def write_json(path, bases, now):
    out = []
    for b in bases:
        d = days_since(b["last_online"], now)
        out.append({"guild": b["guild"], "base_id": b["base_id"],
                    "days_inactive": None if d is None else round(d, 1),
                    "last_online": fmt_date(b["last_online"]),
                    "last_online_unix": None if b["last_online"] is None else int(b["last_online"]),
                    "player_count": b["player_count"], "x": b["x"], "y": b["y"]})
    with open(path, "w", encoding="utf-8") as f:
        json.dump({"generated": int(now), "bases": out}, f, ensure_ascii=False, indent=2)
    print(f"JSON geschrieben: {path}")


def main():
    parser = argparse.ArgumentParser(
        description="Zeigt aktive/inaktive Basen aus der Level.sav (Tage ohne Login).")
    parser.add_argument("--sav", required=True, help="Pfad/Glob zur Level.sav")
    parser.add_argument("--threshold", type=int, default=14,
                        help="Tage ohne Login, ab denen eine Basis als inaktiv gilt (Standard: 14)")
    parser.add_argument("--top", type=int, default=0,
                        help="nur die N inaktivsten Gilden auflisten (Standard: alle)")
    parser.add_argument("--csv", metavar="DATEI", help="zusätzlich CSV aller Basen schreiben")
    parser.add_argument("--json", metavar="DATEI", help="zusätzlich JSON aller Basen schreiben")
    parser.add_argument("--debug", action="store_true", help="Diagnose ausgeben")
    args = parser.parse_args()

    now = time.time()
    world = load_world(find_sav(args.sav))
    guilds = guild_activity(world, now)
    bases = base_camps(world, guilds)

    if not bases:
        print("Keine Basen gefunden.")
        return

    report(bases, guilds, args.threshold, args.top, now)
    if args.debug:
        print_diag()
    elif DIAG["with_activity"] == 0:
        print("  Hinweis: Für keine Gilde ließ sich ein Zeitstempel ermitteln.")
        print("  Bitte einmal mit  --debug  starten und die Ausgabe weitergeben.\n")

    if args.csv:
        write_csv(args.csv, bases, now)
    if args.json:
        write_json(args.json, bases, now)


if __name__ == "__main__":
    main()
