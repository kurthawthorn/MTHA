/**
 * Datalaget — henter nu fra Sanity.
 *
 * KILDE
 *   Alt hentes fra Sanity på byggetidspunktet. Kan Sanity ikke nås, bruges
 *   `roster.json` som reserve, og der skrives en advarsel i byggeloggen.
 *   Sitet bliver derfor altid udgivet; i værste fald med indhold der er en
 *   smule gammelt. Se `lib/sanity.ts`.
 *
 * BILLEDER
 *   Kommer fra Sanitys CDN, som selv beskærer og komprimerer. Findes der
 *   intet Sanity-billede, falder komponenterne tilbage på de lokale filer i
 *   `src/assets/` via `fotoKey`.
 *
 * FORMEN ER UÆNDRET
 *   Grænsefladerne herunder er de samme som før. Siderne kender ikke forskel
 *   på om dataene kom fra en fil eller fra Sanity — det var hele pointen med
 *   at bygge prototypen på denne form fra starten.
 */

import roster from './roster.json';
import { saeson } from './saeson';
import { hentEllerFallback, type Hotspot } from '../lib/sanity';

export type Position =
  | 'Målvogter' | 'Venstre fløj' | 'Venstre back'
  | 'Playmaker' | 'Streg' | 'Højre back' | 'Højre fløj';

export type SponsorNiveau = 'hovedsponsor' | 'topsponsor' | 'sponsor' | 'partner';

/**
 * Dokumentets rå `_id` i Sanity.
 *
 * Sitet bruger overalt den korte nøgle uden præfiks — `u17`, ikke `hold-u17` —
 * fordi den skal stå i adresselinjen. Men Presentation mode skal kunne pege på
 * det RIGTIGE dokument, og der findes kun ét gyldigt id. Derfor bæres begge:
 * `id` til adresser, `docId` til redigering. Se `lib/redigering.ts`.
 *
 * Feltet er valgfrit, fordi det ikke findes i reservedataene i `roster.json`.
 * Kan Sanity ikke nås, bygges siden uden mærker — hvilket er det rigtige: der
 * er intet dokument at åbne.
 */
export interface Sponsor {
  id: string;
  docId?: string;
  navn: string;
  niveau: SponsorNiveau;
  /** Nøgle til logofilen i src/assets/logoer/ — reserve */
  logoKey?: string;
  /** Logo fra Sanitys CDN — foretrækkes når det findes */
  logoUrl?: string;
  /** Færdig sti i public/ — bruges kun til hovedsponsoren i header og fod */
  logo?: string;
  url?: string;
}

export interface Hold {
  id: string;
  docId?: string;
  navn: string;
  aargang: string;
  raekke: string;
  traener?: string;
  fotoKey: string;
}

export interface Spiller {
  docId?: string;
  navn: string;
  slug: string;
  /** Nøgle til portrættet i src/assets/portraetter/ — reserve */
  fotoKey: string;
  /** Portræt fra Sanitys CDN — foretrækkes når det findes */
  fotoUrl?: string;
  /**
   * Hotspottet redaktøren har markeret på portrættet. Findes det, styrer det
   * beskæringen; findes det ikke, holdes der fast i toppen så hovedet ikke
   * skæres af. Se `portraetAnker()` i `lib/sanity.ts`.
   */
  fotoHotspot?: Hotspot;
  /**
   * Fødselsåret er kilden til holdtilknytning — et faktum der aldrig ændrer
   * sig, mens holdet skifter hver sæson. Se `holdFor()`.
   */
  foedselsaar: number;
  /** Sættes kun når en spiller spiller op eller ned. Overstyrer udregningen. */
  holdOverstyring?: string;
  rygnummer: number;
  position: Position;
  moderklub: string;
  uddannelse: 'STX' | 'HHX' | 'HF';
  sponsorId?: string;
  sponsorNavn?: string;
  /**
   * Sand når spilleren har spillet på et dansk ungdoms- eller A-landshold.
   * Sætter dannebrogsmærket øverst til højre på portrættet. Se `Landsholdsmaerke`.
   */
  landshold: boolean;
  /** Valgfri præcisering, fx "U18". Står på mærket når det er udfyldt. */
  landsholdNiveau?: string;
  aktiv: boolean;
}

export interface Person {
  docId?: string;
  navn: string;
  slug: string;
  rolle: string;
  fotoKey: string;
  fotoUrl?: string;
  fotoHotspot?: Hotspot;
  telefon?: string;
  email?: string;
  /** Sektionen personen står i på m-tha.dk — ikke gættet. */
  sektion: 'professionel' | 'ansat' | 'bestyrelse';
}

