/**
 * Værdier, uddannelser, trofæer, motto og nøgletal — nu fra Sanity.
 *
 * Filen indeholdt før selve indholdet, skrevet ud fra akademiets brochurer.
 * Det betød at en værdi ikke kunne omformuleres, en koordinator ikke skiftes
 * og et nyt mesterskab ikke tilføjes uden en udvikler. Netop det indhold
 * bliver oftest skrevet om.
 *
 * Nu står her kun forespørgsler og reservedata. Kan Sanity ikke nås, bruges
 * reserven, og bygningen fortsætter — se `lib/sanity.ts`.
 *
 * TRÆNINGSSKEMA OG ELITETILBUD
 *   De to lister nederst er stadig i kode. De ændrer sig sjældent, og de er
 *   opremsninger frem for redaktionelt indhold. Flyt dem i studioet hvis
 *   træningstiderne begynder at skifte.
 */

import { hentEllerFallback } from '../lib/sanity';

/* ── Motto og nøgletal ────────────────────────────────────────────────── */

interface Indstillinger {
  motto: string;
  slogan: string;
  ligatrupIMiljoeet: number;
  ligatrupIAlt: number;
  ligatrupSaeson: string;
  milepaele: { aar: number; tekst: string; tal?: string }[];
}

const Q_INDSTILLINGER = `*[_type == "indstillinger"][0]{
  motto, slogan, ligatrupIMiljoeet, ligatrupIAlt, ligatrupSaeson,
  "milepaele": milepaele[]{ aar, tekst, tal }
}`;

const R_INDSTILLINGER: Indstillinger = {
  motto: 'Sammen er vi stærkere',
  slogan: 'Vi skaber fremtidens stjerner',
  ligatrupIMiljoeet: 17, ligatrupIAlt: 19, ligatrupSaeson: '2023/24',
  milepaele: [
    { aar: 2012, tekst: 'Sports College Mors starter', tal: '4 elever' },
    { aar: 2022, tekst: 'Håndbold Akademi Mors bliver til Mors-Thy Håndbold Akademi' },
    { aar: 2023, tekst: 'Akademiet er vokset', tal: '38 elever' },
  ],
};

const ind = (await hentEllerFallback('indstillinger', Q_INDSTILLINGER, R_INDSTILLINGER)).data;

export const MOTTO = ind.motto ?? R_INDSTILLINGER.motto;
export const SLOGAN = ind.slogan ?? R_INDSTILLINGER.slogan;

/** Akademiets stærkeste tal. Stod nederst på side 1 i en PDF. */
export const ligatrupTal = {
  iMiljoeet: ind.ligatrupIMiljoeet ?? 17,
  iTrup: ind.ligatrupIAlt ?? 19,
  saeson: ind.ligatrupSaeson ?? '2023/24',
};

export interface Milepael { aar: number; tekst: string; tal?: string }

/** ”Nyt navn, samme dna.” */
export const historie: Milepael[] = (ind.milepaele ?? R_INDSTILLINGER.milepaele)
  .slice()
  .sort((a, b) => a.aar - b.aar);

/* ── Værdier ──────────────────────────────────────────────────────────── */

export interface Vaerdi {
  titel: string;
  tekst: string;
  paaForsiden: boolean;
}

const Q_VAERDIER = `*[_type == "vaerdi"] | order(raekkefoelge asc) {
  titel, tekst, paaForsiden
}`;

const R_VAERDIER: Vaerdi[] = [
  { titel: 'Dannelse og udvikling går hånd i hånd', paaForsiden: true,
    tekst: 'Vi arbejder med unge, der både sigter mod den sportslige top og '
      + 'prioriterer uddannelse.' },
  { titel: 'Nærhed og tætte relationer', paaForsiden: true,
    tekst: 'Det skal være sjovt og hyggeligt at være en del af akademiet.' },
  { titel: 'Et socialt sikkerhedsnet', paaForsiden: false,
    tekst: 'Akademiet har en fuldtidsansat daglig leder, som også sikrer et '
      + 'socialt sikkerhedsnet.' },
  { titel: 'Høj faglig ekspertise', paaForsiden: false,
    tekst: 'Vi stiller de bedst mulige kompetencer til rådighed.' },
];

