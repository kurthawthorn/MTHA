/**
 * Akademiets værdier, historie og uddannelsessamarbejde.
 *
 * Alt herunder er akademiets EGEN tekst, trukket ud af
 * "MTH_Vi skaber fremtidens stjerner_A4_2023.pdf" og "MTH_Velkommen_A4_Aug23.pdf".
 * I dag ligger det låst i to PDF-brochurer, hvor Google ikke kan læse det, og
 * hvor ingen finder det på en telefon.
 */

/** Mottoet står på forsiden af visionsbrochuren. */
export const MOTTO = 'Sammen er vi stærkere';
export const SLOGAN = 'Vi skaber fremtidens stjerner';

export interface Vaerdi {
  titel: string;
  tekst: string;
}

/** Fire bærende værdier, formuleret ud af akademiets egen brochuretekst. */
export const vaerdier: Vaerdi[] = [
  {
    titel: 'Dannelse og udvikling går hånd i hånd',
    tekst:
      'Vi arbejder med unge, der både sigter mod den sportslige top og ' +
      'prioriterer uddannelse. Ved at balancere de to elementer udvikler vi ' +
      'dygtigere eliteudøvere — og samtidig ansvarlige, robuste og ' +
      'læringsparate unge, der har lyst og mod til at bidrage til ' +
      'fællesskabet. Egenskaber, som er nyttige både på og udenfor banen.',
  },
  {
    titel: 'Nærhed og tætte relationer',
    tekst:
      'Det skal være sjovt og hyggeligt at være en del af akademiet. Vi ' +
      'prioriterer nærhed, interesse og tætte relationer eleverne imellem. ' +
      'Som elev forpligter du dig på at være en del af — og tage ansvar for — ' +
      'at det sociale liv fungerer.',
  },
  {
    titel: 'Et socialt sikkerhedsnet',
    tekst:
      'Akademiet har en fuldtidsansat daglig leder, som ud over driften også ' +
      'sikrer et socialt sikkerhedsnet og står til rådighed for hjælp og ' +
      'sparring for den enkelte elev. Nettet består af et tæt samarbejde ' +
      'mellem familien, ungdomsuddannelsen, klubben og akademiet.',
  },
  {
    titel: 'Høj faglig ekspertise',
    tekst:
      'Vi arbejder hele tiden på at stille de bedst mulige kompetencer til ' +
      'rådighed: tæt samarbejde med den sportslige ledelse i Mors-Thy ' +
      'Håndbold, aftale med mentalcoach, fysioterapi og skadesforebyggelse — ' +
      'og et træningsforløb, vi planlægger sammen med dig.',
  },
];

/* ── Historie ─────────────────────────────────────────────────────────── */

export interface Milepael {
  aar: number;
  tekst: string;
  tal?: string;
}

/** "Nyt navn, samme dna." */
export const historie: Milepael[] = [
  { aar: 2012, tekst: 'Sports College Mors starter', tal: '4 elever' },
  { aar: 2022, tekst: 'Håndbold Akademi Mors bliver til Mors-Thy Håndbold Akademi' },
  { aar: 2023, tekst: 'Akademiet er vokset', tal: '38 elever' },
];

/**
 * Akademiets stærkeste tal, fra visionsbrochuren:
 * 17 af 19 spillere i ligatruppen 2023/24 er eller har været i talentmiljøet.
 */
export const ligatrupTal = { iMiljoeet: 17, iTrup: 19, saeson: '2023/24' };

/* ── Trofæer ──────────────────────────────────────────────────────────── */

export interface Titel {
  aar: number;
  raekke: string;
}

/**
 * U19-danmarksmesterskaber. Tre gange i fire år.
 *
 * KILDE  2025-titlen er dokumenteret på akademiets eget site med filen
 *        "Officiel vinderbillede U19 DM 2025.jpg". Årene bekræftet i pressen:
 *        2025-dækningen skriver "tredje gang i fire år", og 2023-dækningen
 *        skriver "anden år i træk" — hvilket giver 2022, 2023 og 2025.
 */
export const titler: Titel[] = [
  { aar: 2025, raekke: 'U19 Drenge' },
  { aar: 2023, raekke: 'U19 Drenge' },
  { aar: 2022, raekke: 'U19 Drenge' },
];

export const titelTekst = 'Tre danmarksmesterskaber i fire år';

/* ── Uddannelser ──────────────────────────────────────────────────────── */

