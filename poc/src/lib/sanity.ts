import { createClient } from '@sanity/client';

/**
 * Forbindelsen til Sanity.
 *
 * Datasættet er offentligt læsbart, så bygningen kræver INGEN hemmeligheder.
 * Det er en bevidst fordel: GitHub Actions kan bygge sitet uden at nogen skal
 * vedligeholde et token, og et token der ikke findes, kan ikke lække.
 *
 * Alt hentes på byggetidspunktet. Der sker ingen kald fra browseren, og
 * besøgende får færdige HTML-filer.
 */
export const sanity = createClient({
  projectId: 'g4s1nwak',
  dataset: 'production',
  apiVersion: '2024-01-01',
  // CDN'en er hurtigere og billigere. Ved udgivelse rammer webhooken en ny
  // bygning, så indholdet er friskt selv med caching.
  useCdn: true,
});

/**
 * Henter fra Sanity, men lader ALDRIG bygningen falde på gulvet.
 *
 * Kan Sanity ikke nås — nedetid, netværk, en tastefejl i en forespørgsel —
 * bruges reservedataene fra `poc/src/data/roster.json` i stedet, og der
 * skrives en advarsel i byggeloggen. Sitet bliver altså altid udgivet; i
 * værste fald med indhold der er en smule gammelt.
 *
 * Det er vigtigere end det lyder: uden dette ville en fem minutters
 * udfald hos Sanity betyde, at et push ikke kunne udgives.
 */
export async function hentEllerFallback<T>(
  navn: string,
  forespoergsel: string,
  reserve: T,
): Promise<{ data: T; fraSanity: boolean }> {
  try {
    const svar = await sanity.fetch<T>(forespoergsel);
    const tom = Array.isArray(svar) ? svar.length === 0 : svar == null;
    if (tom) {
      console.warn(`  [sanity] "${navn}" gav intet — bruger reservedata`);
      return { data: reserve, fraSanity: false };
    }
    return { data: svar, fraSanity: true };
  } catch (fejl) {
    const besked = fejl instanceof Error ? fejl.message : String(fejl);
    console.warn(`  [sanity] "${navn}" fejlede (${besked}) — bruger reservedata`);
    return { data: reserve, fraSanity: false };
  }
}

/* ── Billeder fra Sanitys CDN ─────────────────────────────────────────── */

/**
 * Bygger en billed-URL med transformationer.
 *
 * Sanity beskærer og komprimerer selv på deres CDN, så der hentes ikke noget
 * ned under bygningen. `crop=focalpoint` bruger det punkt redaktøren har
 * markeret i studioet — derfor rammer beskæringen ansigtet hver gang.
 */
export function billedUrl(
  url: string | undefined,
  o: { b: number; h?: number; kvalitet?: number } = { b: 600 },
): string | undefined {
  if (!url) return undefined;
  const p = new URLSearchParams({
    w: String(o.b),
    auto: 'format',
    q: String(o.kvalitet ?? 78),
    fit: 'crop',
    crop: 'focalpoint',
  });
  if (o.h) p.set('h', String(o.h));
  return `${url}?${p}`;
}

/** srcset i flere bredder, så telefonen ikke henter et skærmbillede. */
export function billedSrcset(
  url: string | undefined,
  bredder: number[],
  forhold?: number,
  kvalitet?: number,
): string | undefined {
  if (!url) return undefined;
  return bredder
    .map((b) => {
      const h = forhold ? Math.round(b * forhold) : undefined;
      return `${billedUrl(url, { b, h, kvalitet })} ${b}w`;
    })
    .join(', ');
}
