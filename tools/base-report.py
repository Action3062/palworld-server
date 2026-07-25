#!/usr/bin/env python3
"""
Basen-Aktivitätsbericht für PalHeim (v3)
----------------------------------------
Läuft auf dem PALWORLD-Server. Liest die Level.sav und erstellt eine Liste,
welche Basen aktiv sind und welche schon länger nicht mehr bespielt wurden –
inklusive Anzahl der inaktiven Basen und wie viele Tage sie jeweils schon
brachliegen. Hilft, wenn das Basen-Limit (z. B. 128) erreicht ist und man
sehen will, welche Gilden man aufräumen kann.

Hintergrund
  Eine Basis (BaseCampSaveData) hat selbst KEINEN Zeitstempel. Sie gehört
  aber über  group_id_belong_to  zu einer Gilde (GroupSaveDataMap). Jede
  Gilde speichert pro Mitglied  last_online_real_time  (.NET-Ticks, gleicher
  Tick-Raum wie GameTimeSaveData.RealDateTimeTicks). Der jüngste Wert ist
  die „letzte Aktivität" der Gilde – und damit aller ihrer Basen.

  Palworld 1.0 (v1.0.0.100427, 10.07.2026) hat die Gilden-Struktur erneut
  umgebaut (Gilden-Marker, Truhen-Rollen, Rollen-Rechte, Rollen-Byte pro
  Spieler). Dieses Skript bringt daher einen EIGENEN Decoder mit, der beide
  Layouts kann (1.0 „v2" und 0.6 „v1") und sie – wie die Referenz-Tools –
  daran unterscheidet, welches Layout die Rohbytes EXAKT bis zum Ende
  aufbraucht. Schlägt alles fehl, greift ein Signatur-Scan als Notnagel.
  Als Zeitreferenz dient RealDateTimeTicks aus dem Save selbst (immun gegen
  eine falsch gehende Systemuhr); ersatzweise die Systemzeit.

Aufs Spiel-Server holen bzw. AKTUALISIEREN (Repo ist öffentlich; -f sorgt
dafür, dass bei einem 404 keine kaputte Datei geschrieben wird):
  curl -fsSLo /root/base-report.py \
    https://raw.githubusercontent.com/Action3062/palworld-server/refs/heads/claude/palworld-server-website-j2gox0/tools/base-report.py

Einrichtung – identisch zum Basen-Uploader (gleiche venv nutzen):
  apt update && apt install -y python3-venv git build-essential python3-dev
  python3 -m venv /opt/paltools
  /opt/paltools/bin/pip install "git+https://github.com/MRHRTZ/pyooz.git"
  /opt/paltools/bin/pip install "git+https://github.com/MRHRTZ/palworld-save-tools.git"

Aufruf (auf dem Palworld-Server; das Glob-Muster bitte QUOTEN, damit die
Shell es nicht selbst expandiert – ~ wird vom Skript aufgelöst):
  /opt/paltools/bin/python3 /root/base-report.py \
      --sav '~/palworld/Saved/SaveGames/0/*/Level.sav' \
      --threshold 14

  --threshold N   Basen, deren Gilde seit > N Tagen nicht online war, gelten
                  als „inaktiv" (Standard: 14).
  --top N         nur die N inaktivsten Gilden auflisten (Standard: alle).
  --csv datei     zusätzlich eine CSV mit allen Basen schreiben (für Excel).
  --json datei    zusätzlich Roh-Daten als JSON schreiben.
  --debug         Diagnose immer ausgeben (bei 0 Treffern kommt sie
                  automatisch) – bei Problemen bitte die Ausgabe weitergeben.

Alternative ohne Skript (Server räumt selbst auf):
  In der PalWorldSettings.ini kann der Server inaktive Gilden automatisch
  entfernen:
      bAutoResetGuildNoOnlinePlayers=True
      AutoResetGuildTimeNoOnlinePlayers=168.0    # Stunden (=7 Tage)
  Dieses Skript ist die „read only"-Variante: es zeigt nur an, löscht nichts.
"""

import argparse
import contextlib
import csv
import glob
import io
import json
import os
import sys
import time

VERSION = "3.0"

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
# .NET-Ticks: 100-ns-Intervalle seit 0001-01-01.
DOTNET_EPOCH_OFFSET = 62135596800   # Sekunden zwischen 0001-01-01 und 1970-01-01
TICKS_PER_DAY = 864000000000        # 24h * 3600s * 1e7
PLAUSIBLE_MIN = 1672531200          # 2023-01-01 – vor Palworld-Release
PLAUSIBLE_SLACK = 30 * 86400        # 30 Tage Toleranz in die Zukunft
_NOW = time.time()

