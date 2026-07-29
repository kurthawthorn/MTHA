# Handoff — MTHA

Status ved sessionens afslutning, 28. juli 2026. Skrevet til den næste der
skal arbejde videre, uanset om det er et menneske eller en ny AI-session.

---

## Hvad det er

Et uopfordret forslag til en ny hjemmeside for **Mors-Thy Håndbold Akademi**.
Kurt Hawthorns søn Tobias er netop startet på akademiet; akademiet er ikke
IT-fokuseret, og deres nuværende side er bygget i One.coms træk-og-slip-editor.

**Det er ikke akademiets officielle materiale.** Der er ikke indgået nogen
aftale. Alt er lavet som oplæg til en samtale med daglig leder Lars Svane
Nielsen.

## Hvad der kører lige nu

| | |
|---|---|
| Live site | https://kurthawthorn.github.io/MTHA/ |
| Redigeringsvindue | https://mtha.sanity.studio |
| Repo | https://github.com/kurthawthorn/MTHA (offentligt) |
| Sanity-projekt | `g4s1nwak`, datasæt `production` (offentligt læsbart) |

Kæden virker ende til ende: **ret i studioet → tryk Udgiv → siden er opdateret
efter ~2 minutter.** Bevist flere gange. Ingen terminal involveret.

## Sådan hænger det sammen

```
Sanity Studio  ──webhook──▶  GitHub Actions  ──▶  GitHub Pages
 (indholdet)                  (bygger med Astro)     (det live site)
```

- `poc/` — Astro-sitet. 76 sider, statisk, ~29 KB forside, 983 bytes JavaScript.
- `sanity/` — studioet. Ti dokumenttyper. Alt indhold ligger her, intet i kode.
- `tools/` — scripts der henter billeder og logoer fra m-tha.dk.
- Bygningen henter kun de 20 redaktionelle fotos fra m-tha.dk; portrætter,
  logoer og nyhedsbilleder kommer fra Sanitys CDN.

## Det du skal vide før du rører noget

Fem ting kostede tid at finde. De er alle rettet, men forklaringen er værd at
kende, fordi de kan komme igen.

**1. Astros byggecache lyver om udgivelser.**
Astro genbruger cachede sider når kildefilerne er uændrede — og en ændring i
Sanity ændrer ingen fil. `npm run build` rydder derfor cachen først
(`poc/tools/ryd-cache.mjs`). **Cach aldrig `.astro` i CI** for at spare tid;
så holder Udgiv op med at virke, og bygningen melder stadig succes.

**2. Sanitys CDN lyver også.**
Webhooken fyrer i samme sekund som Udgiv, og bygningen starter få sekunder
efter — hvor CDN'en kan levere den forrige version. `useCdn: false` i
`poc/src/lib/sanity.ts`. Lad den stå.

**3. `position: relative` på en `<dialog>` ødelægger den.**
Det overskriver browserens `position: fixed`, og modalen falder ned i det
normale sidflow — altså øverst på siden. På mobil betyder det at man skal
rulle op for at se den.

**4. `vh` er forkert på mobil.** Brug `dvh`. Adresselinjen ændrer højden på
viewporten, og `vh` regner med den største.

**5. Skrifter der kun findes på Windows.**
Den oprindelige display-skrift var Bahnschrift — som ikke findes på iOS,
Android eller macOS. Nu bruges selvhostet Barlow Condensed i `poc/public/skrift/`.

## Tjekket der kører af sig selv

`poc/tools/tjek-design.mjs` kører som del af `npm run build` og **stopper
bygningen** hvis noget er galt. Den måler farvekontrast, alt-tekster,
overskriftshierarki, berøringsmål og sidens vægt — altså det man ikke kan se
ved at kigge.

Den erstatter ikke øjne på siden. To fejl blev fundet af brugeren, ikke af
scriptet: modalen på mobilen og manglende marginer.

## Åbne punkter

### 1. To hold slås om årgang 2009 — skal rettes

Der ligger tre hold i Sanity:

| Hold | Årgange |
|---|---|
| U17 | 2008, 2009 |
| U19 | 2006, 2007 |
| **U17-1** | **2010, 2009** |

U17-1 blev oprettet for at rumme **Tobias Hawthorn Trærup (årgang 2010)**, som
er tilføjet i studioet. Men fordi U17-1 også hævder 2009, og `holdFor()` tager
det første hold der matcher, er de 12 spillere født i 2009 flyttet væk fra U17.

**U17 viser 13 spillere i stedet for 25**, og forsiden tæller 55.

