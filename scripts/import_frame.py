"""Import a real anime screenshot as a scene frame.

Trims black letterbox bars, centre-crops to 16:9, resizes to 1600x900 and writes
public/scenes/<id>/frame.jpg plus a matching outline.png.

Usage:
    .venv/bin/python scripts/import_frame.py <scene-id> <screenshot> [--crop x,y,w,h]

--crop takes a region of the screenshot (in source pixels) before the automatic steps,
useful when the screenshot contains player UI around the video.
"""
import argparse
import sys
from pathlib import Path

import cv2
import numpy as np

from make_outline import make_outline

W, H = 1600, 900
ROOT = Path(__file__).resolve().parent.parent


def trim_bars(img: np.ndarray, threshold: int = 18) -> np.ndarray:
    """Remove near-black rows/columns at the edges (letterbox / pillarbox)."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    rows = np.where(gray.mean(axis=1) > threshold)[0]
    cols = np.where(gray.mean(axis=0) > threshold)[0]
    if len(rows) == 0 or len(cols) == 0:
        return img
    return img[rows[0] : rows[-1] + 1, cols[0] : cols[-1] + 1]


def crop_to_aspect(img: np.ndarray, aspect: float = W / H) -> np.ndarray:
    h, w = img.shape[:2]
    if w / h > aspect:
        nw = round(h * aspect)
        x = (w - nw) // 2
        return img[:, x : x + nw]
    nh = round(w / aspect)
    y = (h - nh) // 2
    return img[y : y + nh]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("scene_id")
    ap.add_argument("image", type=Path)
    ap.add_argument("--crop", help="x,y,w,h region of the screenshot to use")
    args = ap.parse_args()

    img = cv2.imread(str(args.image))
    if img is None:
        sys.exit(f"cannot read {args.image}")
    if args.crop:
        x, y, w, h = map(int, args.crop.split(","))
        img = img[y : y + h, x : x + w]

    img = crop_to_aspect(trim_bars(img))
    interp = cv2.INTER_AREA if img.shape[1] >= W else cv2.INTER_CUBIC
    img = cv2.resize(img, (W, H), interpolation=interp)

    out_dir = ROOT / "public" / "scenes" / args.scene_id
    out_dir.mkdir(parents=True, exist_ok=True)
    frame = out_dir / "frame.jpg"
    cv2.imwrite(str(frame), img, [cv2.IMWRITE_JPEG_QUALITY, 90])
    print("wrote", frame)
    print("wrote", make_outline(frame))


if __name__ == "__main__":
    main()
