/**
 * FOTOPLADSERNE — de steder på sitet hvor der står et redaktionelt foto.
 *
 * HVORFOR PLADSER OG IKKE ET FRIT BILLEDARKIV
 *   Sitets layout har et bestemt antal steder hvor der skal stå et foto: hero'en
 *   på forsiden, holdfotoet, stribens tre billeder, facilitetskortene. Et
 *   billede der ikke sidder i en plads, vises ikke nogen steder — og et arkiv
 *   hvor 40 billeder ligger uden at nogen kan se hvilke der er i brug, er
 *   præcis den tilstand m-tha.dk er i i dag.
 *
 *   Derfor er `noegle` en RULLELISTE i studioet, og teksten i listen siger hvor
 *   billedet havner. Lars vælger “Forsiden — det store billede øverst”, trækker
 *   et foto ind, trykker Udgiv, og så er forsiden skiftet. Han skal ikke vide
 *   at pladsen heder `dm-2025-vinder`.
 *
 * SÅDAN TILFØJER MAN EN PLADS
 *   Skriv en linje herunder, og brug nøglen i en `<Foto noegle="..." />` ude på
 *   en side. Rullelisten i Sanity følger med, fordi skemaet læser denne fil.
 *
 * DE TO DER IKKE ER MED
 *   Udtrækket fra m-tha.dk hentede 20 fotos. To af dem — `dm-guldhatte` og
 *   `drone-1` — vises ikke nogen steder på sitet, og har derfor ingen plads her.
 *   Skal de bruges, skal der først være et sted at vise dem.
 *
 * “HVERDAGEN” ER SEKS FASTE PLADSER, IKKE ET GALLERI
 *   Galleriet på /om-akademiet hentede før alle fotos i kategorien `socialt`,
 *   altså et vilkårligt antal. Nu er det seks pladser. Det er ærligere over for
 *   layoutet — gitteret er bygget til seks — men det betyder også at Lars ikke
 *   kan tilføje et syvende billede uden en udvikler. Et rigtigt galleri, hvor
 *   antallet er redaktørens valg, er den næste ting at bygge her.
 */

export interface FotoSlot {
  /** Nøglen koden bruger. Ændres den, skal `<Foto>`-kaldene rettes med. */
  noegle: string;
  /** Hvor billedet vises. Det er DENNE tekst redaktøren ser i rullelisten. */
  hvor: string;
}

export const FOTO_SLOTS: FotoSlot[] = [
  { noegle: 'dm-2025-vinder', hvor: 'Forsiden — det store billede øverst' },
  { noegle: 'hold-samlet', hvor: 'Holdfoto U17 — og forsidens årgangskort' },
  { noegle: 'hold-udenfor', hvor: 'Holdfoto U19 — og øverst på Om akademiet' },
  { noegle: 'dm-jubel', hvor: 'Værdier — baggrunden bag mottoet' },
  { noegle: 'traening-hal', hvor: 'Træning 1 af 3 — forsidens stribe' },
  { noegle: 'traening-styrke', hvor: 'Træning 2 af 3 — stribe og Uddannelse' },
  { noegle: 'socialt-4', hvor: 'Træning 3 af 3 — forsidens stribe' },
  { noegle: 'traneholm-indgang', hvor: 'Faciliteter — Traneholm udefra' },
  { noegle: 'traneholm-koekken', hvor: 'Faciliteter — fælleskøkkenet' },
  { noegle: 'traneholm-ophold', hvor: 'Faciliteter — opholdsrummet' },
  { noegle: 'multipark-front', hvor: 'Faciliteter — Sparekassen Thy Arena udefra' },
  { noegle: 'drone-2', hvor: 'Faciliteter — Morsø Multipark fra luften' },
  { noegle: 'drone-3', hvor: 'Faciliteter — området fra luften' },
  { noegle: 'socialt-1', hvor: 'Hverdagen 1 af 6 — galleriet på Om akademiet' },
  { noegle: 'socialt-2', hvor: 'Hverdagen 2 af 6' },
  { noegle: 'socialt-3', hvor: 'Hverdagen 3 af 6' },
  { noegle: 'socialt-5', hvor: 'Hverdagen 5 af 6' },
  { noegle: 'socialt-6', hvor: 'Hverdagen 6 af 6' },
];

/**
 * Galleriet “Hverdagen” på /om-akademiet.
 *
 * `socialt-4` står med i midten, fordi det billede ALLEREDE er en plads —
 * det er også nummer tre i forsidens stribe. Ét billede, to steder: skifter
 * Lars det, skifter begge.
 */
export const HVERDAGEN = [
  'socialt-1', 'socialt-2', 'socialt-3', 'socialt-4', 'socialt-5', 'socialt-6',
];

/** Rullelisten til Sanity. Samme rækkefølge som ovenfor: forsiden først. */
export const FOTO_VALG = FOTO_SLOTS.map((s) => ({ title: s.hvor, value: s.noegle }));

export const FOTO_HVOR: Record<string, string> = Object.fromEntries(
  FOTO_SLOTS.map((s) => [s.noegle, s.hvor]),
);
