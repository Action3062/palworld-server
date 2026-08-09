#!/usr/bin/env python3
"""
PalHeim – Server-Status nach Discord spiegeln
---------------------------------------------
Läuft auf dem PALWORLD-Server (Cron, alle 5 Minuten) und pflegt EINE
Status-Nachricht pro Server im Discord-Kanal: Spieler, Version, In-Game-Tage,
FPS, Uptime, API-Latenz – plus CPU und RAM der Maschine und des
PalServer-Prozesses. Die Nachricht wird bearbeitet statt neu gepostet,
der Kanal bleibt also sauber.

Mit --restart-state und --event stehen zusätzlich der letzte/nächste Neustart
und das laufende bzw. kommende Event-Wochenende in derselben Nachricht – damit
gibt es pro Server nur noch EIN Embed im Kanal. Die Daten dafür kommen von
palworld-discord.sh (Zustandsdatei) und palworld-event.sh (Rotation); dieses
Skript rechnet sie nur nicht selbst aus, sondern stellt sie dar.

Einrichtung:
  1. Discord: Kanal-Einstellungen → Integrationen → Webhooks → Neuer Webhook,
     URL kopieren.
  2. Testlauf auf dem Palworld-Server:
       python3 discord-status.py \
         --api http://127.0.0.1:8212 --password 'ADMINPASSWORT' \
         --webhook 'https://discord.com/api/webhooks/…' \
         --name 'Server 1 · PvE 4x' --address pve.palheim.de:8211
  3. Cron (crontab -e), alle 5 Minuten:
       */5 * * * * /etc/palworld/palworld-status.sh --password '…' --webhook '…' --name '…' --address … >> /var/log/discord-status.log 2>&1

Die zuletzt erfolgreiche Adresse merkt sich das Skript und probiert sie beim
nächsten Lauf zuerst – --api ist damit nur noch der Startwert.

Braucht nur die Python-Standardbibliothek (kein /opt/paltools nötig).
Die Nachrichten-ID merkt sich das Skript in --state (Standard:
~/.palheim-discord-status.json). Wird die Nachricht im Discord gelöscht,
postet der nächste Lauf automatisch eine neue.
"""

import argparse
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

BLUE = 0x2F9DE4    # palheim.de-Blau (online)
RED = 0xC0392B     # offline
ORANGE = 0xE67E22  # Neustart laeuft / Server startet gerade
UA = "PalHeim-DiscordStatus/1.0 (+https://palheim.de)"

# So lange nach einem gemeldeten Neustart gilt ein stummer Server als
# "startet gerade" und nicht als Ausfall - die Welt braucht ein paar Minuten.
BOOT_GRACE_SECONDS = 600

KIND_LABELS = {
    "update": "⬆️ Update",
    "watchdog": "⚠️ Watchdog",
    "restart": "🔧 Wartung",
}


# ---------------------------------------------------------------------------
# Palworld REST-API
# ---------------------------------------------------------------------------

def api_get(base, password, endpoint):
    auth = base64.b64encode(f"admin:{password}".encode()).decode()
    req = urllib.request.Request(
        base.rstrip("/") + endpoint,
        headers={"Authorization": f"Basic {auth}", "Accept": "application/json",
                 "User-Agent": UA})
    with urllib.request.urlopen(req, timeout=5) as res:
        return json.loads(res.read().decode("utf-8"))


def fetch_game(base, password):
    """info+metrics holen; Latenz = Dauer des metrics-Aufrufs in ms."""
    t0 = time.monotonic()
    metrics = api_get(base, password, "/v1/api/metrics")
    latency_ms = (time.monotonic() - t0) * 1000
    info = api_get(base, password, "/v1/api/info")
    return info, metrics, latency_ms


