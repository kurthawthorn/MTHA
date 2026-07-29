import { defineDocuments } from 'sanity/presentation';
import { ruter } from './site';

/**
 * DEN ANDEN VEJ: fra en side til dokumentet.
 *
 * `steder.ts` svarer på "hvor vises dette dokument". Denne fil svarer på det
 * modsatte: Lars ruller rundt i forhåndsvisningen, klikker på en spiller — og
 * felterne i venstre side skifter selv til netop den spiller.
 *
 * Det er den halvdel der gør værktøjet til noget andet end et vindue med
 * hjemmesiden i. Man behøver ikke vide hvad dokumentet heder; man finder det
 * ved at pege på det ude på siden.
 *
 * SÅDAN VIRKER EN RUTE
 *   `route` matches mod stien i forhåndsvisningen, og `:slug` bliver en
 *   parameter man kan bruge i `filter` som `$slug`. Værktøjet henter det
 *   første dokument der matcher, og åbner det.
 *
 * RÆKKEFØLGEN BETYDER NOGET
 *   Den første rute der matcher vinder. Derfor står de specifikke sider øverst
 *   og forsiden nederst.
 *
 * `ruter()` giver hver rute i to varianter — med og uden basisstien /MTHA —
 * så det samme studio virker både mod det live site og mod localhost. Se
 * `site.ts`.
 */
export const dokumenter = defineDocuments([
  {
    route: ruter('/nyheder/:slug'),
    filter: '_type == "nyhed" && slug.current == $slug',
  },
  {
    route: ruter('/spillere/:slug'),
    filter: '_type == "spiller" && slug.current == $slug',
  },
  /*
   * Holdets adresse er `/hold/u17`, men dokumentet heder `hold-u17`. De hold
   * der er oprettet i studiofladen har til gengæld et auto-genereret id uden
   * præfiks (fx `d268b965-…`), og deres adresse er så det rå id. Derfor to
   * muligheder — ellers ville netop de nyoprettede hold være de eneste der
   * ikke kunne findes fra forhåndsvisningen.
   */
  {
    route: ruter('/hold/:hold'),
    filter: '_type == "hold" && (_id == "hold-" + $hold || _id == $hold)',
  },

  /* De tre sider hvor hvert tal kommer fra sæsondokumentet. */
  {
    route: [...ruter('/bliv-elev'), ...ruter('/bliv-elev/oekonomi'), ...ruter('/bolig')],
    type: 'saeson',
  },

  /*
   * Forsiden peger på indstillingsdokumentet — motto, ligatruptallet og
   * kontaktoplysningerne. Den står sidst, fordi den ellers ville sluge
   * ingenting: ruten `/` matcher kun forsiden. Men rækkefølgen er stadig den
   * rigtige vane at holde.
   */
  {
    route: ruter('/'),
    type: 'indstillinger',
  },
]);
