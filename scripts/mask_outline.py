"""Erase character lines from outline.png using the shapes in pose.svg.

The outline layer is meant for scenery; characters live on the red pose layer.
Supports the simple shapes we hand-draw in pose.svg: <ellipse> and <path> made of M/L/Z.

Usage:
    .venv/bin/python scripts/mask_outline.py <scene-id>
"""
import re
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent

if len(sys.argv) != 2:
    sys.exit(__doc__)
scene = ROOT / "public" / "scenes" / sys.argv[1]
outline_path = scene / "outline.png"
outline = cv2.imread(str(outline_path), cv2.IMREAD_UNCHANGED)
svg = (scene / "pose.svg").read_text()

h, w = outline.shape[:2]
vb = re.search(r'viewBox="0 0 (\d+) (\d+)"', svg)
sx, sy = w / int(vb.group(1)), h / int(vb.group(2))

mask = np.zeros((h, w), np.uint8)
for cx, cy, rx, ry in re.findall(r'<ellipse cx="([\d.]+)" cy="([\d.]+)" rx="([\d.]+)" ry="([\d.]+)"', svg):
    cv2.ellipse(mask, (round(float(cx) * sx), round(float(cy) * sy)), (round(float(rx) * sx), round(float(ry) * sy)), 0, 0, 360, 255, -1)
for d in re.findall(r'<path d="([^"]+)"', svg):
    pts = np.array([[float(x) * sx, float(y) * sy] for x, y in re.findall(r"([\d.]+)[ ,]([\d.]+)", d)], np.int32)
    cv2.fillPoly(mask, [pts], 255)

mask = cv2.dilate(mask, np.ones((15, 15), np.uint8))  # also catch the edge right on the silhouette
outline[mask > 0, 3] = 0
cv2.imwrite(str(outline_path), outline)
print("masked", outline_path, f"{(mask > 0).mean():.0%} of frame")
