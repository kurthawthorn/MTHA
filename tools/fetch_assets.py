"""
Henter akademiets egne billeder fra m-tha.dk ned i prototypen.

    python tools/fetch_assets.py

Tre grupper:
  fotos        kurateret liste herunder — DM, traening, faciliteter, socialt
  portraetter  63 spillere + 17 professionelle, fra tools/assets.json
  logoer       42 sponsorlogoer, fra tools/assets.json

Billederne bliver bevidst IKKE committet til git:
  * de tilhoerer akademiet, sponsorerne og fotograferne — et offentligt repo
    skal ikke videredistribuere dem
  * portraetterne viser identificerbare mindreaarige
  * binaere filer bliver liggende i git-historikken for evigt

Manifestet (navne, alt-tekster, kildefiler) ligger derimod i git, saa
kortlaegningen ikke skal laves om. Prototypen bygger ogsaa UDEN billederne —
da falder den tilbage paa farvede pladsholdere.

Kildefilerne afsloerer i sig selv hvorfor sitet er svaert at vedligeholde:
spillerne heder 33.png, 18.png, 81.png — og naar numrene slap op, az.png,
dada.png og asqasa.png.
"""

from __future__ import annotations

import io
import json
import sys
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / "poc" / "src" / "assets"
BASE = ("https://impro.usercontent.one/appid/oneComWsb/domain/m-tha.dk"
        "/media/m-tha.dk/onewebmedia/")

# Astro skalerer selv ned herfra, saa der er ingen grund til at gemme 4032 px.
GRÆNSER = {"fotos": 2200, "portraetter": 900, "logoer": 700}
QUALITY = 86


@dataclass(frozen=True)
class Billede:
    gruppe: str
    key: str
    kilde: str
    alt: str
    kategori: str = ""
    trim: bool = False


# ── Kurateret liste over fotos ────────────────────────────────────────────
FOTOS: list[Billede] = [
    Billede("fotos", "hold-samlet", "DR7A8331 NY (1).jpg",
            "Hele akademiets trup samlet på banen i Sparekassen Thy Arena", "hold"),
    Billede("fotos", "hold-udenfor", "Fællesfoto udenfor.JPG",
            "Akademiets elever på række udenfor ved Morsø Multipark", "hold"),

    Billede("fotos", "dm-2025-vinder", "Officiel vinderbillede U19 DM 2025.jpg",
            "U19-holdet jubler med guldmedaljer og guldhatte efter DM-finalen 2025", "dm"),
    Billede("fotos", "dm-guldhatte", "U19dm.jpg",
            "U19-holdet fejrer med medaljer og guldhatte midt på banen", "dm"),
    Billede("fotos", "dm-jubel", "DR7A6630___serialized21.jpg",
            "Holdet i en klynge med armene om hinanden mens blå serpentiner falder",
            "dm", trim=True),

    Billede("fotos", "traening-hal", "Træning, Lohmann___serialized1.jpg",
            "Spiller laver armstrækninger på måtte i hallen mens holdkammeraterne ser til",
            "traening"),
    Billede("fotos", "traening-styrke", "Træning, strøm___serialized1.jpg",
            "Spiller træner med håndvægt i akademiets styrkerum", "traening"),

    Billede("fotos", "traneholm-indgang", "Nyt banner mm.jpg",
            "Indgangen til Traneholm med akademiets og sponsorernes bannere", "faciliteter"),
    Billede("fotos", "traneholm-koekken", "Køkken 1.jpg",
            "Fælleskøkkenet på Traneholm", "faciliteter"),
    Billede("fotos", "traneholm-ophold", "biografstole.jpg",
            "Opholdsrum med biografstole på Traneholm", "faciliteter"),
    Billede("fotos", "multipark-front", "Front.jpg",
            "Morsø Multipark set udefra", "faciliteter"),
    Billede("fotos", "drone-1", "dji_0019.jpg",
            "Luftfoto af Morsø Multipark og omgivelserne", "faciliteter"),
    Billede("fotos", "drone-2", "dji_0022.jpg",
            "Luftfoto af akademiets område ved Nykøbing Mors", "faciliteter"),
    Billede("fotos", "drone-3", "dji_0025.jpg",
            "Luftfoto af Morsø Multipark fra oven", "faciliteter"),

    *[Billede("fotos", f"socialt-{i}", kilde,
              "Fra hverdagen på Mors-Thy Håndbold Akademi", "socialt")
      for i, kilde in enumerate(
          ["IMG_1029___serialized1.jpg", "IMG_1031___serialized1.jpg",
           "IMG_1035___serialized1.jpg", "IMG_3384___serialized2.jpg",
           "IMG_3388___serialized1.jpg", "IMG_3422___serialized1.jpg"], start=1)],
]