def try_bases(bases, password):
    """Erste Adresse nehmen, die antwortet.

    Rückgabe: (basis|None, info, metrics, latenz, fehlerliste). Ein 401 ist
    kein Verbindungsproblem – die API ist da, nur das Passwort passt nicht;
    weitersuchen wäre sinnlos, deshalb bricht die Schleife dann ab.
    """
    errors = []
    for base in bases:
        try:
            info, metrics, latency_ms = fetch_game(base, password)
            return base, info, metrics, latency_ms, errors
        except urllib.error.HTTPError as err:
            errors.append(f"{base}: HTTP {err.code}")
            if err.code == 401:
                errors.append("  → AdminPassword passt nicht zur PalWorldSettings.ini")
                break
        except Exception as err:  # noqa: BLE001 – offline ist ein normaler Zustand
            errors.append(f"{base}: {err}")
    return None, None, None, 0.0, errors


# ---------------------------------------------------------------------------
# Hardware (nur Standardbibliothek: /proc)
# ---------------------------------------------------------------------------

def read_cpu_totals():
    with open("/proc/stat") as f:
        parts = f.readline().split()[1:]
    vals = [int(x) for x in parts]
    idle = vals[3] + (vals[4] if len(vals) > 4 else 0)  # idle + iowait
    return sum(vals), idle


def find_palserver_pids():
    pids = []
    for entry in os.listdir("/proc"):
        if not entry.isdigit():
            continue
        try:
            with open(f"/proc/{entry}/comm") as f:
                if "PalServer" in f.read():
                    pids.append(int(entry))
        except OSError:
            continue
    return pids


def read_proc_jiffies(pid):
    try:
        with open(f"/proc/{pid}/stat") as f:
            parts = f.read().rsplit(")", 1)[1].split()
        return int(parts[11]) + int(parts[12])  # utime + stime
    except OSError:
        return None


def read_proc_rss_kb(pids):
    total = 0
    for pid in pids:
        try:
            with open(f"/proc/{pid}/status") as f:
                for line in f:
                    if line.startswith("VmRSS:"):
                        total += int(line.split()[1])
                        break
        except OSError:
            continue
    return total


def hardware_stats(sample_seconds=0.8):
    """CPU-Auslastung (gesamt + PalServer) und RAM (gesamt + PalServer)."""
    ncpu = os.cpu_count() or 1
    pids = find_palserver_pids()

    total1, idle1 = read_cpu_totals()
    proc1 = sum(j for j in (read_proc_jiffies(p) for p in pids) if j is not None)
    time.sleep(sample_seconds)
    total2, idle2 = read_cpu_totals()
    proc2 = sum(j for j in (read_proc_jiffies(p) for p in pids) if j is not None)

    dt = max(1, total2 - total1)
    cpu_pct = 100.0 * (dt - (idle2 - idle1)) / dt
    # Prozess-Jiffies sind pro Kern – auf Gesamtkapazität normiert
    proc_pct = 100.0 * (proc2 - proc1) / dt * 1  # /proc/stat zählt alle Kerne

    mem_total = mem_avail = 0
    with open("/proc/meminfo") as f:
        for line in f:
            if line.startswith("MemTotal:"):
                mem_total = int(line.split()[1])
            elif line.startswith("MemAvailable:"):
                mem_avail = int(line.split()[1])
    mem_used = mem_total - mem_avail
    proc_rss = read_proc_rss_kb(pids)

    load1 = os.getloadavg()[0]
    return {
        "cpu_pct": cpu_pct,
        "proc_pct": proc_pct,
        "ncpu": ncpu,
        "load1": load1,
        "mem_total_kb": mem_total,
        "mem_used_kb": mem_used,
        "proc_rss_kb": proc_rss,
        "palserver_running": bool(pids),
    }


# ---------------------------------------------------------------------------
# Formatierung
# ---------------------------------------------------------------------------

def gb(kb):
    return kb / 1024 / 1024


def fmt_uptime(seconds):
    m = int(seconds) // 60
    if m < 60:
        return f"{m} min"
    h, m = divmod(m, 60)
    if h < 24:
        return f"{h} Std {m:02d} min"
    d, h = divmod(h, 24)
    return f"{d} Tage {h} Std"


