/**
 * DE REDAKTIONELLE FOTOS — nu fra Sanity.
 *
 * HVAD DER BLEV LØST
 *   Før hentede bygningen billederne fra m-tha.dk hver gang. Målt på en kørsel:
 *   36 af 65 sekunder gik med det, altså over halvdelen — og af de 149 filer der
 *   blev hentet, blev 13 brugt. Portrætterne og logoerne kom nemlig allerede fra
 *   Sanitys CDN; de blev hentet uden at nogen sad og så på dem.
 *
 *   Samtidig kunne Lars ikke skifte et forsidebillede. Det krævede at nogen lagde
 *   en fil på det GAMLE site med det rigtige filnavn, for at det nye kunne hente
 *   den. Det er så bagvendt at det er værd at skrive ned.
 *
 * RESERVEVEJEN BESTÅR
 *   Kan Sanity ikke nås, falder komponenten `Foto.astro` tilbage på de lokale
 *   filer i `src/assets/fotos/` — hvis de er hentet. Er de ikke, vises en farvet
 *   pladsholder. Bygningen fejler aldrig fordi et billede mangler; siden er
 *   vigtigere end fotoet.
 */

import { hentEllerFallback, type Hotspot } from '../lib/sanity';
import { FOTO_SLOTS } from './fotoslots';

export interface Foto {
  noegle: string;
  /** Tom streng betyder bevidst dekorativ — se `dekorativ` i skemaet. */
  alt: string;
  url?: string;
  hotspot?: Hotspot;
  /** Billedets egne mål. Bruges til width/height, så siden ikke hopper. */
  bredde?: number;
  hoejde?: number;
}

type SanityFoto = {
  noegle?: string;
  alt?: string;
  dekorativ?: boolean;
  url?: string;
  hotspot?: Hotspot | null;
  dim?: { width?: number; height?: number } | null;
};

const Q_FOTOS = `*[_type == "foto" && defined(noegle)] {
  noegle, alt, dekorativ,
  "url": billede.asset->url,
  "hotspot": billede.hotspot{x, y},
  "dim": billede.asset->metadata.dimensions{width, height}
}`;

/*
 * Ingen reservedata her.
 *
 * De andre forespørgsler falder tilbage på `roster.json`, fordi et navn og en
 * årgang findes i git. Et billede gør ikke: filerne er bevidst holdt uden for
 * git. Svarer Sanity ikke, er den rigtige reserve derfor de lokale filer — og
 * dem finder `Foto.astro` selv. En tom liste er det ærlige svar.
 */
const svar = await hentEllerFallback<SanityFoto[]>('fotos', Q_FOTOS, []);

export const fotosFraSanity = svar.fraSanity;

const efterNoegle = new Map<string, Foto>();
for (const f of svar.data) {
  if (!f.noegle) continue;
  efterNoegle.set(f.noegle, {
    noegle: f.noegle,
    /* Dekorativ vinder over alt-teksten: er kontakten slået til, skal der stå
       alt="" uanset hvad nogen engang skrev i feltet. */
    alt: f.dekorativ ? '' : (f.alt ?? ''),
    url: f.url,
    hotspot: f.hotspot ?? undefined,
    bredde: f.dim?.width,
    hoejde: f.dim?.height,
  });
}

/** Fotoet på en plads, eller undefined hvis pladsen er tom i Sanity. */
export const foto = (noegle: string | undefined) =>
  noegle ? efterNoegle.get(noegle) : undefined;

/*
 * ADVAR OM TOMME PLADSER.
 *
 * En tom plads betyder et hul i layoutet — en grå kasse på forsiden eller et
 * facilitetskort uden billede. Det er synligt, men kun hvis nogen ser på netop
 * den side, og det er derfor lige den slags der bliver opdaget af en forælder
 * frem for af os.
 */
{
  const tomme = FOTO_SLOTS.filter((s) => !efterNoegle.has(s.noegle));
  if (svar.fraSanity && tomme.length) {
    console.warn(
      `  [fotos] ${tomme.length} af ${FOTO_SLOTS.length} billedpladser er tomme ` +
      `i Sanity: ${tomme.map((s) => s.noegle).join(', ')}. ` +
      `Sitet bruger de lokale filer hvis de er hentet, ellers en pladsholder.`,
    );
  }
  if (!svar.fraSanity) {
    console.warn(
      '  [fotos] Ingen billeder fra Sanity — de lokale filer i src/assets/fotos/ ' +
      'bruges hvis de er hentet.',
    );
  }
}
