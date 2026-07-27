import { defineField, defineType } from 'sanity';

/**
 * TITEL — et mesterskab i trofæskabet.
 *
 * HVORFOR DEN SKAL VÆRE ET DOKUMENT
 *   Akademiet vinder U19-DM med jævne mellemrum: 2022, 2023 og 2025. Næste
 *   gang skal de kunne tilføje året selv, samme aften. Stod listen i kode,
 *   ville den vente på en udvikler — og et mesterskab er ikke noget man
 *   venter med at vise frem.
 *
 * TOMME FELTER ER I ORDEN
 *   For 2022 findes hverken dato, modstander eller resultat offentligt. De
 *   felter står tomme og markeres på sitet som "udfyldes af akademiet".
 *   Et gæt der ser rigtigt ud er værre end et felt der mangler.
 */
export default defineType({
  name: 'titel',
  title: 'Mesterskab',
  type: 'document',
  fields: [
    defineField({
      name: 'aar',
      title: 'År',
      type: 'number',
      validation: (Rule) => Rule.required().min(2000).max(2100).integer(),
    }),
    defineField({
      name: 'raekke',
      title: 'Række',
      type: 'string',
      description: 'Fx "U19 Drenge"',
      initialValue: 'U19 Drenge',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'dato',
      title: 'Dato',
      type: 'string',
      description: 'Fx "23. april 2023". Lad stå tomt hvis den ikke kendes.',
    }),
    defineField({
      name: 'spillested',
      title: 'Spillested',
      type: 'string',
      description: 'Fx "Sparekassen Thy Arena | Mors — egen hjemmebane"',
    }),
    defineField({
      name: 'finaleModstander', title: 'Finale: modstander', type: 'string',
    }),
    defineField({
      name: 'finaleResultat', title: 'Finale: resultat', type: 'string',
      description: 'Fx "36–31"',
    }),
    defineField({
      name: 'finaleHalvleg', title: 'Finale: ved pausen', type: 'string',
      description: 'Fx "20–13". Valgfrit.',
    }),
    defineField({
      name: 'semiModstander', title: 'Semifinale: modstander', type: 'string',
    }),
    defineField({
      name: 'semiResultat', title: 'Semifinale: resultat', type: 'string',
    }),
    defineField({
      name: 'maalscorere',
      title: 'Målscorere i finalen',
      type: 'array',
      of: [{
        type: 'object',
        name: 'scorer',
        fields: [
          defineField({ name: 'navn', title: 'Navn', type: 'string' }),
          defineField({ name: 'maal', title: 'Mål', type: 'number' }),
        ],
        preview: {
          select: { navn: 'navn', maal: 'maal' },
          prepare: ({ navn, maal }) => ({ title: `${navn ?? '—'} · ${maal ?? 0} mål` }),
        },
      }],
    }),
    defineField({
      name: 'trup',
      title: 'Truppen',
      type: 'array',
      of: [{ type: 'string' }],
      description:
        'Spillerne der vandt. Findes ikke i offentlige kilder — udfyldes af ' +
        'akademiet. Fra den dag hænger et mesterskab sammen med de spillere ' +
        'der vandt det.',
    }),
    defineField({
      name: 'traenere',
      title: 'Trænerstab',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'noter',
      title: 'Noter',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Fx "Tredje danmarksmesterskab i fire år"',
    }),
  ],
  preview: {
    select: { aar: 'aar', raekke: 'raekke', mod: 'finaleModstander', res: 'finaleResultat' },
    prepare: ({ aar, raekke, mod, res }) => ({
      title: `${aar} · ${raekke}`,
      subtitle: mod ? `${res ?? ''} mod ${mod}` : 'kampdetaljer mangler',
    }),
  },
  orderings: [
    { title: 'Nyeste først', name: 'nyeste', by: [{ field: 'aar', direction: 'desc' }] },
  ],
});