GUILD = "EPalGroupType::Guild"
INDEPENDENT = "EPalGroupType::IndependentGuild"
ORGANIZATION = "EPalGroupType::Organization"

DIAG = {
    "attempt": None, "ref_ticks": None, "ref_mode": None, "has_groupmap": False,
    "groups_total": 0, "with_activity": 0,
    "unknown_bases": 0, "total_bases": 0,
    "paths": {},                 # Decode-Weg → Anzahl (v2-1.0, v1-0.6, bibliothek, indep, scan, none)
    "errors": [],                # erste Decode-Fehler (Weg → Meldung)
    "samples": [],               # (gilde, spieler, ticks_hex, tage)
    "implausibel": [],           # dekodiert, aber Zeitstempel unplausibel (Roh-Evidenz)
    "probes": [],                # Struktur-Proben, wenn nichts Brauchbares gefunden wurde
}


def diag_reset_parse_state():
    """Vor jedem Parse-Versuch aufrufen – sonst zählt ein verworfener Versuch doppelt."""
    DIAG["paths"].clear()
    DIAG["errors"].clear()
    DIAG["samples"].clear()
    DIAG["implausibel"].clear()
    DIAG["probes"].clear()


def ticks_to_unix(ticks, now=None):
    """Ticks → Unix-Zeit, nur wenn im Plausibilitätsfenster; sonst None."""
    if not ticks or ticks <= 0:
        return None
    unix = ticks / 1e7 - DOTNET_EPOCH_OFFSET
    upper = (now or _NOW) + PLAUSIBLE_SLACK
    return unix if PLAUSIBLE_MIN <= unix <= upper else None


def member_days(ticks, unix, ref_ticks, now):
    """
    Tage seit letztem Login eines Mitglieds. Bevorzugt die Tick-Differenz zur
    Save-internen Referenz (RealDateTimeTicks) – das ist unempfindlich gegen
    Uhr-Drift. Unplausible Werte (Migrations-Artefakte, Garbage) → None.
    """
    if ticks and ticks > 0:
        if ref_ticks:
            d = (ref_ticks - ticks) / TICKS_PER_DAY
            if -30 <= d <= 2000:
                return max(0.0, d)
            return None
        u = ticks_to_unix(ticks, now)
        return max(0.0, (now - u) / 86400.0) if u is not None else None
    if unix is not None:
        return max(0.0, (now - unix) / 86400.0)
    return None


# --- Eigener Gilden-Decoder (Palworld 1.0 "v2" und 0.6 "v1") -------------
# Layout kreuzvalidiert gegen deafdudecomputers/PalworldSaveTools (Stand
# 2026-07-20), oMaN-Rod/palworld-save-tools, TBro1998/PalWorld-Server-Manager
# u. a. Es gibt kein Versionsflag im Blob – das Layout, das die Bytes exakt
# bis zum Ende aufbraucht, ist das richtige (Exakt-EOF-Diskriminator).

def _take(r, n, what):
    b = r.data.read(n)
    if len(b) != n:
        raise ValueError(f"{what}: Blob zu kurz")
    return b


def _skip_guid(r, what="guid"):
    # statt r.guid(): mit Längenprüfung, damit ein zu kurzer Blob nie still
    # durchrutscht (r.guid() liest ungeprüft und könnte EOF vortäuschen)
    _take(r, 16, what)


def _skip_tarray_fixed(r, elem_size, cap, what):
    n = r.u32()
    if n > cap:
        raise ValueError(f"{what}-Anzahl implausibel: {n}")
    _take(r, elem_size * n, what)


def _require_eof(r, data_bytes):
    if not r.eof():
        pos = r.data.tell()
        raise ValueError(f"Layout passt nicht: {pos} von {len(data_bytes)} Bytes "
                         f"gelesen, {len(data_bytes) - pos} übrig")


def _read_players(r, with_role, cap=2000):
    n = r.u32()
    if n > cap:
        raise ValueError(f"players-Anzahl implausibel: {n}")
    players = []
    for _ in range(n):
        _skip_guid(r, "player_uid")           # player_uid
        ticks = r.i64()                       # last_online_real_time
        name = r.fstring()                    # player_name
        if with_role:
            r.byte()                          # EPalGuildRole (1.0)
        players.append({"ticks": ticks, "name": str(name) or "?"})
    return players


