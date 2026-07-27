import { defineField, defineType } from 'sanity';

/**
 * INDSTILLINGER — ét dokument med det der står overalt.
 *
 * Motto, slogan, kontaktoplysninger og de tal der bruges som argumenter.
 * Alt herinde optræder på flere sider, og skal derfor kun kunne rettes ét
 * sted. Da prototypen blev bygget, viste det sig at prisen for ophold stod i
 * tre forskellige versioner på m-tha.dk og i to brochurer — netop fordi der
 * ikke fandtes ét sted.
 */
export default defineType({
  name: 'indstillinger',
  title: 'Indstillinger',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  groups: [
    { name: 'ord', title: 'Ord og motto', default: true },
    { name: 'tal', title: 'Tal der overbeviser' },
    { name: 'kontakt', title: 'Kontakt' },
    { name: 'historie', title: 'Historie' },
  ],
  fields: [
    defineField({
      name: 'motto', title: 'Motto', type: 'string', group: 'ord',
      description: 'Står i hero\'en, i sidefoden og på /vaerdier.',
      initialValue: 'Sammen er vi stærkere',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slogan', title: 'Slogan', type: 'string', group: 'ord',
      initialValue: 'Vi skaber fremtidens stjerner',
    }),

    // Akademiets stærkeste argument. Stod nederst på side 1 i en PDF.
    defineField({
      name: 'ligatrupIMiljoeet', title: 'Spillere i ligatruppen fra akademiet',
      type: 'number', group: 'tal',
      description: 'Fx 17. Bruges i "17 af 19 spillere kommer herfra".',
    }),
    defineField({
      name: 'ligatrupIAlt', title: 'Spillere i ligatruppen i alt',
      type: 'number', group: 'tal', description: 'Fx 19.',
    }),
    defineField({
      name: 'ligatrupSaeson', title: 'Hvilken sæson tallet gælder',
      type: 'string', group: 'tal', description: 'Fx "2023/24".',
    }),

    defineField({ name: 'adresse', title: 'Adresse', type: 'text', rows: 2,
      group: 'kontakt', initialValue: 'Tranevej 4\n7900 Nykøbing Mors' }),
    defineField({ name: 'telefon', title: 'Telefon', type: 'string',
      group: 'kontakt', initialValue: '30 62 43 04' }),
    defineField({ name: 'email', title: 'E-mail', type: 'string',
      group: 'kontakt', initialValue: 'info@m-tha.dk' }),
    defineField({ name: 'facebook', title: 'Facebook', type: 'url', group: 'kontakt' }),
    defineField({ name: 'instagram', title: 'Instagram', type: 'url', group: 'kontakt' }),

    defineField({
      name: 'milepaele',
      title: 'Milepæle',
      type: 'array',
      group: 'historie',
      description: '”Nyt navn, samme dna” — tidslinjen på /vaerdier.',
      of: [{
        type: 'object',
        name: 'milepael',
        fields: [
          defineField({ name: 'aar', title: 'År', type: 'number' }),
          defineField({ name: 'tekst', title: 'Hvad skete der', type: 'string' }),
          defineField({ name: 'tal', title: 'Tal at fremhæve', type: 'string',
            description: 'Fx "4 elever". Valgfrit.' }),
        ],
        preview: {
          select: { aar: 'aar', tekst: 'tekst', tal: 'tal' },
          prepare: ({ aar, tekst, tal }) => ({
            title: `${aar ?? '—'} · ${tekst ?? ''}`,
            subtitle: tal ?? '',
          }),
        },
      }],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Indstillinger', subtitle: 'Motto, tal og kontakt' }),
  },
});
