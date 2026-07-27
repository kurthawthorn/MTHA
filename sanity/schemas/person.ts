import { defineField, defineType } from 'sanity';

/**
 * PERSON — trænere, ansatte og bestyrelse i én model.
 *
 * HVORFOR ÉN MODEL OG IKKE TRE
 *   En træner, en fysioterapeut og et bestyrelsesmedlem har de samme felter:
 *   navn, portræt, rolle, kontakt. Det der adskiller dem er hvilken SEKTION
 *   de står i. Med tre modeller skulle tre skemaer vedligeholdes parallelt —
 *   og en person der er både bestyrelsesmedlem og uddannelseskoordinator
 *   (det findes: Jesper Kjær Nannerup) skulle oprettes to gange.
 *
 *   Med én model og et sektionsfelt er personen ét dokument, og
 *   `sektion` afgør hvor hun vises.
 *
 * SÅDAN TILFØJER MAN EN PERSON
 *   Tryk "Staben" → "+" → navn, portræt, sektion, rolle → Udgiv.
 *   Personen står straks i den rigtige gruppe på /staben.
 *
 * SÅDAN SKIFTER MAN TRÆNER
 *   Sæt `aktiv` fra på den gamle og opret den nye. Skal en træner knyttes til
 *   et hold, peger HOLDET på personen — så en trænerudskiftning kun rettes ét
 *   sted, og holdsiden følger automatisk med.
 *
 * KONTAKTOPLYSNINGER
 *   Telefon og mail er valgfrit og vises kun hvis de er udfyldt. Det er
 *   relevant for koordinatorer og daglig leder — ikke for alle.
 */
export default defineType({
  name: 'person',
  title: 'Person i staben',
  type: 'document',
  fields: [
    defineField({
      name: 'navn',
      title: 'Navn',
      type: 'string',
      validation: (Rule) => Rule.required().error('Navn skal udfyldes'),
    }),
    defineField({
      name: 'slug',
      title: 'Webadresse',
      type: 'slug',
      options: { source: 'navn', maxLength: 72 },
    }),
    defineField({
      name: 'portraet',
      title: 'Portræt',
      type: 'image',
      options: { hotspot: true },
      description: 'Markér ansigtet én gang — alle formater beskæres derefter korrekt.',
    }),
    defineField({
      name: 'sektion',
      title: 'Sektion',
      type: 'string',
      description: 'Bestemmer hvilken gruppe personen vises i på /staben.',
      options: {
        list: [
          { title: 'Professionelle omkring akademiet', value: 'professionel' },
          { title: 'Ansatte', value: 'ansat' },
          { title: 'Bestyrelsen', value: 'bestyrelse' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required().error('Vælg hvilken sektion personen hører i'),
    }),
    defineField({
      name: 'rolle',
      title: 'Rolle',
      type: 'string',
      description:
        'Fx "Cheftræner U19-1", "Fysioterapeut" eller "Formand". Står feltet ' +
        'tomt, vises kun navnet — det er i orden.',
    }),
    defineField({
      name: 'telefon',
      title: 'Telefon',
      type: 'string',
      description: 'Valgfrit. Vises kun hvis udfyldt. Bliver et klikbart nummer.',
    }),
    defineField({
      name: 'email',
      title: 'E-mail',
      type: 'string',
      description: 'Valgfrit. Vises kun hvis udfyldt.',
      validation: (Rule) =>
        Rule.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { name: 'e-mail' })
          .warning('Ser ikke ud som en e-mailadresse'),
    }),
    defineField({
      name: 'raekkefoelge',
      title: 'Rækkefølge i sektionen',
      type: 'number',
      description: 'Lavest tal først. Bruges fx til at sætte daglig leder øverst.',
      initialValue: 50,
    }),
    defineField({
      name: 'aktiv',
      title: 'Tilknyttet akademiet',
      type: 'boolean',
      description: 'Slå fra når personen stopper. Dokumentet består.',
      initialValue: true,
    }),
  ],

  preview: {
    select: { titel: 'navn', rolle: 'rolle', sektion: 'sektion',
              media: 'portraet', aktiv: 'aktiv' },
    prepare: ({ titel, rolle, sektion, media, aktiv }) => ({
      title: titel,
      subtitle: [
        rolle || 'Rolle mangler',
        sektion,
        aktiv ? null : 'STOPPET',
      ].filter(Boolean).join(' · '),
      media,
    }),
  },

  orderings: [
    { title: 'Sektion og rækkefølge', name: 'sektion',
      by: [
        { field: 'sektion', direction: 'asc' },
        { field: 'raekkefoelge', direction: 'asc' },
        { field: 'navn', direction: 'asc' },
      ] },
    { title: 'Navn', name: 'navn', by: [{ field: 'navn', direction: 'asc' }] },
  ],
});
