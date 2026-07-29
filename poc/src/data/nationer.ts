/**
 * NATIONER — de lande der kan vælges som nationalitet på en spiller.
 *
 * HVORFOR EN LUKKET LISTE
 *   Nationaliteten styrer hvilket flag der står på landsholdsmærket. Var det et
 *   fritekstfelt, ville "Tyskland", "tyskland" og "Germany" give tre forskellige
 *   svar, og de to sidste ville give et tomt flag. Med en rulleliste kan der kun
 *   vælges et land vi HAR et flag til.
 *
 * HVORFOR DANSKE NAVNE
 *   Det er redaktøren der skal finde landet i listen, og siden er dansk.
 *   Sorteringen sker på det danske navn, så Ø står til sidst hvor man leder.
 *
 * `oevrige` ER IKKE ET LAND
 *   Det er svaret på "eleven er ikke fra Europa". Kommer der en kineser eller
 *   en brasilianer, vælges Øvrige, og mærket viser et jordkloden-mærke frem for
 *   et forkert flag. Feltet `nationalitetAndet` kan så bære det rigtige
 *   landenavn som tekst.
 *
 * SÅDAN TILFØJER MAN ET LAND
 *   1. Skriv en linje herunder med ISO-koden og det danske navn
 *   2. Kør `node tools/hent-flag.mjs` i `poc/` — den henter flaget
 *   Det er alt. Rullelisten i Sanity og flaget på mærket følger med.
 */

export interface Nation {
  /** ISO 3166-1 alfa-2. Bruges som filnavn på flaget. */
  kode: string;
  navn: string;
}

/**
 * Europa. Rådet for Europas medlemmer, rigsfællesskabet og Kosovo — altså de
 * lande en elev på et dansk håndboldakademi realistisk kommer fra eller
 * spiller landshold for.
 */
export const NATIONER: Nation[] = [
  { kode: 'AL', navn: 'Albanien' },
  { kode: 'AD', navn: 'Andorra' },
  { kode: 'AM', navn: 'Armenien' },
  { kode: 'AZ', navn: 'Aserbajdsjan' },
  { kode: 'BE', navn: 'Belgien' },
  { kode: 'BA', navn: 'Bosnien-Hercegovina' },
  { kode: 'BG', navn: 'Bulgarien' },
  { kode: 'CY', navn: 'Cypern' },
  { kode: 'DK', navn: 'Danmark' },
  { kode: 'EE', navn: 'Estland' },
  { kode: 'FI', navn: 'Finland' },
  { kode: 'FR', navn: 'Frankrig' },
  { kode: 'FO', navn: 'Færøerne' },
  { kode: 'GE', navn: 'Georgien' },
  { kode: 'GR', navn: 'Grækenland' },
  { kode: 'GL', navn: 'Grønland' },
  { kode: 'BY', navn: 'Hviderusland' },
  { kode: 'IE', navn: 'Irland' },
  { kode: 'IS', navn: 'Island' },
  { kode: 'IT', navn: 'Italien' },
  { kode: 'XK', navn: 'Kosovo' },
  { kode: 'HR', navn: 'Kroatien' },
  { kode: 'LV', navn: 'Letland' },
  { kode: 'LI', navn: 'Liechtenstein' },
  { kode: 'LT', navn: 'Litauen' },
  { kode: 'LU', navn: 'Luxembourg' },
  { kode: 'MT', navn: 'Malta' },
  { kode: 'MD', navn: 'Moldova' },
  { kode: 'MC', navn: 'Monaco' },
  { kode: 'ME', navn: 'Montenegro' },
  { kode: 'NL', navn: 'Nederlandene' },
  { kode: 'MK', navn: 'Nordmakedonien' },
  { kode: 'NO', navn: 'Norge' },
  { kode: 'PL', navn: 'Polen' },
  { kode: 'PT', navn: 'Portugal' },
  { kode: 'RO', navn: 'Rumænien' },
  { kode: 'RU', navn: 'Rusland' },
  { kode: 'SM', navn: 'San Marino' },
  { kode: 'CH', navn: 'Schweiz' },
  { kode: 'RS', navn: 'Serbien' },
  { kode: 'SK', navn: 'Slovakiet' },
  { kode: 'SI', navn: 'Slovenien' },
  { kode: 'ES', navn: 'Spanien' },
  { kode: 'GB', navn: 'Storbritannien' },
  { kode: 'SE', navn: 'Sverige' },
  { kode: 'CZ', navn: 'Tjekkiet' },
  { kode: 'TR', navn: 'Tyrkiet' },
  { kode: 'DE', navn: 'Tyskland' },
  { kode: 'UA', navn: 'Ukraine' },
  { kode: 'HU', navn: 'Ungarn' },
  { kode: 'VA', navn: 'Vatikanstaten' },
  { kode: 'AT', navn: 'Østrig' },
];

/** Værdien for "ikke et europæisk land". Se kommentaren øverst. */
export const OEVRIGE = 'oevrige';

export const NATION_NAVN: Record<string, string> = {
  ...Object.fromEntries(NATIONER.map((n) => [n.kode, n.navn])),
  [OEVRIGE]: 'Øvrige',
};

/**
 * Rullelisten til Sanity. Danmark ligger øverst, fordi det er svaret i langt de
 * fleste tilfælde, og Øvrige nederst fordi det er undtagelsen. Resten står
 * alfabetisk efter det danske navn.
 */
export const NATION_VALG = [
  { title: 'Danmark', value: 'DK' },
  ...NATIONER.filter((n) => n.kode !== 'DK')
    .map((n) => ({ title: n.navn, value: n.kode })),
  { title: 'Øvrige (uden for Europa)', value: OEVRIGE },
];
