/**
 * Sætter basissti på de hårdkodede links i det byggede site.
 *
 *   node tools/saet-basissti.mjs dist /MTHA/
 *
 * HVORFOR DET HER FINDES
 *   Astro præfikser selv alt hvad den selv har genereret: importerede
 *   billeder, stylesheets og scripts. Men den rører ikke ved tekststrenge i
 *   skabelonerne, og prototypen har 46 hårdkodede links af typen
 *   href="/nyheder" plus filer i public/ som src="/brand/…".
 *
 *   Alternativet var at ændre alle 58 steder til at kalde en hjælpefunktion.
 *   Det ville virke, men det er 58 muligheder for at glemme ét — og fejlen
 *   ville først vise sig som et dødt link i produktion. Ét skript der retter
 *   færdigt HTML kan derimod verificeres: se tælleren til sidst.
 *
 *   Scriptet er en no-op når basisstien er "/", så lokale builds er urørte.
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const [mappe = 'dist', basis = '/'] = process.argv.slice(2);

if (basis === '/' || basis === '') {
  console.log('Basissti er "/" — intet at gøre.');
  process.exit(0);
}

const praefiks = basis.replace(/\/+$/, ''); // "/MTHA"

/** Filer der kan indeholde links. */
const RETTES = new Set(['.html', '.xml', '.txt', '.json']);

/**
 * Attributter med én URL. Rører kun stier der starter med præcis ét "/" og
 * ikke allerede har præfikset — så scriptet kan køres igen uden skade.
 */
const ENKELT = /\b(href|src|content|action)="\/(?!\/)([^"]*)"/g;
/** srcset og imagesrcset har flere URL'er adskilt af komma. */
const FLERE = /\b(srcset|imagesrcset)="([^"]*)"/g;

/** Absolutte URL'er og protokoller skal ikke røres. */
const spring = (v) =>
  v.startsWith('//') ||
  /^(https?:|mailto:|tel:|data:|#|javascript:)/i.test(v) ||
  v.startsWith(`${praefiks}/`) ||
  v === praefiks;

function ret(tekst) {
  let n = 0;

  tekst = tekst.replace(ENKELT, (hele, attr, sti) => {
    const v = `/${sti}`;
    if (spring(v)) return hele;
    // content= bruges også til meta-tekst; kun rene stier præfikses
    if (attr === 'content' && !/^\/[a-z0-9._~/-]*$/i.test(v)) return hele;
    n++;
    return `${attr}="${praefiks}${v}"`;
  });

  tekst = tekst.replace(FLERE, (hele, attr, vaerdi) => {
    const ny = vaerdi
      .split(',')
      .map((del) => {
        const t = del.trim();
        if (!t.startsWith('/') || spring(t.split(/\s+/)[0])) return del;
        n++;
        return ` ${praefiks}${t}`;
      })
      .join(',');
    return `${attr}="${ny.trim()}"`;
  });

  return { tekst, n };
}

async function* filer(dir) {
  for (const post of await readdir(dir, { withFileTypes: true })) {
    const sti = join(dir, post.name);
    if (post.isDirectory()) yield* filer(sti);
    else if (RETTES.has(extname(post.name))) yield sti;
  }
}

let rettede = 0;
let ialt = 0;

for await (const sti of filer(mappe)) {
  const foer = await readFile(sti, 'utf8');
  const { tekst, n } = ret(foer);
  if (n > 0) {
    await writeFile(sti, tekst, 'utf8');
    rettede++;
    ialt += n;
  }
}

console.log(`Basissti "${praefiks}" sat i ${ialt} links på tværs af ${rettede} filer.`);
