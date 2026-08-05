#!/usr/bin/env python3
"""
PalHeim – Server-Status nach Discord spiegeln
---------------------------------------------
Läuft auf dem PALWORLD-Server (Cron, alle 5 Minuten) und pflegt EINE
Status-Nachricht pro Server im Discord-Kanal: Spieler, Version, In-Game-Tage,
FPS, Uptime, API-Latenz – plus CPU und RAM der Maschine und des
PalServer-Prozesses. Die Nachricht wird bearbeitet statt neu gepostet,
der Kanal bleibt also sauber.

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
UA = "PalHeim-DiscordStatus/1.0 (+https://palheim.de)"


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


def build_embed(args, info, metrics, latency_ms, hw):
    online = metrics is not None
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

    if online and info and info.get("worldguid"):
        fields.append({"name": "🌍 Welt-GUID", "inline": False,
                       "value": f"`{info['worldguid']}`"})

    if online:
        title = f"🟢 {args.name}"
        desc = f"`{args.address}` · [palheim.de](https://palheim.de)"
        color = BLUE
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
        "footer": {"text": "PalHeim Status · aktualisiert alle 5 Minuten"},
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
    parser.add_argument("--dry-run", action="store_true",
                        help="Embed nur ausgeben, nichts an Discord senden")
    args = parser.parse_args()

    # Reihenfolge: zuletzt erfolgreiche Adresse, dann --api
    remembered = load_state(args.state).get(f"{args.name}::api")
    bases = [b for b in (remembered, args.api) if b]
    bases = list(dict.fromkeys(bases))
    used, info, metrics, latency_ms, errors = try_bases(bases, args.password)

    if used is None:
        print("Spielserver nicht erreichbar:")
        for line in errors:
            print(f"  {line}")
        print("  Prüfen: RESTAPIEnabled=True und RESTAPIPort in PalWorldSettings.ini.")
    elif used != args.api and used != remembered:
        # nur beim ersten Fund melden, sonst steht das alle 5 min im Log
        print(f"REST-API gefunden unter {used} – dauerhaft: --api '{used}'")

    hw = hardware_stats()
    embed = build_embed(args, info, metrics, latency_ms, hw)

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
