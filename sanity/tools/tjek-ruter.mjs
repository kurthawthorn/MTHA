/**
 * TJEKKER AT PRESENTATION MODE KAN FINDE SIDERNE.
 *
 *   cd sanity
 *   npm run tjek
 *
 * Ruterne i `presentation/dokumenter.ts` er det led der gør, at et klik ude på
 * hjemmesiden åbner det rigtige dokument i studioet. De er også det led der er
 * nemmest at få forkert, og sværest at opdage når man har:
 *
 *   1. en basissti. GitHub Pages lægger sitet på /MTHA/, ikke på roden.
 *   2. skråstreg til slut. Astro bygger mapper, så GitHub Pages sender
 *      /MTHA/spillere/x videre til /MTHA/spillere/x/ — og `path-to-regexp`
 *      gør en afsluttende skråstreg valgfri i ADRESSEN, men ikke i MØNSTERET.
 *   3. to slags hold-id'er. `hold-u17` fra migreringen, og et auto-genereret
 *      id på de hold nogen har oprettet i studiofladen.
 *
 * Fejler et af de tre, sker der ikke noget synligt: forhåndsvisningen virker,
 * men felterne skifter bare ikke med. Det ser ud som en fejl i Sanity frem for
 * som en manglende skråstreg i en fil, og derfor er det værd at måle.
 *
 * Scriptet importerer `ruter()` fra selve konfigurationen — det er ikke en
 * kopi. Et tjek der måler sin egen kopi af logikken måler ingenting.
 */

import { match } from 'path-to-regexp';
import { ruter } from '../presentation/site.ts';

/* Samme rækkefølge som i dokumenter.ts. Første match vinder. */
const RUTER = [
  { navn: 'nyhed', route: ruter('/nyheder/:slug') },
  { navn: 'spiller', route: ruter('/spillere/:slug') },
  { navn: 'hold', route: ruter('/hold/:hold') },
  { navn: 'saeson', route: [...ruter('/bliv-elev'), ...ruter('/bliv-elev/oekonomi'),
                            ...ruter('/bolig')] },
  { navn: 'indstillinger', route: ruter('/') },
];

/** Adresse → hvilken dokumenttype der skal åbnes. `null` betyder ingen. */
const PROEVER = [
  ['/MTHA/', 'indstillinger'],
  ['/MTHA', 'indstillinger'],
  ['/', 'indstillinger'],
  ['/MTHA/spillere/anton-sunesen/', 'spiller'],
  ['/MTHA/spillere/anton-sunesen', 'spiller'],
  ['/spillere/anton-sunesen/', 'spiller'],
  ['/MTHA/nyheder/u19-sikrer-sig-plads-i-final4/', 'nyhed'],
  ['/nyheder/u19-sikrer-sig-plads-i-final4', 'nyhed'],
  ['/MTHA/hold/u17/', 'hold'],
  ['/MTHA/hold/d268b965-4c3a-4f2b-9a11-000000000000/', 'hold'],
  ['/MTHA/bliv-elev/', 'saeson'],
  ['/MTHA/bliv-elev/oekonomi/', 'saeson'],
  ['/MTHA/bolig/', 'saeson'],
  /* Sider med mange dokumenter har med vilje ingen rute: værktøjet kan kun
     åbne ét dokument, og at vælge et tilfældigt af 25 er værre end intet. */
  ['/MTHA/staben/', null],
  ['/MTHA/sponsorer/', null],
  ['/MTHA/vaerdier/', null],
  ['/MTHA/uddannelse/', null],
];

let fejl = 0;
console.log('\n═══ RUTER TIL PRESENTATION MODE ═══\n');

for (const [url, forventet] of PROEVER) {
  let fundet = null;
  let params = null;
  for (const r of RUTER) {
    for (const m of r.route) {
      const res = match(m)(url);
      if (res) { fundet = r.navn; params = res.params; break; }
    }
    if (fundet) break;
  }
  const ok = fundet === forventet;
  if (!ok) fejl++;
  const p = params && Object.keys(params).length ? `  ${JSON.stringify(params)}` : '';
  console.log(
    `   ${ok ? 'OK  ' : 'FEJL'} ${url.padEnd(50)} → ${(fundet ?? '(ingen)').padEnd(14)}${p}` +
    (ok ? '' : `   FORVENTET: ${forventet ?? '(ingen)'}`),
  );
}

console.log(`\n${fejl ? `${fejl} rute(r) matcher ikke` : 'Alle ruter matcher som forventet'}\n`);
process.exit(fejl ? 1 : 0);
