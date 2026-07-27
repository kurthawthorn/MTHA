/**
 * ÉN SÆSON — ét sted.
 *
 * Alt der skifter fra sæson til sæson står her og kun her: årstal, årgange,
 * priser, SU-satser og takster. Ingen side må hardkode et årstal eller et
 * beløb; de læser herfra.
 *
 * SÅDAN RULLER MAN TIL NÆSTE SÆSON
 *   1. Ret `navn`, `fra` og `til`
 *   2. Ret `foedselsaar` og `aargang` på holdene
 *   3. Ret de beløb der er ændret
 *   Færdig.
 *
 * SPILLERNE FLYTTER SIG SELV
 *   Holdene defineres ved hvilke FØDSELSÅR de består af. Spillerens fødselsår
 *   er stamdata, der aldrig ændrer sig, så tilknytningen udregnes — se
 *   `holdFor()` i akademi.ts. Målt på prototypen:
 *
 *     U17 [2008,2009] -> [2009,2010]   25 spillere -> 12
 *     U19 [2006,2007] -> [2007,2008]   29 spillere -> 28
 *
 *   De 13 spillere født i 2008 rykkede selv op fra U17 til U19, og de 14 født
 *   i 2006 faldt automatisk ud af truppen. Ingen spillere blev rørt.
 *
 * I den færdige løsning er dette ét dokument i CMS'et med samme felter, så
 * ledelsen selv kan gøre det — uden at røre kode og uden at kunne glemme et
 * sted. Det er hele forskellen på at rette ét felt og at lede efter tallet
 * på syv sider.
 *
 * KILDE  Tallene er akademiets egne, fra "Forældreovervejelser" og
 *        Domea-flyeren.
 *
 * ⚠︎ TRE KILDER, TRE PRISER — samme post, tre forskellige beløb
 *      m-tha.dk forside .......... 2.495 kr./md   ophold
 *      Forældreovervejelser ...... 2.395 kr./md   ophold · forbrug 516 kr.
 *      Visionsbrochuren .......... 2.255 kr./md   ophold · forbrug 316 kr.
 *                                    495 kr./md   hjemmeboende
 *    Vi bruger Forældreovervejelsernes tal her, fordi den er den nyeste med
 *    fuldt regnestykke. Akademiet må afgøre hvad der er gældende — og netop
 *    det her er hele argumentet for at priser kun må stå ét sted.
 */

export interface Takst {
  navn: string;
  beloeb: number;
  enhed: 'md' | 'engang';
  note?: string;
}

export interface Saeson {
  navn: string;
  fra: number;
  til: number;
  /** Sat til true når tallene er bekræftet af akademiet. */
  bekraeftet: boolean;

  /** Årgange i denne sæson, i den rækkefølge de skal vises. */
  hold: { id: string; navn: string; aargang: string; raekke: string; foedselsaar: number[] }[];

  priser: {
    opholdBoende: Takst;
    husleje: Takst;
    forbrug: Takst;
    boligstoette: Takst;
    hjemmeboende: Takst;
    traenerHfMors: Takst;
  };

  su: {
    hjemmeboende: number;
    udeboende: number;
    aar: number;
  };

  /** Estimerede indirekte udgifter ved at bo hjemme. */
  hjemmeEstimat: { mad: number; transport: number };
}

export const saeson: Saeson = {
  navn: '2024–2025',
  fra: 2024,
  til: 2025,
  bekraeftet: false,

  hold: [
    { id: 'u17', navn: 'U17', aargang: '2008–2009', raekke: 'U17 Liga',
      foedselsaar: [2008, 2009] },
    { id: 'u19', navn: 'U19', aargang: '2006–2007', raekke: 'U19 Liga',
      foedselsaar: [2006, 2007] },
  ],

  priser: {
    opholdBoende: { navn: 'Ophold på akademiet', beloeb: 2395, enhed: 'md',
      note: 'Inkl. kost, logi, vask, akademitræning, tøj- og træningspakke og sociale arrangementer' },
    husleje: { navn: 'Husleje, Traneholm', beloeb: 2640, enhed: 'md',
      note: '1-rumsbolig på 33 m², ekskl. forbrug' },
    forbrug: { navn: 'Forbrug', beloeb: 516, enhed: 'md', note: 'Aconto' },
    boligstoette: { navn: 'Boligstøtte', beloeb: 425, enhed: 'md', note: 'Ca. — afhænger af indkomst' },
    hjemmeboende: { navn: 'Akademiet, hjemmeboende', beloeb: 695, enhed: 'md',
      note: 'Inkl. akademitræninger, tøj- og træningspakke og sociale arrangementer' },
    traenerHfMors: { navn: 'Træner i HF Mors', beloeb: 300, enhed: 'md',
      note: 'Fratrækkes den månedlige betaling' },
  },

  su: { hjemmeboende: 1060, udeboende: 4375, aar: 2024 },

  hjemmeEstimat: { mad: 2500, transport: 600 },
};

/* ── Udregninger — ingen side regner selv ─────────────────────────────── */

/** Samlet månedlig udgift hvis eleven bor på akademiet. */
export const nettoUdgiftBoende = () => {
  const p = saeson.priser;
  return p.opholdBoende.beloeb + p.husleje.beloeb + p.forbrug.beloeb - p.boligstoette.beloeb;
};

/** Forældrenes nettoudgift, bor på akademiet. */
export const foraeldreNettoBoende = () =>
  nettoUdgiftBoende() - saeson.su.udeboende - saeson.priser.traenerHfMors.beloeb;

/** Forældrenes nettoudgift, bor hjemme. */
export const foraeldreNettoHjemme = () =>
  saeson.priser.hjemmeboende.beloeb +
  saeson.hjemmeEstimat.mad +
  saeson.hjemmeEstimat.transport -
  Math.round(saeson.su.hjemmeboende * 0.958); // efter skat, jf. brochurens 1.016 kr.

export const kr = (n: number) => `${n.toLocaleString('da-DK')} kr.`;

/** Årgangsteksten for et hold, så ingen side skriver årstal i hånden. */
export const aargangFor = (holdId: string) =>
  saeson.hold.find((h) => h.id === holdId)?.aargang ?? '';
