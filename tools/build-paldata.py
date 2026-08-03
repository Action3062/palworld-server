#!/usr/bin/env python3
"""
Erzeugt das Pal-Datenpaket für die Team-Anzeige der Webseite
------------------------------------------------------------
Quelle ist ein Checkout von PalworldSaveTools (deafdudecomputers) – dessen
game_data-Ordner enthält Icons, Basiswerte und Passiv-Namen. Dieses Skript
kopiert die benötigten Icons nach public/assets/pals/ und baut paldata.json
(CharacterID → Name, Icon, Elemente, Basiswerte + Passiv-Tabelle).

Aufruf (einmalig bzw. nach großen Palworld-Updates):
  python3 tools/build-paldata.py --source /pfad/zu/PalworldSaveTools/resources

Quelle: https://github.com/deafdudecomputers/PalworldSaveTools (MIT);
die Icons selbst sind Spiel-Assets von Pocketpair (Fan-Content-Nutzung).
"""

import argparse
import json
import os
import shutil
import sys


def main() -> None:
    parser = argparse.ArgumentParser(description="Pal-Datenpaket generieren")
    parser.add_argument("--source", required=True,
                        help="resources-Ordner eines PalworldSaveTools-Checkouts")
    parser.add_argument("--dest", default=os.path.join(
        os.path.dirname(__file__), "..", "public", "assets", "pals"),
        help="Zielordner (Standard: public/assets/pals)")
    args = parser.parse_args()

    gd = os.path.join(args.source, "game_data")
    if not os.path.isfile(os.path.join(gd, "characters.json")):
        sys.exit(f"characters.json nicht gefunden unter {gd} – --source prüfen.")

    dest = os.path.abspath(args.dest)
    icons_dest = os.path.join(dest, "icons")
    os.makedirs(icons_dest, exist_ok=True)

    chars = json.load(open(os.path.join(gd, "characters.json")))["pals"]
    skills = json.load(open(os.path.join(gd, "skills.json")))

    # ---- Pals: CharacterID (klein) → Anzeige-Daten
    pals = {}
    icon_files = set()
    elements = {}
    for p in chars:
        key = p["asset"].lower()
        if key in pals:
            continue  # Duplikate (Quest-/Boss-Varianten) – erster Eintrag gewinnt
        icon_file = os.path.basename(p["icon"])
        # Alphas (BOSS_…) und ein paar unveröffentlichte Arten haben keine
        # eigene Icon-Datei – aufs Unknown-Fallback ausweichen (der Uploader
        # normalisiert BOSS_ ohnehin auf die Grundform)
        if not os.path.isfile(os.path.join(gd, "icons", "pals", icon_file)):
            icon_file = "T_icon_unknown.webp"
        elems = []
        for ename, e in p["elements"].items():
            elems.append(e["name"])
            elements[e["name"]] = os.path.basename(e["icon"])
        s = p["stats"]
        pals[key] = {
            "name": p["name"],
            "icon": icon_file,
            "elements": elems,
            "hp": s["hp"],
            "atk": s["shot_attack"],
            "def": s["defense"],
        }
        icon_files.add(("pals", icon_file))
    for f in elements.values():
        icon_files.add(("elements", f))

    # ---- Passives: interner Name → Anzeigename + Güte (rank <0 = negativ,
    #      >=3 = besonders/legendär)
    passives = {}
    for sk in skills["passives"]:
        asset = str(sk.get("asset") or sk.get("name") or "")
        name = str(sk.get("name") or asset)
        if not asset:
            continue
        passives[asset.lower()] = {"name": name, "rank": int(sk.get("rank") or 0)}

    # ---- Icons kopieren (+ Unbekannt-Fallback)
    copied = missing = 0
    for sub, f in sorted(icon_files):
        src = os.path.join(gd, "icons", sub, f)
        if not os.path.isfile(src):
            missing += 1
            continue
        shutil.copy2(src, os.path.join(icons_dest, f))
        copied += 1
    unknown = os.path.join(gd, "icons", "T_icon_unknown.webp")
    if os.path.isfile(unknown):
        shutil.copy2(unknown, os.path.join(icons_dest, "T_icon_unknown.webp"))
        copied += 1

    out = {
        "source": "PalworldSaveTools (deafdudecomputers) – Spiel-Assets © Pocketpair",
        "pals": pals,
        "elements": elements,
        "passives": passives,
    }
    with open(os.path.join(dest, "paldata.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))

    print(f"{len(pals)} Pal-Arten, {len(passives)} Passives, "
          f"{copied} Icons kopiert" + (f", {missing} Icons FEHLEN" if missing else "") +
          f"\nZiel: {dest}")


if __name__ == "__main__":
    main()
