# Handoff — MTHA

Status ved sessionens afslutning, 29. juli 2026. Skrevet til den næste der
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

- `poc/` — Astro-sitet. 76 sider, statisk, ~31 KB forside, 2,7 kB JavaScript.
- `sanity/` — studioet. Ti dokumenttyper. Alt indhold ligger her, intet i kode.
  `sanity/presentation/` er forhåndsvisningen — se nedenfor.
- `tools/` — scripts der henter billeder og logoer fra m-tha.dk.
- **Bygningen henter ingen billeder fra m-tha.dk.** Alt ligger i Sanity. Kun de
  tre underskrevne PDF'er hentes, fordi de er filer og ikke indhold.

**Hvorfor der står React i `poc/package.json`.** Overlejringen til Sanitys
Presentation mode (`@sanity/visual-editing`) er bygget med React, og den bundles
derfor med. Den ligger i en separat fil på 784 KB, som **kun** hentes hvis siden
ligger i en iframe — altså kun for en redaktør inde i studioet. En besøgende
kører fire linjer der giver `false` og henter aldrig andet. Sitet er stadig
statisk og har stadig ingen komponenter der hydreres.

## Det du skal vide før du rører noget

Ni ting kostede tid at finde. De er alle rettet, men forklaringen er værd at
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

**6. Sanity sender ikke hotspottet af sig selv.**
`crop=focalpoint` i en billed-URL betyder ikke “brug redaktørens hotspot”. Punktet
skal med som `fp-x` og `fp-y`, ellers falder Sanity tilbage på midten. Det stod
i både kode og vejledning at hotspot-funktionen virkede; den var i praksis slået
fra i et halvt år. Fordi alle 79 portrætter er 600 × 900 med 1–2 % luft over
hovedet, skar en beskæring om midten toppen af hovedet af på hvert enkelt.

Nu hentes `portraet.hotspot{x, y}` med i forespørgslen, og findes der ikke noget
hotspot, holdes beskæringen fast i **toppen**. Se `portraetAnker()` i
`poc/src/lib/sanity.ts`.

**7. Astros scopede CSS følger ikke markupen når man kopierer den.**
Blokken “17 af 19 spillere i ligatruppen kommer herfra” var kopieret fra
`/vaerdier` til forsiden — men CSS'en blev efterladt, og i Astro gælder en fils
`<style>` kun i den fil. Akademiets stærkeste argument stod derfor som fire
linjer understreget blå linktekst midt på forsiden.

Ingen af de automatiske tjek kunne fange det: kontrasten var fin, alt-teksterne
var på plads, overskriftshierarkiet var korrekt. Det var bare grimt. **Kopierer
du markup mellem to `.astro`-filer, så tag reglerne med — eller læg dem i
`global.css`.**

**8. Bygningen hentede 149 filer for at bruge 13.**
Workflowet kørte `python tools/fetch_assets.py` uden argumenter, altså ALLE
grupper: 149 billeder og 3 PDF'er, hver gang. HANDOFF påstod at kun de 20
redaktionelle fotos blev hentet — det passede ikke. Portrætterne og logoerne kom
allerede fra Sanitys CDN, så de 129 blev hentet uden at nogen så på dem.

Det kostede 36 af bygningens 65 sekunder. De 18 fotos ligger nu i Sanity, og
trinnet henter kun PDF'erne. **Læs efter i workflowet, ikke i den her fil, hvis
du er i tvivl om hvad der faktisk sker.**

**9. `data-sanity`, ikke “stega”.**
Sanity kan mærke redigerbar tekst på to måder. Stega indlejrer usynlige tegn i
selve teksten — nemt at slå til, men tegnene ryger med ud i sidetitler,
alt-tekster, meta-beskrivelser og den strukturerede data Google læser, og de
følger med når nogen kopierer et navn ud af siden.

Her bruges `data-sanity`-attributter i stedet. De ligger uden for teksten,
koster ca. 90 tegn pr. mærket element, og der findes ingen bygningstilstand der
kan blive glemt i den forkerte stilling. Se `poc/src/lib/redigering.ts`.

## Tjekkene der kører af sig selv

**`poc/tools/tjek-design.mjs`** kører som del af `npm run build` og **stopper
bygningen** hvis noget er galt. Den måler farvekontrast, alt-tekster,
overskriftshierarki, berøringsmål og sidens vægt — altså det man ikke kan se
ved at kigge.

