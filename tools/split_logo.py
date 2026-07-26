"""
Deler det kombinerede MTHA + Thisted Forsikring logo i to filer.

Kilde:  assets/brand/combined-original.jpg  (798x187, hentet fra m-tha.dk)
Output: assets/brand/mtha-logo{,-transparent}.png
        assets/brand/thisted-forsikring{,-transparent}.png

Snitpunktet findes automatisk som den bredeste lodrette hvide korridor i
midten af billedet, i stedet for at hardkode en pixelvaerdi.
"""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
BRAND = ROOT / "assets" / "brand"
SRC = BRAND / "combined-original.jpg"

# En kolonne/raekke regnes som "tom" naar alle pixels er naer-hvide.
EMPTY = 246
# Blodgoering af kanter: pixels herover bliver helt gennemsigtige, og
# intervallet ned til FEATHER_LO giver delvis alpha, saa kanterne ikke takker.
ALPHA_HI, ALPHA_LO = 250, 218


def load() -> np.ndarray:
    return np.asarray(Image.open(SRC).convert("RGB")).astype(np.int16)


def empty_columns(px: np.ndarray) -> np.ndarray:
    """True for hver kolonne der kun indeholder naer-hvide pixels."""
    return px.min(axis=(0, 2)) >= EMPTY


def widest_gap(empty: np.ndarray, lo_frac=0.30, hi_frac=0.70) -> tuple[int, int]:
    """Bredeste sammenhaengende tomme korridor i den midterste del af billedet."""
    lo, hi = int(len(empty) * lo_frac), int(len(empty) * hi_frac)
    best = (0, 0)
    run_start = None
    for x in range(lo, hi):
        if empty[x]:
            run_start = x if run_start is None else run_start
        elif run_start is not None:
            if x - run_start > best[1] - best[0]:
                best = (run_start, x)
            run_start = None
    if run_start is not None and hi - run_start > best[1] - best[0]:
        best = (run_start, hi)
    return best


def trim(px: np.ndarray) -> np.ndarray:
    """Beskaerer hvid luft vaek paa alle fire sider."""
    cols = ~empty_columns(px)
    rows = ~(px.min(axis=(1, 2)) >= EMPTY)
    if not cols.any() or not rows.any():
        return px
    x0, x1 = np.flatnonzero(cols)[[0, -1]]
    y0, y1 = np.flatnonzero(rows)[[0, -1]]
    return px[y0 : y1 + 1, x0 : x1 + 1]


def to_transparent(px: np.ndarray) -> Image.Image:
    """Fjerner den hvide baggrund og bevarer bloede kanter via alpha."""
    lum = px.max(axis=2)  # max i stedet for middel: bevarer maettede farver
    alpha = np.clip((ALPHA_HI - lum) * (255 / (ALPHA_HI - ALPHA_LO)), 0, 255)
    rgba = np.dstack([px.astype(np.uint8), alpha.astype(np.uint8)])
    return Image.fromarray(rgba, "RGBA")


def palette(px: np.ndarray, n=6) -> list[tuple[str, int]]:
    """Dominerende brandfarver, hvide/graa toner filtreret vaek."""
    flat = px.reshape(-1, 3)
    keep = (flat.max(axis=1) < 235) & (flat.max(axis=1) - flat.min(axis=1) > 18)
    flat = flat[keep]
    if not len(flat):
        return []
    quant = (flat // 26 * 26).astype(np.uint8)
    colours, counts = np.unique(quant, axis=0, return_counts=True)
    order = np.argsort(-counts)[:n]
    out = []
    for i in order:
        # Gennemsnit af de faktiske pixels i hver bakke giver en praecis vaerdi
        bin_mask = np.all(quant == colours[i], axis=1)
        r, g, b = flat[bin_mask].mean(axis=0).round().astype(int)
        out.append((f"#{r:02X}{g:02X}{b:02X}", int(counts[i])))
    return out


def save(px: np.ndarray, stem: str) -> None:
    trimmed = trim(px)
    h, w = trimmed.shape[:2]

    on_white = Image.fromarray(trimmed.astype(np.uint8), "RGB")
    on_white.save(BRAND / f"{stem}.png", optimize=True)

    to_transparent(trimmed).save(BRAND / f"{stem}-transparent.png", optimize=True)

    print(f"  {stem:24s} {w:4d} x {h:3d} px")
    for hexv, _ in palette(trimmed, 4):
        print(f"      {hexv}")


def main() -> None:
    px = load()
    print(f"Kilde: {SRC.name}  {px.shape[1]} x {px.shape[0]} px\n")

    gap_start, gap_end = widest_gap(empty_columns(px))
    cut = (gap_start + gap_end) // 2
    print(f"Hvid korridor fundet: x={gap_start}-{gap_end}  ->  snit ved x={cut}\n")

    print("Output:")
    save(px[:, :cut], "mtha-logo")
    save(px[:, cut:], "thisted-forsikring")


if __name__ == "__main__":
    main()
