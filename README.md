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

`tools/fetch_assets.py` henter **149 billeder og 3 PDF'er** fra m-tha.dk:

| Gruppe | Antal | Hvad |
|---|---|---|
| `fotos` | 20 | DM, træning, faciliteter, hverdag |
| `portraetter` | 79 | 54 spillere + 25 i staben |
| `logoer` | 50 | Sponsorer og partnere, med links, transparens bevaret |
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
| Navy | `#32348B` | Figuren og teksten |
| Orange | `#EF8329` | Bolden |
| Thisted-blå | `#0762A1` | Kun omkring hovedsponsoren |

Samplet fra `mtha-logo-officiel.png` — akademiets egen logofil med ægte
transparens, fundet på m-tha.dk som `MTHA_Logo_Endelig-ingen baggrund.png`
(702 × 356). Den bruges i header og sidefod; `split_logo.py`-udklipningerne er
kun nødvendige for Thisted Forsikring.

## Sider

| Adresse | Viser |
|---|---|
| `/` | Forside med DM-foto, nyheder, årgange, træning, faciliteter |
| `/nyheder` + `/nyheder/[slug]` | Oversigt og enkelt nyhed |
| `/hold/u17`, `/hold/u19` | Trup med holdfoto og filtrering |
| `/spillere/[navn]` | 54 spillerprofiler med portræt og personlig sponsor |
| `/staben` | 25 personer i akademiets egne tre sektioner |
| `/sponsorer` | 44 sponsorer + 6 partnere, alle med aktivt link |
| `/bliv-elev` | Optagelse, uddannelse, priser, ansøgning |
| `/bliv-elev/oekonomi` | To regnestykker med SU — fra PDF til side |
| `/bolig` | Traneholm College med priser og indskud |
| `/vaerdier` | ”Sammen er vi stærkere”, de fire værdier, historien 2012→ |
| `/uddannelse` | Fire uddannelsesveje med links, koordinatorer, træningsskema |
| `/om-akademiet` | Vision, fysisk udvikling, faciliteter, hverdag |
| `/privatlivspolitik` | GDPR-tekst som side |
| `/dokumenter` | 3 underskrevne PDF'er + hvor resten er flyttet hen |

## Sæsonskifte — spillerne flytter sig selv

Et hold er defineret ved hvilke **fødselsår** det består af, ikke ved en
spillerliste. Fødselsåret er stamdata der aldrig ændrer sig, så
holdtilknytningen udregnes — se `holdFor()` i `poc/src/data/akademi.ts`.

Ved sæsonskifte rettes kun årgangene på holdene i `saeson.ts`. Målt på
prototypen:

| | Før | Efter |
|---|---|---|
| U17 | 25 spillere (2008–2009) | 12 spillere (2009–2010) |
| U19 | 29 spillere (2006–2007) | 28 spillere (2007–2008) |

De 13 født i 2008 rykkede selv op fra U17 til U19; de 14 født i 2006 faldt ud
af truppen. **Ingen spillere blev redigeret.** Spiller en ung op eller ned,
sættes en overstyring på netop den spiller.

Se `sanity/README.md` for hvordan det ser ud i administrationen — herunder
hvordan en spiller og et portræt bindes sammen.

## Priser og satser — ét sted

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

Otte ting akademiet bør se på, alle fundet ved at trække indhold ud af PDF'erne:

1. **Prisen står to steder og er ikke ens.** Forsiden på m-tha.dk oplyser
   2.495 kr./md for ophold; brochuren skriver 2.395 kr./md.
2. **Privatlivspolitikken er forældet.** Dataansvarlig står som "Sports
   College Mors" med adressen H.C. Ørstedsvej 2, mens sitet oplyser Tranevej 4.
3. **Hjemmeboende-muligheden er usynlig.** Brochuren nævner 595–695 kr./md for
   hjemmeboende elever — det står ikke på hjemmesiden.
4. **Prisen står faktisk i TRE versioner.** Ud over de to ovenfor skriver
   visionsbrochuren 2.255 kr./md for ophold, 316 kr. i forbrug og 495 kr. for
   hjemmeboende. Tre kilder, tre priser på samme post.
5. **Deres bedste argument er begravet.** ”17 af 19 spillere i Mors-Thy
   Håndbolds ligatrup 2023/24 er eller har været i akademiets talentmiljø” stod
   nederst på side 1 i en PDF. Det står nu på forsiden.
6. **Værdiordet bruges ikke.** ”Sammen er vi stærkere” står på brochurens
   forside, men ingen steder på hjemmesiden. Det har nu fået sin egen side.
7. **Koordinatorernes direkte kontaktoplysninger** — navn, mobil og mail på
   Morsø Gymnasium og EUC Nordvest — stod kun i velkomstfolderen til nye
   elever, ikke på sitet.
8. **To sponsornavne var forkerte i mit første udtræk**, fundet ved at validere
   hvert logo mod domænet i linket: `image001.jpg` er Kop & Kande, og `Thy.JPG`
   er Thy Sport — ikke Sparekassen Thy.

## Målt resultat

| | m-tha.dk i dag | Prototypen |
|---|---|---|
| Forside, blokerende | 672 KB HTML alene, før 213 billeder | 152–346 KB inkl. hero-foto |
| Forside, HTML | 687.871 bytes | 22 KB (5 KB gzip) |
| JavaScript | 41 scripts | 0 |
| Rigtige sider | 1 | 73 |
| Byggetid | — | ~3 sek |

## Om dataene

Spillernes og stabens **navne, årgange, portrætter, stabens roller og
sektioner samt alle 54 personlige sponsorkoblinger** er offentlige oplysninger
fra m-tha.dk. **Position, rygnummer, moderklub og uddannelse er eksempeldata**
— indsat for at vise felterne, og skal erstattes. Det præcise fødselsår
indenfor en årgang er også eksempeldata; selve årgangen er den rigtige.

Det står i et banner øverst på hver side og på hver spillerprofil.

## Herfra

`poc/src/data/akademi.ts` har samme form som Sanity-skemaet i forslaget.
Etape 2 skifter derfor kun datakilde — `truppen()` og `getCollection()` går fra
at læse lokale filer til at kalde Sanity, og siderne ændres ikke.