export const vaerdier: Vaerdi[] =
  (await hentEllerFallback('vaerdier', Q_VAERDIER, R_VAERDIER)).data
    .map((v) => ({ ...v, paaForsiden: v.paaForsiden ?? false }));

/** Forsiden viser kun de fremhævede. Falder tilbage på de to første. */
export const forsideVaerdier = () => {
  const valgt = vaerdier.filter((v) => v.paaForsiden);
  return valgt.length ? valgt : vaerdier.slice(0, 2);
};

/* ── Trofæer ──────────────────────────────────────────────────────────── */

export interface Maalscorer { navn: string; maal: number }

export interface Titel {
  aar: number;
  raekke: string;
  /** Tom streng = oplysningen findes ikke og skal udfyldes. */
  dato: string;
  spillested: string;
  finale?: { navn: string; modstander: string; resultat: string; halvleg?: string };
  semifinale?: { navn: string; modstander: string; resultat: string };
  maalscorere: Maalscorer[];
  traenere: string[];
  trup: string[];
  noter: string[];
}

const Q_TITLER = `*[_type == "titel"] | order(aar desc) {
  aar, raekke, dato, spillested,
  finaleModstander, finaleResultat, finaleHalvleg,
  semiModstander, semiResultat,
  "maalscorere": maalscorere[]{ navn, maal },
  trup, traenere, noter
}`;

type SanityTitel = {
  aar: number; raekke?: string; dato?: string; spillested?: string;
  finaleModstander?: string; finaleResultat?: string; finaleHalvleg?: string;
  semiModstander?: string; semiResultat?: string;
  maalscorere?: Maalscorer[]; trup?: string[]; traenere?: string[]; noter?: string[];
};

const R_TITLER: SanityTitel[] = [
  { aar: 2025, raekke: 'U19 Drenge', spillested: 'Final4 i Helsinge',
    finaleModstander: 'GOG Håndbold', finaleResultat: '36–31' },
  { aar: 2023, raekke: 'U19 Drenge', dato: '23. april 2023',
    finaleModstander: 'GOG Håndbold', finaleResultat: '34–33' },
  { aar: 2022, raekke: 'U19 Drenge' },
];

export const titler: Titel[] =
  (await hentEllerFallback('titler', Q_TITLER, R_TITLER)).data.map((t) => ({
    aar: t.aar,
    raekke: t.raekke ?? 'U19 Drenge',
    dato: t.dato ?? '',
    spillested: t.spillested ?? '',
    finale: t.finaleModstander
      ? { navn: 'Finale', modstander: t.finaleModstander,
          resultat: t.finaleResultat ?? '', halvleg: t.finaleHalvleg }
      : undefined,
    semifinale: t.semiModstander
      ? { navn: 'Semifinale', modstander: t.semiModstander,
          resultat: t.semiResultat ?? '' }
      : undefined,
    maalscorere: t.maalscorere ?? [],
    traenere: t.traenere ?? [],
    trup: t.trup ?? [],
    noter: t.noter ?? [],
  }));

/**
 * Fx "Tre danmarksmesterskaber i fire år" — udregnet, ikke skrevet.
 * Tilføjer akademiet 2027 i studioet, retter sætningen sig selv.
 */
export const titelTekst = (() => {
  const ord = ['ingen', 'ét', 'to', 'tre', 'fire', 'fem', 'seks', 'syv', 'otte',
               'ni', 'ti'];
  const n = titler.length;
  if (!n) return '';
  if (n === 1) return 'Ét danmarksmesterskab';
  const aar = titler.map((t) => t.aar);
  const spand = Math.max(...aar) - Math.min(...aar) + 1;
  const antal = ord[n] ?? String(n);
  const iAar = ord[spand] ?? String(spand);
  return `${antal[0]!.toUpperCase()}${antal.slice(1)} danmarksmesterskaber i ${iAar} år`;
})();

