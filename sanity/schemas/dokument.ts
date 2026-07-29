import { defineField, defineType } from 'sanity';

/**
 * DOKUMENT — en fil man kan hente. Vedtægter, referater, elevkontrakt.
 *
 * HVORFOR DEN FINDES
 *   Fordi sitet skal kunne ERSTATTE m-tha.dk. Så længe bygningen hentede de tre
 *   PDF'er fra det gamle site, kunne det nye ikke tage over: den dag m-tha.dk
 *   lukker, forsvinder filerne, og /dokumenter står med tre døde links.
 *
 *   Det var også det sidste led der gjorde byggetiden uforudsigelig. Målt på tre
 *   kørsler i træk: 7, 8 og 185 sekunder for de samme tre filer. Den langsomme
 *   kostede en redaktør fire minutter, fordi hendes eget Udgiv stod i kø bag den.
 *
 * DET ER IKKE KUN HASTIGHED
 *   `referat-generalforsamling-2025.pdf` bliver forældet næste gang der er
 *   generalforsamling. Før kunne Lars ikke lægge et nyt op — det krævede at
 *   nogen lagde en fil på det gamle site. Nu er det: Dokumenter → + → træk
 *   PDF'en ind → Udgiv.
 *
 * BROCHURERNE HØRER IKKE HERTIL
 *   De fem brochurer er trukket ud på almindelige sider, fordi en PDF næsten
 *   ikke kan læses af Google, er ubrugelig på en telefon, og man kan ikke linke
 *   til et afsnit i den. Her ligger kun de papirer der SKAL være filer:
 *   underskrevne dokumenter og formelle referater.
 */
export default defineType({
  name: 'dokument',
  title: 'Dokument',
  type: 'document',
  fields: [
    defineField({
      name: 'titel',
      title: 'Titel',
      type: 'string',
      description: 'Sådan som det står på siden. Fx "Referat fra generalforsamling, oktober 2025".',
      validation: (Rule) => Rule.required().error('Titel skal udfyldes'),
    }),
    defineField({
      name: 'fil',
      title: 'Filen',
      type: 'file',
      description: 'PDF. Træk den ind — den bliver hostet af Sanity, ikke af det gamle site.',
      validation: (Rule) => Rule.required().error('Der skal være en fil'),
    }),
    defineField({
      name: 'hvorfor',
      title: 'Hvorfor det er en fil',
      type: 'string',
      description:
        'Én kort linje under titlen. Fx "Underskrevet dokument" eller "Skal ' +
        'printes og underskrives". Den forklarer hvorfor netop dette ikke er ' +
        'blevet en almindelig side.',
    }),
    defineField({
      name: 'aar',
      title: 'År',
      type: 'number',
      description: 'Årstallet på dokumentet. Vises sammen med sidetallet.',
      validation: (Rule) => Rule.min(2000).max(2100).integer(),
    }),
    defineField({
      name: 'sider',
      title: 'Antal sider',
      type: 'number',
      description:
        'Vises så man ved hvad man henter. Skrives i hånden — antallet kan ' +
        'ikke tælles ud af filen uden at åbne den, og det er ikke værd at ' +
        'bygge en PDF-læser for.',
      validation: (Rule) => Rule.min(1).max(500).integer(),
    }),
    defineField({
      name: 'raekkefoelge',
      title: 'Rækkefølge',
      type: 'number',
      description: 'Lavest tal først.',
      initialValue: 50,
    }),
  ],

  preview: {
    select: { titel: 'titel', hvorfor: 'hvorfor', aar: 'aar', sider: 'sider' },
    prepare: ({ titel, hvorfor, aar, sider }) => ({
      title: titel,
      subtitle: [hvorfor, aar, sider ? `${sider} sider` : null]
        .filter(Boolean).join(' · '),
    }),
  },

  orderings: [
    { title: 'Rækkefølge', name: 'nr', by: [{ field: 'raekkefoelge', direction: 'asc' }] },
  ],
});
