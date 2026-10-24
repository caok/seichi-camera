"""Stitch four quadrant screenshots (TL, TR, BL, BR) into one image.

Usage:
    .venv/bin/python scripts/stitch_quads.py out.png tl.png tr.png bl.png br.png
"""
import sys

import cv2
import numpy as np

if len(sys.argv) != 6:
    sys.exit(__doc__)
out, *paths = sys.argv[1:]
tl, tr, bl, br = (cv2.imread(p) for p in paths)
h, w = tl.shape[:2]
tr, bl, br = (cv2.resize(im, (w, h)) for im in (tr, bl, br))
cv2.imwrite(out, np.vstack([np.hstack([tl, tr]), np.hstack([bl, br])]))
print("wrote", out, f"{w * 2}x{h * 2}")
