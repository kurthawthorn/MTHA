import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { presentationTool } from 'sanity/presentation';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';
import { steder } from './presentation/steder';
import { dokumenter } from './presentation/dokumenter';
import { START_URL, TILLADTE_ORIGINS } from './presentation/site';

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

  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'g4s1nwak',
  dataset: 'production',

  plugins: [
    /*
     * PRESENTATION — hjemmesiden ved siden af felterne.
     *
     * Det Kurt savnede: man retter et felt i venstre side og ser siden i
     * højre. Åbner man en spiller, springer forhåndsvisningen selv til netop
     * den spillers profil; klikker man på en spiller ude på siden, skifter
     * felterne til den spiller. De to retninger er defineret i
     * `presentation/steder.ts` og `presentation/dokumenter.ts`.
     *
     * DEN ENE BEGRÆNSNING, SAGT HØJT
     *   Forhåndsvisningen viser den UDGIVNE side, ikke kladden. Sitet er
     *   statisk — hver side er en færdig fil på GitHub Pages, bygget da nogen
     *   sidst trykkede Udgiv — og der findes ingen server der kan tegne en
     *   kladde. Rettelser dukker altså op i forhåndsvisningen ca. to minutter
     *   efter Udgiv, ikke mens man skriver.
     *
     *   Det er en bevidst afvejning, ikke en mangel der er overset:
     *   kladdevisning kræver en server der kan læse kladder, altså et token i
     *   drift og hosting med kørende kode. Prisen ville være hele grunden til
     *   at løsningen er gratis og ikke kan gå ned. Skal det ændres, er vejen
     *   en forhåndsvisning på Vercel eller Cloudflare ved siden af — det live
     *   site kan blive som det er.
     *
     *   Til gengæld virker NAVIGATIONEN og klik-til-felt med det samme, og det
     *   er det man bruger værktøjet til: at finde det rigtige felt uden at
     *   vide hvad dokumentet heder.
     */
    presentationTool({
      title: 'Se siden',
      previewUrl: { initial: START_URL },
      /* Hvilke adresser iframen må indlæse. Se `presentation/site.ts`. */
      allowOrigins: TILLADTE_ORIGINS,
      resolve: {
        locations: steder,
        mainDocuments: dokumenter,
      },
    }),

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
                    // Landsholdsmærket er den ene oplysning på en spiller der
                    // pynter udad. Derfor skal den kunne efterses samlet — en
                    // markering der er sat ved en fejl, er svær at opdage når
                    // den kun kan ses ét dokument ad gangen.
                    S.listItem().title('Landsholdsspillere').child(
                      S.documentList()
                        .title('Har spillet på landsholdet')
                        .filter('_type == "spiller" && landshold == true')
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
                    /*
                     * Udtrækket fra m-tha.dk klippede fem roller over midt i et
                     * HTML-tag: "Fysioterapeut </d", "Koordinator EUC Nordvest <".
                     * Sitet renser dem ved visning, men de bør rettes ved kilden.
                     * Slet tegnene fra og med '<' — og skriv resten af titlen,
                     * hvis den også mangler et ord.
                     */
                    S.listItem().title('⚠ Rolle med HTML-rester').child(
                      S.documentList().title('Roller med HTML-rester fra udtrækket')
                        .filter('_type == "person" && rolle match "*<*"'),
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

            // Billederne staar over vaerdierne, fordi et forsidefoto skiftes
            // oftere end en formulering.
            S.listItem()
              .title('Billeder')
              .child(
                S.list()
                  .title('Billeder')
                  .items([
                    S.listItem().title('Alle pladser').child(
                      S.documentTypeList('foto').title('Billeder på sitet')
                        .defaultOrdering([{ field: 'noegle', direction: 'asc' }]),
                    ),
                    // Et foto uden alt-tekst er usynligt for en skaermlaeser og
                    // for Google — og designtjekket stopper bygningen paa det.
                    S.listItem().title('⚠ Mangler alt-tekst').child(
                      S.documentList().title('Mangler alt-tekst')
                        .filter('_type == "foto" && !defined(alt) && dekorativ != true'),
                    ),
                  ]),
              ),

            // Dokumenterne staar her fordi de hoerer sammen med billederne:
            // det er de to slags FILER redaktoeren har med at goere.
            S.listItem()
              .title('Dokumenter til download')
              .child(S.documentTypeList('dokument').title('Dokumenter')
                .defaultOrdering([{ field: 'raekkefoelge', direction: 'asc' }])),

            S.listItem()
              .title('Værdier')
              .child(S.documentTypeList('vaerdi').title('De fire værdier')
                .defaultOrdering([{ field: 'raekkefoelge', direction: 'asc' }])),

            S.listItem()
              .title('Uddannelsesveje')
              .child(S.documentTypeList('uddannelse').title('Uddannelsesveje')
                .defaultOrdering([{ field: 'raekkefoelge', direction: 'asc' }])),

            S.listItem()
              .title('Trofæskabet')
              .child(S.documentTypeList('titel').title('Mesterskaber')
                .defaultOrdering([{ field: 'aar', direction: 'desc' }])),

            S.divider(),

            // De to enkeltdokumenter vises direkte frem for som lister
            S.listItem()
              .title('Sæson, priser og satser')
              .child(S.document().schemaType('saeson').documentId('saeson')),

            S.listItem()
              .title('Indstillinger')
              .child(S.document().schemaType('indstillinger').documentId('indstillinger')),
          ]),
    }),
    // Til at prøve forespørgsler af. Kan fjernes inden overdragelse.
    visionTool(),
  ],

  schema: { types: schemaTypes },

  document: {
    // Sæsonen må ikke kunne oprettes to gange
    newDocumentOptions: (prev) =>
      prev.filter((t) => !['saeson', 'indstillinger'].includes(t.templateId)),
  },
});