const udenPraefiks = (id: string) =>
  id.replace(/^(spiller|person|logo|sponsor|hold)-/, '');

/* ── Forespørgsler ────────────────────────────────────────────────────── */

type SanitySponsor = { id: string; navn: string; niveau: string;
                       url?: string; logoUrl?: string };
type SanityHold = { id: string; navn: string; foedselsaar?: number[];
                    raekke?: string; traener?: string };
type SanitySpiller = {
  id?: string;
  navn: string; slug?: string; foedselsaar?: number; rygnummer?: number;
  position?: string; moderklub?: string; uddannelse?: string;
  sponsorId?: string; sponsorNavn?: string; fotoUrl?: string;
  fotoHotspot?: Hotspot | null;
  holdOverstyring?: string;
  landshold?: boolean; landsholdNiveau?: string;
};
type SanityPerson = {
  id?: string;
  navn: string; slug?: string; rolle?: string; sektion?: string;
  telefon?: string; email?: string; fotoUrl?: string;
  fotoHotspot?: Hotspot | null;
};

const Q_SPONSORER = `*[_type == "sponsor" && aktiv != false] | order(navn asc) {
  "id": _id, navn, niveau, url, "logoUrl": logo.asset->url
}`;

const Q_HOLD = `*[_type == "hold"] | order(raekkefoelge asc) {
  "id": _id, navn, foedselsaar, raekke, "traener": traenere[0]->navn
}`;

const Q_SPILLERE = `*[_type == "spiller" && aktiv != false] {
  "id": _id,
  navn, "slug": slug.current, foedselsaar, rygnummer, position,
  moderklub, uddannelse, landshold, landsholdNiveau,
  "sponsorId": sponsor->_id, "sponsorNavn": sponsor->navn,
  "fotoUrl": portraet.asset->url,
  "fotoHotspot": portraet.hotspot{x, y},
  "holdOverstyring": holdOverstyring->_id
}`;

const Q_PERSONER = `*[_type == "person" && aktiv != false]
  | order(raekkefoelge asc, navn asc) {
  "id": _id,
  navn, "slug": slug.current, rolle, sektion, telefon, email,
  "fotoUrl": portraet.asset->url,
  "fotoHotspot": portraet.hotspot{x, y}
}`;

/* ── Reservedata, hvis Sanity ikke svarer ─────────────────────────────── */

const R_SPONSORER: SanitySponsor[] = roster.sponsorer.map((s) => ({
  id: s.key, navn: s.navn, niveau: s.niveau,
  url: (s as { url?: string }).url,
}));
const R_SPILLERE: SanitySpiller[] = roster.spillere.map((s, i) => ({
  navn: s.navn, slug: udenPraefiks(s.key), foedselsaar: s.foedselsaar,
  rygnummer: (i % 30) + 1,
  sponsorId: s.sponsorId ? `sponsor-${s.sponsorId}` : undefined,
  sponsorNavn: s.sponsorNavn ?? undefined,
}));
const R_PERSONER: SanityPerson[] = roster.stab.map((p) => ({
  navn: p.navn, slug: udenPraefiks(p.key), rolle: p.rolle, sektion: p.sektion,
}));
const R_HOLD: SanityHold[] = saeson.hold.map((h) => ({
  id: `hold-${h.id}`, navn: h.navn, foedselsaar: h.foedselsaar, raekke: h.raekke,
}));

const [sp, ho, spi, pe] = await Promise.all([
  hentEllerFallback('sponsorer', Q_SPONSORER, R_SPONSORER),
  hentEllerFallback('hold', Q_HOLD, R_HOLD),
  hentEllerFallback('spillere', Q_SPILLERE, R_SPILLERE),
  hentEllerFallback('personer', Q_PERSONER, R_PERSONER),
]);

/** Sand når indholdet kom fra Sanity. Vises i POC-banneret. */
export const fraSanity = sp.fraSanity && spi.fraSanity && pe.fraSanity;

/* ── Sponsorer ────────────────────────────────────────────────────────── */

