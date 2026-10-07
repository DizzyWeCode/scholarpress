#!/usr/bin/env python3
"""Generate the site's brand assets into src/app/ (Next.js App Router).

Outputs:
  favicon.ico          16 / 32 / 48 px tile mark
  icon.png             48 px tile mark (modern browsers)
  apple-icon.png       180 px tile mark (iOS home screen)
  opengraph-image.png  1200x630 social share card
  public/covers/*.png  1600x900 article cover art (seed content)

Re-run after changing SITE copy or the palette:

    python3 scripts/generate-brand-assets.py
"""

from __future__ import annotations

import io
import struct
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "app"

# Palette — mirrors tailwind.config.ts
INK = (10, 10, 10)
INK_2 = (61, 61, 61)
INK_4 = (115, 115, 115)
PAPER = (250, 250, 250)
LINE = (229, 229, 229)

GEORGIA_BOLD = "/usr/share/fonts/truetype/msttcorefonts/Georgia_Bold.ttf"
GEORGIA_ITALIC = "/usr/share/fonts/truetype/msttcorefonts/Georgia_Italic.ttf"
INTER_REGULAR = "/usr/share/fonts/opentype/inter/Inter-Regular.otf"
INTER_MEDIUM = "/usr/share/fonts/opentype/inter/Inter-Medium.otf"
INTER_SEMIBOLD = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"

MONOGRAM = "F"
EYEBROW = "RESEARCH · ARTICLES · WEBINARS"
NAME = "Dr Fraction Dzinjalamala"
TAGLINE = "Clinical pharmacology for better malaria treatment"
AFFILIATION = "Department of Clinical Sciences, MUST"


def site_url() -> str:
    """Read NEXT_PUBLIC_SITE_URL from .env.local when present."""
    env = ROOT / ".env.local"
    if env.exists():
        for line in env.read_text().splitlines():
            if line.startswith("NEXT_PUBLIC_SITE_URL="):
                return line.split("=", 1)[1].strip().strip('"').strip("'").rstrip("/")
    return "https://dr-fraction.me"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def fit(text: str, path: str, start: int, minimum: int, max_width: int) -> ImageFont.FreeTypeFont:
    """Largest font size at or below `start` whose text fits `max_width`."""
    size = start
    while size > minimum:
        f = font(path, size)
        if f.getbbox(text)[2] - f.getbbox(text)[0] <= max_width:
            return f
        size -= 2
    return font(path, minimum)


def draw_tracked(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    fnt: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int],
    tracking: int,
) -> None:
    """Draw text with manual letter-spacing (PIL has no tracking API)."""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += fnt.getlength(ch) + tracking


def tracked_width(text: str, fnt: ImageFont.FreeTypeFont, tracking: int) -> int:
    return sum(fnt.getlength(ch) for ch in text) + tracking * (len(text) - 1)


# ---------------------------------------------------------------- tile mark

def tile(size: int) -> Image.Image:
    """Ink rounded square with a paper Georgia monogram."""
    radius = round(size * 0.18)
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=INK + (255,))

    fnt = font(GEORGIA_BOLD, round(size * 0.62))
    bbox = fnt.getbbox(MONOGRAM)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    # Optical centring: the F reads slightly left-heavy, so nudge right 1.5%.
    x = (size - w) / 2 - bbox[0] + size * 0.015
    y = (size - h) / 2 - bbox[1] - size * 0.02
    draw.text((x, y), MONOGRAM, font=fnt, fill=PAPER + (255,))
    return img


def write_ico(path: Path, images: list[Image.Image]) -> None:
    """Write a multi-resolution ICO with PNG-compressed entries."""
    header = struct.pack("<HHH", 0, 1, len(images))
    offset = 6 + 16 * len(images)
    directory, payloads = b"", b""
    for im in images:
        buf = io.BytesIO()
        im.convert("RGBA").save(buf, "PNG")
        blob = buf.getvalue()
        w = im.width if im.width < 256 else 0
        h = im.height if im.height < 256 else 0
        directory += struct.pack("<BBBBHHII", w, h, 0, 0, 1, 32, len(blob), offset)
        offset += len(blob)
        payloads += blob
    path.write_bytes(header + directory + payloads)


def generate_icons() -> None:
    write_ico(OUT / "favicon.ico", [tile(s) for s in (16, 32, 48)])
    tile(48).save(OUT / "icon.png", optimize=True)
    tile(180).save(OUT / "apple-icon.png", optimize=True)


# ------------------------------------------------------------ social card