def _guild_own(data_bytes, layout):
    """layout: 'v2-1.0' (mit Rollen) oder 'v1-0.6'. Muss exakt auf EOF landen."""
    r = _pst_archive.FArchiveReader(data_bytes)
    _skip_guid(r, "group_id")                 # group_id
    r.fstring()                               # group_name (interner Name)
    _skip_tarray_fixed(r, 32, 100000, "handle_ids")  # {guid, instance_id}
    r.byte()                                  # org_type
    r.byte_list(4)                            # leading_bytes
    _skip_tarray_fixed(r, 16, 2000, "base_ids")
    r.i32()                                   # unknown_1
    r.i32()                                   # base_camp_level
    _skip_tarray_fixed(r, 16, 2000, "base_camp_points")
    guild_name = r.fstring()
    _skip_guid(r, "last_guild_name_modifier") # last_guild_name_modifier_player_uid
    _skip_tarray_fixed(r, 60, 10000, "guild_markers")  # FPalGuildMarkerData
    if layout == "v2-1.0":
        _skip_tarray_fixed(r, 1, 64, "chest_allowed_roles")
        r.i32()                               # unknown_i32
        _skip_guid(r, "admin_player_uid")     # admin_player_uid
        players = _read_players(r, with_role=True)
        n = r.u32()                           # role_permissions
        if n > 64:
            raise ValueError("role_permissions implausibel")
        for _ in range(n):
            r.byte()
            _skip_tarray_fixed(r, 1, 256, "permissions")
        r.byte_list(4)                        # trailing_bytes
    else:                                     # v1-0.6
        _skip_guid(r, "admin_player_uid")     # admin_player_uid
        players = _read_players(r, with_role=False)
        r.byte_list(4)                        # trailing_bytes
    _require_eof(r, data_bytes)
    return {"guild_name": str(guild_name) if guild_name else None,
            "_members": players}


def _independent_own(data_bytes, with_role):
    r = _pst_archive.FArchiveReader(data_bytes)
    _skip_guid(r, "group_id")
    r.fstring()
    _skip_tarray_fixed(r, 32, 100000, "handle_ids")
    r.byte()                                  # org_type
    r.i32()                                   # base_camp_level
    _skip_tarray_fixed(r, 16, 2000, "base_camp_points")
    guild_name = r.fstring()
    _skip_guid(r, "player_uid")               # player_uid
    r.fstring()                               # guild_name_2
    ticks = r.i64()
    name = r.fstring()
    if with_role:
        r.byte()
    _require_eof(r, data_bytes)
    return {"guild_name": str(guild_name) if guild_name else None,
            "_members": [{"ticks": ticks, "name": str(name) or "?"}]}


def _prefix_guild_name(data_bytes, group_type):
    """Nur die stabilen Felder bis zum Gildennamen lesen (Notnagel)."""
    r = _pst_archive.FArchiveReader(data_bytes)
    _skip_guid(r, "group_id")
    group_name = r.fstring()
    _skip_tarray_fixed(r, 32, 100000, "handle_ids")
    if group_type in (GUILD, INDEPENDENT, ORGANIZATION):
        r.byte()
    if group_type == GUILD:
        r.byte_list(4)
        _skip_tarray_fixed(r, 16, 2000, "base_ids")
        r.i32()
        r.i32()
        _skip_tarray_fixed(r, 16, 2000, "base_camp_points")
        return str(r.fstring()) or None
    if group_type == INDEPENDENT:
        r.i32()
        _skip_tarray_fixed(r, 16, 2000, "base_camp_points")
        return str(r.fstring()) or None
    return str(group_name) if group_name else None


# --- Signatur-Scan (letzter Notnagel) ------------------------------------
def _read_fstring_at(data, off):
    n = len(data)
    if off + 4 > n:
        return None
    size = int.from_bytes(data[off:off + 4], "little", signed=True)
    if size > 0:
        if not (2 <= size <= 64):
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
    if not s or any(ord(c) < 0x20 for c in s):
        return None
    return s


