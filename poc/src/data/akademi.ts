/**
 * POC-datalag.
 *
 * Formen her er identisk med Sanity-skemaet i forslaget, saa etape 2 er et
 * skift af datakilde og ikke en omskrivning: `getSpillere()` gaar fra at laese
 * denne fil til at kalde Sanity. Siderne aendres ikke.
 *
 * DATAKILDE
 *   Navne og aargange er offentlige oplysninger fra m-tha.dk.
 *   Position, rygnummer, moderklub, uddannelse og personlig sponsor er
 *   EKSEMPELDATA, indsat for at vise felterne. De erstattes af akademiets
 *   egne oplysninger.
 */

import { slugify } from '../lib/slug';

export type Position =
  | 'Målvogter' | 'Venstre fløj' | 'Venstre back'
  | 'Playmaker' | 'Streg' | 'Højre back' | 'Højre fløj';

export type SponsorNiveau = 'hovedsponsor' | 'topsponsor' | 'sponsor';

export interface Sponsor {
  id: string;
  navn: string;
  niveau: SponsorNiveau;
  url?: string;
  /** Logo i /public/brand — kun hovedsponsoren har en rigtig fil i POC'en. */
  logo?: string;
}

export interface Hold {
  id: string;
  navn: string;
  aargang: string;
  raekke: string;
  traener: string;
}

export interface Spiller {
  navn: string;
  holdId: string;
  rygnummer: number;
  position: Position;
  foedselsaar: number;
  moderklub: string;
  uddannelse: 'STX' | 'HHX' | 'HF';
  sponsorId?: string;
  aktiv: boolean;
}

/* ── Sponsorer ─────────────────────────────────────────────────────────── */

export const sponsorer: Sponsor[] = [
  { id: 'thisted-forsikring', navn: 'Thisted Forsikring', niveau: 'hovedsponsor',
    url: 'https://thistedforsikring.dk', logo: '/brand/thisted-forsikring.png' },
  { id: 'jyske-bank',    navn: 'Jyske Bank',         niveau: 'topsponsor' },
  { id: 'jysk-elteknik', navn: 'Jysk Elteknik',      niveau: 'topsponsor' },
  { id: 'mth-biler',     navn: 'MTH Biler — Toyota', niveau: 'topsponsor' },
  { id: 'beierholm',     navn: 'Beierholm',          niveau: 'sponsor' },
  { id: 'davidsen',      navn: 'Davidsen',           niveau: 'sponsor' },
  { id: 'dencker',       navn: 'Dencker',            niveau: 'sponsor' },
  { id: 'ejner-hessel',  navn: 'Ejner Hessel',       niveau: 'sponsor' },
  { id: 'jesperhus',     navn: 'Jesperhus',          niveau: 'sponsor' },
  { id: 'arena-mors',    navn: 'Arena Mors Fitness', niveau: 'sponsor' },
  { id: 'thy-mors',      navn: 'Thy-Mors Energi',    niveau: 'sponsor' },
  { id: 'br-energy',     navn: 'BR Energy',          niveau: 'sponsor' },
  { id: 'redoffice',     navn: 'RedOffice',          niveau: 'sponsor' },
  { id: 'altibox',       navn: 'Altibox',            niveau: 'sponsor' },
];

/* ── Hold ──────────────────────────────────────────────────────────────── */

export const hold: Hold[] = [
  { id: 'u17', navn: 'U17 Drenge', aargang: '2008–2009',
    raekke: 'U17 Liga', traener: 'Udfyldes af akademiet' },
  { id: 'u19', navn: 'U19 Drenge', aargang: '2006–2007',
    raekke: 'U19 Liga', traener: 'Udfyldes af akademiet' },
];

/* ── Spillere ──────────────────────────────────────────────────────────── */

const POS: Position[] = [
  'Målvogter', 'Venstre fløj', 'Venstre back', 'Playmaker',
  'Streg', 'Højre back', 'Højre fløj',
];
const KLUBBER = ['Thisted IK', 'Mors-Thy Håndbold', 'Skive fH', 'Nykøbing Mors IF',
                 'Hurup IF', 'Sydthy HK', 'Struer HK'];
const UDD = ['STX', 'HHX', 'HF'] as const;

/** Navne hentet fra m-tha.dk. Oevrige felter er eksempeldata. */
const NAVNE_U17 = [
  'Gustav Tandrup', 'Joakim Lindum', 'Jonas Thomsen', 'Ludvig Bruun Sørensen',
  'Marcus Bundgaard', 'Lucas Kjær Krintel', 'Jonathan Rokkjær',
  'Rasmus Lang Havemann', 'Gustav Bro Petersen', 'Jeppe Knudsen',
  'Hjalte Trangbæk Jørgensen', 'Anton Lund Gregersen', 'Anton Sunesen',
  'Alexander Hamper', 'Christian Lyng Andersen', 'Oliver Mors',
];
const NAVNE_U19 = [
  'Christian Guldhammer Højbak', 'Anders Hove', 'Christoffer Cichosz',
  'Jesper Corneliussen', 'Mathias Bak', 'Emil Overgaard', 'Noah Riis',
  'Silas Bjerre', 'Villads Kirk', 'Magnus Dahl', 'Sander Holm',
  'Frederik Bach', 'Oscar Lindholm', 'Thor Mikkelsen',
];

function build(navne: string[], holdId: string, aar: number[]): Spiller[] {
  return navne.map((navn, i) => ({
    navn,
    holdId,
    rygnummer: i + 1,
    position: POS[i % POS.length],
    foedselsaar: aar[i % aar.length],
    moderklub: KLUBBER[i % KLUBBER.length],
    uddannelse: UDD[i % UDD.length],
    // Hver 3. spiller har en personlig sponsor — som i dag paa m-tha.dk
    sponsorId: i % 3 === 0 ? sponsorer[(i % 10) + 4]?.id : undefined,
    aktiv: true,
  }));
}

export const spillere: Spiller[] = [
  ...build(NAVNE_U17, 'u17', [2008, 2009]),
  ...build(NAVNE_U19, 'u19', [2006, 2007]),
];

/* ── Opslag ────────────────────────────────────────────────────────────── */

export const spillerSlug = (s: Spiller) => slugify(s.navn);
export const getHold = (id: string) => hold.find((h) => h.id === id);
export const getSponsor = (id?: string) =>
  id ? sponsorer.find((s) => s.id === id) : undefined;
export const truppen = (holdId: string) =>
  spillere.filter((s) => s.holdId === holdId && s.aktiv)
          .sort((a, b) => a.rygnummer - b.rygnummer);
export const hovedsponsor = () =>
  sponsorer.find((s) => s.niveau === 'hovedsponsor')!;
