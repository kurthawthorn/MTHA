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
│   ├── Stoppet
│   └── ⚠ Mangler fødselsår      ← fanger den fejl der koster et hold
├── Staben
│   ├── Professionelle
│   ├── Ansatte
│   ├── Bestyrelsen              ← akademiets egne tre sektioner
│   └── ⚠ Mangler rolle
├── Sponsorer
│   ├── Hovedsponsor
│   ├── Topsponsorer
│   ├── Sponsorer
│   ├── Samarbejdspartnere
│   └── ⚠ Mangler logo
└── Sæson, priser og satser      ← ét dokument
```

De tre ⚠-lister er ikke pynt. Uden fødselsår har en spiller intet hold og
falder ud af truppen — den fejl er ellers usynlig, indtil nogen spørger
hvorfor der mangler en spiller.

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

Kortlægningen fra `33.png` til det rigtige navn er lavet **én gang** maskinelt
ud af den nuværende side, og ligger i `tools/assets.json`. Den skal aldrig
laves igen.

## De fire ting man gør

### Ny spiller — ca. 40 sekunder

**Spillere → +** → navn og **fødselsår** → træk portrættet ind → rygnummer,
position, moderklub, uddannelse, sponsor → **Udgiv**.

Straks på det rigtige hold, i truppen, i filtrene og i forsidens tælling.

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
| `spiller.ts` | Spiller | Fødselsår er påkrævet; holdet udregnes af det |
| `hold.ts` | Hold | Defineret ved årgange, ikke ved en spillerliste |
| `person.ts` | Person | Trænere, ansatte og bestyrelse i **én** model |
| `sponsor.ts` | Sponsor | Ved ikke selv hvem den støtter |
| `saeson.ts` | Sæson | Ét dokument med alle priser og satser |

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

Under **HTTP Headers**:

```
Authorization: Bearer ghp_dit_token
Accept: application/vnd.github+json
Content-Type: application/json
```

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
