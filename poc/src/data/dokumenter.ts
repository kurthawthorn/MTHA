/**
 * DOKUMENTERNE TIL DOWNLOAD — nu fra Sanity.
 *
 * DET VAR DEN SIDSTE SNOR TIL m-tha.dk
 *   Tre PDF'er blev hentet fra det gamle site ved hver bygning. Så længe det
 *   var tilfældet, kunne dette site ikke ERSTATTE m-tha.dk: den dag den gamle
 *   side lukker, står /dokumenter med tre døde links.
 *
 *   Det var også den sidste kilde til uforudsigelig byggetid. Målt på tre
 *   kørsler i træk: 7, 8 og 185 sekunder for de samme tre filer. Den langsomme
 *   kostede en redaktør fire minutter, fordi hendes eget Udgiv stod i kø bag den.
 *
 * INGEN RESERVEVEJ
 *   Svarer Sanity ikke, vises listen tom med en linje om hvorfor. Der er ikke
 *   noget at falde tilbage på — filerne er ikke i git, og skal ikke være det.
 *   Et dødt downloadlink er værre end ingen liste.
 */

import { hentEllerFallback } from '../lib/sanity';

export interface Dokument {
  id: string;
  titel: string;
  hvorfor: string;
  aar?: number;
  sider?: number;
  /** Færdig adresse der henter filen ned frem for at åbne den. */
  href?: string;
  /** Filens størrelse i kB. Vises, så man ved hvad man klikker på. */
  kb?: number;
}

type SanityDokument = {
  id: string; titel: string; hvorfor?: string; aar?: number; sider?: number;
  url?: string; filnavn?: string; stoerrelse?: number;
};

const Q = `*[_type == "dokument" && defined(fil.asset)]
  | order(raekkefoelge asc, titel asc) {
  "id": _id, titel, hvorfor, aar, sider,
  "url": fil.asset->url,
  "filnavn": fil.asset->originalFilename,
  "stoerrelse": fil.asset->size
}`;

const svar = await hentEllerFallback<SanityDokument[]>('dokumenter', Q, []);

export const dokumenterFraSanity = svar.fraSanity;

export const dokumenter: Dokument[] = svar.data.map((d) => ({
  id: d.id,
  titel: d.titel,
  hvorfor: d.hvorfor ?? '',
  aar: d.aar,
  sider: d.sider,
  /*
   * `?dl=` er Sanitys måde at sige "hent den ned". HTML-attributten `download`
   * virker IKKE på et link til et andet domæne — browseren ignorerer den og
   * åbner filen i stedet. Da filen nu ligger på cdn.sanity.io, er det netop
   * situationen, og parameteren er derfor det der gør det.
   */
  href: d.url ? `${d.url}?dl=${encodeURIComponent(d.filnavn ?? 'dokument.pdf')}` : undefined,
  kb: d.stoerrelse ? Math.round(d.stoerrelse / 1024) : undefined,
})).filter((d) => d.href);

if (!dokumenter.length) {
  console.warn(
    '  [dokumenter] Ingen filer fra Sanity — /dokumenter viser en tom liste. ' +
    'Kør sanity/migrer-dokumenter.mjs, eller læg dem op i studioet.',
  );
}
