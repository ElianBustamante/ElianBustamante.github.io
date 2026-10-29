"""Generate PNG and ICO favicons and app icons matching the EB brand design.

Design specification (matching public/favicon.svg):
- Background: #0a0a0a (RGB: 10, 10, 10).
  - For standard icons: rounded rectangle with radius = size * 0.20 on transparent canvas.
  - For apple-touch-icon.png: full-bleed #0a0a0a (no rounded/transparent corners).
- Text: "EB" in #ff6a1a (RGB: 255, 106, 26).
  - Font: Inter ExtraBold (from node_modules/@fontsource-variable/inter or system bold fallback).
  - Size: 48% of icon dimension, centered horizontally and vertically.
"""

from io import BytesIO
import os
import sys
from PIL import Image, ImageDraw, ImageFont

BG_COLOR = (10, 10, 10, 255)
TEXT_COLOR = (255, 106, 26, 255)
TRANSPARENT = (0, 0, 0, 0)


def get_font(size: int, repo_root: str):
    """Attempt to load Inter ExtraBold from node_modules or system bold fallbacks."""
    inter_path = os.path.join(
        repo_root,
        "node_modules",
        "@fontsource-variable",
        "inter",
        "files",
        "inter-latin-wght-normal.woff2",
    )
    candidates = [
        inter_path,
        "arialbd.ttf",
        "segoeuib.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    ]
    for c in candidates:
        if os.path.isabs(c) and not os.path.exists(c):
            continue
        try:
            font = ImageFont.truetype(c, size)
            try:
                font.set_variation_by_name(b"ExtraBold")
            except Exception:
                try:
                    font.set_variation_by_axes([800])
                except Exception:
                    pass
            return font, c
        except Exception:
            continue

    return ImageFont.load_default(), "default"


def render_icon(target_size: int, full_bleed: bool, repo_root: str) -> Image.Image:
    """Render an icon at high resolution (supersampling) and downscale with Lanczos."""
    supersample = max(4, 1024 // target_size)
    master_size = target_size * supersample

    if full_bleed:
        im = Image.new("RGBA", (master_size, master_size), BG_COLOR)
        draw = ImageDraw.Draw(im)
    else:
        im = Image.new("RGBA", (master_size, master_size), TRANSPARENT)
        draw = ImageDraw.Draw(im)
        radius = int(round(master_size * 0.20))
        draw.rounded_rectangle(
            [0, 0, master_size - 1, master_size - 1],
            radius=radius,
            fill=BG_COLOR,
        )

    font_size = int(round(master_size * 0.48))
    font, _ = get_font(font_size, repo_root)

    draw.text(
        (master_size / 2, master_size / 2),
        "EB",
        font=font,
        fill=TEXT_COLOR,
        anchor="mm",
    )

    if supersample > 1:
        return im.resize((target_size, target_size), Image.Resampling.LANCZOS)
    return im


def generate_icons():
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(repo_root, "public")
    os.makedirs(public_dir, exist_ok=True)

    print(f"Generating favicons in: {public_dir}")

    # 1. Standalone PNG icons
    targets = [
        ("favicon-48x48.png", 48, False),
        ("favicon-192x192.png", 192, False),
        ("icon-512.png", 512, False),
        ("apple-touch-icon.png", 180, True),  # full-bleed: no transparent corners
    ]

    for filename, size, full_bleed in targets:
        out_path = os.path.join(public_dir, filename)
        img = render_icon(size, full_bleed=full_bleed, repo_root=repo_root)
        img.save(out_path, format="PNG")
        print(f"  [+] Created {filename} ({size}x{size}{', full-bleed' if full_bleed else ''})")

    # 2. Multi-size favicon.ico (16, 32, 48 px)
    ico_path = os.path.join(public_dir, "favicon.ico")
    im16 = render_icon(16, full_bleed=False, repo_root=repo_root)
    im32 = render_icon(32, full_bleed=False, repo_root=repo_root)
    im48 = render_icon(48, full_bleed=False, repo_root=repo_root)

    im48.save(
        ico_path,
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=[im16, im32],
    )
    print("  [+] Created favicon.ico (16x16, 32x32, 48x48)")


if __name__ == "__main__":
    generate_icons()