**`sanity/tools/tjek-ruter.mjs`** kører som del af `npm run build` og
`npm run deploy` i `sanity/`, og **stopper udgivelsen** hvis en rute i
Presentation mode ikke rammer. Ruterne er nemme at få forkert, fordi der både er
en basissti (`/MTHA/`) og skråstreg til slut i spil — og en fejl er tavs:
forhåndsvisningen virker, felterne skifter bare ikke med.

Tjekkene erstatter ikke øjne på siden. Fem fejl er nu fundet af brugeren eller
ved at kigge, ikke af scripterne: modalen på mobilen, manglende marginer, de
afskårne hoveder på portrætterne, den ustylede blok på forsiden, og de fem
roller der stod som `Fysioterapeut </d`.

Ét tal blev også rettet i selve tjekket: “JavaScript på forsiden” talte kun
indholdet mellem `<script>` og `</script>`. Da overlejringen kom til som en
ekstern fil, blev tallet ved med at melde 983 bytes mens browseren hentede
2.739. **Et tal der ikke ændrer sig når virkeligheden gør, er værre end intet
tal** — man tror man har målt noget.

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

### 2. Fem roller i staben er klippet over — skal rettes i studioet

Udtrækket fra m-tha.dk klippede stabens roller over midt i et HTML-tag. Fem af
de 25 stod derfor på sitet som:

| Person | Står som | Skal formentlig være |
|---|---|---|
| Anders Hove | `Fysioterapeut </d` | Fysioterapeut |
| Sara Kankelborg Poulsen | `Fysioterapeut </d` | Fysioterapeut |
| Helle F. Thøgersen | `Fysioterapeut </` | Fysioterapeut |
| Maja Rysz Clausen | `Fysioterapeut og diætist </` | Fysioterapeut og diætist |
| Elsebeth Overgaard | `Koordinator EUC Nordvest <` | Koordinator EUC Nordvest |

Kilden er rettet i `tools/assets.json` og `poc/src/data/roster.json`, og sitet
renser resterne ved visning, så det ser rigtigt ud nu. **Men Sanity indeholder
stadig de gamle værdier**, og dem kan kun en redaktør rette — derfor er de ikke
ændret her. Listen **Staben → ⚠ Rolle med HTML-rester** i studioet finder dem.

Kør IKKE `migrer.mjs` for at rette det. Den skriver alle 132 dokumenter og 129
billeder om, og ville overskrive de hotspots og felter nogen har sat i studioet
siden. Fem felter rettes hurtigere i hånden.

**To ting mere, som er værd at kigge på men IKKE er rettet:**

- Jesper Kjær Nannerup står som `Koordinator Morsø Gymnasium ST` — præcis 30
  tegn, altså formentlig klippet over midt i `STX`. Det er et gæt, og derfor
  ikke rettet. **Spørg akademiet.**
- Rune Lanng står som `Cheftræner u17` med lille u, mens de andre skriver
  `U19`. Ren stavemåde, men det ses.

Bemærk at værdierne i Sanity IKKE er de samme som i `tools/assets.json` — nogle
er blevet ryddet op undervejs. `assets.json` er kun reservekilden; **Sanity er
sandheden**. Slå altid op i Sanity før du beskriver hvad der står på sitet.

Bygningen skriver nu en advarsel i loggen, og designtjekket stopper bygningen
hvis der dukker HTML-rester op i indhold nogen andet steds.

### 3. Sikkerhed og persondata

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

### 4. Billederne ligger nu i Sanity — 18 pladser

Fanen **Billeder** i studioet har 18 navngivne pladser: “Forsiden — det store
billede øverst”, “Holdfoto U19”, “Faciliteter — fælleskøkkenet”. Lars vælger
pladsen, trækker et foto ind og trykker Udgiv.

Flyttet dertil af `sanity/migrer-fotos.mjs`. **Kør den ikke igen uden grund** —
den springer over pladser der har et billede, men `--tving` overskriver, og så
ryger et foto Lars har skiftet.

To ting mangler stadig:

- **Galleriet “Hverdagen” er seks faste pladser, ikke et galleri.** Før hentede
  det alle fotos i kategorien `socialt`, altså et vilkårligt antal. Nu er det
  seks. Ærligere over for layoutet — gitteret er bygget til seks — men Lars kan
  ikke tilføje et syvende billede. Et rigtigt galleri er den næste ting at bygge.
- **`dm-guldhatte` og `drone-1` har ingen plads.** De blev hentet fra m-tha.dk,
  men vises ikke nogen steder. Skal de bruges, skal der først være et sted.

### 5. Presentation mode er bygget — med én kendt begrænsning

