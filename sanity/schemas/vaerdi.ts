import { defineField, defineType } from 'sanity';

/**
 * VÆRDI — én af akademiets bærende værdier.
 *
 * De fire værdier er formuleret ud af visionsbrochurens egen tekst. Akademiet
 * er stolte af dem, og de er derfor det indhold der oftest bliver skrevet om —
 * en formulering strammes, et ord skiftes. Det skal kunne gøres uden en
 * udvikler.
 *
 * REKKEFØLGE, IKKE RANGERING
 *   `raekkefoelge` styrer hvor de står, men de er sideordnede. Derfor er der
 *   ingen numre på dem ude på sitet: 01–04 ville antyde en rangering der ikke
 *   findes.
 */
export default defineType({
  name: 'vaerdi',
  title: 'Værdi',
  type: 'document',
  fields: [
    defineField({
      name: 'titel',
      title: 'Overskrift',
      type: 'string',
      description: 'Fx "Dannelse og udvikling går hånd i hånd"',
      validation: (Rule) => Rule.required().max(70),
    }),
    defineField({
      name: 'tekst',
      title: 'Tekst',
      type: 'text',
      rows: 5,
      description: 'To til fire sætninger. Vises i et kort på /vaerdier.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'raekkefoelge',
      title: 'Rækkefølge',
      type: 'number',
      description: 'Lavest tal først. Værdierne er sideordnede — dette er kun visning.',
      initialValue: 50,
    }),
    defineField({
      name: 'paaForsiden',
      title: 'Vis på forsiden',
      type: 'boolean',
      description: 'Forsiden viser to værdier. Slå til på de to der skal frem.',
      initialValue: false,
    }),
  ],
  preview: {
    select: { titel: 'titel', tekst: 'tekst', forside: 'paaForsiden', nr: 'raekkefoelge' },
    prepare: ({ titel, tekst, forside, nr }) => ({
      title: titel,
      subtitle: [nr ? `#${nr}` : null, forside ? 'på forsiden' : null,
                 tekst?.slice(0, 60)].filter(Boolean).join(' · '),
    }),
  },
  orderings: [
    { title: 'Rækkefølge', name: 'nr', by: [{ field: 'raekkefoelge', direction: 'asc' }] },
  ],
});
