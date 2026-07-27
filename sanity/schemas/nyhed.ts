import { defineField, defineType } from 'sanity';

/**
 * NYHED — det redaktørerne bruger oftest.
 *
 * Derfor er den skruet sammen så der er så få felter som muligt: overskrift,
 * dato, kategori, foto, resumé og tekst. Dato er sat på forhånd, og
 * webadressen dannes af overskriften.
 *
 * `kilde` skelner mellem noget nogen har skrevet her, og noget der er hentet
 * automatisk fra Instagram. Det er mekanikken der holder nyhedssiden i live
 * uden ekstra arbejde: staben skriver ét sted, som de altid har gjort.
 */
export default defineType({
  name: 'nyhed',
  title: 'Nyhed',
  type: 'document',
  fields: [
    defineField({
      name: 'titel',
      title: 'Overskrift',
      type: 'string',
      validation: (Rule) => Rule.required().max(90)
        .error('Overskrift skal udfyldes og må højst være 90 tegn'),
    }),
    defineField({
      name: 'slug',
      title: 'Webadresse',
      type: 'slug',
      options: { source: 'titel', maxLength: 80 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'dato',
      title: 'Dato',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'kategori',
      title: 'Kategori',
      type: 'string',
      options: {
        list: ['Kamp', 'Akademiet', 'Uddannelse', 'Sponsor'],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'Akademiet',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'foto',
      title: 'Billede',
      type: 'image',
      options: { hotspot: true },
      description: 'Træk et foto ind fra kamerarullen. Komprimering sker automatisk.',
      fields: [
        defineField({ name: 'alt', title: 'Alt-tekst', type: 'string',
          description: 'Beskriv billedet for skærmlæsere.' }),
      ],
    }),
    defineField({
      name: 'resume',
      title: 'Resumé',
      type: 'text',
      rows: 3,
      description: 'To linjer. Vises på nyhedskortet og i Google.',
      validation: (Rule) => Rule.required().max(220),
    }),
    defineField({
      name: 'indhold',
      title: 'Tekst',
      type: 'array',
      of: [
        { type: 'block', styles: [
            { title: 'Almindelig', value: 'normal' },
            { title: 'Mellemrubrik', value: 'h2' },
            { title: 'Citat', value: 'blockquote' },
          ] },
        { type: 'image', options: { hotspot: true } },
      ],
    }),
    defineField({
      name: 'hold',
      title: 'Handler om hold',
      type: 'reference',
      to: [{ type: 'hold' }],
      description: 'Valgfrit. Sætter et link til holdet på nyheden.',
    }),
    defineField({
      name: 'fremhaevet',
      title: 'Fremhæv på forsiden',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'kilde',
      title: 'Kilde',
      type: 'string',
      readOnly: true,
      description: 'Sættes automatisk. "instagram" når nyheden er hentet ind.',
      options: { list: ['cms', 'instagram'] },
      initialValue: 'cms',
    }),
  ],

  preview: {
    select: { titel: 'titel', dato: 'dato', kategori: 'kategori',
              media: 'foto', kilde: 'kilde' },
    prepare: ({ titel, dato, kategori, media, kilde }) => ({
      title: titel,
      subtitle: [
        dato ? new Date(dato).toLocaleDateString('da-DK') : 'ingen dato',
        kategori,
        kilde === 'instagram' ? 'fra Instagram' : null,
      ].filter(Boolean).join(' · '),
      media,
    }),
  },

  orderings: [
    { title: 'Nyeste først', name: 'nyeste', by: [{ field: 'dato', direction: 'desc' }] },
  ],
});