export interface Uddannelse {
  kort: string;
  navn: string;
  sted: string;
  url: string;
  beskrivelse: string;
  koordinator?: { navn: string; telefon: string; email: string };
}

export const uddannelser: Uddannelse[] = [
  {
    kort: 'STX',
    navn: 'Almen gymnasial uddannelse',
    sted: 'Morsø Gymnasium',
    url: 'https://morsoegym.dk/',
    beskrivelse:
      'Det almene gymnasium ligger lige ved siden af akademiet. Alle linjer ' +
      'kan vælges, og skemaet koordineres med træningen.',
    koordinator: { navn: 'Jesper Kjær Nannerup', telefon: '20 88 90 48',
                   email: 'jk@morsoe-gym.dk' },
  },
  {
    kort: 'HHX · EUD · EUX Business',
    navn: 'Merkantil ungdomsuddannelse',
    sted: 'Morsø Handelsgymnasium — EUC Nordvest',
    url: 'https://eucnordvest.dk/gymnasier/morso-handelsgymnasium-hhx/',
    beskrivelse:
      'Handelsgymnasiet ligger nabo til akademiet. Alle linjer på EUD og ' +
      'EUX Business kan vælges.',
    koordinator: { navn: 'Elsebeth Overgaard', telefon: '30 10 65 96',
                   email: 'eo@eucnordvest.dk' },
  },
  {
    kort: 'HF',
    navn: 'Højere forberedelseseksamen',
    sted: 'HF Mors',
    url: 'https://hfmors.dk/',
    beskrivelse:
      'HF Mors er en del af samarbejdet omkring akademiet. Akademiets ' +
      'mentaltræner er samtidig daglig leder på HF Mors.',
  },
  {
    kort: 'EUD',
    navn: 'Erhvervsuddannelse med læreplads',
    sted: 'Lokale virksomheder',
    url: 'https://eucnordvest.dk/',
    beskrivelse:
      'Er du mere interesseret i en erhvervsfaglig uddannelse, hjælper vi ' +
      'med en løsning, der passer dig — herunder en læreplads hos en lokal ' +
      'virksomhed.',
  },
];

/** Det akademiet selv fremhæver om uddannelsessamarbejdet. */
export const uddannelseFakta = [
  'Det er et krav, at opholdet kombineres med en boglig eller praktisk ungdomsuddannelse',
  'Fra de indledende samtaler til afgangsprøven er der tilknyttet en koordinator',
  'Der er mulighed for lektiehjælp på akademiet og/eller på skolerne',
  'Koordinatorer, lærere, trænere og elev planlægger udviklingen sammen',
  'Skolernes gratis, frivillige aktiviteter efter skoletid kan bruges frit',
];

/* ── Eliteidræt ───────────────────────────────────────────────────────── */

export interface Traening {
  dag: string;
  tid: string;
  indhold: string;
}

/** Akademitræninger, fra velkomstfolderen. */
export const akademitraening: Traening[] = [
  { dag: 'Tirsdag', tid: '07.45–09.00',
    indhold: 'Skadesforebyggende, styrke og målmandstræning' },
  { dag: 'Tirsdag', tid: '09.00–09.30', indhold: 'Behandling' },
  { dag: 'Torsdag', tid: '15.15–16.30', indhold: 'Skadesforebyggende og styrke' },
  { dag: 'Torsdag', tid: '16.30–17.00', indhold: 'Behandling' },
];

export const eliteTilbud = [
  { titel: 'Kost tilpasset eliteidræt',
    tekst: 'Samarbejdsaftale med Nordic Food College, der leverer varm mad ' +
           'alle hverdage med udgangspunkt i en eliteidrætsudøvers behov.' },
  { titel: 'Fysioterapi og skadesforebyggelse',
    tekst: 'Fysioterapeuter fra Morsø Fysiologi står for skadesforebyggende ' +
           'træning og behandling i forbindelse med akademitræningerne.' },
  { titel: 'Mentaltræning',
    tekst: 'Aftale med mentalcoach, der er tilknyttet hverdagen på akademiet.' },
  { titel: 'Adgang til faciliteterne',
    tekst: 'Haller, fitnesscenter, padelhal, fodboldbaner og udendørs ' +
           'træningsanlæg — plus adgangskode til Arena Mors Fitness.' },
  { titel: 'Tæt på ligatruppen',
    tekst: 'Tæt samarbejde med den sportslige ledelse i Mors-Thy Håndbold, ' +
           'og holdet følges til kampe.' },
];