def scan_player_infos(data, ref_ticks=None):
    """Sucht [plausible .NET-Ticks-i64][gültiger Name-FString] in Rohbytes."""
    hits = []
    if ref_ticks:
        # Save-interne Referenz → unabhängig von der Systemuhr
        lo = ref_ticks - 2000 * TICKS_PER_DAY
        hi = ref_ticks + 30 * TICKS_PER_DAY
    else:
        lo = (PLAUSIBLE_MIN + DOTNET_EPOCH_OFFSET) * 1e7
        hi = (_NOW + PLAUSIBLE_SLACK + DOTNET_EPOCH_OFFSET) * 1e7
    i, limit = 0, len(data) - 8
    while i <= limit:
        ticks = int.from_bytes(data[i:i + 8], "little", signed=True)
        if lo <= ticks <= hi:
            name = _read_fstring_at(data, i + 8)
            if name is not None:
                hits.append({"ticks": ticks, "name": name})
                i += 8
                continue
        i += 1
    return hits


def _structure_probe(data_bytes, guild_label):
    """
    Wenn gar nichts gefunden wird: die ersten Namen-Strings im Blob samt der
    8 Bytes davor (in Hex + Datums-Deutungen) ausgeben. Damit lässt sich das
    tatsächliche Layout aus der Ferne bestimmen.
    """
    probe = {"guild": guild_label, "size": len(data_bytes), "strings": []}
    for off in range(0, len(data_bytes) - 4):
        if len(probe["strings"]) >= 4:
            break
        s = _read_fstring_at(data_bytes, off)
        if s is None or len(s) < 3:
            continue
        entry = {"off": off, "text": s}
        size = int.from_bytes(data_bytes[off:off + 4], "little", signed=True)
        end = off + 4 + (size if size > 0 else -size * 2)
        # Hex-Fenster um den String – layout-agnostische Roh-Evidenz, falls der
        # Zeitstempel z. B. HINTER dem Namen oder als double kodiert liegt
        entry["hex_davor"] = data_bytes[max(0, off - 16):off].hex()
        entry["hex_danach"] = data_bytes[end:end + 16].hex()
        if off >= 8:
            raw = int.from_bytes(data_bytes[off - 8:off], "little", signed=True)
            entry["i64_davor_hex"] = f"0x{raw & 0xFFFFFFFFFFFFFFFF:016X}"
            interp = []
            for label, unix in (
                (".NET-Ticks", raw / 1e7 - DOTNET_EPOCH_OFFSET),
                ("FILETIME", raw / 1e7 - 11644473600),
                ("Unix-ms", raw / 1000.0),
                ("Unix-s", float(raw)),
            ):
                if PLAUSIBLE_MIN <= unix <= _NOW + PLAUSIBLE_SLACK:
                    interp.append(f"{label}→{time.strftime('%Y-%m-%d', time.localtime(unix))}")
            entry["deutungen"] = ", ".join(interp) if interp else "keine plausibel"
        probe["strings"].append(entry)
    return probe


# --- Decode-Kette --------------------------------------------------------
_ORIGINAL_DECODE = _gmod.decode_bytes


def _note_error(path, err):
    if len(DIAG["errors"]) < 6:
        DIAG["errors"].append(f"{path}: {type(err).__name__}: {err}")


def _tally(path):
    DIAG["paths"][path] = DIAG["paths"].get(path, 0) + 1