def generate_og() -> None:
    w, h = 1200, 630
    pad = 48  # inset hairline plate
    gutter = 96  # content start
    img = Image.new("RGB", (w, h), PAPER)
    draw = ImageDraw.Draw(img)

    draw.rectangle((pad, pad, w - pad, h - pad), outline=LINE, width=2)

    # Eyebrow — tracked Inter small caps
    eyebrow = font(INTER_SEMIBOLD, 20)
    ew = tracked_width(EYEBROW, eyebrow, 5)
    draw_tracked(draw, (gutter, 132), EYEBROW, eyebrow, INK_4, 5)

    # Hairline that runs from the eyebrow to the right margin
    rule_y = 143
    draw.line((gutter + ew + 24, rule_y, w - gutter, rule_y), fill=LINE, width=2)

    # Headline + tagline, auto-fitted to the content width
    content = w - 2 * gutter
    name_fnt = fit(NAME, GEORGIA_BOLD, 78, 44, content)
    draw.text((gutter, 196), NAME, font=name_fnt, fill=INK)
    name_bottom = 196 + name_fnt.getbbox(NAME)[3]

    draw.line((gutter, name_bottom + 34, gutter + 96, name_bottom + 34), fill=INK, width=3)

    tag_fnt = fit(TAGLINE, GEORGIA_ITALIC, 34, 24, content)
    draw.text((gutter, name_bottom + 66), TAGLINE, font=tag_fnt, fill=INK_2)

    aff_fnt = font(INTER_REGULAR, 21)
    draw.text((gutter, name_bottom + 66 + 56), AFFILIATION, font=aff_fnt, fill=INK_4)

    # Footer row: domain left, host credit right
    domain = site_url().replace("https://", "").replace("http://", "")
    foot = font(INTER_MEDIUM, 19)
    fy = h - pad - 56
    draw_tracked(draw, (gutter, fy), domain.upper(), foot, INK_4, 3)
    credit = "SITE BY AKODI LTD"
    cw = tracked_width(credit, foot, 3)
    draw_tracked(draw, (w - gutter - cw, fy), credit, foot, INK_4, 3)

    img.save(OUT / "opengraph-image.png", optimize=True)


# ------------------------------------------------------------ article covers

def cover_light(path: Path) -> None:
    """Paper cover: text-block motif under a tracked eyebrow."""
    w, h, pad = 1600, 900, 40
    img = Image.new("RGB", (w, h), PAPER)
    draw = ImageDraw.Draw(img)
    draw.rectangle((pad, pad, w - pad, h - pad), outline=LINE, width=2)

    draw_tracked(draw, (96, 92), "DR FRACTION DZINJALAMALA", font(INTER_SEMIBOLD, 20), INK_4, 5)

    # Justified-paragraph motif: ink rules, last line short.
    y = 300
    for length in (1408, 1408, 1408, 1408, 1408, 1408, 860):
        draw.rectangle((96, y, 96 + length, y + 16), fill=INK)
        y += 44

    mark = tile(88)
    img.paste(mark, (w - 96 - 88, h - 96 - 88), mark)

    domain = site_url().replace("https://", "").replace("http://", "")
    draw_tracked(draw, (96, h - 128), domain.upper(), font(INTER_MEDIUM, 18), INK_4, 3)
    img.save(path, optimize=True)


def cover_ink(path: Path) -> None:
    """Ink cover: paper monogram with hairline accents."""
    w, h, pad = 1600, 900, 40
    img = Image.new("RGB", (w, h), INK)
    draw = ImageDraw.Draw(img)
    draw.rectangle((pad, pad, w - pad, h - pad), outline=INK_2, width=2)

    draw_tracked(draw, (96, 92), "DR FRACTION DZINJALAMALA", font(INTER_SEMIBOLD, 20), INK_4, 5)

    fnt = font(GEORGIA_BOLD, 420)
    bbox = fnt.getbbox(MONOGRAM)
    mw, mh = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x, y = (w - mw) / 2 - bbox[0], (h - mh) / 2 - bbox[1] - 30
    draw.text((x, y), MONOGRAM, font=fnt, fill=PAPER)

    rule_y = (h + mh) / 2 + 40
    draw.line((w / 2 - 70, rule_y, w / 2 + 70, rule_y), fill=INK_4, width=3)

    domain = site_url().replace("https://", "").replace("http://", "")
    draw_tracked(draw, (96, h - 128), domain.upper(), font(INTER_MEDIUM, 18), INK_4, 3)
    img.save(path, optimize=True)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    covers = ROOT / "public" / "covers"
    covers.mkdir(parents=True, exist_ok=True)
    generate_icons()
    generate_og()
    cover_light(covers / "open-access.png")
    cover_ink(covers / "field-notes.png")
    for name in ("favicon.ico", "icon.png", "apple-icon.png", "opengraph-image.png"):
        size = (OUT / name).stat().st_size
        print(f"{name:>22}  {size / 1024:6.1f} kB")
    for name in ("open-access.png", "field-notes.png"):
        size = (covers / name).stat().st_size
        print(f"{'covers/' + name:>22}  {size / 1024:6.1f} kB")


if __name__ == "__main__":
    main()
