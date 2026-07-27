/**
 * Lægger prototypens indhold ind i Sanity, så studioet ikke starter tomt.
 *
 *   cd sanity
 *   npm install
 *   export SANITY_STUDIO_PROJECT_ID=xxxxxxxx
 *   export SANITY_WRITE_TOKEN=sk...        # sanity.io/manage -> API -> Tokens
 *   node migrer.mjs
 *
 * Lægger ind:
 *   2 hold, 54 spillere, 25 i staben, 50 sponsorer, 1 sæson
 *   + 79 portrætter og 50 logoer som rigtige billedfelter
 *
 * KAN KØRES IGEN
 *   Alle dokumenter får et forudsigeligt _id, og der bruges createOrReplace.
 *   Kører man scriptet to gange, opdateres posterne — der bliver ikke dubletter.
 *
 * BILLEDERNE
 *   Hentes fra poc/src/assets/, som IKKE er i git. Kør derfor
 *   `python tools/fetch_assets.py` først. Mangler en fil, oprettes posten
 *   uden billede frem for at scriptet stopper.
 */

import { createClient } from '@sanity/client';
import { readFile, access } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HER = dirname(fileURLToPath(import.meta.url));
const ROD = join(HER, '..');

/**
 * Læser .env hvis den findes, så tokenet kan ligge i en fil frem for i en
 * miljøvariabel man skal sætte forfra hver gang. .env er dækket af
 * .gitignore og bliver aldrig committet.
 */
for (const navn of ['.env.local', '.env']) {
  const sti = join(HER, navn);
  if (!existsSync(sti)) continue;
  for (const linje of readFileSync(sti, 'utf8').split(/\r?\n/)) {
    const m = linje.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const vaerdi = m[2].replace(/^["']|["']$/g, '');
    process.env[m[1]] ??= vaerdi;
  }
}

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? 'g4s1nwak';
const token = process.env.SANITY_WRITE_TOKEN;

if (!token) {
  console.error(`
Mangler et skrivetoken.

  Hent det på https://sanity.io/manage/project/g4s1nwak/api
  under "Tokens" — vælg rollen Editor.

Nemmest: opret filen sanity/.env med denne ene linje

  SANITY_WRITE_TOKEN=sk...

Eller sæt den i terminalen:
  PowerShell:  $env:SANITY_WRITE_TOKEN = "sk..."
  Bash:        export SANITY_WRITE_TOKEN=sk...

Tokenet må IKKE committes. .env er dækket af .gitignore.
`);
  process.exit(1);
}

const client = createClient({
  projectId, dataset: 'production', token,
  apiVersion: '2024-01-01', useCdn: false,
});

const findes = async (sti) => { try { await access(sti); return true; } catch { return false; } };

/** Uploader et billede og returnerer et image-felt, eller undefined. */
async function billede(mappe, filnavn, alt) {
  for (const endelse of ['.jpg', '.png']) {
    const sti = join(ROD, 'poc/src/assets', mappe, filnavn + endelse);
    if (!(await findes(sti))) continue;
    const aktiv = await client.assets.upload('image', await readFile(sti), {
      filename: filnavn + endelse,
    });
    return { _type: 'image', asset: { _type: 'reference', _ref: aktiv._id }, alt };
  }
  return undefined;
}

const slug = (s) => ({ _type: 'slug', current: s });
const ref = (id) => ({ _type: 'reference', _ref: id });

/* ── Læs prototypens data ─────────────────────────────────────────────── */

const roster = JSON.parse(
  await readFile(join(ROD, 'poc/src/data/roster.json'), 'utf8'),
);

/** Årgangene står i saeson.ts; her hardkodes de for at holde scriptet simpelt. */
const HOLD = [
  { id: 'u17', navn: 'U17', foedselsaar: [2008, 2009], raekke: 'U17 Liga', raekkefoelge: 1 },
  { id: 'u19', navn: 'U19', foedselsaar: [2006, 2007], raekke: 'U19 Liga', raekkefoelge: 2 },
];

const SAESON = {
  navn: '2024–2025', fra: 2024, til: 2025, bekraeftet: false,
  opholdBoende: 2395, husleje: 2640, forbrug: 516, boligstoette: 425,
  hjemmeboende: 695, traenerHfMors: 300,
  suHjemmeboende: 1060, suUdeboende: 4375, suAar: 2024,
  estimatMad: 2500, estimatTransport: 600,
};

/* ── Skriv ────────────────────────────────────────────────────────────── */

let n = 0;
const log = (hvad) => console.log(`  ${String(++n).padStart(3)} ${hvad}`);

console.log('\nHold');
for (const h of HOLD) {
  await client.createOrReplace({
    _id: `hold-${h.id}`, _type: 'hold',
    navn: h.navn, foedselsaar: h.foedselsaar,
    raekke: h.raekke, raekkefoelge: h.raekkefoelge,
  });
  log(`${h.navn} — årgang ${h.foedselsaar.join('–')}`);
}

console.log('\nSponsorer');
const sponsorId = new Map();
for (const s of roster.sponsorer) {
  const id = `sponsor-${s.key.replace(/^logo-/, '')}`;
  sponsorId.set(s.key, id);
  await client.createOrReplace({
    _id: id, _type: 'sponsor',
    navn: s.navn, niveau: s.niveau, url: s.url, aktiv: true,
    logo: await billede('logoer', s.key, `${s.navn} — sponsor for akademiet`),
  });
  log(`${s.navn} (${s.niveau})`);
}

console.log('\nStaben');
for (const p of roster.stab) {
  await client.createOrReplace({
    _id: `person-${p.key.replace(/^person-/, '')}`, _type: 'person',
    navn: p.navn, slug: slug(p.key.replace(/^person-/, '')),
    sektion: p.sektion, rolle: p.rolle || undefined,
    raekkefoelge: p.rolle?.includes('Daglig leder') ? 1 : 50,
    aktiv: true,
    portraet: await billede('portraetter', p.key, p.navn),
  });
  log(`${p.navn}${p.rolle ? ` — ${p.rolle}` : ''}`);
}

console.log('\nSpillere');
for (const [i, s] of roster.spillere.entries()) {
  const sp = s.sponsorId
    ? [...sponsorId.entries()].find(([k]) => k === `logo-${s.sponsorId}`)?.[1]
    : undefined;
  await client.createOrReplace({
    _id: `spiller-${s.key.replace(/^spiller-/, '')}`, _type: 'spiller',
    navn: s.navn, slug: slug(s.key.replace(/^spiller-/, '')),
    foedselsaar: s.foedselsaar,
    // Eksempeldata fra prototypen — skal gennemgås af akademiet
    rygnummer: (i % 30) + 1,
    aktiv: true,
    sponsor: sp ? ref(sp) : undefined,
    portraet: await billede('portraetter', s.key, s.navn),
  });
  log(`${s.navn} — årgang ${s.foedselsaar}`);
}

console.log('\nSæson');
await client.createOrReplace({ _id: 'saeson', _type: 'saeson', ...SAESON });
log(`${SAESON.navn}`);

console.log(`
Færdig. ${n} dokumenter lagt ind.

  npm run dev      se dem på http://localhost:3333
  npm run deploy   udgiv studioet på mtha.sanity.studio

HUSK: position, moderklub og uddannelse er IKKE overført — de var
eksempeldata i prototypen, og det ville være forkert at lade dem se ægte ud
i det rigtige system. Felterne står tomme og skal udfyldes af akademiet.
Rygnummer er overført som eksempel, så truppen har en rækkefølge.
`);
