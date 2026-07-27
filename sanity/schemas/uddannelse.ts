import { defineField, defineType } from 'sanity';

/**
 * UDDANNELSE — én af de veje en elev kan kombinere akademiet med.
 *
 * HVORFOR DEN SKAL KUNNE REDIGERES
 *   Koordinatorernes navne, numre og mails står her. De skifter, og de er det
 *   en forælder ringer til FØR man søger. Stod de i kode, ville en
 *   udskiftning kræve en udvikler — og indtil da ville en forælder ringe til
 *   den forkerte.
 *
 *   Da prototypen blev bygget, stod disse oplysninger kun i en PDF-folder til
 *   nye elever. De var altså usynlige for netop dem der havde brug for dem.
 */
export default defineType({
  name: 'uddannelse',
  title: 'Uddannelsesvej',
  type: 'document',
  fields: [
    defineField({
      name: 'kort',
      title: 'Kort betegnelse',
      type: 'string',
      description: 'Fx "STX" eller "HHX · EUD · EUX Business". Vises som mærkat.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'navn',
      title: 'Fuldt navn',
      type: 'string',
      description: 'Fx "Almen gymnasial uddannelse"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sted',
      title: 'Uddannelsessted',
      type: 'string',
      description: 'Fx "Morsø Gymnasium"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Uddannelsesstedets hjemmeside',
      type: 'url',
      validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'beskrivelse',
      title: 'Beskrivelse',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'koordinatorNavn',
      title: 'Koordinatorens navn',
      type: 'string',
      description: 'Valgfrit. Vises kun hvis udfyldt.',
    }),
    defineField({
      name: 'koordinatorTelefon',
      title: 'Koordinatorens telefon',
      type: 'string',
      description: 'Bliver et klikbart nummer.',
    }),
    defineField({
      name: 'koordinatorEmail',
      title: 'Koordinatorens e-mail',
      type: 'string',
      validation: (Rule) =>
        Rule.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { name: 'e-mail' })
          .warning('Ser ikke ud som en e-mailadresse'),
    }),
    defineField({
      name: 'raekkefoelge',
      title: 'Rækkefølge',
      type: 'number',
      initialValue: 50,
    }),
  ],
  preview: {
    select: { kort: 'kort', sted: 'sted', koord: 'koordinatorNavn' },
    prepare: ({ kort, sted, koord }) => ({
      title: kort,
      subtitle: [sted, koord ? `koordinator: ${koord}` : 'ingen koordinator']
        .filter(Boolean).join(' · '),
    }),
  },
  orderings: [
    { title: 'Rækkefølge', name: 'nr', by: [{ field: 'raekkefoelge', direction: 'asc' }] },
  ],
});
