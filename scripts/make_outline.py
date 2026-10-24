"""Turn a real anime screenshot into a transparent white-line outline PNG.

Usage:
    .venv/bin/python scripts/make_outline.py public/scenes/<id>/frame.jpg [--clahe] [--canny LO,HI]

Use --clahe (and optionally fixed --canny thresholds) for soft, low-contrast frames.

Writes outline.png next to the input. Afterwards point `frame` / `outline`
in src/data/scenes.ts at the new files.
"""
from __future__ import annotations

import sys
from pathlib import Path

import cv2
import numpy as np


def edge_mask(
    img: np.ndarray, work: int = 800, min_len: int = 60, blur: int = 7, sigma: float = 0.33,
    clahe: bool = False, canny: tuple[int, int] | None = None,
) -> np.ndarray:
    """Long structural edges only: smooth at low resolution, auto-threshold Canny, drop short fragments."""
    h, w = img.shape[:2]
    small = cv2.resize(img, (work, round(h * work / w)), interpolation=cv2.INTER_AREA)
    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    if clahe:  # boost local contrast for hazy / backlit frames
        gray = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8)).apply(gray)
    gray = cv2.bilateralFilter(gray, 9, 50, 50)  # flatten anime shading, keep edges
    gray = cv2.GaussianBlur(gray, (blur, blur), 0)
    if canny:
        lo, hi = canny
    else:
        med = float(np.median(gray))
        lo, hi = int(max(0, (1 - sigma) * med * 0.5)), int(min(255, (1 + sigma) * med * 0.6))
    edges = cv2.Canny(gray, lo, hi)

    n, labels, stats, _ = cv2.connectedComponentsWithStats(edges, connectivity=8)
    keep = np.zeros_like(edges)
    for i in range(1, n):
        _, _, bw, bh, _ = stats[i]
        if max(bw, bh) >= min_len:
            keep[labels == i] = 255

    big = cv2.resize(keep, (w, h), interpolation=cv2.INTER_LINEAR)
    big = (big > 60).astype(np.uint8) * 255
    return cv2.dilate(big, np.ones((3, 3), np.uint8))


def make_outline(src: Path, width: int = 1600, **edge_opts) -> Path:
    img = cv2.imread(str(src))
    if img is None:
        sys.exit(f"cannot read {src}")
    h, w = img.shape[:2]
    img = cv2.resize(img, (width, round(h * width / w)), interpolation=cv2.INTER_AREA)
    edges = edge_mask(img, **edge_opts)

    rgba = np.zeros((*edges.shape, 4), np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = edges
    out = src.with_name("outline.png")
    cv2.imwrite(str(out), rgba)
    return out


if __name__ == "__main__":
    import argparse

    ap = argparse.ArgumentParser(usage=__doc__)
    ap.add_argument("frames", nargs="+", type=Path)
    ap.add_argument("--clahe", action="store_true")
    ap.add_argument("--canny", help="fixed LO,HI thresholds")
    args = ap.parse_args()
    canny = tuple(map(int, args.canny.split(","))) if args.canny else None
    for f in args.frames:
        print("wrote", make_outline(f, clahe=args.clahe, canny=canny))