def decode_group_full(data_bytes, group_type, parent_reader=None, ref_ticks=None):
    """
    Robuste Decode-Kette pro Gruppe. Liefert normiert:
      {group_type, guild_name, _members: [{ticks|unix, name}], _path, _bytes}
    _bytes bleibt erhalten, damit die Diagnose später Struktur-Proben aus den
    Rohbytes ziehen kann – auch wenn ein Decoder „erfolgreich" war, die
    Zeitstempel aber unplausibel sind.
    """
    data_bytes = bytes(data_bytes)
    result = {"group_type": group_type, "guild_name": None,
              "_members": [], "_path": "none", "_bytes": data_bytes}

    attempts = []
    if group_type == GUILD:
        attempts = [("v2-1.0", lambda: _guild_own(data_bytes, "v2-1.0")),
                    ("v1-0.6", lambda: _guild_own(data_bytes, "v1-0.6"))]
    elif group_type == INDEPENDENT:
        attempts = [("indep", lambda: _independent_own(data_bytes, False)),
                    ("indep-rolle", lambda: _independent_own(data_bytes, True))]

    # Die Bibliothek druckt bei Fehl-Deutungen Warnungen direkt auf stdout
    # ("Error decoding utf-16-le string …") – bei Layout-Proben normal und
    # erwartbar, daher hier stumm schalten. Echte Fehler kommen als Exception.
    _quiet = contextlib.redirect_stdout(io.StringIO())

    # Fehler der Layout-Proben nur festhalten, wenn am Ende KEIN eigener
    # Decoder gegriffen hat – sonst zeigt --debug bei einem funktionierenden
    # v1-Save irreführende "v2-1.0: …"-Fehlerzeilen.
    pending_errors = []
    for path, fn in attempts:
        try:
            with _quiet:
                own = fn()
            result.update(own)
            result["_path"] = path
            _tally(path)
            return result
        except Exception as err:  # noqa: BLE001 – Layout-Probe darf scheitern
            pending_errors.append((path, err))
    for path, err in pending_errors:
        _note_error(path, err)

    # Bibliotheks-Decoder (deckt ältere Formate + Sonderfälle ab)
    try:
        parent = parent_reader or _pst_archive.FArchiveReader(data_bytes)
        with _quiet:
            res = _ORIGINAL_DECODE(parent, data_bytes, group_type)
        members = []
        for p in res.get("players", []) or []:
            info = p.get("player_info") or {}
            members.append({"ticks": int(info.get("last_online_real_time") or 0),
                            "name": str(info.get("player_name") or "?")})
        info = res.get("player_info")
        if isinstance(info, dict):
            members.append({"ticks": int(info.get("last_online_real_time") or 0),
                            "name": str(info.get("player_name") or "?")})
        result["guild_name"] = res.get("guild_name") or res.get("group_name")
        if result["guild_name"] is not None:
            result["guild_name"] = str(result["guild_name"])
        result["_members"] = members
        result["_path"] = "bibliothek"
        _tally("bibliothek")
        return result
    except Exception as err:  # noqa: BLE001
        _note_error("bibliothek", err)

    # Notnagel: Name über den stabilen Präfix + Signatur-Scan
    try:
        result["guild_name"] = _prefix_guild_name(data_bytes, group_type)
    except Exception:
        pass
    if group_type in (GUILD, INDEPENDENT):
        hits = scan_player_infos(data_bytes, ref_ticks)
        result["_members"] = hits
        result["_path"] = "scan" if hits else "none"
        _tally(result["_path"])
        if not hits and len(DIAG["probes"]) < 3:
            DIAG["probes"].append(_structure_probe(
                data_bytes, result["guild_name"] or group_type))
    else:
        result["_path"] = "sonstige"
        _tally("sonstige")
    return result


def patch_decode_bytes():
    def patched(parent_reader, group_bytes, group_type):
        return decode_group_full(group_bytes, group_type, parent_reader)
    _gmod.decode_bytes = patched


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


patch_missing_map_value_types()
patch_decode_bytes()


# --- Spielstand laden ----------------------------------------------------
def find_sav(pattern):
    matches = glob.glob(os.path.expanduser(pattern))
    if not matches:
        sys.exit(f"Keine Level.sav unter '{pattern}' gefunden.")
    # Bei mehreren Welt-Ordnern den ZULETZT GESPEICHERTEN nehmen – der
    # alphabetisch erste wäre oft ein alter, verwaister Spielstand.
    matches.sort(key=os.path.getmtime, reverse=True)
    if len(matches) > 1:
        print(f"Hinweis: {len(matches)} Spielstände gefunden, "
              f"nehme den zuletzt gespeicherten: {matches[0]}")
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
        ("nur Basislager (Gilden generisch)", needed_properties(["BaseCampSaveData"])),
        ("minimal (nur Basislager-Kerndaten)", needed_properties(["BaseCampSaveData.Value.RawData"])),
    ]
    last_error = None
    for label, custom in attempts:
        print(f"Parse Spielstand ({label}) …")
        diag_reset_parse_state()   # sonst zählt ein verworfener Versuch doppelt
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


def real_now_ticks(world, now):
    """
    RealDateTimeTicks aus dem Save – die verlässlichste 'Jetzt'-Referenz.

    Wichtig: Der Tick-Raum ist je nach Server/Version ABSOLUT (.NET-Ticks seit
    dem Jahr 1 = Kalenderzeit) oder RELATIV (verstrichene Welt-Laufzeit; so
    z. B. nach dem 1.0-Update). Für die Tage-Rechnung ist das egal – gezählt
    wird die DIFFERENZ zwischen Referenz und letztem Login im selben Raum.
    Deshalb wird der Wert hier roh akzeptiert und nur der Modus erkannt.
    """
    try:
        t = int(world["GameTimeSaveData"]["value"]["RealDateTimeTicks"]["value"])
    except (KeyError, TypeError, ValueError):
        return None
    if t <= 0:
        return None
    DIAG["ref_mode"] = ("absolut (Kalenderzeit)" if ticks_to_unix(t, now) is not None
                        else "relativ (Welt-Laufzeit)")
    return t