def indlæs_manifest() -> list[Billede]:
    data = json.loads((ROOT / "tools" / "assets.json").read_text(encoding="utf-8"))
    ud: list[Billede] = []
    for s in data["spillere"]:
        ud.append(Billede("portraetter", s["key"], s["kilde"],
                          f"{s['navn']}, spiller på Mors-Thy Håndbold Akademi",
                          s["hold"]))
    for p in data["stab"]:
        ud.append(Billede("portraetter", p["key"], p["kilde"],
                          f"{p['navn']}, tilknyttet Mors-Thy Håndbold Akademi", "stab"))
    for l in data["sponsorer"]:
        ud.append(Billede("logoer", l["key"], l["kilde"],
                          f"{l['navn']} — sponsor for Mors-Thy Håndbold Akademi",
                          l["niveau"]))
    return ud


# ── Dokumenter ────────────────────────────────────────────────────────────
# Kun de tre der SKAL vaere filer: underskrevne papirer uden tekstlag.
# Brochurernes indhold er trukket ud paa rigtige sider i stedet.
PDFS: list[tuple[str, str]] = [
    ("vedtaegter", "Vedtægter - underskrevet.pdf"),
    ("referat-generalforsamling-2025",
     "Referat fra Generalforsamling oktober 2025 - underskrevet.pdf"),
    ("kontrakt", "Kontrakt til hjemmeside_SizeOptimized.pdf"),
]


def hent_pdfs() -> None:
    ud = ROOT / "poc" / "public" / "dokumenter"
    ud.mkdir(parents=True, exist_ok=True)
    print("\nDokumenter:")
    for key, navn in PDFS:
        try:
            req = urllib.request.Request(
                "https://m-tha.dk/onewebmedia/" + urllib.parse.quote(navn),
                headers={"User-Agent": "Mozilla/5.0 (MTHA POC)"},
            )
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
            (ud / f"{key}.pdf").write_bytes(data)
            print(f"  {key:32s} {len(data) / 1024:7.0f} KB")
        except Exception as e:  # noqa: BLE001
            print(f"  {key:32s} FEJL: {e}")


