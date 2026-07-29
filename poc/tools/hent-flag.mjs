/**
 * HENTER FLAGENE IND I REPOET.
 *
 *   node tools/hent-flag.mjs
 *
 * Kopierer ét SVG-flag pr. land i `src/data/nationer.ts` fra pakken
 * `country-flag-icons` (MIT) over i `src/assets/flag/`.
 *
 * HVORFOR KOPIERE FREM FOR AT LÆSE FRA node_modules
 *   Flagene er en del af designet, ligesom skrifterne i `public/skrift/`. De
 *   ligger derfor i repoet: bygningen skal ikke kunne knække fordi en pakke
 *   ændrer sin mappestruktur, og man skal kunne se i en diff hvis et flag
 *   ændrer sig. Til sammen er de omkring 25 kB — mindre end ét portræt.
 *
 * HVORFOR IKKE TEGNE DEM SELV
 *   Der er 52 lande. Halvdelen er korsflag og trefarvede bånd, som er nemme —
 *   men Montenegro, Cypern, Slovenien, San Marino og Kosovo har våbenskjolde
 *   og landkort, og en hjemmetegnet forenkling af et andet lands flag er ikke
 *   en forenkling, den er et forkert flag.
 *
 * HVORFOR IKKE EMOJI-FLAG
 *   🇩🇰 ser forskelligt ud på Windows, iPhone og Android, og på Windows vises
 *   det som bogstaverne "DK" i en kasse — altså slet ikke som et flag.
 *   Designtjekket forbyder desuden emoji som ikoner.
 *
 * HVORFOR IKKE EN PAKKE DER INDLÆSES I BROWSEREN
 *   Der skal ikke hentes noget. Flaget lægges direkte i HTML'en som SVG, kun
 *   for de spillere der faktisk har et mærke. Danmark er 181 bytes.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROD = join(dirname(fileURLToPath(import.meta.url)), '..');
const KILDE = join(ROD, 'node_modules/country-flag-icons/3x2');
const MAAL = join(ROD, 'src/assets/flag');

/* Læser landelisten som tekst frem for at importere den: filen er TypeScript,
   og dette script skal kunne køre med et bart `node`. */
const liste = readFileSync(join(ROD, 'src/data/nationer.ts'), 'utf8');
const koder = [...liste.matchAll(/\{\s*kode:\s*'([A-Z]{2})'/g)].map((m) => m[1]);

if (!koder.length) {
  console.error('Fandt ingen landekoder i src/data/nationer.ts');
  process.exit(1);
}

mkdirSync(MAAL, { recursive: true });

let hentet = 0;
let mangler = 0;
let bytes = 0;

for (const kode of koder) {
  try {
    const svg = readFileSync(join(KILDE, `${kode}.svg`), 'utf8');
    writeFileSync(join(MAAL, `${kode}.svg`), svg);
    bytes += svg.length;
    hentet++;
  } catch {
    console.error(`  MANGLER  ${kode} findes ikke i country-flag-icons`);
    mangler++;
  }
}

/* Rydder op efter et land der er fjernet fra listen, så mappen ikke samler
   flag ingen bruger. `oevrige.svg` er vores eget og skal blive. */
const beholdes = new Set([...koder.map((k) => `${k}.svg`), 'oevrige.svg']);
let slettet = 0;
for (const fil of readdirSync(MAAL)) {
  if (fil.endsWith('.svg') && !beholdes.has(fil)) {
    unlinkSync(join(MAAL, fil));
    slettet++;
  }
}

console.log(
  `\n${hentet} flag hentet (${(bytes / 1024).toFixed(1)} kB i alt)` +
  `${slettet ? `, ${slettet} forældede slettet` : ''}` +
  `${mangler ? `, ${mangler} MANGLER` : ''}\n`,
);
process.exit(mangler ? 1 : 0);
