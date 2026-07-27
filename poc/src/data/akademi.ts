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

export type SponsorNiveau = 'hovedsponsor' | 'topsponsor' | 'sponsor' | 'partner';

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
  /** Nøgle til portrættet i src/assets/portraetter/ */
  fotoKey: string;
  /**
   * Fødselsåret er kilden til holdtilknytning — det er et faktum der aldrig
   * ændrer sig, mens holdet skifter hver sæson. Se `holdFor()`.
   */
  foedselsaar: number;
  /**
   * Sættes kun når en spiller spiller op eller ned — fx en stærk 2010'er på
   * U17. Overstyrer den automatiske tilknytning.
   */
  holdOverstyring?: string;
  rygnummer: number;
  position: Position;
  moderklub: string;
  uddannelse: 'STX' | 'HHX' | 'HF';
  /** Personlig sponsor — hentet fra m-tha.dk, ikke opdigtet. */
  sponsorId?: string;
  sponsorNavn?: string;
  aktiv: boolean;
}

export interface Person {
  navn: string;
  slug: string;
  rolle: string;
  fotoKey: string;
  /** Sektionen personen står i på m-tha.dk — ikke gættet. */
  sektion: 'professionel' | 'ansat' | 'bestyrelse';
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
    // Linket til sponsorens egen hjemmeside — hentet fra m-tha.dk
    url: (s as { url?: string }).url,
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
/** Hvilke fødselsår hvert hold består af — ét sted, i saeson.ts. */
const AARGANG: Record<string, number[]> = Object.fromEntries(
  saeson.hold.map((h) => [h.id, h.foedselsaar]),
);

export const spillere: Spiller[] = roster.spillere.map((s, i) => ({
  navn: s.navn,
  slug: slugFraKey(s.key),
  fotoKey: s.key,
  // STAMDATA: fødselsåret står fast på spilleren og ændrer sig aldrig.
  // Det er derfor sæsonskiftet kan flytte spillerne af sig selv.
  // Årgangen er den rigtige fra m-tha.dk; det præcise år indenfor årgangen
  // er eksempeldata indtil akademiet udfylder det.
  foedselsaar: s.foedselsaar,
  // ── herfra: eksempeldata ──
  rygnummer: (i % 30) + 1,
  position: POS[i % POS.length]!,
  moderklub: KLUBBER[i % KLUBBER.length]!,
  uddannelse: UDD[i % UDD.length]!,
  // Personlig sponsor: alle 54 har én, hentet fra m-tha.dk
  sponsorId: s.sponsorId ?? undefined,
  sponsorNavn: s.sponsorNavn ?? undefined,
  aktiv: true,
}));

/* ── Professionelle og bestyrelse ──────────────────────────────────────── */

export const personer: Person[] = roster.stab.map((p) => ({
  navn: p.navn,
  slug: slugFraKey(p.key),
  rolle: p.rolle,
  fotoKey: p.key,
  sektion: p.sektion as Person['sektion'],
}));

/** Sektionsnavnene som de står på m-tha.dk. */
export const SEKTION_NAVNE: Record<Person['sektion'], string> = {
  professionel: 'Professionelle omkring akademiet',
  ansat: 'Ansatte',
  bestyrelse: 'Bestyrelsen',
};

/* ── Opslag ────────────────────────────────────────────────────────────── */

export const getHold = (id: string) => hold.find((h) => h.id === id);

/**
 * Holdet en spiller hører til — UDREGNET ud fra fødselsåret.
 *
 * Det er hele pointen: sæsonen definerer hvilke årgange hvert hold består af
 * (se saeson.ts), og spillerne følger med af sig selv. Ved sæsonskifte rettes
 * to felter i saeson.ts — ikke 54 spillere.
 *
 *   U17: [2008, 2009]  →  bliv til  [2009, 2010]
 *   U19: [2006, 2007]  →  bliv til  [2007, 2008]
 *
 * En spiller der ikke længere passer i nogen årgang falder automatisk ud af
 * truppen; historikken og profilen består.
 */
export const holdFor = (s: Spiller): Hold | undefined => {
  if (s.holdOverstyring) return getHold(s.holdOverstyring);
  return hold.find((h) => AARGANG[h.id]?.includes(s.foedselsaar));
};

/** Spillere der ikke passer i nogen årgang i denne sæson. */
export const udenHold = () => spillere.filter((s) => s.aktiv && !holdFor(s));
export const getSponsor = (id?: string) =>
  id ? sponsorer.find((s) => s.id === id) : undefined;
export const truppen = (holdId: string) =>
  spillere.filter((s) => s.aktiv && holdFor(s)?.id === holdId)
          .sort((a, b) => a.rygnummer - b.rygnummer);
export const hovedsponsor = () => HOVEDSPONSOR;
export const iSektion = (s: Person['sektion']) => personer.filter((p) => p.sektion === s);
export const sponsorerPaaNiveau = (n: SponsorNiveau) =>
  sponsorer.filter((s) => s.niveau === n);