def hent(b: Billede) -> bytes:
    req = urllib.request.Request(
        BASE + urllib.parse.quote(b.kilde),
        headers={"User-Agent": "Mozilla/5.0 (MTHA POC billedhentning)"},
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def trim_kanter(im: Image.Image) -> Image.Image:
    """Klipper ensfarvede rammer vaek fra letterboxede filer."""
    px = np.asarray(im.convert("RGB")).astype(int)
    spred_r = np.ptp(px.reshape(px.shape[0], -1), axis=1)
    spred_k = np.ptp(px.transpose(1, 0, 2).reshape(px.shape[1], -1), axis=1)
    r, k = np.flatnonzero(spred_r > 28), np.flatnonzero(spred_k > 28)
    if not len(r) or not len(k):
        return im
    return im.crop((k[0], r[0], k[-1] + 1, r[-1] + 1))


def gem(data: bytes, b: Billede) -> tuple[int, int, int, str]:
    im = Image.open(io.BytesIO(data))
    # Logoer SKAL beholde alfakanalen — ellers faar de sort baggrund paa
    # farvede flader. Fotos og portraetter komprimeres som JPEG.
    har_alfa = im.mode in ("RGBA", "LA", "P") and "transparency" in im.info \
        or im.mode in ("RGBA", "LA")
    if b.trim:
        im = trim_kanter(im)
    grænse = GRÆNSER[b.gruppe]
    if max(im.size) > grænse:
        im.thumbnail((grænse, grænse), Image.LANCZOS)

    mappe = DEST / b.gruppe
    mappe.mkdir(parents=True, exist_ok=True)
    if b.gruppe == "logoer" and har_alfa:
        im = im.convert("RGBA")
        ud = mappe / f"{b.key}.png"
        im.save(ud, "PNG", optimize=True)
    else:
        ud = mappe / f"{b.key}.jpg"
        im.convert("RGB").save(ud, "JPEG", quality=QUALITY,
                               optimize=True, progressive=True)
    return (*im.size, ud.stat().st_size, ud.suffix)


def skriv_data(alle: list[Billede]) -> None:
    """Alt-tekster og noegler skal med i git — det er tekst, ikke billeddata."""
    L = [
        "// GENERERET af tools/fetch_assets.py — ret manifestet der, ikke her.",
        "//",
        "// Alt-teksterne og nøglerne ligger i git, selvom billedfilerne ikke gør.",
        "// Derfor kan prototypen bygge uden billeder og stadig vide hvad der mangler.",
        "",
        "export interface BilledeMeta {",
        "  key: string;",
        "  gruppe: 'fotos' | 'portraetter' | 'logoer';",
        "  kategori: string;",
        "  alt: string;",
        "}",
        "",
        "export const billeder: BilledeMeta[] = [",
    ]
    for b in alle:
        alt = b.alt.replace("\\", "\\\\").replace("'", "\\'")
        L.append(f"  {{ key: '{b.key}', gruppe: '{b.gruppe}', "
                 f"kategori: '{b.kategori}', alt: '{alt}' }},")
    L += [
        "];",
        "",
        "const efterKey = new Map(billeder.map((b) => [b.key, b]));",
        "",
        "export const altFor = (key: string): string => efterKey.get(key)?.alt ?? '';",
        "",
        "export const iKategori = (gruppe: BilledeMeta['gruppe'], kategori: string) =>",
        "  billeder.filter((b) => b.gruppe === gruppe && b.kategori === kategori);",
        "",
    ]
    ud = ROOT / "poc" / "src" / "data" / "billeder.ts"
    ud.write_text("\n".join(L), encoding="utf-8")
    print(f"\nSkrev {ud.relative_to(ROOT)}  ({len(alle)} poster)")


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    alle = FOTOS + indlæs_manifest()

    grupper: dict[str, list[Billede]] = {}
    for b in alle:
        grupper.setdefault(b.gruppe, []).append(b)
    print("Henter fra m-tha.dk:")
    for g, v in grupper.items():
        print(f"  {g:12s} {len(v):3d}")
    print()

    fejl: list[str] = []
    bytes_pr_gruppe: dict[str, int] = {}

    def arbejd(b: Billede):
        try:
            w, h, size, ext = gem(hent(b), b)
            return b, w, h, size, ext, None
        except Exception as e:  # noqa: BLE001
            return b, 0, 0, 0, "", str(e)

    with ThreadPoolExecutor(max_workers=8) as pool:
        for b, w, h, size, ext, err in pool.map(arbejd, alle):
            if err:
                fejl.append(f"{b.key} ({b.kilde}): {err}")
                continue
            bytes_pr_gruppe[b.gruppe] = bytes_pr_gruppe.get(b.gruppe, 0) + size

    for g, v in grupper.items():
        n = sum(1 for b in v if not any(b.key in f for f in fejl))
        mb = bytes_pr_gruppe.get(g, 0) / 1024 / 1024
        print(f"  {g:12s} {n:3d}/{len(v):3d} hentet   {mb:5.1f} MB")

    total = sum(bytes_pr_gruppe.values()) / 1024 / 1024
    print(f"\n  i alt        {len(alle) - len(fejl):3d}/{len(alle):3d} hentet   {total:5.1f} MB")
    print(f"  gemt i {DEST.relative_to(ROOT)} (ikke i git)")

    hent_pdfs()

    skriv_data([b for b in alle if not any(b.key in f for f in fejl)])

    if fejl:
        print(f"\n{len(fejl)} fejl:")
        for e in fejl[:20]:
            print("  -", e)


if __name__ == "__main__":
    main()
