#!/usr/bin/env python3
"""Erzeugt public/assets/og-image.jpg (1200x630) aus dem Hero-Artwork.

Das Bild wird als Link-Vorschau beim Teilen genutzt (Discord, WhatsApp,
Facebook, X, …) und ist in den Open-Graph-Tags der Seiten eingetragen.
Nach einem Wechsel des Hero-Bildes einfach neu ausführen:

    pip install Pillow
    python3 tools/make-og-image.py

Benötigt die DejaVu-Fonts (auf Debian/Ubuntu vorinstalliert:
Paket fonts-dejavu-core).
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "public" / "assets"
OUT = ASSETS / "og-image.jpg"
W, H = 1200, 630

TITLE = "PalHeim"
SUBTITLE = "Deutscher Palworld Community-Server · PvE · 24/7"
ADDRESS = "pve.palheim.de:8211"

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"


def pick_source() -> Path:
    # Gleiche Prioritäten wie der Hero-Hintergrund in style.css
    for name in ("hero.jpg", "hero.webp", "hero-alt.webp"):
        p = ASSETS / name
        if p.exists():
            return p
    raise SystemExit("Kein Hero-Bild in public/assets/ gefunden.")


im = Image.open(pick_source()).convert("RGB")
# Auf Zielhöhe skalieren, dann mittig auf 1200 Breite beschneiden
scale = H / im.height
im = im.resize((round(im.width * scale), H), Image.LANCZOS)
x0 = max(0, (im.width - W) // 2)
im = im.crop((x0, 0, x0 + W, H))
if im.size != (W, H):  # Quelle schmaler als 1200? Dann passend strecken
    im = im.resize((W, H), Image.LANCZOS)

# Dunkler Verlauf unten, damit der Text lesbar ist
grad = Image.new("L", (1, H))
for y in range(H):
    t = max(0.0, (y / H - 0.45) / 0.55)  # ab 45 % Höhe einblenden
    grad.putpixel((0, y), int(200 * (t ** 1.5)))
overlay = Image.new("RGB", (W, H), (10, 22, 34))
im = Image.composite(overlay, im, grad.resize((W, H)))

draw = ImageDraw.Draw(im)
f_title = ImageFont.truetype(FONT_BOLD, 92)
f_sub = ImageFont.truetype(FONT_BOLD, 40)
f_addr = ImageFont.truetype(FONT_MONO, 34)


def text_shadow(xy, txt, font, fill):
    x, y = xy
    draw.text((x + 3, y + 3), txt, font=font, fill=(0, 0, 0))
    draw.text((x, y), txt, font=font, fill=fill)


tw = draw.textlength(TITLE, font=f_title)
sw = draw.textlength(SUBTITLE, font=f_sub)
aw = draw.textlength(ADDRESS, font=f_addr)

text_shadow(((W - tw) / 2, 340), TITLE, f_title, (255, 255, 255))
text_shadow(((W - sw) / 2, 462), SUBTITLE, f_sub, (186, 224, 255))

# Adress-"Chip" wie auf der Webseite
pad_x, pad_y = 26, 12
cx0 = (W - aw) / 2 - pad_x
cy0 = 540 - pad_y
cx1 = (W + aw) / 2 + pad_x
cy1 = 540 + 40 + pad_y
draw.rounded_rectangle((cx0, cy0, cx1, cy1), radius=14,
                       fill=(16, 42, 64), outline=(59, 161, 232), width=3)
draw.text(((W - aw) / 2, 544), ADDRESS, font=f_addr, fill=(255, 214, 130))

im.save(OUT, "JPEG", quality=87, progressive=True, optimize=True)
print(f"OK: {OUT.relative_to(ROOT)} ({W}x{H})")
