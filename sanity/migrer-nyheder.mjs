/**
 * Flytter nyhederne fra markdown-filer ind i Sanity.
 *
 *   cd sanity
 *   node migrer-nyheder.mjs
 *
 * Læser `poc/src/content/nyheder/*.md`, oversætter teksten til Sanitys
 * "portable text" og uploader det tilhørende foto.
 *
 * HVORFOR EN OVERSÆTTER
 *   Markdown er tekst med tegn i. Portable text er en liste af blokke med
 *   markeringer — netop fordi indholdet så kan vises både på en side, i en
 *   modal, i et RSS-feed og i en app uden at nogen skal parse tegn igen.
 *   Oversætteren herunder dækker det de fem nyheder faktisk bruger:
 *   afsnit, mellemrubrikker (##), citater (>), lister (-) og **fed**.
 *
 * KAN KØRES IGEN
 *   Hver nyhed får _id ud fra filnavnet, og der bruges createOrReplace.
 */

import { createClient } from '@sanity/client';
import { readFile, readdir } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const HER = dirname(fileURLToPath(import.meta.url));
const ROD = join(HER, '..');

for (const navn of ['.env.local', '.env']) {
  const sti = join(HER, navn);
  if (!existsSync(sti)) continue;
  for (const linje of readFileSync(sti, 'utf8').split(/\r?\n/)) {
    const m = linje.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, '');
  }
}

const token = process.env.SANITY_WRITE_TOKEN;
if (!token) {
  console.error('\nMangler SANITY_WRITE_TOKEN. Se sanity/.env.eksempel.\n');
  process.exit(1);
}

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'g4s1nwak',
  dataset: 'production', token, apiVersion: '2024-01-01', useCdn: false,
});

/* ── Frontmatter ──────────────────────────────────────────────────────── */

function delFrontmatter(raa) {
  const m = raa.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, krop: raa };
  const meta = {};
  let noegle = null;
  for (const linje of m[1].split(/\r?\n/)) {
    const par = linje.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (par) {
      noegle = par[1];
      const v = par[2].trim();
      // ">-" betyder at teksten fortsætter på de indrykkede linjer
      meta[noegle] = v === '>-' || v === '>' || v === '' ? '' : v;
    } else if (noegle && /^\s+\S/.test(linje)) {
      meta[noegle] = `${meta[noegle]} ${linje.trim()}`.trim();
    }
  }
  return { meta, krop: m[2] };
}

/* ── Markdown → portable text ─────────────────────────────────────────── */

const noegle = () => randomUUID().slice(0, 12);

/** Oversætter **fed** og *kursiv* til markeringer på tekststykker. */
function tekstStykker(linje) {
  const ud = [];
  const re = /(\*\*|__)(.+?)\1|(\*|_)(.+?)\3|\[([^\]]+)\]\(([^)]+)\)/g;
  let sidst = 0;
  let m;
  while ((m = re.exec(linje))) {
    if (m.index > sidst) {
      ud.push({ _type: 'span', _key: noegle(), text: linje.slice(sidst, m.index), marks: [] });
    }
    if (m[2] !== undefined) {
      ud.push({ _type: 'span', _key: noegle(), text: m[2], marks: ['strong'] });
    } else if (m[4] !== undefined) {
      ud.push({ _type: 'span', _key: noegle(), text: m[4], marks: ['em'] });
    } else {
      // Links bliver almindelig tekst; de fem nyheder har kun interne links,
      // og de hører hjemme som rigtige referencer, ikke som markdown-tegn.
      ud.push({ _type: 'span', _key: noegle(), text: m[5], marks: [] });
    }
    sidst = m.index + m[0].length;
  }
  if (sidst < linje.length) {
    ud.push({ _type: 'span', _key: noegle(), text: linje.slice(sidst), marks: [] });
  }
  return ud.length ? ud : [{ _type: 'span', _key: noegle(), text: linje, marks: [] }];
}

function blok(tekst, style = 'normal', listItem) {
  const b = { _type: 'block', _key: noegle(), style, markDefs: [],
              children: tekstStykker(tekst) };
  if (listItem) { b.listItem = listItem; b.level = 1; }
  return b;
}

function tilPortableText(krop) {
  const blokke = [];
  for (const afsnit of krop.trim().split(/\r?\n\s*\r?\n/)) {
    const linjer = afsnit.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!linjer.length) continue;

    // Liste
    if (linjer.every((l) => /^[-*]\s+/.test(l))) {
      for (const l of linjer) blokke.push(blok(l.replace(/^[-*]\s+/, ''), 'normal', 'bullet'));
      continue;
    }
    // Mellemrubrik
    if (/^#{2,3}\s+/.test(linjer[0]) && linjer.length === 1) {
      blokke.push(blok(linjer[0].replace(/^#+\s+/, ''), 'h2'));
      continue;
    }
    // Citat
    if (linjer.every((l) => l.startsWith('>'))) {
      blokke.push(blok(linjer.map((l) => l.replace(/^>\s?/, '')).join(' '), 'blockquote'));
      continue;
    }
    // Almindeligt afsnit — bløde linjeskift bliver mellemrum
    blokke.push(blok(linjer.join(' ')));
  }
  return blokke;
}

/* ── Billeder ─────────────────────────────────────────────────────────── */

async function upload(fotoKey, alt) {
  if (!fotoKey) return undefined;
  for (const endelse of ['.jpg', '.png']) {
    const sti = join(ROD, 'poc/src/assets/fotos', fotoKey + endelse);
    if (!existsSync(sti)) continue;
    const aktiv = await client.assets.upload('image', await readFile(sti), {
      filename: fotoKey + endelse,
    });
    return { _type: 'image', asset: { _type: 'reference', _ref: aktiv._id }, alt };
  }
  console.warn(`     (fandt ikke billedet "${fotoKey}" — nyheden oprettes uden)`);
  return undefined;
}

/* ── Kør ──────────────────────────────────────────────────────────────── */

const mappe = join(ROD, 'poc/src/content/nyheder');
const filer = (await readdir(mappe)).filter((f) => f.endsWith('.md')).sort();

console.log(`\nFlytter ${filer.length} nyheder ind i Sanity\n`);

let n = 0;
for (const fil of filer) {
  const { meta, krop } = delFrontmatter(await readFile(join(mappe, fil), 'utf8'));
  const slug = basename(fil, '.md');
  const indhold = tilPortableText(krop);

  await client.createOrReplace({
    _id: `nyhed-${slug}`,
    _type: 'nyhed',
    titel: meta.titel,
    slug: { _type: 'slug', current: slug },
    dato: new Date(meta.dato).toISOString(),
    kategori: meta.kategori,
    resume: meta.resume,
    kilde: meta.kilde ?? 'cms',
    fremhaevet: meta.fremhaevet === 'true',
    hold: meta.holdId
      ? { _type: 'reference', _ref: `hold-${meta.holdId}` }
      : undefined,
    foto: await upload(meta.fotoKey, meta.titel),
    indhold,
  });

  n++;
  console.log(`  ${n}. ${meta.titel}`);
  console.log(`     ${indhold.length} blokke · ${meta.kategori} · ${meta.dato}` +
              `${meta.fotoKey ? ` · foto: ${meta.fotoKey}` : ''}`);
}

console.log(`\n${n} nyheder lagt ind.

Markdown-filerne bliver liggende som reserve: kan Sanity ikke naas under en
bygning, viser sitet dem i stedet. Nye nyheder skrives i studioet.
`);
