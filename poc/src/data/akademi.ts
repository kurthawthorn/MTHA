/**
 * POC-datalag.
 *
 * Formen er identisk med Sanity-skemaet i forslaget, saa etape 2 er et skift
 * af datakilde og ikke en omskrivning: `truppen()` gaar fra at laese denne fil
 * til at kalde Sanity, og siderne aendres ikke.
 *
 * DATAKILDE
 *   roster.json er udtrukket maskinelt fra m-tha.dk og indeholder de
 *   OFFENTLIGE oplysninger: navn, aargang, stabens roller, sponsornavne — samt
 *   noeglen til det tilhoerende billede.
 *
 *   Position, rygnummer, foedselsaar, moderklub, uddannelse og personlig
 *   sponsor er EKSEMPELDATA, indsat for at vise felterne. De skal erstattes af
 *   akademiets egne oplysninger.
 */

import roster from './roster.json';
import { saeson } from './saeson';

export type Position =
  | 'Målvogter' | 'Venstre fløj' | 'Venstre back'
  | 'Playmaker' | 'Streg' | 'Højre back' | 'Højre fløj';

export type SponsorNiveau = 'hovedsponsor' | 'topsponsor' | 'sponsor';

export interface Sponsor {
  id: string;
  navn: string;
  niveau: SponsorNiveau;
  /** Nøgle til logofilen i src/assets/logoer/ */
  logoKey?: string;
  url?: string;
}

export interface Hold {
  id: string;
  navn: string;
  aargang: string;
  raekke: string;
  traener?: string;
  /** Nøgle til holdfoto */
  fotoKey: string;
}

export interface Spiller {
  navn: string;
  slug: string;
  holdId: string;
  /** Nøgle til portrættet i src/assets/portraetter/ */
  fotoKey: string;
  rygnummer: number;
  position: Position;
  foedselsaar: number;
  moderklub: string;
  uddannelse: 'STX' | 'HHX' | 'HF';
  sponsorId?: string;
  aktiv: boolean;
}

export interface Person {
  navn: string;
  slug: string;
  rolle: string;
  fotoKey: string;
  gruppe: 'ledelse' | 'traener' | 'sundhed' | 'uddannelse' | 'bestyrelse';
}

const slugFraKey = (key: string) => key.replace(/^(spiller|person|logo)-/, '');

/* ── Sponsorer ─────────────────────────────────────────────────────────── */

/** Thisted Forsikring har sit eget udskilte logo — se assets/brand/. */
const HOVEDSPONSOR: Sponsor = {
  id: 'thisted-forsikring',
  navn: 'Thisted Forsikring',
  niveau: 'hovedsponsor',
  url: 'https://thistedforsikring.dk',
};

export const sponsorer: Sponsor[] = [
  HOVEDSPONSOR,
  ...roster.sponsorer.map((s) => ({
    id: slugFraKey(s.key),
    navn: s.navn,
    niveau: s.niveau as SponsorNiveau,
    logoKey: s.key,
  })),
];

/* ── Hold ──────────────────────────────────────────────────────────────── */

/** Holdene kommer fra sæsonen — ingen årstal skrevet ind her. */
const TRAENER: Record<string, string> = { u17: 'Rune Lanng', u19: 'Henrik Tilsted' };
const HOLDFOTO: Record<string, string> = { u17: 'hold-samlet', u19: 'hold-udenfor' };

export const hold: Hold[] = saeson.hold.map((h) => ({
  id: h.id,
  navn: h.navn,
  aargang: h.aargang,
  raekke: h.raekke,
  traener: TRAENER[h.id],
  fotoKey: HOLDFOTO[h.id] ?? 'hold-samlet',
}));

/* ── Spillere ──────────────────────────────────────────────────────────── */

const POS: Position[] = [
  'Målvogter', 'Venstre fløj', 'Venstre back', 'Playmaker',
  'Streg', 'Højre back', 'Højre fløj',
];
const KLUBBER = ['Thisted IK', 'Mors-Thy Håndbold', 'Skive fH', 'Nykøbing Mors IF',
                 'Hurup IF', 'Sydthy HK', 'Struer HK'];
const UDD = ['STX', 'HHX', 'HF'] as const;
const AARGANG: Record<string, number[]> = Object.fromEntries(
  saeson.hold.map((h) => [h.id, h.foedselsaar]),
);

const personligeSponsorer = roster.sponsorer
  .filter((s) => s.niveau === 'sponsor')
  .map((s) => slugFraKey(s.key));

export const spillere: Spiller[] = roster.spillere.map((s, i) => ({
  navn: s.navn,
  slug: slugFraKey(s.key),
  holdId: s.hold,
  fotoKey: s.key,
  // ── herfra: eksempeldata ──
  rygnummer: (i % 30) + 1,
  position: POS[i % POS.length]!,
  foedselsaar: AARGANG[s.hold]![i % 2]!,
  moderklub: KLUBBER[i % KLUBBER.length]!,
  uddannelse: UDD[i % UDD.length]!,
  // Hver 3. spiller har en personlig sponsor — som i dag på m-tha.dk
  sponsorId: i % 3 === 0 ? personligeSponsorer[i % personligeSponsorer.length] : undefined,
  aktiv: true,
}));

/* ── Professionelle og bestyrelse ──────────────────────────────────────── */

function gruppeFor(rolle: string): Person['gruppe'] {
  const r = rolle.toLowerCase();
  if (r.includes('daglig leder')) return 'ledelse';
  if (r.includes('træner') || r.includes('træningsansvarlig')) return 'traener';
  if (r.includes('fysio') || r.includes('diætist') || r.includes('mental')) return 'sundhed';
  if (r.includes('koordinator')) return 'uddannelse';
  return 'bestyrelse';
}

export const personer: Person[] = roster.stab.map((p) => ({
  navn: p.navn,
  slug: slugFraKey(p.key),
  rolle: p.rolle,
  fotoKey: p.key,
  gruppe: gruppeFor(p.rolle),
}));

export const GRUPPE_NAVNE: Record<Person['gruppe'], string> = {
  ledelse: 'Daglig ledelse',
  traener: 'Trænerteam',
  sundhed: 'Sundhed og fysik',
  uddannelse: 'Uddannelseskoordinatorer',
  bestyrelse: 'Bestyrelse og øvrige',
};

/* ── Opslag ────────────────────────────────────────────────────────────── */

export const getHold = (id: string) => hold.find((h) => h.id === id);
export const getSponsor = (id?: string) =>
  id ? sponsorer.find((s) => s.id === id) : undefined;
export const truppen = (holdId: string) =>
  spillere.filter((s) => s.holdId === holdId && s.aktiv)
          .sort((a, b) => a.rygnummer - b.rygnummer);
export const hovedsponsor = () => HOVEDSPONSOR;
export const iGruppe = (g: Person['gruppe']) => personer.filter((p) => p.gruppe === g);
export const sponsorerPaaNiveau = (n: SponsorNiveau) =>
  sponsorer.filter((s) => s.niveau === n);
