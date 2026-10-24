"""Turn dist/ into one self-contained HTML file (dist-single/index.html).

Inlines the JS bundle, CSS, favicon and every scene image as data: URIs, so the app can be
published as a single page (e.g. FeedMob Pages without file storage). Frames are re-encoded at
1280px / JPEG q80 to keep the page small.

Usage:
    npm run build && .venv/bin/python scripts/inline_build.py
"""
import base64
import re
from pathlib import Path

import cv2

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
OUT = ROOT / "dist-single" / "index.html"
MIME = {".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml"}


def data_uri(path: Path) -> str:
    if path.suffix == ".jpg":
        img = cv2.imread(str(path))
        h, w = img.shape[:2]
        img = cv2.resize(img, (1280, round(h * 1280 / w)), interpolation=cv2.INTER_AREA)
        raw = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 80])[1].tobytes()
    else:
        raw = path.read_bytes()
    return f"data:{MIME[path.suffix]};base64,{base64.b64encode(raw).decode()}"


def main():
    html = (DIST / "index.html").read_text()
    js_path = DIST / re.search(r'<script type="module" crossorigin src="\./([^"]+)"', html).group(1)
    css_path = DIST / re.search(r'<link rel="stylesheet" crossorigin href="\./([^"]+)"', html).group(1)

    js = js_path.read_text()
    for img in sorted((DIST / "scenes").rglob("*.*")):
        rel = img.relative_to(DIST).as_posix()
        js = js.replace(rel, data_uri(img))
    assert "scenes/" not in re.sub(r"data:[^`\"']+", "", js), "unreplaced scene path left in bundle"
    js = js.replace("</script", "<\\/script")

    html = re.sub(r'<script type="module" crossorigin src="[^"]+"></script>', lambda _: f'<script type="module">{js}</script>', html)
    html = re.sub(r'<link rel="stylesheet" crossorigin href="[^"]+">', lambda _: f"<style>{css_path.read_text()}</style>", html)
    html = html.replace('href="./favicon.svg"', f'href="{data_uri(DIST / "favicon.svg")}"')

    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(html)
    print(f"wrote {OUT} ({OUT.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