export const sponsorer: Sponsor[] = sp.data.map((s) => ({
  id: udenPraefiks(s.id),
  /* Kun rigtige Sanity-id'er. Reservedataenes nøgler ligner et id, men peger
     ikke på noget dokument — se `docId` på `Sponsor`. */
  docId: sp.fraSanity ? s.id : undefined,
  navn: s.navn,
  niveau: (s.niveau as SponsorNiveau) ?? 'sponsor',
  logoKey: `logo-${udenPraefiks(s.id)}`,
  logoUrl: s.logoUrl,
  url: s.url,
  // Header og sidefod viser hovedsponsoren uden Astros billedbehandling
  logo: s.niveau === 'hovedsponsor' ? '/brand/thisted-forsikring.png' : undefined,
}));

/* ── Hold ─────────────────────────────────────────────────────────────── */

/** Årgangsteksten udregnes af fødselsårene — ingen årstal skrives i hånden. */
const aargangTekst = (aar: number[] = []) =>
  aar.length ? [...aar].sort().join('–') : '';

const HOLDFOTO: Record<string, string> = { u17: 'hold-samlet', u19: 'hold-udenfor' };

export const hold: Hold[] = ho.data.map((h) => {
  const id = udenPraefiks(h.id);
  return {
    id,
    docId: ho.fraSanity ? h.id : undefined,
    navn: h.navn,
    aargang: aargangTekst(h.foedselsaar),
    raekke: h.raekke ?? '',
    traener: h.traener,
    fotoKey: HOLDFOTO[id] ?? 'hold-samlet',
  };
});

/** Hvilke fødselsår hvert hold består af — kommer fra Sanity. */
const AARGANG: Record<string, number[]> = Object.fromEntries(
  ho.data.map((h) => [udenPraefiks(h.id), h.foedselsaar ?? []]),
);

/*
 * ADVAR HVIS TO HOLD SLÅS OM SAMME ÅRGANG.
 *
 * `holdFor()` tager det FØRSTE hold der matcher spillerens fødselsår. Det er
 * forudsigeligt, men kun hvis årgangene ikke overlapper. Gør de det, forsvinder
 * halvdelen af en trup over i det andet hold — og siden ser helt normal ud.
 *
 * Det skete i praksis: et hold "U17-1" blev oprettet med årgangene 2010 og
 * 2009, mens U17 også havde 2009. U17 gik fra 25 til 13 spillere uden at
 * noget så forkert ud.
 *
 * Derfor: skriv det i byggeloggen. En stille halvering af en trup er præcis
 * den slags fejl ingen opdager før nogen spørger hvorfor de mangler.
 */
{
  const set = new Map<number, string[]>();
  for (const [id, aar] of Object.entries(AARGANG)) {
    for (const a of aar) set.set(a, [...(set.get(a) ?? []), id]);
  }
  for (const [aar, hold] of set) {
    if (hold.length > 1) {
      console.warn(
        `  [hold] Årgang ${aar} findes på flere hold: ${hold.join(', ')}. ` +
        `Spillerne havner kun på "${hold[0]}". Ret årgangene i studioet.`,
      );
    }
  }
}

/* ── Spillere ─────────────────────────────────────────────────────────── */

const POS: Position[] = [
  'Målvogter', 'Venstre fløj', 'Venstre back', 'Playmaker',
  'Streg', 'Højre back', 'Højre fløj',
];
const KLUBBER = ['Thisted IK', 'Mors-Thy Håndbold', 'Skive fH', 'Nykøbing Mors IF',
                 'Hurup IF', 'Sydthy HK', 'Struer HK'];
const UDD = ['STX', 'HHX', 'HF'] as const;

export const spillere: Spiller[] = spi.data
  .map((s, i) => ({
    docId: spi.fraSanity ? s.id : undefined,
    navn: s.navn,
    slug: s.slug ?? '',
    fotoKey: `spiller-${s.slug ?? ''}`,
    fotoUrl: s.fotoUrl,
    fotoHotspot: s.fotoHotspot ?? undefined,
    foedselsaar: s.foedselsaar ?? 0,
    holdOverstyring: s.holdOverstyring ? udenPraefiks(s.holdOverstyring) : undefined,
    rygnummer: s.rygnummer ?? i + 1,
    // Felter akademiet endnu ikke har udfyldt vises som eksempeldata, så
    // siden ikke står med huller mens de bliver gennemgået.
    position: (s.position as Position) ?? POS[i % POS.length]!,
    moderklub: s.moderklub ?? KLUBBER[i % KLUBBER.length]!,
    uddannelse: (s.uddannelse as Spiller['uddannelse']) ?? UDD[i % UDD.length]!,
    sponsorId: s.sponsorId ? udenPraefiks(s.sponsorId) : undefined,
    sponsorNavn: s.sponsorNavn,
    /* Landshold er IKKE eksempeldata. Slås feltet ikke til i studioet, står
       der ikke noget mærke — et gæt her ville pynte på en spillers cv. */
    landshold: s.landshold === true,
    landsholdNiveau: s.landsholdNiveau,
    aktiv: true,
  }))
  .filter((s) => s.slug)
  .sort((a, b) => a.rygnummer - b.rygnummer);

