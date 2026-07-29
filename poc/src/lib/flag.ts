import { OEVRIGE } from '../data/nationer';

/**
 * FLAGENE — som inline SVG, hentet ind på byggetidspunktet.
 *
 * Filerne ligger i `src/assets/flag/` og hentes ind af
 * `tools/hent-flag.mjs` fra pakken `country-flag-icons` (MIT). Se det script
 * for hvorfor de ligger i repoet frem for i node_modules, og hvorfor det ikke
 * er emoji.
 *
 * `eager: true` betyder at alle 53 flag ligger som strenge i bygningen. Det
 * koster ingenting hos den besøgende: siderne er statiske, så kun det flag der
 * faktisk bruges står i den færdige HTML. Til sammenligning er ét portræt
 * større end alle 53 flag lagt sammen.
 */
const FILER = import.meta.glob<string>('../assets/flag/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/** Nøglet på landekoden — `../assets/flag/DK.svg` bliver `DK`. */
const FLAG: Record<string, string> = Object.fromEntries(
  Object.entries(FILER).map(([sti, svg]) => [
    sti.replace(/^.*\/([^/]+)\.svg$/, '$1'),
    svg,
  ]),
);

/**
 * Flaget for en nation, klar til at lægges i HTML.
 *
 * Kendes koden ikke — fx hvis nogen har fjernet et land fra `nationer.ts` uden
 * at rette spillerne — bruges jordkloden. Der returneres ALDRIG et forkert
 * flag, og aldrig ingenting: et tomt mærke ville se ud som en fejl i browseren.
 *
 * Attributterne sættes her frem for i skabelonen, fordi SVG'en indsættes med
 * `set:html` og derfor ikke kan få dem fra Astro.
 */
export function flagSvg(kode: string | undefined): string {
  const svg = (kode && FLAG[kode]) || FLAG[OEVRIGE];
  return (svg ?? '').replace(
    /^\s*(?:<!--[\s\S]*?-->\s*)*<svg\s/,
    '<svg aria-hidden="true" focusable="false" ',
  );
}

/** Sand hvis vi har et flag til koden. Bruges til at fange en tastefejl. */
export const harFlag = (kode: string | undefined) => Boolean(kode && FLAG[kode]);
