# Administrationen — sådan styres indholdet

Skemaerne i `schemas/` er den database, prototypen skal bygge på i etape 2.
De er skrevet ud, så modellen kan læses og diskuteres, før der bygges.

## Hvordan hænger en spiller og et billede sammen?

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

Sammenhængen mellem `33.png` og "Christian Guldhammer Højbak" findes kun ét
sted: i den alt-tekst, nogen engang har tastet ind ved siden af billedet. Filen
ved ikke selv, hvem den er. Derfor:

- man skal huske eller gætte hvilket nummer der er hvem
- to personer kan komme til at pege på samme fil
- sletter man en fil, går billedet i stykker uden varsel
- da numrene slap op, blev de næste kaldt `az.png`, `dada.png` og `asqasa.png`

### Bagefter

Billedet er **et felt på spilleren**. Der er ingen fælles mappe at holde styr
på, og ingen filnavne at huske:

```
Spiller: Christian Guldhammer Højbak
├── Navn          Christian Guldhammer Højbak
├── Fødselsår     2008
├── Portræt       [træk et foto herind]     ← billedet hører til HER
├── Position      Venstre back
└── Sponsor       → 3N Lakering
```

Man åbner spilleren, trækker fotoet ind i feltet, og så er de bundet sammen
for altid. Filnavnet er uden betydning — man ser aldrig et filnavn.

**Hvad der sker automatisk, når fotoet lægges ind:**

1. Filen får et internt id og kan ikke forveksles med en anden
2. Redaktøren markerer ansigtet én gang (*hotspot*), og derefter beskæres
   miniature, spillerkort og profilbillede korrekt hver gang
3. Billedet komprimeres til WebP i flere størrelser — telefonen får en lille
   version, en stor skærm en større
4. Alt-teksten udfyldes med spillerens navn, så skærmlæsere kan læse den
5. Skiftes fotoet ud, opdateres det alle steder på én gang

Det er derfor `poc/src/data/roster.json` findes: kortlægningen fra `33.png` til
det rigtige navn er lavet **én gang** maskinelt ud af den nuværende side. Den
skal aldrig laves igen.

## Sådan tilføjer man en spiller

1. Åbn `m-tha.dk/admin` — også på en telefon
2. Tryk **Spillere → +**
3. Udfyld navn og **fødselsår** (påkrævet — se nedenfor)
4. Træk portrættet ind fra kamerarullen
5. Udfyld position, rygnummer, moderklub, uddannelse og personlig sponsor
6. Tryk **Udgiv**

Spilleren er på sitet med det samme, på det rigtige hold, i truppen, i filtrene
og i tællingen på forsiden.

## Sådan fjerner man en spiller

Slå **Aktiv på akademiet** fra.

Spilleren forsvinder fra truppen straks, men profilen, fotoet og historikken
består. Det betyder at gamle nyheder ikke får døde links, og at man senere kan
vise en tidligere sæsons hold. Rigtig sletning er også muligt, men bør være
undtagelsen — man kan ikke fortryde det.

## Sådan skifter man sæson

**Man rører ikke spillerne.**

Et hold er defineret ved hvilke **fødselsår** det består af. Spillerens
fødselsår er stamdata, der aldrig ændrer sig, så holdtilknytningen udregnes:

```
Hold U17   årgange [2008, 2009]
Hold U19   årgange [2006, 2007]
```

Ved sæsonskifte rettes kun de to felter:

```
Hold U17   årgange [2009, 2010]
Hold U19   årgange [2007, 2008]
```

Så rykker alle spillere født i 2008 selv op fra U17 til U19, og de spillere der
er blevet for gamle falder ud af truppen. Målt på prototypen:

| | Før | Efter |
|---|---|---|
| U17 | 25 spillere (2008–2009) | 12 spillere (2009–2010) |
| U19 | 29 spillere (2006–2007) | 28 spillere (2007–2008) |

De 13 spillere født i 2008 flyttede sig selv. De 14 født i 2006 forsvandt fra
truppen. **Ingen spillere blev redigeret.**

Spiller en ung med op eller ned, sættes feltet **Spiller på andet hold** på
netop den spiller. Det overstyrer udregningen for én person, uden at røre
modellen.

## Skemaer

| Fil | Dokument | Bemærk |
|---|---|---|
| `spiller.ts` | Spiller | Fødselsår er påkrævet — holdet udregnes af det |
| `hold.ts` | Hold | Defineret ved årgange, ikke ved en spillerliste |

Mangler stadig, og bygges i etape 2: `nyhed`, `person` (stab), `sponsor`,
`saeson` og `side`. `poc/src/data/` viser hvordan de skal se ud — formen er
allerede den samme.

## Hvorfor Sanity og ikke en almindelig database?

Fordi spørgsmålet ikke er "hvor ligger dataene", men "hvem retter dem".

En almindelig database — MySQL, Postgres, Supabase — kræver at nogen bygger en
brugerflade ovenpå, før en holdleder kan tilføje en spiller. Sanity **er**
databasen og brugerfladen på én gang: skemaerne ovenfor er samtidig
definitionen af felterne og af den formular, redaktøren udfylder.

Derudover:

- **Ingen layout at ødelægge.** Der er kun felter. En frivillig kan ikke
  komme til at flytte en kolonne eller vælge en anden skrifttype.
- **Versionshistorik.** Man kan se hvem der rettede hvad, og rulle tilbage.
- **Billedbehandling er indbygget** — beskæring, komprimering og formater.
- **Gratis** for op til tre redaktører.
- **Virker på telefonen**, uden app.

Prisen er, at der skal en udvikler til for at ændre *hvilke felter* der findes.
Men det er sjældent — og det er netop den begrænsning, der gør at siden ikke
kan forfalde.