def bar(pct, width=10):
    filled = round(pct / 100 * width)
    return "▰" * min(width, filled) + "▱" * max(0, width - filled)


def restart_fields(restart_state, fallback_next=0):
    """Die zwei Neustart-Felder aus dem Zustand von palworld-discord.sh.

    Der gespeicherte Termin gewinnt, denn nur er kennt ein evtl. gesetztes
    --min-gap. Liegt er in der Vergangenheit (Skript lief noch nie, oder der
    Lauf ist ausgefallen), springt der frisch berechnete Termin ein.
    """
    now = int(time.time())
    last_ts = int(restart_state.get("last_ts") or 0)
    stored = int(restart_state.get("next_ts") or 0)
    nxt = stored if stored > now else int(fallback_next or 0)

    if last_ts:
        parts = [f"<t:{last_ts}:f>", f"**<t:{last_ts}:R>**"]
        extras = (KIND_LABELS.get(restart_state.get("last_kind") or ""),
                  restart_state.get("last_reason"),
                  restart_state.get("last_detail"))
        parts += [str(x) for x in extras if x]
        last_val = "\n".join(parts)
    else:
        last_val = "noch keiner erfasst"

    if nxt:
        next_val = (f"<t:{nxt}:f>\n**<t:{nxt}:R>**\n"
                    "Vorwarnung im Spiel läuft rechtzeitig.")
    else:
        next_val = "kein fester Termin\n(`RESTART_SCHEDULE` in `palworld-scripts.conf`)"

    return [
        {"name": "🕒 Letzter Neustart", "inline": True, "value": last_val[:1024]},
        {"name": "⏭️ Nächster Neustart", "inline": True, "value": next_val[:1024]},
    ]


def event_field(spec):
    """'active|Name|Text' bzw. 'next|Name|Text' von palworld-event.sh next."""
    state, _, rest = spec.partition("|")
    name, _, text = rest.partition("|")
    if not name:
        return None
    if state == "active":
        return {"name": "🎉 Event läuft", "inline": False,
                "value": f"**{name}**\n{text}"[:1024]}
    return {"name": "🗓️ Nächstes Event", "inline": False,
            "value": f"**{name}** – ab Freitagabend\n{text}"[:1024]}


