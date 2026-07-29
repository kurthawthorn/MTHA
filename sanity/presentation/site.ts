/**
 * HVOR PROTOTYPEN LIGGER — og hvorfor det kræver to felter og ikke ét.
 *
 * GitHub Pages lægger et projekt-repo under /MTHA/ frem for på roden. Derfor
 * er adressen delt i to:
 *
 *   ORIGIN   https://kurthawthorn.github.io     hvad iframen må indlæse
 *   BASIS    /MTHA                              hvad hver sti skal præfikses med
 *
 * Presentation-værktøjet lægger `href` fra en location oven på ORIGIN. Var
 * basisstien en del af ORIGIN, ville `new URL('/spillere/x', origin)` smide
 * '/MTHA' væk, og forhåndsvisningen ville ramme en 404. Derfor præfikses hver
 * sti eksplicit med `sti()`.
 *
 * SÅDAN PEGER MAN PÅ EN LOKAL SERVER I STEDET
 *   Læg to linjer i `sanity/.env` (som er dækket af .gitignore):
 *
 *     SANITY_STUDIO_SITE_ORIGIN=http://localhost:4321
 *     SANITY_STUDIO_SITE_BASIS=
 *
 *   Så viser Presentation mode den side der kører på din egen maskine —
 *   nyttigt når man arbejder på layoutet. Uden dem peger den på det live
 *   site, hvilket er det rigtige for Lars.
 */

const ORIGIN = process.env.SANITY_STUDIO_SITE_ORIGIN
  ?? 'https://kurthawthorn.github.io';

/** Uden skråstreg til slut, så `sti()` selv styrer alle skråstreger. */
const BASIS = (process.env.SANITY_STUDIO_SITE_BASIS ?? '/MTHA').replace(/\/+$/, '');

/** Sitets sti til en side, med basisstien sat på. `sti('/')` → `/MTHA/`. */
export const sti = (p = '/') => `${BASIS}/${p}`.replace(/\/{2,}/g, '/');

/** Adressen forhåndsvisningen åbner på, når Lars trykker på Presentation. */
export const START_URL = `${ORIGIN}${sti('/')}`;

/**
 * Hvilke adresser iframen må indlæse.
 *
 * Ud over det live site tillades de to porte Astro bruger lokalt, så man kan
 * skifte forhåndsvisning i værktøjets egen URL-vælger uden at bygge studioet
 * om. Ingen andre origins — en iframe der må indlæse hvad som helst, er en
 * åben dør ind i en session der har skriveadgang til indholdet.
 */
export const TILLADTE_ORIGINS = [
  ORIGIN,
  'https://kurthawthorn.github.io',
  'http://localhost:4321',
  'http://localhost:4322',
];

/**
 * Ruter til `mainDocuments`, i BEGGE varianter — med og uden basisstien.
 *
 * Ruterne matches mod stien i iframen. Peger man forhåndsvisningen på
 * localhost, hvor Astro kører uden basissti, ville en rute der kun kender
 * `/MTHA/spillere/:slug` aldrig matche — og så holder værktøjet op med at
 * åbne det rigtige dokument, uden nogen fejlmeddelelse.
 */
export const ruter = (p: string) => {
  const alle = [sti(p), p];
  /*
   * Og uden skråstreg til slut.
   *
   * `path-to-regexp` gør en AFSLUTTENDE skråstreg valgfri i det man matcher —
   * men ikke i selve mønsteret. Ruten `/MTHA/` matcher derfor `/MTHA/`, men
   * ikke `/MTHA`. Det rammer præcis én rute, nemlig forsidens, og det ville se
   * ud som om forsiden var den eneste side der ikke kunne findes.
   */
  for (const r of [...alle]) {
    if (r.length > 1 && r.endsWith('/')) alle.push(r.replace(/\/$/, ''));
  }
  return [...new Set(alle)];
};