def fallback_ref_from_members(world):
    """
    Kein RealDateTimeTicks im Save? Dann dient der jüngste Login-Tick über
    alle Gilden als Referenz („vor X Tagen relativ zum letzten Login").
    """
    best = 0
    try:
        groups = world["GroupSaveDataMap"]["value"]
    except (KeyError, TypeError):
        return None
    for entry in groups:
        try:
            raw = entry["value"]["RawData"]["value"]
        except (KeyError, TypeError):
            continue
        if isinstance(raw, dict):
            for m in raw.get("_members", []) or []:
                t = m.get("ticks") or 0
                if t > best:
                    best = t
    if best > 0:
        DIAG["ref_mode"] = "relativ (jüngster Login als Referenz)"
        return best
    return None


def _group_type_of(entry):
    try:
        gt = entry["value"]["GroupType"]["value"]
        if isinstance(gt, dict):
            gt = gt.get("value")
        return str(gt) if gt else None
    except (KeyError, TypeError):
        return None


def guild_activity(world, ref_ticks, now):
    """group_id → {name, days, members: [(name, days)], path}"""
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
        DIAG["groups_total"] += 1

        if isinstance(raw, dict) and "_members" in raw:
            decoded = raw                        # Decoder lief beim Parsen (Versuch 1)
        elif isinstance(raw, dict) and "values" in raw:
            gtype = _group_type_of(entry) or GUILD   # generisch geparst (Versuch 2/3)
            decoded = decode_group_full(raw["values"], gtype, ref_ticks=ref_ticks)
            # zurückschreiben: cacht das Ergebnis für Folge-Durchläufe
            # (z. B. Neuberechnung mit Fallback-Referenz)
            entry["value"]["RawData"]["value"] = decoded
        else:
            _tally("unbekannte-form")
            continue

        members, best = [], None
        for m in decoded.get("_members", []) or []:
            d = member_days(m.get("ticks"), m.get("unix"), ref_ticks, now)
            members.append((m.get("name") or "?", d))
            if d is not None and (best is None or d < best):
                best = d
        label = decoded.get("guild_name") or gid[:8]
        if best is not None:
            DIAG["with_activity"] += 1
            if len(DIAG["samples"]) < 5 and members:
                m0 = decoded["_members"][0]
                DIAG["samples"].append((
                    label, m0.get("name") or "?",
                    f"0x{(m0.get('ticks') or 0) & 0xFFFFFFFFFFFFFFFF:016X}",
                    f"{members[0][1]:.1f} Tage" if members[0][1] is not None else "?",
                ))
        else:
            # Gilde ohne verwertbaren Zeitstempel: Roh-Evidenz für die
            # Ferndiagnose festhalten – auch wenn ein Decoder „erfolgreich"
            # war (z. B. Bibliotheks-Fehlparse oder alle Ticks = 0).
            if decoded.get("_members") and len(DIAG["implausibel"]) < 5:
                m0 = decoded["_members"][0]
                t0 = m0.get("ticks") or 0
                diff = (f"Δref={ (ref_ticks - t0) / TICKS_PER_DAY :.0f}d"
                        if ref_ticks and t0 else "—")
                DIAG["implausibel"].append((
                    label, decoded.get("_path", "?"), m0.get("name") or "?",
                    f"0x{t0 & 0xFFFFFFFFFFFFFFFF:016X}", diff))
            # scan/none proben schon in decode_group_full – hier nur die Fälle
            # „strukturell dekodiert, aber Zeitstempel unbrauchbar"
            if (decoded.get("_path") not in ("scan", "none", "sonstige")
                    and decoded.get("_bytes")
                    and decoded.get("group_type", GUILD) in (GUILD, INDEPENDENT)
                    and len(DIAG["probes"]) < 3):
                DIAG["probes"].append(_structure_probe(decoded["_bytes"], label))

        result[gid] = {
            "name": decoded.get("guild_name"),
            "days": best,
            "members": sorted(members, key=lambda t: (t[1] is None, t[1] or 0)),
            "path": decoded.get("_path", "?"),
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
                "days": g.get("days"),
                "player_count": len(g.get("members", [])),
                "x": round(float(t["x"])),
                "y": round(float(t["y"])),
            })
        except (KeyError, TypeError, ValueError) as err:
            print(f"Überspringe ein Basislager (unerwartete Struktur: {err})")
            continue
    return bases


