"""Measure the real scroll speed of the original recording.

Cross-correlates 5fps frame strips to get horizontal displacement — AI
eyeball estimates of frame displacement were off by 4-10x, so this script is
the source of truth for scroll calibration (see docs/STATUS.md).

Usage: put frames in .refs/measure/ via ffmpeg first, or adjust PATHS.
  ffmpeg -ss <start> -t 12 -i original.f243.webm -vf "fps=5,scale=640:-1" measure/s<start>_%03d.png
Then:  python tools/measure_scroll.py
"""
import numpy as np
from PIL import Image
import glob, os, re
from collections import defaultdict

PATHS = [r"D:\MM\.refs\measure\s*_*.png"]

def strip_shift(a, b):
    h, w = a.shape
    y0, y1 = int(h * .3), int(h * .7)
    A = a[y0:y1].astype(np.float64) - a[y0:y1].mean()
    B = b[y0:y1].astype(np.float64) - b[y0:y1].mean()
    corr = np.zeros(2 * w - 1)
    for r in range(A.shape[0]):
        corr += np.correlate(B[r], A[r], mode="full")
    lags = np.arange(-w + 1, w)
    mask = np.abs(lags) <= w * .4
    idx = np.argmax(corr * mask)
    return -lags[idx]

def main():
    groups = defaultdict(list)
    for pattern in PATHS:
        for f in sorted(glob.glob(pattern)):
            m = re.match(r"s(\d+)_", os.path.basename(f))
            if m:
                groups[int(m.group(1))].append(f)
    print(f"{'section':>8} {'px/0.2s':>9} {'px/s':>7} {'%width/s':>9}")
    for start in sorted(groups):
        files = groups[start]
        grays = [np.array(Image.open(f).convert("L")) for f in files]
        shifts = [strip_shift(grays[i], grays[i + 1]) for i in range(len(grays) - 1)]
        shifts = [s for s in shifts if s != 0]
        if not shifts:
            print(f"{start:>8}  no displacement detected")
            continue
        med = float(np.median(shifts))
        px_s = med * 5
        w = grays[0].shape[1]
        print(f"{start:>8} {med:>9.1f} {px_s:>7.1f} {px_s / w * 100:>8.2f}%")

if __name__ == "__main__":
    main()
