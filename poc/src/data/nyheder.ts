/**
 * Nyhederne — fra Sanity, med markdown-filerne som reserve.
 *
 * ÉN FORM, TO KILDER
 *   Sanity leverer "portable text": en liste af blokke med markeringer.
 *   Markdown-filerne i `src/content/nyheder/` er tekst med tegn i. For at
 *   siderne kun skal kunne én ting, oversættes markdown til samme blokform
 *   her. Derfor findes der præcis én visningskomponent — `RigTekst.astro` —
 *   og ingen sider skal vide hvor indholdet kom fra.
 *
 * REKKEFØLGE
 *   1. Sanity. Nye nyheder skrives i studioet.
 *   2. Kan Sanity ikke nås: markdown-filerne, så bygningen aldrig fejler.
 */

import { getCollection } from 'astro:content';
import { hentEllerFallback } from '../lib/sanity';

export type BlokStil = 'normal' | 'h2' | 'blockquote';

export interface Stykke {
  text: string;
  marks?: string[];
}

export interface Blok {
  _type: 'block';
  style: BlokStil;
  listItem?: 'bullet';
  children: Stykke[];
}

export interface Nyhed {
  slug: string;
  titel: string;
  dato: Date;
  kategori: string;
  resume: string;
  kilde: 'cms' | 'instagram';
  fremhaevet: boolean;
  holdId?: string;
  /** Foto fra Sanitys CDN */
  fotoUrl?: string;
  /** Nøgle til den lokale fil i src/assets/fotos/ — reserve */
  fotoKey?: string;
  indhold: Blok[];
}

/* ── Markdown → blokke, til reservevejen ──────────────────────────────── */

function stykker(linje: string): Stykke[] {
  const ud: Stykke[] = [];
  const re = /(\*\*|__)(.+?)\1|(\*|_)(.+?)\3|\[([^\]]+)\]\(([^)]+)\)/g;
  let sidst = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(linje))) {
    if (m.index > sidst) ud.push({ text: linje.slice(sidst, m.index) });
    if (m[2] !== undefined) ud.push({ text: m[2], marks: ['strong'] });
    else if (m[4] !== undefined) ud.push({ text: m[4], marks: ['em'] });
    else ud.push({ text: m[5]! });
    sidst = m.index + m[0].length;
  }
  if (sidst < linje.length) ud.push({ text: linje.slice(sidst) });
  return ud.length ? ud : [{ text: linje }];
}

const blok = (tekst: string, style: BlokStil = 'normal',
              listItem?: 'bullet'): Blok =>
  ({ _type: 'block', style, listItem, children: stykker(tekst) });

/** Dækker det de fem nyheder faktisk bruger: afsnit, ##, >, - og **fed**. */
export function markdownTilBlokke(krop: string): Blok[] {
  const ud: Blok[] = [];
  for (const afsnit of krop.trim().split(/\r?\n\s*\r?\n/)) {
    const linjer = afsnit.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!linjer.length) continue;
    if (linjer.every((l) => /^[-*]\s+/.test(l))) {
      for (const l of linjer) ud.push(blok(l.replace(/^[-*]\s+/, ''), 'normal', 'bullet'));
    } else if (linjer.length === 1 && /^#{2,3}\s+/.test(linjer[0]!)) {
      ud.push(blok(linjer[0]!.replace(/^#+\s+/, ''), 'h2'));
    } else if (linjer.every((l) => l.startsWith('>'))) {
      ud.push(blok(linjer.map((l) => l.replace(/^>\s?/, '')).join(' '), 'blockquote'));
    } else {
      ud.push(blok(linjer.join(' ')));
    }
  }
  return ud;
}

/* ── Hent ─────────────────────────────────────────────────────────────── */

const Q_NYHEDER = `*[_type == "nyhed"] | order(dato desc) {
  "slug": slug.current, titel, dato, kategori, resume, kilde, fremhaevet,
  "holdId": hold->_id,
  "fotoUrl": foto.asset->url,
  "indhold": indhold[]{
    _type, style, listItem,
    "children": children[]{ text, marks }
  }
}`;

type SanityNyhed = Omit<Nyhed, 'dato' | 'indhold' | 'holdId'> & {
  dato: string; holdId?: string; indhold?: Blok[];
};

/** Reservedata: markdown-filerne, oversat til samme form. */
async function fraMarkdown(): Promise<SanityNyhed[]> {
  const poster = await getCollection('nyheder');
  return Promise.all(
    poster.map(async (p) => ({
      slug: p.id,
      titel: p.data.titel,
      dato: p.data.dato.toISOString(),
      kategori: p.data.kategori,
      resume: p.data.resume,
      kilde: p.data.kilde,
      fremhaevet: p.data.fremhaevet,
      holdId: p.data.holdId,
      fotoKey: p.data.fotoKey,
      indhold: markdownTilBlokke(p.body ?? ''),
    })),
  );
}

const svar = await hentEllerFallback<SanityNyhed[]>(
  'nyheder', Q_NYHEDER, await fraMarkdown(),
);

export const nyhederFraSanity = svar.fraSanity;

export const nyheder: Nyhed[] = svar.data
  .filter((n) => n.slug && n.titel)
  .map((n) => ({
    ...n,
    dato: new Date(n.dato),
    holdId: n.holdId?.replace(/^hold-/, ''),
    kilde: n.kilde ?? 'cms',
    fremhaevet: n.fremhaevet ?? false,
    indhold: n.indhold ?? [],
  }))
  .sort((a, b) => b.dato.getTime() - a.dato.getTime());

export const getNyhed = (slug: string) => nyheder.find((n) => n.slug === slug);
