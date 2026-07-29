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
  /*
   * IKKE CDN'en. Det er vigtigt, og det kostede en times fejlfinding.
   *
   * Webhooken fyrer i samme sekund en redaktør trykker Udgiv, og bygningen
   * starter få sekunder efter. Sanitys CDN kan på det tidspunkt stadig levere
   * den forrige version — uregelmæssigt, afhængigt af hvilken edge man rammer.
   *
   * Resultatet ville være: Lars trykker Udgiv, bygningen kører og melder
   * succes, og siden viser det gamle. Næste natlige bygning ville rette det,
   * så fejlen ville se tilfældig ud. Målt: Sanity svarede 35, bygningen skrev
   * 44.
   *
   * Vi bygger en håndfuld gange om dagen. CDN'ens fordel — fart og pris ved
   * mange kald — er derfor uden betydning her, mens korrekthed er alt.
   */
  useCdn: false,
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

/** Redaktørens markering af hvad billedet handler om. 0–1 på hver akse. */
export interface Hotspot { x: number; y: number }

export interface Billedvalg {
  /** Bredde i pixels. */
  b: number;
  /** Højde i pixels. Sættes den, beskæres billedet til netop det forhold. */
  h?: number;
  kvalitet?: number;
  /**
   * Hvor beskæringen holder fast, når billedets eget forhold ikke passer til
   * det forhold der bliver bedt om.
   *
   *   center       midten. Standard, og det Sanity gør af sig selv.
   *   top          øverste kant. Til portrætter uden hotspot — se nedenfor.
   *   bottom       nederste kant.
   *   focalpoint   redaktørens hotspot. Kræver `fp`.
   */
  anker?: 'center' | 'top' | 'bottom' | 'focalpoint';
  /** Hotspottet fra Sanity. Kun meningsfuldt sammen med `anker: 'focalpoint'`. */
  fp?: Hotspot;
}

/**
 * Bygger en billed-URL med transformationer.
 *
 * Sanity beskærer og komprimerer selv på deres CDN, så der hentes ikke noget
 * ned under bygningen.
 *
 * FEJLEN DER LÅ HER — og som kostede hovedet på 54 portrætter
 *   Der stod `crop=focalpoint` uden `fp-x` og `fp-y`. Men Sanitys billed-API
 *   læser IKKE hotspottet af sig selv; det skal sendes med som parametre.
 *   Uden dem falder `focalpoint` tilbage på 0,5 / 0,5 — altså midten.
 *
 *   Det så ud som om hotspot-funktionen virkede. Den var i praksis slået fra,
 *   og på et portræt er midten det værst mulige sted at holde fast: alle 54
 *   fotos er 600 × 900, og en beskæring til 3 : 4 skar derfor 5,6 % af toppen
 *   væk — netop der hvor hovedet er, fordi der næsten ingen luft er over det.
 *
 *   Nu sendes hotspottet med når det findes, og `portraetAnker()` holder fast
 *   i TOPPEN når det ikke gør. Så kan et portræt ikke miste hovedet, uanset om
 *   nogen har husket at markere ansigtet.
 */
export function billedUrl(
  url: string | undefined,
  o: Billedvalg = { b: 600 },
): string | undefined {
  if (!url) return undefined;
  const anker = o.anker ?? (o.fp ? 'focalpoint' : 'center');
  const p = new URLSearchParams({
    w: String(o.b),
    auto: 'format',
    q: String(o.kvalitet ?? 78),
    fit: 'crop',
    crop: anker,
  });
  if (o.h) p.set('h', String(o.h));
  if (anker === 'focalpoint' && o.fp) {
    /* Sanity vil have tal mellem 0 og 1, med højst tre decimaler. */
    p.set('fp-x', o.fp.x.toFixed(3));
    p.set('fp-y', o.fp.y.toFixed(3));
  }
  return `${url}?${p}`;
}

/**
 * Beskæringen til et portræt: redaktørens hotspot hvis der findes et, ellers
 * den øverste kant.
 *
 * Toppen frem for midten, fordi et portræt er et menneske der står op. Skæres
 * der i toppen, forsvinder hovedet; skæres der i bunden, forsvinder noget af
 * trøjen. Det er ikke et svært valg — men det skal træffes ét sted, og det er
 * her.
 */
export const portraetAnker = (fp?: Hotspot): Pick<Billedvalg, 'anker' | 'fp'> =>
  fp ? { anker: 'focalpoint', fp } : { anker: 'top' };

/** srcset i flere bredder, så telefonen ikke henter et skærmbillede. */
export function billedSrcset(
  url: string | undefined,
  bredder: number[],
  o: { forhold?: number; kvalitet?: number } & Pick<Billedvalg, 'anker' | 'fp'> = {},
): string | undefined {
  if (!url) return undefined;
  return bredder
    .map((b) => {
      const h = o.forhold ? Math.round(b * o.forhold) : undefined;
      return `${billedUrl(url, { ...o, b, h })} ${b}w`;
    })
    .join(', ');
}
