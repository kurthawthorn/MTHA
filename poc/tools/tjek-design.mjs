/**
 * Måler sitet mod de kritiske punkter i UI/UX-tjeklisten.
 *
 *   node tools/tjek-design.mjs
 *
 * Kontrast regnes efter WCAG 2.1: relativ luminans og forholdet
 * (L1 + 0.05) / (L2 + 0.05). Grænserne er 4.5:1 for brødtekst og 3:1 for
 * stor tekst (18,66px fed eller 24px normal) og for grafiske elementer.
 *
 * Dette er ikke en erstatning for at se på siden — men farvekontrast og
 * berøringsmål er netop de ting man IKKE kan se, og som rammer dem der har
 * sværest ved at bruge sitet i forvejen.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROD = join(dirname(fileURLToPath(import.meta.url)), '..');

/* ── Kontrast ─────────────────────────────────────────────────────────── */

const kanal = (v) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

function luminans(hex) {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
  return 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);
}

const kontrast = (a, b) => {
  const [l1, l2] = [luminans(a), luminans(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

/* ── Farver fra global.css ────────────────────────────────────────────── */

const css = readFileSync(join(ROD, 'src/styles/global.css'), 'utf8');

/* Lys palet = kun det foerste :root-blok. Moerk = kun media-blokken.
   Laeses hele filen i ét haps, overskriver de moerke vaerdier de lyse — og
   saa maaler man paa noget der ikke findes. */
const grænse = css.indexOf('@media (prefers-color-scheme: dark)');
const lysBlok = css.slice(0, grænse);
const moerkBlok = css.slice(grænse, css.indexOf('}', css.indexOf('}', grænse) + 1));

const farver = (blok) => Object.fromEntries(
  [...blok.matchAll(/--([a-z0-9-]+):\s*(#[0-9A-Fa-f]{3,6});/g)].map((m) => [m[1], m[2]]),
);
const lys = farver(lysBlok);
/* Moerk arver alt der ikke omdefineres */
const moerk = { ...lys, ...farver(moerkBlok) };

/** De kombinationer der faktisk optræder på sitet. */
const PAR = [
  ['brødtekst på papir', 'text', 'paper', 4.5],
  ['dæmpet tekst på papir', 'text-dim', 'paper', 4.5],
  ['svag tekst på papir', 'text-faint', 'paper', 4.5],
  ['brødtekst på kort', 'text', 'surface', 4.5],
  ['dæmpet tekst på kort', 'text-dim', 'surface', 4.5],
  ['svag tekst på kort', 'text-faint', 'surface', 4.5],
];

/*
 * Par der kun findes i ét tema. Foer stod de i listen ovenfor og gav to
 * falske alarmer: i moerk visning bruger links `navy-300`, ikke `navy-600`,
 * og headeren forbliver LYS uanset tema — saa navy-paa-moerk opstaar aldrig.
 * At maale par der ikke findes er vaerre end ikke at maale: man jagter fejl
 * der ikke er der, og overser dem der er.
 */
const KUN_LYS = [
  ['eyebrow (orange-600)', 'orange-600', 'paper', 4.5],
  ['link', 'navy-600', 'paper', 4.5],
  ['menutekst i header', 'navy', 'surface', 4.5],
];
const KUN_MOERK = [
  ['link (navy-300)', 'navy-300', 'paper', 4.5],
  ['eyebrow (orange)', 'orange', 'paper', 4.5],
];

console.log('\n═══ KONTRAST (WCAG 2.1) ═══\n');
let fejl = 0;
for (const tema of [['LYS', lys], ['MØRK', moerk]]) {
  const [navn, p] = tema;
  console.log(`  ── ${navn} ──`);
  const ekstra = navn === 'LYS' ? KUN_LYS : KUN_MOERK;
  for (const [label, fg, bg, kraev] of [...PAR, ...ekstra]) {
    const f = p[fg] ?? lys[fg];
    const b = p[bg] ?? lys[bg];
    if (!f || !b) continue;
    const k = kontrast(f, b);
    const ok = k >= kraev;
    if (!ok) fejl++;
    console.log(
      `   ${ok ? 'OK  ' : 'FEJL'} ${label.padEnd(32)} ${k.toFixed(2)}:1` +
      `  (kræver ${kraev}:1)  ${f} på ${b}`,
    );
  }
  console.log();
}

/* ── Berøringsmål og andet i det byggede site ─────────────────────────── */

const dist = join(ROD, 'dist');
const sider = readdirSync(dist, { recursive: true })
  .filter((f) => String(f).endsWith('.html'))
  .map((f) => join(dist, String(f)));

const alle = sider.map((s) => readFileSync(s, 'utf8'));
const forside = readFileSync(join(dist, 'index.html'), 'utf8');
const byggetCss = readdirSync(join(dist, '_astro'))
  .filter((f) => f.endsWith('.css'))
  .map((f) => readFileSync(join(dist, '_astro', f), 'utf8'))
  .join('');

/* Tael fejl, saa scriptet kan afslutte med en fejlkode. Uden det ville
   GitHub Actions se en groen bygning selvom tjekket fandt noget. */
let problemer = 0;
const tjek = (navn, ok, note = '') => {
  if (!ok) problemer++;
  console.log(`   ${ok ? 'OK  ' : 'SE  '} ${navn.padEnd(42)}${note}`);
};

console.log('═══ TILGÆNGELIGHED OG STRUKTUR ═══\n');
tjek('lang="da" på alle sider', alle.every((h) => h.includes('lang="da"')));
tjek('viewport uden maximum-scale',
  alle.every((h) => h.includes('width=device-width') && !h.includes('maximum-scale')));
tjek('synlig fokusmarkering', byggetCss.includes(':focus-visible'));
tjek('prefers-reduced-motion respekteret', byggetCss.includes('prefers-reduced-motion'));
tjek('spring-til-indhold-link', forside.includes('class="skip"'));
tjek('ingen emoji som ikoner',
  !alle.some((h) => /<(span|i|div)[^>]*>[\u{1F300}-\u{1FAFF}]/u.test(h)));

/*
 * Tælles PR. FIL — ikke på alle sider limet sammen.
 *
 * To fejl i denne ene linje kostede en halv times jagt på fejl der ikke fandtes:
 *
 *   1. `alle.join('')` uden adskiller lader en regex matche hen over en
 *      filgrænse: slutningen af én side plus starten af den næste blev til et
 *      <img> der ikke findes noget sted. Gav 7 spøgelser.
 *   2. `\balt=` accepterer kun alt="...". Men `compressHTML` forkorter alt=""
 *      til et bart `alt`, hvilket er gyldig HTML5 og betyder præcis det samme
 *      — dekorativt billede. Gav 12 falske fejl.
 *
 * Pointen: et tjek man ikke selv har efterprøvet er værre end intet tjek.
 * Det sender én ud at rette noget der virker.
 */
const taelIAlle = (re) => alle.reduce((n, h) => n + (h.match(re) ?? []).length, 0);

/*
 * LÆKKET MARKUP I INDHOLD.
 *
 * Udtrækket fra m-tha.dk klippede stabens roller over midt i et HTML-tag, så
 * fem af dem stod på sitet som "Fysioterapeut </d" og "Koordinator EUC
 * Nordvest <". Det havde ligget der siden det første udtræk.
 *
 * Et `<` i indhold bliver `&lt;` i den byggede HTML. Der findes ikke ét
 * legitimt sted på sitet hvor et mindre-end-tegn hører til i en tekst, så det
 * er et rent signal: findes det, er der markup der er sivet ind i data.
 *
 * Tjekket findes fordi fejlen var USYNLIG for alt andet. Kontrasten var fin,
 * alt-teksterne var på plads, hierarkiet var korrekt. Det stod bare noget
 * forkert, og det blev først fundet ved at kigge på /staben ved 375 px.
 */
const lækket = taelIAlle(/&lt;\/?[a-zA-Z]{0,6}(?![a-zA-Z])/g);
tjek('ingen HTML-rester i indhold', lækket === 0,
  lækket ? `${lækket} sted(er) med &lt; i en tekst` : '');

const udenAlt = taelIAlle(/<img(?![^>]*\salt(?:=|[\s>]))[^>]*>/g);
tjek('alle billeder har alt-tekst', udenAlt === 0,
  udenAlt ? `${udenAlt} uden alt` : '');

const tommeAlt = taelIAlle(/<img[^>]*\salt(?:=""|(?=[\s>]))/g);
console.log(`        (${tommeAlt} bevidst tomme alt="" — dekorative billeder)`);

/*
 * Berøringsmål kan ikke måles præcist uden en browser, men de værdier der ER
 * i CSS'en kan tjekkes — og det fanger den fejl der faktisk sker: at nogen
 * tilføjer en lille knap uden at tænke over hvor stor en finger er.
 *
 * Målt før rettelsen: .btn 36px, .chip 22px, menupunkter 24px. Alt under 44.
 */
/*
 * Overskriftshierarki. Skærmlæserbrugere navigerer på overskrifter, så et
 * spring fra h1 til h3 betyder at et niveau mangler i sidens disposition.
 * Fangede 61 spring første gang: sidefodens h3 på sider uden nogen h2.
 */
console.log('\n═══ OVERSKRIFTER ═══\n');
const springer = alle.filter((h) => {
  const n = [...h.matchAll(/<h([1-6])[ >]/g)].map((m) => Number(m[1]));
  return n.some((v, i) => i > 0 && v - n[i - 1] > 1);
}).length;
tjek('intet spring i hierarkiet', springer === 0,
  springer ? `${springer} sider springer et niveau over` : '');

const forkertH1 = alle.filter((h) => (h.match(/<h1[ >]/g) ?? []).length !== 1).length;
tjek('præcis én h1 pr. side', forkertH1 === 0,
  forkertH1 ? `${forkertH1} sider afviger` : '');

console.log('\n═══ BERØRINGSMÅL ═══\n');
tjek('knapper har min-height 44px', /\.btn[^{]*\{[^}]*min-height:44px/.test(byggetCss));
tjek('usynligt trykfelt på små elementer',
  /\.chip[^{]*:after\{[^}]*inset:-11px/.test(byggetCss));
tjek('menupunkter udvidet lodret',
  /nav a[^{]*:after\{[^}]*inset:-10px/.test(byggetCss));

console.log('\n═══ YDELSE ═══\n');
const idx = readFileSync(join(dist, 'index.html'));
tjek('forside under 50 KB HTML', idx.length < 50000, `${(idx.length / 1024).toFixed(1)} KB`);
tjek('billeder i moderne format',
  /\.webp|auto=format/.test(forside), 'WebP + Sanity auto=format');
tjek('lazy loading under folden',
  (forside.match(/loading="lazy"/g) ?? []).length > 5,
  `${(forside.match(/loading="lazy"/g) ?? []).length} billeder`);
tjek('bredde+højde på billeder (mod layoutspring)',
  (forside.match(/<img[^>]*width=/g) ?? []).length > 0);

/*
 * JavaScript paa forsiden — INKLUSIV de eksterne moduler.
 *
 * Foer taltes kun indholdet mellem <script> og </script>. Da overlejringen til
 * Sanitys Presentation mode kom til, blev den lagt i en separat fil og
 * indsat med src — og tjekket blev derfor ved med at melde 983 bytes, mens
 * browseren hentede 2,7 kB. Et tal der ikke aendrer sig naar virkeligheden
 * goer, er vaerre end intet tal: man tror man har maalt noget.
 */
const inlineJs = [...forside.matchAll(/<script(?![^>]*(?:ld\+json|\ssrc=))[^>]*>([\s\S]*?)<\/script>/g)]
  .reduce((n, m) => n + m[1].length, 0);

const eksterneJs = [...forside.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)]
  .map((m) => m[1].replace(/^.*\/_astro\//, ''))
  .reduce((n, fil) => {
    try {
      return n + readFileSync(join(dist, '_astro', fil)).length;
    } catch {
      return n; /* filen ligger et andet sted; tael den ikke med paa gaet */
    }
  }, 0);

console.log(`        JavaScript på forsiden: ${inlineJs + eksterneJs} bytes ` +
  `(${inlineJs} indlejret + ${eksterneJs} hentet)`);
console.log('        Overlejringen til Presentation mode hentes kun i en iframe');

const ialt = fejl + problemer;
console.log(`\n${ialt ? `${ialt} ting at se på` : 'Alt i orden'}\n`);

/*
 * Fejlkode 1 stopper bygningen.
 *
 * Et tjek der kun skriver i loggen bliver overset — især i CI, hvor ingen
 * læser 200 linjer output på en grøn bygning. Et tjek der stopper bygningen
 * bliver rettet. Det er hele forskellen på et værktøj der virker og et der
 * ligger og ser pænt ud.
 */
if (ialt) process.exit(1);
