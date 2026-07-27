/**
 * Flytter det sidste indhold fra kodefiler ind i Sanity.
 *
 *   cd sanity
 *   node migrer-indhold.mjs
 *
 * Værdier, uddannelsesveje, mesterskaber, motto, nøgletal og historie stod i
 * `poc/src/data/vaerdier.ts` — altså i kode. Derfor kunne akademiet ikke rette
 * dem selv, og det er netop det indhold der oftest bliver skrevet om: en værdi
 * strammes, en koordinator skifter, et mesterskab vindes.
 *
 * Efter denne kørsel findes der intet indhold tilbage i kodefiler.
 *
 * KAN KØRES IGEN — forudsigelige _id'er og createOrReplace.
 */

import { createClient } from '@sanity/client';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HER = dirname(fileURLToPath(import.meta.url));

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

/* Indholdet som det stod i vaerdier.ts og saeson.ts. Kilderne er akademiets
   egne brochurer og pressedækningen — se kommentarerne i de filer. */

const VAERDIER = [
  { titel: 'Dannelse og udvikling går hånd i hånd', forside: true,
    tekst: 'Vi arbejder med unge, der både sigter mod den sportslige top og '
      + 'prioriterer uddannelse. Ved at balancere de to elementer udvikler vi '
      + 'dygtigere eliteudøvere — og samtidig ansvarlige, robuste og '
      + 'læringsparate unge, der har lyst og mod til at bidrage til '
      + 'fællesskabet. Egenskaber, som er nyttige både på og udenfor banen.' },
  { titel: 'Nærhed og tætte relationer', forside: true,
    tekst: 'Det skal være sjovt og hyggeligt at være en del af akademiet. Vi '
      + 'prioriterer nærhed, interesse og tætte relationer eleverne imellem. '
      + 'Som elev forpligter du dig på at være en del af — og tage ansvar for — '
      + 'at det sociale liv fungerer.' },
  { titel: 'Et socialt sikkerhedsnet', forside: false,
    tekst: 'Akademiet har en fuldtidsansat daglig leder, som ud over driften '
      + 'også sikrer et socialt sikkerhedsnet og står til rådighed for hjælp og '
      + 'sparring for den enkelte elev. Nettet består af et tæt samarbejde '
      + 'mellem familien, ungdomsuddannelsen, klubben og akademiet.' },
  { titel: 'Høj faglig ekspertise', forside: false,
    tekst: 'Vi arbejder hele tiden på at stille de bedst mulige kompetencer til '
      + 'rådighed: tæt samarbejde med den sportslige ledelse i Mors-Thy '
      + 'Håndbold, aftale med mentalcoach, fysioterapi og skadesforebyggelse — '
      + 'og et træningsforløb, vi planlægger sammen med dig.' },
];

const UDDANNELSER = [
  { kort: 'STX', navn: 'Almen gymnasial uddannelse', sted: 'Morsø Gymnasium',
    url: 'https://morsoegym.dk/',
    beskrivelse: 'Det almene gymnasium ligger lige ved siden af akademiet. '
      + 'Alle linjer kan vælges, og skemaet koordineres med træningen.',
    koordinatorNavn: 'Jesper Kjær Nannerup', koordinatorTelefon: '20 88 90 48',
    koordinatorEmail: 'jk@morsoe-gym.dk' },
  { kort: 'HHX · EUD · EUX Business', navn: 'Merkantil ungdomsuddannelse',
    sted: 'Morsø Handelsgymnasium — EUC Nordvest',
    url: 'https://eucnordvest.dk/gymnasier/morso-handelsgymnasium-hhx/',
    beskrivelse: 'Handelsgymnasiet ligger nabo til akademiet. Alle linjer på '
      + 'EUD og EUX Business kan vælges.',
    koordinatorNavn: 'Elsebeth Overgaard', koordinatorTelefon: '30 10 65 96',
    koordinatorEmail: 'eo@eucnordvest.dk' },
  { kort: 'HF', navn: 'Højere forberedelseseksamen', sted: 'HF Mors',
    url: 'https://hfmors.dk/',
    beskrivelse: 'HF Mors er en del af samarbejdet omkring akademiet. '
      + 'Akademiets mentaltræner er samtidig daglig leder på HF Mors.' },
  { kort: 'EUD', navn: 'Erhvervsuddannelse med læreplads',
    sted: 'Lokale virksomheder', url: 'https://eucnordvest.dk/',
    beskrivelse: 'Er du mere interesseret i en erhvervsfaglig uddannelse, '
      + 'hjælper vi med en løsning, der passer dig — herunder en læreplads hos '
      + 'en lokal virksomhed.' },
];

