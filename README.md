# MTHA — modernisering af m-tha.dk

Arbejdsmappe for forslaget og prototypen til Mors-Thy Håndbold Akademis
hjemmeside. **Ikke akademiets officielle materiale.**

## Kom i gang

```bash
cd poc
npm install     # kun første gang
npm run dev     # http://localhost:4321
npm run build   # bygger til poc/dist/
```

## Indhold

| Mappe | Hvad |
|---|---|
| `assets/brand/` | Logoer — originalen og de to udskilte filer |
| `tools/split_logo.py` | Deler det kombinerede logo automatisk |
| `poc/` | Astro-prototypen |

## Logoer

`assets/brand/combined-original.jpg` er hentet fra m-tha.dk (798 × 187 px) og
delt automatisk af `tools/split_logo.py`, som finder den hvide korridor mellem
de to mærker i stedet for at bruge et hardkodet snitpunkt.

| Fil | Størrelse | Brug |
|---|---|---|
| `mtha-logo.png` | 240 × 179 | På lys baggrund |
| `mtha-logo-transparent.png` | 240 × 179 | På farvet baggrund |
| `thisted-forsikring.png` | 314 × 173 | På lys baggrund |
| `thisted-forsikring-transparent.png` | 314 × 173 | På farvet baggrund |

Kør igen med `python tools/split_logo.py`.

> **Til produktion skal der skaffes vektorfiler.** Kilden er en komprimeret
> JPEG på 798 px, hvilket er for lidt til tryk og til skærme med høj opløsning.
> Bed akademiet om SVG/EPS/AI, og Thisted Forsikring om deres officielle
> logopakke.

### Brandfarver

Samplet direkte ud af logoet, ikke gættet:

| Farve | Hex | Hvor |
|---|---|---|
| Navy | `#2E308D` | Figuren og teksten i MTHA-logoet |
| Orange | `#E0893E` | Bolden |
| Thisted-blå | `#0762A1` | Kun omkring hovedsponsoren |
| Thisted lys | `#61A4D8` | Kun omkring hovedsponsoren |

Værdierne er aflæst fra en JPEG og er derfor tilnærmede. Ret dem, når
akademiets rigtige farvekoder foreligger.

## Prototypens sider

| Adresse | Viser |
|---|---|
| `/` | Forside med nyheder, årgange og nøgletal |
| `/nyheder` + `/nyheder/[slug]` | Nyhedsoversigt og enkelt nyhed |
| `/hold/u17`, `/hold/u19` | Trup med filtrering på position og årgang |
| `/spillere/[navn]` | Spillerprofil med personlig sponsor |
| `/sponsorer` | Sponsorniveauer, optalt automatisk |
| `/bliv-elev` | Optagelse, priser og ansøgningsformular |
| `/om-akademiet`, `/dokumenter` | Indhold flyttet fra den nuværende forside |

## Målt resultat

| | m-tha.dk i dag | Prototypen |
|---|---|---|
| HTML, forside | 687.871 bytes | 15.463 bytes |
| JavaScript, forside | 41 scripts | 0 |
| Rigtige sider | 1 | 42 |
| Byggetid | — | 0,9 sek |

Alle 42 sider fylder tilsammen mindre end den nuværende forside alene.

## Om dataene

Spillernes **navne og årgange** er offentlige oplysninger fra m-tha.dk.
**Position, rygnummer, moderklub, uddannelse og personlig sponsor er
eksempeldata** — de er indsat for at vise felterne og skal erstattes.

Prototypen bruger bevidst **ingen fotos af eleverne**; spillerkortene viser
initialer og rygnummer i stedet.

## Herfra

`poc/src/data/akademi.ts` har samme form som Sanity-skemaet i forslaget.
Etape 2 skifter derfor kun datakilde — `truppen()` og `getCollection()` går fra
at læse lokale filer til at kalde Sanity, og siderne ændres ikke.
