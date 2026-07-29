/**
 * FLYTTER DE TRE PDF'ER IND I SANITY.
 *
 *   cd sanity
 *   node migrer-dokumenter.mjs            # tørkørsel
 *   node migrer-dokumenter.mjs --skriv    # gør det
 *
 * HVORFOR
 *   Det er den sidste snor til m-tha.dk. Så længe bygningen hentede disse tre
 *   filer fra det gamle site, kunne det nye ikke erstatte det: den dag m-tha.dk
 *   lukker, står /dokumenter med tre døde links.
 *
 *   Og de gjorde byggetiden uforudsigelig. Målt på tre kørsler i træk: 7, 8 og
 *   185 sekunder for de samme tre filer.
 *
 * SOM migrer-fotos.mjs: en ENGANGSFLYTNING
 *   Springer over dokumenter der allerede har en fil. `--tving` overskriver.
 *   Uden `--skriv` gør den ingenting.
 *
 * KILDEFILERNE
 *   `poc/public/dokumenter/*.pdf`, som IKKE er i git. Kør
 *   `python ../tools/fetch_assets.py dokumenter` først — den sidste gang det
 *   script nogensinde skal bruges til noget.
 */

import { createClient } from '@sanity/client';
import { readFile, access, stat } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HER = dirname(fileURLToPath(import.meta.url));
const ROD = join(HER, '..');

const SKRIV = process.argv.includes('--skriv');
const TVING = process.argv.includes('--tving');

for (const navn of ['.env.local', '.env']) {
  const sti = join(HER, navn);
  if (!existsSync(sti)) continue;
  for (const linje of readFileSync(sti, 'utf8').split(/\r?\n/)) {
    const m = linje.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, '');
  }
}

const token = process.env.SANITY_WRITE_TOKEN;
if (SKRIV && !token) {
  console.error('\nMangler SANITY_WRITE_TOKEN. Læg det i sanity/.env — se migrer.mjs.\n');
  process.exit(1);
}

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'g4s1nwak',
  dataset: 'production', token, apiVersion: '2024-01-01', useCdn: false,
});

/*
 * De tre dokumenter, som de stod hårdkodet i `poc/src/pages/dokumenter.astro`.
 * Titel, årstal, sidetal og linjen om hvorfor det er en fil — alt det som
 * herefter kan rettes i studioet.
 */
const DOKUMENTER = [
  { id: 'dokument-vedtaegter', fil: 'vedtaegter.pdf',
    titel: 'Vedtægter', aar: 2025, sider: 5,
    hvorfor: 'Underskrevet dokument', raekkefoelge: 1 },
  { id: 'dokument-referat-generalforsamling-2025', fil: 'referat-generalforsamling-2025.pdf',
    titel: 'Referat fra generalforsamling, oktober 2025', aar: 2025, sider: 6,
    hvorfor: 'Underskrevet referat', raekkefoelge: 2 },
  { id: 'dokument-elevkontrakt', fil: 'kontrakt.pdf',
    titel: 'Elevkontrakt', aar: 2024, sider: 5,
    hvorfor: 'Skal printes og underskrives', raekkefoelge: 3 },
];

const findes = async (sti) => { try { await access(sti); return true; } catch { return false; } };

console.log(`\n${SKRIV ? 'SKRIVER' : 'TØRKØRSEL — intet skrives'}${TVING ? ' (--tving)' : ''}\n`);

const harFil = new Set(
  (await client.fetch('*[_type == "dokument" && defined(fil.asset)]._id')) ?? [],
);

let lagt = 0, sprunget = 0, mangler = 0;

for (const d of DOKUMENTER) {
  if (harFil.has(d.id) && !TVING) {
    console.log(`   SPRING   ${d.fil.padEnd(38)} har allerede en fil i Sanity`);
    sprunget++;
    continue;
  }

  const sti = join(ROD, 'poc/public/dokumenter', d.fil);
  if (!(await findes(sti))) {
    console.log(`   MANGLER  ${d.fil.padEnd(38)} kør fetch_assets.py dokumenter`);
    mangler++;
    continue;
  }

  const kb = ((await stat(sti)).size / 1024).toFixed(0);

  if (!SKRIV) {
    console.log(`   VILLE    ${d.fil.padEnd(38)} ${String(kb + ' kB').padStart(8)}  ${d.titel}`);
    lagt++;
    continue;
  }

  const aktiv = await client.assets.upload('file', await readFile(sti), {
    filename: d.fil,
    contentType: 'application/pdf',
  });

  await client.createOrReplace({
    _id: d.id,
    _type: 'dokument',
    titel: d.titel,
    fil: { _type: 'file', asset: { _type: 'reference', _ref: aktiv._id } },
    hvorfor: d.hvorfor,
    aar: d.aar,
    sider: d.sider,
    raekkefoelge: d.raekkefoelge,
  });

  console.log(`   LAGT IND ${d.fil.padEnd(38)} ${String(kb + ' kB').padStart(8)}  ${d.titel}`);
  lagt++;
}

console.log(
  `\n${SKRIV ? lagt + ' lagt ind' : lagt + ' ville blive lagt ind'}` +
  `${sprunget ? `, ${sprunget} sprunget over` : ''}` +
  `${mangler ? `, ${mangler} mangler en fil` : ''}\n` +
  `${SKRIV ? 'Herefter henter bygningen INTET fra m-tha.dk.\n'
           : 'Kør igen med --skriv for at gøre det.\n'}`,
);