def build_embed(args, info, metrics, latency_ms, hw,
                restart_state=None, event_spec=""):
    online = metrics is not None
    restart_state = restart_state or {}
    fields = []

    if online:
        fields += [
            {"name": "👥 Spieler",
             "inline": True,
             "value": f"**{metrics.get('currentplayernum', 0)}/{metrics.get('maxplayernum', '?')}**"},
            {"name": "🎮 Version",
             "inline": True,
             "value": str(info.get("version", "?")) if info else "?"},
            {"name": "📅 In-Game-Tage",
             "inline": True,
             "value": str(metrics.get("days", "?"))},
            {"name": "🎯 Server-FPS",
             "inline": True,
             "value": str(metrics.get("serverfps", "?"))},
            {"name": "⏱️ Uptime",
             "inline": True,
             "value": fmt_uptime(metrics.get("uptime", 0))},
            {"name": "📡 API-Latenz",
             "inline": True,
             "value": f"{latency_ms:.0f} ms"},
        ]

    # Hardware immer anzeigen – gerade wenn der Spielserver hängt,
    # ist der Blick auf CPU/RAM Gold wert
    cpu_line = (f"{bar(hw['cpu_pct'])} **{hw['cpu_pct']:.0f} %**"
                f"\nPalServer: {hw['proc_pct']:.0f} % · Load {hw['load1']:.2f}"
                f" ({hw['ncpu']} Kerne)")
    mem_pct = 100 * hw["mem_used_kb"] / max(1, hw["mem_total_kb"])
    ram_line = (f"{bar(mem_pct)} **{gb(hw['mem_used_kb']):.1f} / {gb(hw['mem_total_kb']):.1f} GB**"
                f"\nPalServer: {gb(hw['proc_rss_kb']):.1f} GB")
    fields += [
        {"name": "🖥️ CPU", "inline": True, "value": cpu_line},
        {"name": "🧠 RAM", "inline": True, "value": ram_line},
    ]

    if event_spec:
        ev = event_field(event_spec)
        if ev:
            fields.append(ev)

    if args.restart_state or restart_state:
        fields += restart_fields(restart_state, args.next_restart)

    if online and info and info.get("worldguid"):
        fields.append({"name": "🌍 Welt-GUID", "inline": False,
                       "value": f"`{info['worldguid']}`"})

    phase = restart_state.get("status") or ""
    last_ts = int(restart_state.get("last_ts") or 0)
    addr = f"`{args.address}` · [palheim.de](https://palheim.de)"

    if online:
        title = f"🟢 {args.name}"
        desc = addr
        color = BLUE
        if phase == "running":
            title = f"🟠 {args.name}"
            desc += "\n🟠 **Neustart läuft** – die Vorwarnung im Spiel läuft bereits."
            color = ORANGE
        elif phase == "failed":
            title = f"⚠️ {args.name}"
            desc += "\n⚠️ **Letzte Wartung ist fehlgeschlagen** – bitte prüfen."
            if restart_state.get("note"):
                desc += f"\n{restart_state['note']}"
            color = ORANGE
    elif phase == "running" or (
            phase == "ok" and last_ts
            and time.time() - last_ts < BOOT_GRACE_SECONDS):
        # Kein Ausfall, sondern die geplante Auszeit: waehrend des Neustarts
        # und in den Minuten danach laedt die Welt noch, die API schweigt.
        title = f"🟠 {args.name} – Neustart"
        desc = f"{addr}\nDer Server startet gerade neu und ist gleich zurück."
        if restart_state.get("note"):
            desc += f"\n{restart_state['note']}"
        color = ORANGE
    else:
        title = f"🔴 {args.name} – OFFLINE"
        desc = (f"`{args.address}` · Spielserver antwortet nicht"
                + ("" if hw["palserver_running"] else " – **Prozess läuft nicht!**"))
        color = RED

    return {
        "title": title,
        "description": desc,
        "color": color,
        "fields": fields,
        "footer": {"text": "PalHeim · wird aktualisiert, nicht neu gepostet"},
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S+00:00", time.gmtime()),
    }


# ---------------------------------------------------------------------------
# Discord-Webhook: eine Nachricht pflegen (POST einmal, danach PATCH)
# ---------------------------------------------------------------------------

def discord_request(url, payload, method):
    req = urllib.request.Request(
        url, data=json.dumps(payload).encode("utf-8"), method=method,
        headers={"Content-Type": "application/json", "User-Agent": UA})
    with urllib.request.urlopen(req, timeout=15) as res:
        body = res.read().decode("utf-8")
        return json.loads(body) if body.strip() else {}


def load_state(path):
    try:
        with open(os.path.expanduser(path)) as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def save_state(path, state):
    path = os.path.expanduser(path)
    tmp = path + ".tmp"
    with open(tmp, "w") as f:
        json.dump(state, f)
    os.replace(tmp, path)


def publish(args, embed, api_base=None):
    state = load_state(args.state)
    key = args.name  # eine Nachricht je Server-Name
    msg_id = state.get(key)
    # Gefundene API-Adresse merken: der nächste Lauf probiert sie zuerst
    if api_base and state.get(f"{key}::api") != api_base:
        state[f"{key}::api"] = api_base
        save_state(args.state, state)
    payload = {"embeds": [embed], "username": "PalHeim Status",
               "allowed_mentions": {"parse": []}}

    if msg_id:
        try:
            discord_request(f"{args.webhook}/messages/{msg_id}", payload, "PATCH")
            print(f"Discord: Nachricht {msg_id} aktualisiert.")
            return
        except urllib.error.HTTPError as err:
            if err.code != 404:
                raise
            print("Discord: gemerkte Nachricht existiert nicht mehr – poste neu.")

    created = discord_request(args.webhook + "?wait=true", payload, "POST")
    state[key] = str(created.get("id", ""))
    save_state(args.state, state)
    print(f"Discord: neue Status-Nachricht {state[key]} angelegt.")


