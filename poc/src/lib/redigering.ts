import { createDataAttribute } from '@sanity/visual-editing/create-data-attribute';

/**
 * KLIK PÅ SIDEN, RET FELTET.
 *
 * Presentation mode kan vise hjemmesiden ved siden af felterne. Men iframen er
 * bare HTML: studioet kan ikke af sig selv vide, at netop det navn i overskriften
 * kom fra feltet `navn` på dokumentet `spiller-jonathan-rokkjaer`.
 *
 * Derfor mærkes elementerne. `data-sanity` fortæller hvilket dokument og
 * hvilket felt et stykke tekst stammer fra, og så kan overlejringen i studioet
 * tegne en ramme om det og åbne præcis det felt når man klikker.
 *
 * HVORFOR data-sanity OG IKKE "stega"
 *   Sanity kan også indlejre metadata direkte i teksten med usynlige tegn
 *   (stega). Det er nemmere at slå til — men de usynlige tegn ryger så med ud
 *   i det udgivne HTML: i sidetitler, i alt-tekster, i meta-beskrivelser og i
 *   den strukturerede data Google læser. Og de følger med når nogen
 *   kopierer et navn ud af siden.
 *
 *   Et data-attribut ligger uden for teksten. Det koster ca. 90 tegn pr.
 *   mærket element, teksten forbliver ren, og der er ingen bygningstilstand
 *   der kan blive glemt i den forkerte stilling.
 *
 * HVAD DER ER MÆRKET
 *   Det Lars retter: nyheder, spillere, hold, staben og sponsorer. De øvrige
 *   sider (værdier, uddannelse, priser) kan stadig findes gennem listen "Hvor
 *   vises dette" i studioet — de er blot ikke klikbare ude på siden endnu.
 */

/** Studioet der skal åbnes når man klikker på et mærket element. */
const STUDIO = import.meta.env.PUBLIC_STUDIO_URL ?? 'https://mtha.sanity.studio';

const PROJEKT = 'g4s1nwak';
const DATASAET = 'production';

/**
 * Bygger værdien til `data-sanity`.
 *
 * @param type   dokumenttypen, fx `spiller`
 * @param id     dokumentets `_id` i Sanity. Mangler det, mærkes intet — et
 *               halvt attribut er værre end ingen, fordi overlejringen så
 *               tegner en ramme om noget der ikke kan åbnes.
 * @param felt   feltstien, fx `navn` eller `portraet`
 */
export function redigerbar(
  type: string,
  id: string | undefined,
  felt: string,
): string | undefined {
  if (!id) return undefined;
  return createDataAttribute({
    baseUrl: STUDIO,
    projectId: PROJEKT,
    dataset: DATASAET,
    tool: 'presentation',
    type,
    id,
    path: felt,
  }).toString();
}
