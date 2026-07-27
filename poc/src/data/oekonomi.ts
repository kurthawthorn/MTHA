/**
 * Regnestykkerne — UDREGNET, ikke skrevet ind.
 *
 * Alle beløb kommer fra saeson.ts. Der står ikke ét tal i denne fil, og der
 * står ikke ét tal på siderne. Skifter en pris til næste sæson, rettes den
 * ét sted, og begge scenarier, forsiden og optagelsessiden følger med.
 *
 * Teksten er akademiets egen, fra "Forældreovervejelser, alle sider.pdf"
 * (6 sider). I PDF'en står tallene som spatieret VERSALTEKST i et
 * billedlayout — praktisk ulæseligt på en telefon og usynligt for Google.
 */

import { saeson, kr } from './saeson';

export interface Post {
  navn: string;
  beloeb: number;
  note?: string;
}

export interface Scenarie {
  id: 'boende' | 'hjemmeboende';
  navn: string;
  beskrivelse: string;
  udgifter: Post[];
  indtaegter: Post[];
}

export const SÆSON = saeson.navn;

const p = saeson.priser;

export const scenarier: Scenarie[] = [
  {
    id: 'boende',
    navn: 'Bor på akademiet',
    beskrivelse:
      'Egen lejlighed i Traneholm med kost, logi, vask, akademitræning, ' +
      'tøj- og træningspakke samt sociale arrangementer.',
    udgifter: [
      { navn: p.opholdBoende.navn, beloeb: p.opholdBoende.beloeb, note: p.opholdBoende.note },
      { navn: p.husleje.navn, beloeb: p.husleje.beloeb, note: p.husleje.note },
      { navn: p.forbrug.navn, beloeb: p.forbrug.beloeb, note: p.forbrug.note },
    ],
    indtaegter: [
      { navn: p.boligstoette.navn, beloeb: p.boligstoette.beloeb, note: p.boligstoette.note },
      { navn: `SU, udeboende`, beloeb: saeson.su.udeboende,
        note: `Grundsats ${saeson.su.aar}, før skat. Tillæg efter forældreindkomst` },
      { navn: p.traenerHfMors.navn, beloeb: p.traenerHfMors.beloeb, note: p.traenerHfMors.note },
    ],
  },
  {
    id: 'hjemmeboende',
    navn: 'Bor hjemme',
    beskrivelse:
      'Akademitræning, tøj- og træningspakke og sociale arrangementer, ' +
      'men uden kost og logi.',
    udgifter: [
      { navn: p.hjemmeboende.navn, beloeb: p.hjemmeboende.beloeb, note: p.hjemmeboende.note },
      { navn: 'Mad, vand og varme hjemme', beloeb: saeson.hjemmeEstimat.mad,
        note: 'Estimeret indirekte udgift' },
      { navn: 'Transport til skole og træning', beloeb: saeson.hjemmeEstimat.transport,
        note: 'Estimeret' },
    ],
    indtaegter: [
      { navn: 'SU, hjemmeboende', beloeb: Math.round(saeson.su.hjemmeboende * 0.958),
        note: `Grundsats ${saeson.su.aar} er ${kr(saeson.su.hjemmeboende)} før skat` },
    ],
  },
];

export const nettoFor = (s: Scenarie) =>
  s.udgifter.reduce((n, x) => n + x.beloeb, 0) -
  s.indtaegter.reduce((n, x) => n + x.beloeb, 0);

/** Konklusionen som den står i brochuren. */
export const konklusion = [
  'Forældrenes nettoudgift ved at have en ung på Mors-Thy Håndbold Akademi er ' +
  'en lille smule større end hvad det koster at have dem hjemme.',
  'I eksemplet er der ikke medregnet forældretid til kørsel og ventetid ved træning.',
  'De unge kan have flere lommepenge, hvis de modtager den udeboende SU-sats.',
];

export const fordele = [
  'Rigtig godt sammenhold på akademiet',
  'Eleverne holder hinanden op på at passe deres motionscenter',
  'Meget lettere når trænerne ændrer træningstider, eller de skal træne med andre hold',
];

/** Betingelser for udeboende SU — fra brochurens side 3. */
export const suBetingelser = [
  'Den normale transportvej er 20 kilometer eller mere mellem uddannelsesstedet ' +
  'og forældrenes bopæl.',
  'Transporttiden med offentlige transportmidler mellem uddannelsesstedet og ' +
  'forældrenes bopæl er på mere end 75 minutter.',
];

/* ── Traneholm College: boligtyper fra Domea-flyeren ──────────────────── */

export interface Bolig {
  rum: number;
  kvm: number;
  husleje: number;
  indskud: number;
  indskudFoer: number;
}

export const boliger: Bolig[] = [
  { rum: 1, kvm: 33, husleje: 2640, indskud: 9000,  indskudFoer: 17863 },
  { rum: 1, kvm: 38, husleje: 2937, indskud: 10000, indskudFoer: 20570 },
  { rum: 2, kvm: 46, husleje: 3412, indskud: 12000, indskudFoer: 24900 },
  { rum: 2, kvm: 50, husleje: 3649, indskud: 15000, indskudFoer: 27065 },
];

export const boligFordele = [
  'Nybygget bolig med adgang til et fælles miljø',
  'Eget køkken, køl/frys, bad og toilet',
  'Terrasse eller altan',
  'Internet i alle boliger, med i huslejen',
  'Reduceret indskud — ca. 50 % rabat',
];
