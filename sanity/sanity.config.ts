import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';

/**
 * Redigeringsvinduet til Mors-Thy Håndbold Akademi.
 *
 * OPSÆTNING — ét felt mangler
 *   Opret et gratis projekt på sanity.io/manage og indsæt projekt-id'et
 *   nedenfor (eller sæt SANITY_STUDIO_PROJECT_ID). Derefter:
 *
 *     cd sanity
 *     npm install
 *     npm run dev      -> http://localhost:3333
 *     node migrer.mjs  -> lægger prototypens indhold ind
 *     npm run deploy   -> mtha.sanity.studio, klar til brug på telefon
 *
 * MENUEN NEDENFOR ER BYGGET TIL AKADEMIET
 *   Sanity viser som standard bare en liste over dokumenttyper. Her er den
 *   skruet sammen efter hvad folk faktisk skal finde: nyheder øverst, fordi
 *   det er det man laver oftest, og staben delt i akademiets egne tre
 *   sektioner frem for én lang liste på 25 navne.
 */
export default defineConfig({
  name: 'mtha',
  title: 'Mors-Thy Håndbold Akademi',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'INDSÆT_PROJEKT_ID',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Indhold')
          .items([
            S.listItem()
              .title('Nyheder')
              .child(S.documentTypeList('nyhed').title('Nyheder')),

            S.divider(),

            S.listItem()
              .title('Hold og årgange')
              .child(S.documentTypeList('hold').title('Hold')),

            S.listItem()
              .title('Spillere')
              .child(
                S.list()
                  .title('Spillere')
                  .items([
                    S.listItem().title('Alle aktive').child(
                      S.documentList()
                        .title('Aktive spillere')
                        .filter('_type == "spiller" && aktiv == true')
                        .defaultOrdering([{ field: 'navn', direction: 'asc' }]),
                    ),
                    S.listItem().title('Stoppet').child(
                      S.documentList()
                        .title('Stoppede spillere')
                        .filter('_type == "spiller" && aktiv != true'),
                    ),
                    // Fanger den klassiske fejl: uden fødselsår har spilleren
                    // intet hold, og falder derfor ud af truppen.
                    S.listItem().title('⚠ Mangler fødselsår').child(
                      S.documentList()
                        .title('Mangler fødselsår')
                        .filter('_type == "spiller" && !defined(foedselsaar)'),
                    ),
                  ]),
              ),

            S.divider(),

            S.listItem()
              .title('Staben')
              .child(
                S.list()
                  .title('Staben')
                  .items([
                    S.listItem().title('Professionelle').child(
                      S.documentList().title('Professionelle omkring akademiet')
                        .filter('_type == "person" && sektion == "professionel"')
                        .defaultOrdering([{ field: 'raekkefoelge', direction: 'asc' }]),
                    ),
                    S.listItem().title('Ansatte').child(
                      S.documentList().title('Ansatte')
                        .filter('_type == "person" && sektion == "ansat"'),
                    ),
                    S.listItem().title('Bestyrelsen').child(
                      S.documentList().title('Bestyrelsen')
                        .filter('_type == "person" && sektion == "bestyrelse"'),
                    ),
                    S.listItem().title('⚠ Mangler rolle').child(
                      S.documentList().title('Mangler rolle')
                        .filter('_type == "person" && !defined(rolle)'),
                    ),
                  ]),
              ),

            S.listItem()
              .title('Sponsorer')
              .child(
                S.list()
                  .title('Sponsorer')
                  .items([
                    S.listItem().title('Hovedsponsor').child(
                      S.documentList().title('Hovedsponsor')
                        .filter('_type == "sponsor" && niveau == "hovedsponsor"'),
                    ),
                    S.listItem().title('Topsponsorer').child(
                      S.documentList().title('Topsponsorer')
                        .filter('_type == "sponsor" && niveau == "topsponsor"'),
                    ),
                    S.listItem().title('Sponsorer').child(
                      S.documentList().title('Sponsorer')
                        .filter('_type == "sponsor" && niveau == "sponsor"')
                        .defaultOrdering([{ field: 'navn', direction: 'asc' }]),
                    ),
                    S.listItem().title('Samarbejdspartnere').child(
                      S.documentList().title('Samarbejdspartnere')
                        .filter('_type == "sponsor" && niveau == "partner"'),
                    ),
                    S.listItem().title('⚠ Mangler logo').child(
                      S.documentList().title('Mangler logo')
                        .filter('_type == "sponsor" && !defined(logo)'),
                    ),
                  ]),
              ),

            S.divider(),

            // Ét dokument — vises direkte frem for som en liste med én post
            S.listItem()
              .title('Sæson, priser og satser')
              .child(S.document().schemaType('saeson').documentId('saeson')),
          ]),
    }),
    // Til at prøve forespørgsler af. Kan fjernes inden overdragelse.
    visionTool(),
  ],

  schema: { types: schemaTypes },

  document: {
    // Sæsonen må ikke kunne oprettes to gange
    newDocumentOptions: (prev) =>
      prev.filter((t) => t.templateId !== 'saeson'),
  },
});
