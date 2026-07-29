# Administrationen — sådan redigeres indholdet

To niveauer: hvad der virker i dag, og den rigtige løsning som ligger klar her.

## I dag: redigér i browseren på GitHub

Det virker allerede, og det kræver ingen opsætning. Indholdet ligger i
`poc/src/data/roster.json`, og et gem udløser en genudgivelse.

1. Åbn [roster.json på GitHub](https://github.com/kurthawthorn/MTHA/blob/main/poc/src/data/roster.json)
2. Tryk på blyanten
3. Ret, og tryk **Commit changes**
4. Efter ca. 2 minutter er ændringen live

Man får versionshistorik og kan rulle tilbage. Men det er JSON i et
tekstfelt: ét manglende komma og bygningen fejler. **Det er brugbart for en
udvikler — ikke noget man giver en holdleder.**

Derfor findes resten af denne mappe.

## Den rigtige løsning: Sanity Studio

Et rigtigt redigeringsvindue med felter, billedupload, versionshistorik og
dansk menu. Gratis for op til tre redaktører. Virker på telefonen.

**Alt er skrevet færdigt her. Der mangler ét projekt-id.**

### Opsætning — fire trin

```bash
# 1. Opret et gratis projekt på https://sanity.io/manage
#    Notér projekt-id'et, og lav et token under API -> Tokens (Editor-rettigheder)

# 2. Installér
cd sanity
npm install

# 3. Læg prototypens indhold ind — 132 dokumenter og 129 billeder
export SANITY_STUDIO_PROJECT_ID=dit-projekt-id
export SANITY_WRITE_TOKEN=sk...
python ../tools/fetch_assets.py   # billederne skal ligge lokalt først
node migrer.mjs

# 4. Start, og udgiv når det ser rigtigt ud
npm run dev      # http://localhost:3333
npm run deploy   # https://mtha.sanity.studio
```

Tokenet må ikke committes. `.env` er dækket af `.gitignore`.

### Hvad migreringen lægger ind

| Type | Antal |
|---|---|
| Hold | 2 |
| Spillere | 54 |
| Staben | 25 |
| Sponsorer og partnere | 50 |
| Sæson | 1 |
| Billeder | 129 |

Scriptet kan køres igen: dokumenterne får forudsigelige id'er, så en ny
kørsel opdaterer frem for at lave dubletter.

**Position, moderklub og uddannelse overføres bevidst IKKE.** De var
eksempeldata i prototypen, og det ville være forkert at lade dem se ægte ud i
det rigtige system. Felterne står tomme og udfyldes af akademiet.

### Menuen er bygget til akademiet

Sanity viser som standard bare en liste over dokumenttyper. Her er den skruet
sammen efter hvad folk skal finde:

```
Indhold
├── Nyheder                      ← øverst, fordi det bruges oftest
├── Hold og årgange
├── Spillere
│   ├── Alle aktive
│   ├── Landsholdsspillere       ← så en markering kan efterses samlet
│   ├── Stoppet
│   └── ⚠ Mangler fødselsår      ← fanger den fejl der koster et hold
├── Staben
│   ├── Professionelle
│   ├── Ansatte
│   ├── Bestyrelsen              ← akademiets egne tre sektioner
│   ├── ⚠ Mangler rolle
│   └── ⚠ Rolle med HTML-rester  ← fem roller er klippet over i udtrækket
├── Sponsorer
│   ├── Hovedsponsor
│   ├── Topsponsorer
│   ├── Sponsorer
│   ├── Samarbejdspartnere
│   └── ⚠ Mangler logo
└── Sæson, priser og satser      ← ét dokument
```

⚠-listerne er ikke pynt. Uden fødselsår har en spiller intet hold og falder ud
af truppen — den fejl er ellers usynlig, indtil nogen spørger hvorfor der
mangler en spiller.

**⚠ Rolle med HTML-rester** finder fem roller der blev klippet over midt i et
HTML-tag da indholdet blev hentet fra m-tha.dk: `Fysioterapeut </d`,
`Koordinator EUC Nordvest <`. Sitet renser resterne ved visning, så det ser
rigtigt ud — men de bør rettes ved kilden. Slet tegnene fra og med `<`.

Se også `Koordinator Morsø Gymnasium ST` — præcis 30 tegn, altså formentlig
klippet over midt i `STX`. Det er ikke rettet, fordi det er et gæt. Spørg
akademiet.

## Sådan hænger en spiller og et billede sammen

Det er den vigtigste forskel på i dag og bagefter.

### I dag

Billedet er en **fil i en fælles mappe**:

```
onewebmedia/
├── 33.png        ← Christian Guldhammer Højbak
├── 18.png        ← Gustav Bro Petersen
├── az.png        ← Hans Riisager Holst (bestyrelsen)
├── dada.png      ← Kenny Thomsen
└── asqasa.png    ← Jesper Kjær Nannerup
```

Sammenhængen mellem `33.png` og navnet findes kun i den alt-tekst, nogen
engang har tastet. Filen ved ikke selv, hvem den er. Derfor kan to personer
komme til at pege på samme fil, og en slettet fil ødelægger et billede uden
varsel. Da numrene slap op, blev de næste kaldt `az.png` og `asqasa.png`.

### Bagefter

Billedet er **et felt på personen**. Ingen fælles mappe, ingen filnavne:

```
Spiller: Christian Guldhammer Højbak
├── Navn          Christian Guldhammer Højbak
├── Fødselsår     2008
├── Portræt       [træk et foto herind]     ← billedet hører til HER
├── Position      Venstre back
└── Sponsor       → 3N Lakering
```

Man åbner spilleren, trækker fotoet ind, og de er bundet sammen for altid.

Hvad der sker automatisk ved upload:

1. Filen får et internt id og kan ikke forveksles
2. Redaktøren markerer ansigtet én gang (*hotspot*) — derefter beskæres
   miniature, spillerkort og profil korrekt hver gang
3. Billedet komprimeres til WebP i flere størrelser
4. Skiftes fotoet, opdateres det alle steder på én gang

> **Hotspottet virkede ikke før 29. juli 2026.** Sitet byggede billed-URL'erne
> med `crop=focalpoint`, men sendte ikke selve punktet med — og så falder Sanity
> tilbage på midten. Alle 79 portrætter er 600 × 900 med næsten ingen luft over
> hovedet, så en beskæring om midten skar toppen af hovedet af.
>
> Nu sendes punktet med, og er der ikke sat noget hotspot, holdes der fast i
> **toppen** af billedet i stedet for midten. Et portræt kan derfor ikke miste
> hovedet, uanset om nogen har husket at markere ansigtet.
>
> Markerer man alligevel ansigtet, styrer man beskæringen præcist — det er
> stadig værd at gøre på et foto der ikke er et almindeligt studieportræt.

Kortlægningen fra `33.png` til det rigtige navn er lavet **én gang** maskinelt
ud af den nuværende side, og ligger i `tools/assets.json`. Den skal aldrig
laves igen.

## Kladde og udgivet — det første man støder på

Åbner man et dokument, står felterne grå og kan ikke redigeres. Det er ikke en
fejl: man kigger på den **udgivne** version, og den er låst.

Øverst er der to faneblade:

```
● Published     den version besøgende ser. Låst.
● Draft         din arbejdskopi. Her redigerer du.
```

**Tryk Draft, ret, og tryk Publish.**

Det virker som en omvej, men det er den rigtige model for et akademi: en
holdleder kan skrive videre på en nyhed over flere dage, uden at halve
sætninger går live. Og det passer med webhooken — kladdeændringer starter
ingen bygning, kun Publish gør. Ellers ville sitet bygge om hvert par
sekunder mens nogen skriver.

Vis Lars det her først. Det er den ting der ellers får folk til at tro at de
ikke har rettigheder.

## Se siden mens du redigerer — “Se siden”

Øverst i studioet er der nu en fane ved siden af **Indhold**, der heder
**Se siden**. Den viser hjemmesiden i højre side og felterne i venstre.

Den kan tre ting, og de går begge veje:

| Man gør | Så sker der |
|---|---|
| Åbner en spiller under **Indhold** og trykker **Se siden** | forhåndsvisningen springer selv til netop den spillers profil |
| Klikker på en spiller ude i forhåndsvisningen | felterne til venstre skifter til den spiller |
| Klikker på et navn, et billede eller en sponsor på siden | netop det felt åbnes |

Nederst i venstre side står **“Hvor vises dette”** med alle de sider dokumentet
optræder på. En nyhed står fx tre steder: på sin egen side, på nyhedsoversigten
og på forsiden blandt de tre nyeste. Man kan klikke sig mellem dem.

### Den ene begrænsning — læs den, ellers ser det ud som en fejl

**Forhåndsvisningen viser den udgivne side, ikke din kladde.**

Skriver du i et felt, ændrer siden til højre sig ikke. Den skifter ca. to
minutter efter du har trykket **Udgiv**.

Det er ikke en fejl der er overset. Hjemmesiden er *statisk*: hver af de 76
sider er en færdig fil, bygget da nogen sidst trykkede Udgiv, og der findes
ingen server der kan tegne en side der ikke er udgivet endnu. Netop derfor
koster sitet ingenting at have, kan ikke gå ned, og kan ikke blive langsomt.

Skal kladdevisning med, er vejen en separat forhåndsvisning på Vercel eller
Cloudflare ved siden af. Det live site kan blive som det er. Det kræver et
token i drift og hosting med kørende kode — altså den udgift og den
driftsopgave løsningen ellers ikke har.

**Det værktøjet ER godt til**, også uden kladdevisning: at finde det rigtige
felt. Man peger på det ude på siden i stedet for at skulle vide hvad dokumentet
heder. Og man kan se konsekvensen af en rettelse — retter du ét beløb i
sæsondokumentet, viser listen at det slår igennem på tre sider.

### Sådan peger man forhåndsvisningen på din egen maskine

Kører du Astro lokalt og arbejder på layoutet, kan forhåndsvisningen vise din
egen server i stedet for det live site. Læg to linjer i `sanity/.env`, som er
dækket af `.gitignore`:

```
SANITY_STUDIO_SITE_ORIGIN=http://localhost:4321
SANITY_STUDIO_SITE_BASIS=
```

`SITE_BASIS` skal være tom, fordi Astro lokalt kører på roden, mens GitHub
Pages lægger sitet under `/MTHA/`. Uden dem peger værktøjet på det live site,
og det er det rigtige for Lars.

> **Husk:** stop Astro-serveren før du kører `sanity login`. Sanity CLI binder
> port 4321 til sit callback, og ellers får du 401.

### Hvad der kan gå i stykker, og hvordan man ser det

Ruterne — koblingen fra en adresse til et dokument — er det led der er
nemmest at få forkert, fordi der både er en basissti (`/MTHA/`) og skråstreg
til slut i spil. Fejler de, sker der ikke noget synligt: forhåndsvisningen
virker, felterne skifter bare ikke med.

Derfor måles de:

```bash
cd sanity
npm run tjek
```

Tjekket kører automatisk som del af `npm run build` og `npm run deploy`, og
**stopper udgivelsen** hvis en rute ikke rammer. Se `tools/tjek-ruter.mjs`.

## De fire ting man gør

### Ny spiller — ca. 40 sekunder

**Spillere → +** → navn og **fødselsår** → træk portrættet ind → rygnummer,
position, moderklub, uddannelse, sponsor → **Udgiv**.

Straks på det rigtige hold, i truppen, i filtrene og i forsidens tælling.

### Marker en landsholdsspiller

Slå **Har spillet på landsholdet** til på spilleren. Så kommer der et
dannebrogsmærke øverst til højre på portrættet — både på spillerkortet i
truppen og på profilsiden.

Udfylder man også **Hvilket landshold** (fx `U18`), står det på mærket; ellers
står der bare “Landshold”. Feltet er skjult indtil kontakten er slået til.

Der er ingen standardværdi, og intet gættes. Det er en oplysning der står på et
ungt menneskes cv, og den skal komme fra akademiet.

Listen **Spillere → Landsholdsspillere** viser alle der er markeret, så en
markering sat ved en fejl kan findes igen.

### Ny sponsor — ca. 30 sekunder

**Sponsorer → +** → navn, logo, hjemmeside, niveau → **Udgiv**.

Logoet står straks i den rigtige række og linker til deres side. Skal
sponsoren støtte en elev, sættes det **på spilleren** — så tælles “støtter N
spillere” af sig selv.

### Nogen stopper

Slå **Aktiv** fra. Forsvinder fra sitet straks, men bliver i registret, så
gamle nyheder ikke får døde links og en genoptaget aftale er ét klik.
**Man sletter ikke.**

### Ny sæson — spillerne røres ikke

Et hold er defineret ved hvilke **fødselsår** det består af. Fødselsåret er
stamdata der aldrig ændrer sig, så holdtilknytningen udregnes.

```
Hold U17   årgange [2008, 2009]   →   [2009, 2010]
Hold U19   årgange [2006, 2007]   →   [2007, 2008]
```

Målt på prototypen:

| | Før | Efter |
|---|---|---|
| U17 | 25 spillere | 12 spillere |
| U19 | 29 spillere | 28 spillere |

De 13 født i 2008 rykkede selv op fra U17 til U19. De 14 født i 2006 faldt ud
af truppen. **Ingen spillere blev redigeret.**

Spiller en ung med op eller ned, sættes **Spiller på andet hold** på netop den
spiller. Det overstyrer udregningen for én person uden at røre modellen.

## Feltopdelingen

Se den visuelt på [/admin-demo](https://kurthawthorn.github.io/MTHA/admin-demo/)
med faktiske data for alle tre korttyper.

| | Hvornår |
|---|---|
| **Stamdata** | Udfyldes én gang, ændres aldrig |
| **Sæsondata** | Kan ændre sig undervejs eller mellem sæsoner |
| **Udregnet** | Kan ikke redigeres — systemet finder selv værdien |

Det er den grænse der afgør om siden forfalder. Alt der er udregnet, kan ikke
komme til at passe dårligt.

## Skemaer

| Fil | Dokument | Bemærk |
|---|---|---|
| `nyhed.ts` | Nyhed | Færrest mulige felter — bruges oftest |
| `spiller.ts` | Spiller | Fødselsår er påkrævet; holdet udregnes af det. `landshold` tegner dannebrogsmærket |
| `hold.ts` | Hold | Defineret ved årgange, ikke ved en spillerliste |
| `person.ts` | Person | Trænere, ansatte og bestyrelse i **én** model |
| `sponsor.ts` | Sponsor | Ved ikke selv hvem den støtter |
| `saeson.ts` | Sæson | Ét dokument med alle priser og satser |

### Forhåndsvisningen

| Fil | Hvad |
|---|---|
| `presentation/site.ts` | Hvor sitet ligger — origin og basissti, og hvordan man peger på localhost |
| `presentation/steder.ts` | Hvor vises dette dokument? Én liste pr. dokumenttype |
| `presentation/dokumenter.ts` | Den anden vej: fra en adresse til dokumentet |
| `tools/tjek-ruter.mjs` | Måler at ruterne rammer. Stopper `build` og `deploy` |

Ude på sitet hører `poc/src/lib/redigering.ts` og
`poc/src/components/VisuelRedigering.astro` til samme mekanik.

**Person er én model med vilje.** Jesper Kjær Nannerup er både
bestyrelsesmedlem og uddannelseskoordinator på Morsø Gymnasium. Med tre
modeller skulle han oprettes to gange.

**Sæson er det vigtigste dokument.** Da prototypen blev bygget, viste det sig
at prisen for ophold stod i tre versioner: 2.495 kr. på forsiden af m-tha.dk,
2.395 kr. i forældrebrochuren og 2.255 kr. i visionsbrochuren. Ingen af dem
var forkerte da de blev skrevet — de blev bare aldrig rettet samtidig. Med ét
dokument kan det ikke gentage sig.

## Hvorfor Sanity og ikke en almindelig database?

Fordi spørgsmålet ikke er “hvor ligger dataene”, men “hvem retter dem”.

En almindelig database — MySQL, Postgres, Supabase — kræver at nogen bygger en
brugerflade ovenpå, før en holdleder kan tilføje en spiller. Sanity **er**
databasen og brugerfladen på én gang: skemaerne i `schemas/` er samtidig
definitionen af felterne og af den formular redaktøren udfylder.

- **Ingen layout at ødelægge.** Der er kun felter. En frivillig kan ikke flytte
  en kolonne eller vælge en anden skrifttype.
- **Versionshistorik.** Man kan se hvem der rettede hvad, og rulle tilbage.
- **Billedbehandling er indbygget** — beskæring, komprimering, formater.
- **Gratis** for op til tre redaktører.
- **Virker på telefonen**, uden app.

Prisen er at der skal en udvikler til for at ændre *hvilke felter* der findes.
Men det er sjældent — og det er netop den begrænsning der gør at siden ikke
kan forfalde.

## Webhook: et Udgiv skal opdatere hjemmesiden

Sitet læser fra Sanity, men det sker på **byggetidspunktet**. Uden en webhook
ville en rettelse først slå igennem næste gang nogen pusher kode — og så er vi
lige vidt.

Workflowet er klar til det. Der mangler to ting, som kun kan laves med et login.

### 1. Et GitHub-token

Opret et **fine-grained personal access token** på
[github.com/settings/personal-access-tokens](https://github.com/settings/personal-access-tokens):

| Felt | Værdi |
|---|---|
| Navn | `sanity-udgiver` |
| Repository access | Kun `kurthawthorn/MTHA` |
| Permissions | **Contents: Read and write** |
| Udløber | 1 år (sæt en påmindelse) |

`Contents: write` er det mindste der virker til `repository_dispatch`. Giv ikke
mere end det.

### 2. Webhooken i Sanity

På [sanity.io/manage/project/g4s1nwak/api/webhooks](https://sanity.io/manage/project/g4s1nwak/api/webhooks)
→ **Create webhook**:

| Felt | Værdi |
|---|---|
| Name | `Genopbyg hjemmesiden` |
| URL | `https://api.github.com/repos/kurthawthorn/MTHA/dispatches` |
| Dataset | `production` |
| Trigger on | Create, Update, Delete |
| HTTP method | `POST` |
| API version | **`v2025-02-19`** — den nyeste i rullelisten |
| Projection | `{"event_type":"sanity-udgivelse"}` |
| Trigger when versions are modified | **fravalgt** |
| Secret | **tom** |

Under **HTTP Headers** — tre rækker. Bemærk at NAME og VALUE er to felter:

| NAME | VALUE |
|---|---|
| `Authorization` | `Bearer github_pat_dit_token` |
| `Accept` | `application/vnd.github+json` |
| `Content-Type` | `application/json` |

**Intet kolon i NAME.** Kolonet er kun adskilleren i rå HTTP; her er felterne
delt op, så `Authorization:` bliver et ugyldigt headernavn.

**`Bearer ` skal med i VALUE**, med mellemrum efter. Uden skemaet svarer
GitHub 401, selvom tokenet er rigtigt.

Sæt **Filter** til `!(_type match "system.*")`, så interne systemdokumenter
ikke starter en bygning.

**Tre faldgruber på den skærm:**

*API version* er ikke den samme som klientens API-version i koden. Feltet
her styrer kun hvilken GROQ-version filteret og projectionen fortolkes med.
Vælg den nyeste; vores udtryk er simple og virker i begge.

*Trigger webhook when versions are modified* skal være **fravalgt**. Slået til
fyrer webhooken hver gang nogen retter i en kladde — altså potentielt hvert
par sekunder mens en redaktør skriver. Vi vil kun bygge når der trykkes Udgiv.

*Secret* skal stå **tomt**. Feltet er til modtagere der selv verificerer
afsenderen. GitHub gør det ikke; den stoler på `Authorization`-headeren.

### Sådan virker kæden

```
Lars trykker Udgiv i studioet
   → Sanity sender webhooken til GitHub
   → GitHub Actions starter "Byg og udgiv prototypen"
   → sitet bygges med det nye indhold
   → live efter ca. 2 minutter
```

### Sikkerhedsnet

Workflowet kører også **hver nat kl. 04:12**. Skulle webhooken være slået fra
eller fejle, er indholdet aldrig mere end et døgn gammelt. Det er billigt at
have, og det fjerner en hel klasse af fejl der ellers er svære at opdage.

### Sådan ser du om det virker

Øverst på hver side står en indikator i POC-banneret:

- **● Indhold fra Sanity** (grøn) — sidste bygning hentede fra Sanity
- **● Reservedata** (rød) — Sanity kunne ikke nås, `roster.json` blev brugt

Bygningen fejler aldrig fordi Sanity er nede. Den falder tilbage og skriver en
advarsel i loggen. Sitet er altid oppe; i værste fald med indhold der er en
smule gammelt.

## Herfra

**Nyheder mangler stadig.** De ligger som markdown-filer i
`poc/src/content/nyheder/`, ikke i Sanity. Skemaet `nyhed.ts` er klar, men
indholdet er ikke migreret, og siderne læser stadig fra filerne. Det er det
sidste led — og det vigtigste for Lars, fordi nyheder er det man laver oftest.