Løsningen er at fjerne **2009** fra ét af de to hold — sandsynligvis fra
U17-1, hvis det skal være et rent 2010-hold. Bygningen advarer allerede:

```
[hold] Årgang 2009 findes på flere hold: d268b965-…, u17.
```

U17-1 har desuden ingen `raekkefoelge`, så dens plads i rækken er tilfældig,
og et auto-genereret id, så adressen bliver `/hold/d268b965-…`. Overvej at
oprette den på ny med et pænt id.

### 2. Sikkerhed og persondata

- Repoet er **offentligt**, og adressen `kurthawthorn.github.io/MTHA` er gætbar.
- Der ligger portrætter af **54 mindreårige** samt opdigtede oplysninger om dem
  (position, moderklub, uddannelse). `robots.txt` og `noindex` holder Google
  væk, men det er ikke privat.
- **Dette er Kurts beslutning, taget bevidst.** Den er nævnt for ham flere
  gange. Lars bør informeres.
- Et GitHub-token blev synligt i et skærmbillede tidligt i forløbet. Kurt blev
  bedt om at slette og gendanne det; det er uvist om det er sket.
- `sanity/.env` indeholder et skrivetoken og er dækket af `.gitignore`.
  **Committ det aldrig.**

### 3. Ting der er skrevet, men ikke bygget

- **Presentation mode** i Sanity — visuel redigering hvor Lars ser siden ved
  siden af felterne. Kurt savnede netop det. Forudsætningen er på plads: alt
  indhold ligger i Sanity.
- **Instagram-import.** Feltet `kilde` skelner allerede mellem `cms` og
  `instagram`. Anbefalingen var at vente: skriv i Sanity indtil I kan se at
  studioet står stille. Instagram Basic Display API lukkede december 2024;
  erstatningen kræver en Meta-app og en Professional-konto.
- **Trænerstab og trupper på mesterskaberne.** Felterne findes, men står tomme
  — oplysningerne findes ikke offentligt.
- **Positioner, moderklub og uddannelse på de 54 spillere.** Bevidst ikke
  migreret; det var eksempeldata, og det ville være forkert at lade dem se
  ægte ud. Skal udfyldes af akademiet.

### 4. Fundet i akademiets eget materiale — bør nævnes for Lars

- **Prisen for ophold står i tre versioner:** 2.495 kr. på m-tha.dk, 2.395 kr.
  i forældrebrochuren, 2.255 kr. i visionsbrochuren.
- **Privatlivspolitikken er forældet** — dataansvarlig står som "Sports College
  Mors" med en gammel adresse.
- **Hjemmeboende-muligheden** (595–695 kr./md) står ikke på hjemmesiden.
- **Deres bedste argument var begravet:** "17 af 19 spillere i ligatruppen
  kommer herfra" stod nederst på side 1 i en PDF.

## Kom i gang

```powershell
cd C:\Python\MTHA\poc
npm install
python ..\tools\fetch_assets.py fotos    # 20 fotos; resten kommer fra Sanity
npm run dev                              # http://localhost:4321
npm run build                            # bygger + kører designtjekket

cd C:\Python\MTHA\sanity
npm install
npm run dev                              # http://localhost:3333
npm run deploy                           # udgiver til mtha.sanity.studio
```

**Vigtigt:** Sanity CLI's login vil binde port 4321 til sit callback. Stop
Astro-serveren først, ellers får du 401.

Migreringsscripts i `sanity/`: `migrer.mjs` (spillere, stab, sponsorer),
`migrer-nyheder.mjs`, `migrer-indhold.mjs` (værdier, uddannelser, trofæer).
Alle kan køres igen uden at lave dubletter.

## Om samarbejdet med Kurt

- Skriver dansk, forventer dansk svar.
- Går hurtigt frem og stiller korte spørgsmål. Svar konkret.
- Han fanger visuelle fejl som måleværktøjer ikke kan se — tag dem alvorligt
  frem for at forsvare koden.
- Han beder om at få lov at bestemme selv om afvejninger (fx offentligt repo
  med børns billeder). Nævn konsekvensen én gang, og gå så videre.

## Læs også

- `README.md` — projektets opbygning og målte tal
- `sanity/README.md` — hele redaktørvejledningen, inkl. webhook-opsætning og
  faldgruberne i Sanitys brugerflade
- `poc/src/data/akademi.ts` — datalaget; kommentarerne forklarer
  årgangsmodellen
- `poc/src/data/saeson.ts` — alt der ændrer sig fra sæson til sæson