Fanen **“Se siden”** i studioet viser hjemmesiden ved siden af felterne.
Navigationen går begge veje: åbner Lars en spiller, springer forhåndsvisningen
til den spillers profil; klikker han på et navn ude på siden, åbnes netop det
felt. Filerne ligger i `sanity/presentation/`, og hele redaktørforklaringen står
i `sanity/README.md`.

**Forhåndsvisningen viser den UDGIVNE side, ikke kladden.** Sitet er statisk —
hver side er en færdig fil bygget da nogen sidst trykkede Udgiv — og der findes
ingen server der kan tegne en kladde. Rettelser dukker op ca. to minutter efter
Udgiv, ikke mens man skriver.

Det er en bevidst afvejning. Kladdevisning kræver en server der kan læse
kladder, altså et token i drift og hosting med kørende kode — og det er præcis
den udgift og driftsopgave løsningen ellers ikke har. **Vejen videre, hvis det
skal med:** en forhåndsvisning på Vercel eller Cloudflare ved siden af, hvor
`previewUrl.previewMode.enable` peger på en rute der slår kladdetilstand til.
Det live site kan blive som det er.

**Sig begrænsningen højt når du viser det til Lars.** Ellers ser han et felt der
ikke slår igennem, og konkluderer at værktøjet er i stykker.

### 6. Ting der er skrevet, men ikke bygget

- **Instagram-import.** Feltet `kilde` skelner allerede mellem `cms` og
  `instagram`. Anbefalingen var at vente: skriv i Sanity indtil I kan se at
  studioet står stille. Instagram Basic Display API lukkede december 2024;
  erstatningen kræver en Meta-app og en Professional-konto.
- **Trænerstab og trupper på mesterskaberne.** Felterne findes, men står tomme
  — oplysningerne findes ikke offentligt.
- **Positioner, moderklub og uddannelse på de 54 spillere.** Bevidst ikke
  migreret; det var eksempeldata, og det ville være forkert at lade dem se
  ægte ud. Skal udfyldes af akademiet.
- **Landsholdsmarkeringen er ikke sat på nogen spiller.** Feltet, mærket og
  listen i studioet virker og er efterprøvet — men ingen af de 54 er markeret,
  fordi ingen har oplyst hvem der har spillet landshold. Det er ikke et felt man
  gætter på: det står på et ungt menneskes cv. **Lars slår det til.**
- **En foldemenu i headeren på telefon.** Menuen har syv punkter og falder i to
  linjer under ca. 700 px. Sammen med mærke og sponsorlogo blev den klæbende
  bjælke 156 px høj — en femtedel af skærmen, permanent. Rettelsen er at
  headeren ruller væk på telefon. Den rigtige løsning er en foldemenu, så
  bjælken kan blive ved at klæbe og være 60 px høj; den kræver en knap-tilstand
  der annonceres korrekt for skærmlæsere, og det er et selvstændigt stykke
  arbejde.
- **Tabellerne på `/bolig` og `/uddannelse` ruller vandret på telefon** inde i
  `.tblwrap`, uden at der er noget der viser det. Mekanikken virker — man kan
  swipe — men 40 % af boligtabellen er skjult uden varsel. En skyggekant i
  siden ville sige det.

### 7. Fundet i akademiets eget materiale — bør nævnes for Lars

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
npm run tjek                             # måler ruterne i Presentation mode
npm run deploy                           # tjekker + udgiver til mtha.sanity.studio

node migrer-fotos.mjs                    # tørkørsel — viser hvad den ville gøre
node migrer-fotos.mjs --skriv            # ENGANGSFLYTNING, er allerede kørt
```

**Sådan så mobillayoutet efter ved 375 px.** Der er ingen browser i bygningen,
så gennemgangen blev lavet med Chrome via DevTools-protokollen: fuldsides
skærmbilleder med `--force-prefers-reduced-motion` (ellers står halvdelen af
siden med `opacity: 0`, fordi indtoningerne ikke er udløst), plus en måling af
hvert element der stikker ud over viewporten. Scripterne lå i en midlertidig
mappe og er ikke committet — de tog under en time at skrive igen, hvis nogen
skal gøre det samme. Det vigtige er de to indstillinger:
`Emulation.setDeviceMetricsOverride` skal sættes **igen efter** navigationen,
ellers gælder den ikke, og `captureBeyondViewport` henter ikke `loading="lazy"`
-billeder — tomme billedfelter i et skærmbillede er derfor ikke en fejl.

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