/* ── Uddannelser ──────────────────────────────────────────────────────── */

export interface Uddannelse {
  kort: string;
  navn: string;
  sted: string;
  url: string;
  beskrivelse: string;
  koordinator?: { navn: string; telefon: string; email: string };
}

const Q_UDDANNELSER = `*[_type == "uddannelse"] | order(raekkefoelge asc) {
  kort, navn, sted, url, beskrivelse,
  koordinatorNavn, koordinatorTelefon, koordinatorEmail
}`;

type SanityUddannelse = {
  kort: string; navn: string; sted: string; url?: string; beskrivelse?: string;
  koordinatorNavn?: string; koordinatorTelefon?: string; koordinatorEmail?: string;
};

const R_UDDANNELSER: SanityUddannelse[] = [
  { kort: 'STX', navn: 'Almen gymnasial uddannelse', sted: 'Morsø Gymnasium',
    url: 'https://morsoegym.dk/' },
  { kort: 'HHX · EUD · EUX Business', navn: 'Merkantil ungdomsuddannelse',
    sted: 'EUC Nordvest', url: 'https://eucnordvest.dk/' },
  { kort: 'HF', navn: 'Højere forberedelseseksamen', sted: 'HF Mors',
    url: 'https://hfmors.dk/' },
  { kort: 'EUD', navn: 'Erhvervsuddannelse med læreplads',
    sted: 'Lokale virksomheder', url: 'https://eucnordvest.dk/' },
];

export const uddannelser: Uddannelse[] =
  (await hentEllerFallback('uddannelser', Q_UDDANNELSER, R_UDDANNELSER)).data
    .map((u) => ({
      kort: u.kort,
      navn: u.navn,
      sted: u.sted,
      url: u.url ?? '',
      beskrivelse: u.beskrivelse ?? '',
      koordinator: u.koordinatorNavn
        ? { navn: u.koordinatorNavn, telefon: u.koordinatorTelefon ?? '',
            email: u.koordinatorEmail ?? '' }
        : undefined,
    }));

/* ── Stadig i kode: opremsninger der sjældent ændrer sig ──────────────── */

/** Det akademiet selv fremhæver om uddannelsessamarbejdet. */
export const uddannelseFakta = [
  'Det er et krav, at opholdet kombineres med en boglig eller praktisk ungdomsuddannelse',
  'Fra de indledende samtaler til afgangsprøven er der tilknyttet en koordinator',
  'Der er mulighed for lektiehjælp på akademiet og/eller på skolerne',
  'Koordinatorer, lærere, trænere og elev planlægger udviklingen sammen',
  'Skolernes gratis, frivillige aktiviteter efter skoletid kan bruges frit',
];

export interface Traening { dag: string; tid: string; indhold: string }

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
    tekst: 'Samarbejdsaftale med Nordic Food College, der leverer varm mad '
      + 'alle hverdage med udgangspunkt i en eliteidrætsudøvers behov.' },
  { titel: 'Fysioterapi og skadesforebyggelse',
    tekst: 'Fysioterapeuter fra Morsø Fysiologi står for skadesforebyggende '
      + 'træning og behandling i forbindelse med akademitræningerne.' },
  { titel: 'Mentaltræning',
    tekst: 'Aftale med mentalcoach, der er tilknyttet hverdagen på akademiet.' },
  { titel: 'Adgang til faciliteterne',
    tekst: 'Haller, fitnesscenter, padelhal, fodboldbaner og udendørs '
      + 'træningsanlæg — plus adgangskode til Arena Mors Fitness.' },
  { titel: 'Tæt på ligatruppen',
    tekst: 'Tæt samarbejde med den sportslige ledelse i Mors-Thy Håndbold, '
      + 'og holdet følges til kampe.' },
];