/* ── Staben ───────────────────────────────────────────────────────────── */

/*
 * FJERNER EN HALV HTML-TAG FRA ENDEN AF EN TEKST.
 *
 * Udtrækket fra m-tha.dk klippede stabens roller over midt i et tag. Fem af de
 * 25 stod derfor på sitet som:
 *
 *   "Fysioterapeut </d"          "Fysioterapeut </"
 *   "Koordinator EUC Nordvest <" "Assistenttræner U19-2 <spa"
 *
 * Det havde ligget der siden det første udtræk, og det blev først fundet ved
 * at kigge på /staben ved 375 px.
 *
 * Kilden er rettet i `tools/assets.json` og `poc/src/data/roster.json`, men
 * Sanity indeholder stadig de gamle værdier — og dem kan kun en redaktør
 * rette. Derfor renses de også her, så sitet er rigtigt med det samme.
 *
 * Der GÆTTES ikke. Der slettes kun tegn der med sikkerhed ikke er en del af en
 * stillingsbetegnelse. Én rolle er også klippet over midt i et ord —
 * "Koordinator Morsø Gymnasium ST", formentlig "STX" — og den står som den er:
 * et gæt der ser rigtigt ud er værre end en tekst der tydeligt mangler noget.
 */
const udenMarkuprester = (t: string) => t.replace(/\s*<\/?[a-zA-Z]{0,6}$/, '');

{
  const ramte = pe.data
    .filter((p) => p.rolle && udenMarkuprester(p.rolle) !== p.rolle)
    .map((p) => p.navn);
  if (ramte.length) {
    console.warn(
      `  [staben] ${ramte.length} rolle(r) i Sanity indeholder HTML-rester fra ` +
      `udtrækket: ${ramte.join(', ')}. De renses ved visning, men bør rettes i ` +
      `studioet — se listen "⚠ Rolle med HTML-rester".`,
    );
  }
}

export const personer: Person[] = pe.data
  .map((p) => ({
    docId: pe.fraSanity ? p.id : undefined,
    navn: p.navn,
    slug: p.slug ?? '',
    rolle: udenMarkuprester(p.rolle ?? ''),
    fotoKey: `person-${p.slug ?? ''}`,
    fotoUrl: p.fotoUrl,
    fotoHotspot: p.fotoHotspot ?? undefined,
    telefon: p.telefon,
    email: p.email,
    sektion: (p.sektion as Person['sektion']) ?? 'bestyrelse',
  }))
  .filter((p) => p.slug);

/** Sektionsnavnene som de står på m-tha.dk. */
export const SEKTION_NAVNE: Record<Person['sektion'], string> = {
  professionel: 'Professionelle omkring akademiet',
  ansat: 'Ansatte',
  bestyrelse: 'Bestyrelsen',
};

/* ── Opslag ───────────────────────────────────────────────────────────── */

export const getHold = (id: string) => hold.find((h) => h.id === id);

/**
 * Holdet en spiller hører til — UDREGNET ud fra fødselsåret.
 *
 * Sæsonen definerer hvilke årgange hvert hold består af, og spillerne følger
 * med af sig selv. Ved sæsonskifte rettes årgangene på HOLDET i Sanity —
 * ikke på 54 spillere.
 *
 *   U17: [2008, 2009]  →  [2009, 2010]   25 spillere → 12
 *   U19: [2006, 2007]  →  [2007, 2008]   29 spillere → 28
 *
 * En spiller der ikke længere passer i nogen årgang falder automatisk ud af
 * truppen; profilen og historikken består.
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

export const hovedsponsor = (): Sponsor =>
  sponsorer.find((s) => s.niveau === 'hovedsponsor')
  ?? { id: 'thisted-forsikring', navn: 'Thisted Forsikring',
       niveau: 'hovedsponsor',
       logo: '/brand/thisted-forsikring.png',
       url: 'https://www.thistedforsikring.dk/' };

export const iSektion = (s: Person['sektion']) =>
  personer.filter((p) => p.sektion === s);

export const sponsorerPaaNiveau = (n: SponsorNiveau) =>
  sponsorer.filter((s) => s.niveau === n);