# --- Ausgabe -------------------------------------------------------------
def fmt_last(days, now):
    if days is None:
        return "unbekannt"
    return time.strftime("%Y-%m-%d", time.localtime(now - days * 86400))


def report(bases, guilds, threshold_days, top, now):
    per_guild = {}
    for b in bases:
        grp = per_guild.setdefault(b["group_id"], {
            "name": b["guild"], "days": b["days"], "bases": []})
        grp["bases"].append(b)

    total_bases, total_guilds = len(bases), len(per_guild)
    active_g = inactive_g = unknown_g = 0
    active_b = inactive_b = unknown_b = 0
    over_30 = over_60 = 0
    inactive_list, unknown_list = [], []

    for gid, grp in per_guild.items():
        d = grp["days"]
        nbases = len(grp["bases"])
        row = {"gid": gid, "name": grp["name"], "days": d, "nbases": nbases,
               "members": guilds.get(gid, {}).get("members", [])}
        if d is not None:
            # absolut zählen, unabhängig vom --threshold
            over_30 += nbases if d > 30 else 0
            over_60 += nbases if d > 60 else 0
        if d is None:
            unknown_g += 1
            unknown_b += nbases
            unknown_list.append(row)
        elif d > threshold_days:
            inactive_g += 1
            inactive_b += nbases
            inactive_list.append(row)
        else:
            active_g += 1
            active_b += nbases

    inactive_list.sort(key=lambda r: r["days"], reverse=True)
    DIAG["unknown_bases"] = unknown_b
    DIAG["total_bases"] = total_bases

    line = "=" * 62
    print("\n" + line)
    print(f"  PalHeim – Basen-Aktivitätsbericht (v{VERSION})")
    print(f"  Stand: {time.strftime('%Y-%m-%d %H:%M', time.localtime(now))}")
    print(f"  Schwellwert für „inaktiv\": > {threshold_days} Tage ohne Login")
    print(line)
    print(f"  Gesamt:   {total_bases:>3} Basen in {total_guilds} Gilden")
    print(f"  Aktiv:    {active_b:>3} Basen ({active_g} Gilden)")
    print(f"  Inaktiv:  {inactive_b:>3} Basen ({inactive_g} Gilden)")
    print(f"             ├─ > 30 Tage: {over_30} Basen")
    print(f"             └─ > 60 Tage: {over_60} Basen")
    if unknown_b:
        print(f"  Ohne Zeitstempel: {unknown_b} Basen ({unknown_g} Gilden)")
    ref, mode = DIAG["ref_ticks"], DIAG["ref_mode"] or ""
    if ref and "relativ" in mode:
        span = ref / TICKS_PER_DAY
        print(f"  Zeitbasis: Welt-Laufzeit des Servers – erfasst max. die letzten "
              f"{span:.1f} Tage;\n  wer davor zuletzt online war, steht unter "
              f"„ohne Zeitstempel\".")
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
                  f"{fmt_last(r['days'], now):<10} | {gname}  ({names})")
        reclaim = sum(r["nbases"] for r in inactive_list)
        print(f"\n  → {reclaim} Basen-Slots frei, wenn alle inaktiven Gilden "
              f"(> {threshold_days} Tage) entfernt werden.")

    if unknown_list:
        print(f"\n  Gilden ohne ermittelbaren Zeitstempel "
              f"({len(unknown_list)} Gilden, {unknown_b} Basen):")
        for r in unknown_list[:40]:
            print(f"    - {r['name'] or 'Unbekannt'}  ({r['nbases']} Basen)")
        if len(unknown_list) > 40:
            print(f"    … und {len(unknown_list) - 40} weitere")
    print()


