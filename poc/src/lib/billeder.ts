import type { ImageMetadata } from 'astro';

/**
 * Opslag af akademiets egne billeder.
 *
 * Filerne hentes med `python tools/fetch_assets.py` og ligger i
 * src/assets/{fotos,portraetter,logoer}/ — de er holdt uden for git, fordi de
 * tilhoerer akademiet, sponsorerne og fotograferne, og fordi portraetterne
 * viser mindreaarige.
 *
 * Derfor slaar vi op DYNAMISK og accepterer at et billede kan mangle:
 * prototypen bygger og virker uden billederne, hvor den saa falder tilbage
 * paa de farvede pladsholdere. `harBilleder` fortaeller om de er hentet.
 */
const moduler = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}',
  { eager: true },
);

const efterKey = new Map<string, ImageMetadata>();
for (const [sti, mod] of Object.entries(moduler)) {
  const key = sti.split('/').pop()!.replace(/\.[^.]+$/, '');
  efterKey.set(key, mod.default);
}

/** Billedet for en nøgle, eller undefined hvis det ikke er hentet. */
export function billede(key: string | undefined): ImageMetadata | undefined {
  return key ? efterKey.get(key) : undefined;
}

/** Første billede der findes blandt nøglerne — til at falde tilbage i rækkefølge. */
export function foersteBillede(...keys: (string | undefined)[]): ImageMetadata | undefined {
  for (const k of keys) {
    const b = billede(k);
    if (b) return b;
  }
  return undefined;
}

export const antalBilleder = efterKey.size;
export const harBilleder = efterKey.size > 0;
