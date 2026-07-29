/**
 * LÆGGER DE REDAKTIONELLE FOTOS IND I SANITY.
 *
 *   cd sanity
 *   node migrer-fotos.mjs            # tørkørsel: viser hvad der ville ske
 *   node migrer-fotos.mjs --skriv    # gør det
 *
 * HVORFOR
 *   Før hentede bygningen de 20 fotos fra m-tha.dk hver gang. Målt: 36 af
 *   bygningens 65 sekunder. Og Lars kunne ikke skifte dem — et nyt forsidefoto
 *   krævede at nogen lagde en fil på det GAMLE site med det rigtige filnavn.
 *
 *   Efter dette henter bygningen intet fra m-tha.dk, og et nyt forsidebillede er:
 *   vælg pladsen i studioet, træk fotoet ind, tryk Udgiv.
 *
 * DEN KØRES ÉN GANG
 *   Modsat `migrer.mjs` er dette en engangsflytning. Kører man den igen, skriver
 *   den de samme dokumenter om — og dermed OVER et billede Lars har skiftet i
 *   studioet. Derfor:
 *
 *     * den springer over en plads der allerede har et billede
 *     * `--tving` skal med for at overskrive
 *     * uden `--skriv` gør den ingenting
 *
 *   `migrer.mjs` har ikke den beskyttelse, og det er værd at kende: den skriver
 *   alle 132 dokumenter og 129 billeder om, hotspots inklusive.
 *
 * KILDEFILERNE
 *   Ligger i `poc/src/assets/fotos/` og er IKKE i git. Kør
 *   `python tools/fetch_assets.py fotos` først. Mangler en fil, springes pladsen
 *   over — der oprettes ikke et tomt fotodokument.
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

/* Samme .env-læsning som migrer.mjs. Tokenet må ikke committes. */
for (const navn of ['.env.local', '.env']) {
  const sti = join(HER, navn);
  if (!existsSync(sti)) continue;
  for (const linje of readFileSync(sti, 'utf8').split(/\r?\n/)) {
    const m = linje.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, '');
  }
}

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? 'g4s1nwak';
const token = process.env.SANITY_WRITE_TOKEN;

if (SKRIV && !token) {
  console.error('\nMangler SANITY_WRITE_TOKEN. Læg det i sanity/.env — se migrer.mjs.\n');
  process.exit(1);
}

const client = createClient({
  projectId, dataset: 'production', token,
  apiVersion: '2024-01-01', useCdn: false,
});

/* ── Pladserne og alt-teksterne ───────────────────────────────────────── */

/*
 * Pladserne læses ud af sitets egen fil, så der ikke er to lister der kan komme
 * ud af trit. Alt-teksterne kommer fra det manifest `fetch_assets.py` skrev, som
 * ER i git — det var hele pointen med at holde kortlægningen i git selvom
 * billederne ikke er.
 */
const slotsFil = await readFile(join(ROD, 'poc/src/data/fotoslots.ts'), 'utf8');
const SLOTS = [...slotsFil.matchAll(/\{\s*noegle:\s*'([^']+)',\s*hvor:\s*'([^']*)'/g)]
  .map((m) => ({ noegle: m[1], hvor: m[2] }));

const metaFil = await readFile(join(ROD, 'poc/src/data/billeder.ts'), 'utf8');
const ALT = Object.fromEntries(
  [...metaFil.matchAll(/\{ key: '([^']+)',[^}]*?alt: '((?:[^'\\]|\\.)*)' \}/g)]
    .map((m) => [m[1], m[2].replace(/\\'/g, "'")]),
);

/*
 * De pladser hvor billedet er ren pynt. På forsiden og på /vaerdier ligger der
 * et kraftigt slør og en overskrift oven på fotoet, og en skærmlæser skal
 * springe det over frem for at få en beskrivelse læst op der ikke hjælper.
 * Samme vurdering som `alt=""` på kaldestedet i skabelonen.
 */
const DEKORATIVE = new Set(['dm-2025-vinder', 'dm-jubel']);

if (!SLOTS.length) {
  console.error('Fandt ingen pladser i poc/src/data/fotoslots.ts');
  process.exit(1);
}

/* ── Kør ──────────────────────────────────────────────────────────────── */

const findes = async (sti) => { try { await access(sti); return true; } catch { return false; } };

console.log(
  `\n${SKRIV ? 'SKRIVER' : 'TØRKØRSEL — intet skrives'}` +
  `${TVING ? ' (--tving: overskriver billeder der allerede er der)' : ''}\n`,
);

const eksisterende = new Set(
  (await client.fetch('*[_type == "foto" && defined(billede.asset)].noegle')) ?? [],
);

let lagt = 0, sprunget = 0, manglerFil = 0;

for (const slot of SLOTS) {
  const { noegle, hvor } = slot;

  if (eksisterende.has(noegle) && !TVING) {
    console.log(`   SPRING   ${noegle.padEnd(20)} har allerede et billede i Sanity`);
    sprunget++;
    continue;
  }

  let sti;
  for (const endelse of ['.jpg', '.jpeg', '.png']) {
    const p = join(ROD, 'poc/src/assets/fotos', noegle + endelse);
    if (await findes(p)) { sti = p; break; }
  }
  if (!sti) {
    console.log(`   MANGLER  ${noegle.padEnd(20)} ingen fil — kør fetch_assets.py fotos`);
    manglerFil++;
    continue;
  }

  const kb = ((await stat(sti)).size / 1024).toFixed(0);
  const dekorativ = DEKORATIVE.has(noegle);
  const alt = dekorativ ? undefined : (ALT[noegle] || undefined);

  if (!SKRIV) {
    console.log(
      `   VILLE    ${noegle.padEnd(20)} ${String(kb + ' kB').padStart(8)}  ${hvor}` +
      `${dekorativ ? '  [pynt]' : alt ? '' : '  ⚠ ingen alt-tekst'}`,
    );
    lagt++;
    continue;
  }

  const aktiv = await client.assets.upload('image', await readFile(sti), {
    filename: sti.split(/[\\/]/).pop(),
  });

  await client.createOrReplace({
    _id: `foto-${noegle}`,
    _type: 'foto',
    noegle,
    billede: { _type: 'image', asset: { _type: 'reference', _ref: aktiv._id } },
    ...(alt ? { alt } : {}),
    dekorativ,
  });

  console.log(`   LAGT IND ${noegle.padEnd(20)} ${String(kb + ' kB').padStart(8)}  ${hvor}`);
  lagt++;
}

console.log(
  `\n${SKRIV ? lagt + ' lagt ind' : lagt + ' ville blive lagt ind'}` +
  `${sprunget ? `, ${sprunget} sprunget over` : ''}` +
  `${manglerFil ? `, ${manglerFil} mangler en fil` : ''}\n` +
  `${SKRIV ? 'Tryk Udgiv i studioet, eller vent på den natlige bygning.\n'
           : 'Kør igen med --skriv for at gøre det.\n'}`,
);