const TITLER = [
  { aar: 2025, raekke: 'U19 Drenge', spillested: 'Final4 i Helsinge',
    finaleModstander: 'GOG Håndbold', finaleResultat: '36–31', finaleHalvleg: '20–13',
    semiModstander: 'Nordsjælland Håndbold', semiResultat: '35–30',
    maalscorere: [
      ['Frederik Bak', 10], ['Anton Houe', 7], ['Gustav Sunesen', 6],
      ['Mads Faurskov', 5], ['Nikolaj Lundal Hansen', 5], ['Jonas Dehn', 3],
    ],
    noter: ['Tredje danmarksmesterskab i fire år'] },
  { aar: 2023, raekke: 'U19 Drenge', dato: '23. april 2023',
    spillested: 'Sparekassen Thy Arena | Mors — egen hjemmebane',
    finaleModstander: 'GOG Håndbold', finaleResultat: '34–33',
    semiModstander: 'Skanderborg Håndbold', semiResultat: '39–29',
    maalscorere: [],
    noter: ['Andet mesterskab i træk', 'Pokalen løftet foran fyldt hjemmebane'] },
  { aar: 2022, raekke: 'U19 Drenge', maalscorere: [],
    noter: ['Akademiets første U19-danmarksmesterskab'] },
];

const MILEPAELE = [
  { aar: 2012, tekst: 'Sports College Mors starter', tal: '4 elever' },
  { aar: 2022, tekst: 'Håndbold Akademi Mors bliver til Mors-Thy Håndbold Akademi' },
  { aar: 2023, tekst: 'Akademiet er vokset', tal: '38 elever' },
];

/* ── Skriv ────────────────────────────────────────────────────────────── */

const slug = (s) => s.toLowerCase()
  .replaceAll('æ', 'ae').replaceAll('ø', 'oe').replaceAll('å', 'aa')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

let n = 0;
const log = (s) => console.log(`  ${String(++n).padStart(3)} ${s}`);

console.log('\nVærdier');
for (const [i, v] of VAERDIER.entries()) {
  await client.createOrReplace({
    _id: `vaerdi-${slug(v.titel).slice(0, 40)}`, _type: 'vaerdi',
    titel: v.titel, tekst: v.tekst,
    raekkefoelge: (i + 1) * 10, paaForsiden: v.forside,
  });
  log(`${v.titel}${v.forside ? '  (på forsiden)' : ''}`);
}

console.log('\nUddannelsesveje');
for (const [i, u] of UDDANNELSER.entries()) {
  await client.createOrReplace({
    _id: `uddannelse-${slug(u.kort).slice(0, 40)}`, _type: 'uddannelse',
    ...u, raekkefoelge: (i + 1) * 10,
  });
  log(`${u.kort} — ${u.sted}` +
      (u.koordinatorNavn ? `  (koordinator: ${u.koordinatorNavn})` : ''));
}

console.log('\nMesterskaber');
for (const t of TITLER) {
  await client.createOrReplace({
    _id: `titel-${t.aar}-${slug(t.raekke)}`, _type: 'titel',
    ...t,
    maalscorere: t.maalscorere.map(([navn, maal], i) => ({
      _key: `s${i}`, _type: 'scorer', navn, maal,
    })),
    trup: [], traenere: [],
  });
  log(`${t.aar} · ${t.raekke}` +
      (t.finaleResultat ? `  ${t.finaleResultat} mod ${t.finaleModstander}` : '  (detaljer mangler)'));
}

console.log('\nIndstillinger');
await client.createOrReplace({
  _id: 'indstillinger', _type: 'indstillinger',
  motto: 'Sammen er vi stærkere',
  slogan: 'Vi skaber fremtidens stjerner',
  ligatrupIMiljoeet: 17, ligatrupIAlt: 19, ligatrupSaeson: '2023/24',
  adresse: 'Tranevej 4\n7900 Nykøbing Mors',
  telefon: '30 62 43 04', email: 'info@m-tha.dk',
  facebook: 'https://www.facebook.com/morsthyhaandboldakademi/',
  instagram: 'https://www.instagram.com/mors_thy_handbold_akademi/',
  milepaele: MILEPAELE.map((m, i) => ({ _key: `m${i}`, _type: 'milepael', ...m })),
});
log('motto, nøgletal, kontakt og 3 milepæle');

console.log('\nSæson — værelsestallet');
await client.patch('saeson').set({ vaerelser: 35 }).commit();
log('35 værelser');

console.log(`\nFærdig. ${n} dokumenter.

Der findes nu intet indhold i kodefiler. Alt kan rettes i studioet.
`);