def main():
    parser = argparse.ArgumentParser(
        description="Palworld-Serverstatus + Hardware als Discord-Embed pflegen")
    parser.add_argument("--api", default="http://127.0.0.1:8212",
                        help="Basis-URL der Palworld REST-API (Standard: localhost)")
    parser.add_argument("--password", required=True, help="AdminPassword des Spielservers")
    parser.add_argument("--webhook", required=True, help="Discord-Webhook-URL")
    parser.add_argument("--name", required=True, help="Anzeigename, z. B. 'Server 1 · PvE 4x'")
    parser.add_argument("--address", default="", help="Join-Adresse, z. B. pve.palheim.de:8211")
    parser.add_argument("--state", default="~/.palheim-discord-status.json",
                        help="Datei für die gemerkte Nachrichten-ID")
    parser.add_argument("--restart-state", default="",
                        help="Zustandsdatei von palworld-discord.sh; setzt die "
                             "Felder 'Letzter/Nächster Neustart' in dieselbe Nachricht")
    parser.add_argument("--next-restart", type=int, default=0,
                        help="Unixzeit des nächsten geplanten Neustarts "
                             "(Rückfall, falls die Zustandsdatei keinen kennt)")
    parser.add_argument("--event", default="",
                        help="Ausgabe von 'palworld-event.sh next', also "
                             "'active|Name|Text' oder 'next|Name|Text'")
    parser.add_argument("--dry-run", action="store_true",
                        help="Embed nur ausgeben, nichts an Discord senden")
    args = parser.parse_args()

    # Reihenfolge: zuletzt erfolgreiche Adresse, dann --api
    remembered = load_state(args.state).get(f"{args.name}::api")
    bases = [b for b in (remembered, args.api) if b]
    bases = list(dict.fromkeys(bases))
    used, info, metrics, latency_ms, errors = try_bases(bases, args.password)

    # Diagnose nach stderr, damit --dry-run reines JSON liefert (Cron loggt
    # ohnehin beides in dieselbe Datei).
    if used is None:
        print("Spielserver nicht erreichbar:", file=sys.stderr)
        for line in errors:
            print(f"  {line}", file=sys.stderr)
        print("  Prüfen: RESTAPIEnabled=True und RESTAPIPort in PalWorldSettings.ini.",
              file=sys.stderr)
    elif used != args.api and used != remembered:
        # nur beim ersten Fund melden, sonst steht das alle 5 min im Log
        print(f"REST-API gefunden unter {used} – dauerhaft: --api '{used}'",
              file=sys.stderr)

    hw = hardware_stats()
    restart_state = load_state(args.restart_state) if args.restart_state else {}
    embed = build_embed(args, info, metrics, latency_ms, hw,
                        restart_state, args.event)

    if args.dry_run:
        print(json.dumps(embed, ensure_ascii=False, indent=2))
        return
    try:
        publish(args, embed, used)
    except urllib.error.HTTPError as err:
        detail = ""
        try:
            detail = err.read().decode("utf-8", "replace")[:200]
        except Exception:  # noqa: BLE001
            pass
        sys.exit(f"FEHLER: Discord antwortet mit HTTP {err.code}. {detail}\n"
                 "Webhook-URL prüfen (Kanal → Integrationen → Webhooks).")
    except urllib.error.URLError as err:
        sys.exit(f"FEHLER: Discord nicht erreichbar ({err.reason}).")


if __name__ == "__main__":
    main()