def print_diag(now):
    print("  [Diagnose v" + VERSION + "]")
    print(f"    Parse-Weg:          {DIAG['attempt']}")
    print(f"    GroupSaveDataMap:   {'vorhanden' if DIAG['has_groupmap'] else 'FEHLT'}"
          f" ({DIAG['groups_total']} Gruppen)")
    ref, mode = DIAG["ref_ticks"], DIAG["ref_mode"] or "?"
    if ref and "absolut" in mode:
        raw_unix = ref / 1e7 - DOTNET_EPOCH_OFFSET
        print(f"    Referenzzeit (Save): {time.strftime('%Y-%m-%d %H:%M', time.localtime(raw_unix))}"
              f"  [{mode}]")
        drift = (now - raw_unix) / 86400.0
        if abs(drift) > 3:
            print(f"    ACHTUNG: Systemuhr weicht {drift:+.1f} Tage von der "
                  f"Save-Zeit ab (Datumsangaben entsprechend einordnen)")
    elif ref:
        print(f"    Referenzzeit (Save): Welt-Laufzeit {ref / TICKS_PER_DAY:.2f} Tage"
              f"  [{mode}]")
    else:
        print("    Referenzzeit (Save): nicht gefunden – nutze Systemuhr")
    paths = ", ".join(f"{k}={v}" for k, v in sorted(DIAG["paths"].items())) or "—"
    print(f"    Decode-Wege:        {paths}")
    print(f"    Gilden mit Aktivität: {DIAG['with_activity']}")
    for g, p, hexval, d in DIAG["samples"]:
        print(f"      Beispiel: {g:<18} {p:<14} {hexval}  {d}")
    for g, path, p, hexval, diff in DIAG["implausibel"]:
        print(f"    Unplausibel: {g:<16} [{path}] {p:<14} ticks={hexval}  {diff}")
    for e in DIAG["errors"]:
        print(f"    Fehler: {e[:170]}")
    for probe in DIAG["probes"]:
        print(f"    Struktur-Probe „{probe['guild']}\" ({probe['size']} Bytes):")
        for s in probe["strings"]:
            print(f"      off={s['off']:>5}  '{s['text'][:24]}'  "
                  f"i64 davor: {s.get('i64_davor_hex', '—')}  [{s.get('deutungen', '')}]")
            print(f"                davor : {s.get('hex_davor', '')}")
            print(f"                danach: {s.get('hex_danach', '')}")
    print()


def write_csv(path, bases, now):
    rows = sorted(bases, key=lambda b: (b["days"] is not None, b["days"] or 0),
                  reverse=True)
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["Gilde", "Basis-ID", "Tage_inaktiv", "zuletzt_online",
                    "Mitglieder", "x", "y"])
        for b in rows:
            w.writerow([b["guild"], b["base_id"],
                        "" if b["days"] is None else int(round(b["days"])),
                        fmt_last(b["days"], now), b["player_count"], b["x"], b["y"]])
    print(f"CSV geschrieben: {path}")


def write_json(path, bases, now):
    out = []
    for b in bases:
        out.append({"guild": b["guild"], "base_id": b["base_id"],
                    "days_inactive": None if b["days"] is None else round(b["days"], 1),
                    "last_online": fmt_last(b["days"], now),
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

    print(f"base-report v{VERSION} – Palworld-1.0-Gildenformat + Auto-Diagnose")
    now = time.time()
    world = load_world(find_sav(args.sav))
    DIAG["ref_ticks"] = real_now_ticks(world, now)
    guilds = guild_activity(world, DIAG["ref_ticks"], now)
    if DIAG["ref_ticks"] is None:
        # Save ohne GameTimeSaveData: jüngsten Login-Tick als Referenz nehmen
        # und einmal neu rechnen (dank Cache ohne erneutes Dekodieren).
        fb = fallback_ref_from_members(world)
        if fb:
            DIAG["ref_ticks"] = fb
            diag_reset_parse_state()
            DIAG["groups_total"] = 0
            DIAG["with_activity"] = 0
            guilds = guild_activity(world, fb, now)
    bases = base_camps(world, guilds)

    if not bases:
        print("Keine Basen gefunden.")
        print_diag(now)
        return

    report(bases, guilds, args.threshold, args.top, now)
    many_unknown = (DIAG["unknown_bases"] > 0
                    and DIAG["unknown_bases"] * 2 >= DIAG["total_bases"])
    if args.debug or DIAG["with_activity"] == 0 or many_unknown:
        print_diag(now)
        if DIAG["with_activity"] == 0:
            print("  Für keine Gilde ließ sich ein Zeitstempel ermitteln – bitte diese\n"
                  "  komplette Ausgabe (inkl. Diagnose) weitergeben.\n")
        elif many_unknown:
            print("  Auffällig viele Basen ohne Zeitstempel – bei Bedarf die Diagnose\n"
                  "  oben weitergeben.\n")

    if args.csv:
        write_csv(args.csv, bases, now)
    if args.json:
        write_json(args.json, bases, now)


if __name__ == "__main__":
    main()
