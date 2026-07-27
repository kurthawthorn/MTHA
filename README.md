# MTHA — modernisering af m-tha.dk

Forslag og prototype til Mors-Thy Håndbold Akademis hjemmeside.
**Ikke akademiets officielle materiale.**

## Kom i gang

```bash
cd poc
npm install                      # kun første gang
python ../tools/fetch_assets.py  # henter akademiets billeder og dokumenter
npm run dev                      # http://localhost:4321
npm run build                    # bygger til poc/dist/
```

`fetch_assets.py` kan udelades — så bygger prototypen med farvede pladsholdere
i stedet for fotos.

## Mapper

| Mappe | Hvad |
|---|---|
| `assets/brand/` | Logoet delt i MTHA og Thisted Forsikring |
| `tools/` | `split_logo.py`, `fetch_assets.py`, `assets.json` |
| `poc/` | Astro-prototypen |

## Billeder og dokumenter ligger ikke i git

`tools/fetch_assets.py` henter **142 billeder og 3 PDF'er** fra m-tha.dk:

| Gruppe | Antal | Hvad |
|---|---|---|
| `fotos` | 20 | DM, træning, faciliteter, hverdag |
| `portraetter` | 80 | 63 spillere + 17 professionelle |
| `logoer` | 42 | Sponsorlogoer, transparens bevaret |
| `dokumenter` | 3 | Underskrevne PDF'er |

De er **bevidst holdt uden for git**, fordi:

- de tilhører akademiet, sponsorerne og fotograferne — et offentligt repo skal
  ikke videredistribuere dem
- portrætterne viser identificerbare mindreårige
- binære filer bliver liggende i git-historikken for evigt

Kortlægningen — navne, roller, sponsorniveauer, alt-tekster, kildefiler —
ligger derimod i git som `tools/assets.json` og `poc/src/data/roster.json`.
Den skal derfor kun laves én gang.

> Kildefilnavnene på m-tha.dk viser i sig selv hvorfor sitet er svært at
> vedligeholde: spillerne heder `33.png`, `18.png`, `81.png` — og da numrene
> slap op, `az.png`, `dada.png` og `asqasa.png`.

## Logoer

`assets/brand/combined-original.jpg` er hentet fra m-tha.dk (798 × 187 px) og
delt af `tools/split_logo.py`, som finder den hvide korridor mellem de to
mærker frem for at bruge et hardkodet snitpunkt.

| Fil | Størrelse |
|---|---|
| `mtha-logo.png` / `-transparent.png` | 240 × 179 |
| `thisted-forsikring.png` / `-transparent.png` | 314 × 173 |

> **Til produktion skal der skaffes vektorfiler.** Kilden er en komprimeret
> JPEG på 798 px — for lidt til tryk og skærme med høj opløsning. Bed akademiet
> om SVG/EPS/AI og Thisted Forsikring om deres officielle logopakke.

### Brandfarver

Samplet direkte ud af logoet, ikke gættet:

| Farve | Hex | Hvor |
|---|---|---|
| Navy | `#2E308D` | Figuren og teksten |
| Orange | `#E0893E` | Bolden |
| Thisted-blå | `#0762A1` | Kun omkring hovedsponsoren |

Værdierne er aflæst fra en JPEG og er tilnærmede. Ret dem når akademiets
rigtige farvekoder foreligger.

## Sider

| Adresse | Viser |
|---|---|
| `/` | Forside med DM-foto, nyheder, årgange, træning, faciliteter |
| `/nyheder` + `/nyheder/[slug]` | Oversigt og enkelt nyhed |
| `/hold/u17`, `/hold/u19` | Trup med holdfoto og filtrering |
| `/spillere/[navn]` | 63 spillerprofiler med portræt og personlig sponsor |
| `/staben` | 17 professionelle grupperet efter rolle |
| `/sponsorer` | 43 sponsorer i tre niveauer |
| `/bliv-elev` | Optagelse, uddannelse, priser, ansøgning |
| `/bliv-elev/oekonomi` | To regnestykker med SU — fra PDF til side |
| `/bolig` | Traneholm College med priser og indskud |
| `/om-akademiet` | Vision, fysisk udvikling, faciliteter, hverdag |
| `/privatlivspolitik` | GDPR-tekst som side |
| `/dokumenter` | 3 underskrevne PDF'er + hvor resten er flyttet hen |

## Sæsonskifte — ét sted

Alt der varierer fra sæson til sæson står i **`poc/src/data/saeson.ts`** og kun
der: årstal, årgange, priser, SU-satser og takster. Ingen side hardkoder et
årstal eller et beløb.

Sådan ruller man til næste sæson:

1. Ret `navn`, `fra` og `til`
2. Ret årgangene i `hold`
3. Ret de beløb der er ændret

Priser, årstal og overskrifter opdateres derefter over hele sitet. I den
færdige løsning er det ét dokument i CMS'et med samme felter, så ledelsen selv
kan gøre det.

`oekonomi.ts` indeholder **ikke ét tal** — alle beløb udregnes fra `saeson.ts`.

## Fundet undervejs

Tre ting akademiet bør se på, alle fundet ved at trække indhold ud af PDF'erne:

1. **Prisen står to steder og er ikke ens.** Forsiden på m-tha.dk oplyser
   2.495 kr./md for ophold; brochuren skriver 2.395 kr./md.
2. **Privatlivspolitikken er forældet.** Dataansvarlig står som "Sports
   College Mors" med adressen H.C. Ørstedsvej 2, mens sitet oplyser Tranevej 4.
3. **Hjemmeboende-muligheden er usynlig.** Brochuren nævner 595–695 kr./md for
   hjemmeboende elever — det står ikke på hjemmesiden.

## Målt resultat

| | m-tha.dk i dag | Prototypen |
|---|---|---|
| Forside, blokerende | 672 KB HTML alene, før 213 billeder | 152–346 KB inkl. hero-foto |
| Forside, HTML | 687.871 bytes | 22 KB (5 KB gzip) |
| JavaScript | 41 scripts | 0 |
| Rigtige sider | 1 | 80 |
| Byggetid | — | ~3 sek |

## Om dataene

Spillernes og stabens **navne, roller, årgange og portrætter** er offentlige
oplysninger fra m-tha.dk. **Position, rygnummer, fødselsår, moderklub,
uddannelse og personlig sponsor er eksempeldata** — indsat for at vise
felterne, og skal erstattes.

Det står i et banner øverst på hver side og på hver spillerprofil.

## Herfra

`poc/src/data/akademi.ts` har samme form som Sanity-skemaet i forslaget.
Etape 2 skifter derfor kun datakilde — `truppen()` og `getCollection()` går fra
at læse lokale filer til at kalde Sanity, og siderne ændres ikke.
