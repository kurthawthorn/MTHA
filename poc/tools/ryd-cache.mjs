/**
 * Rydder Astros byggecache før hver bygning.
 *
 * HVORFOR DET ER NØDVENDIGT
 *   Astro genbruger cachede sider når kildefilerne er uændrede. Men vores
 *   indhold kommer fra Sanity, og en ændring DER ændrer ingen fil. Resultatet
 *   er at et Udgiv i studioet ikke slår igennem — bygningen kører, melder
 *   succes, og siden viser det gamle.
 *
 *   Det er den værst tænkelige fejl i denne opsætning: den ser ud som om alt
 *   virker. Målt lokalt: værelsestallet blev ændret fra 42 til 43 i Sanity,
 *   bygningen kørte, og sitet viste stadig 42.
 *
 *   I GitHub Actions rammer det ikke i dag, fordi hver kørsel starter med et
 *   frisk checkout. Men det er held, ikke design — cacher nogen `.astro` for
 *   at spare tid, brækker udgivelsen tavst.
 *
 * PRISEN
 *   Bygningen tager få sekunder længere. Billedtransformationerne ligger i
 *   dist/ og røres ikke, så det er kun sidegenereringen der laves om.
 */

import { rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROD = join(dirname(fileURLToPath(import.meta.url)), '..');

for (const mappe of ['.astro', 'node_modules/.astro']) {
  await rm(join(ROD, mappe), { recursive: true, force: true });
}
