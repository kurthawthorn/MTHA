import { defineField, defineType } from 'sanity';

/**
 * HOLD — en årgang i den aktuelle sæson.
 *
 * KERNEN I MODELLEN
 *   Et hold defineres ved hvilke FØDSELSÅR det består af — ikke ved en liste
 *   af spillere. Spillerens fødselsår er stamdata, der aldrig ændrer sig, så
 *   tilknytningen udregnes.
 *
 * SÆSONSKIFTE
 *   Ret `foedselsaar` fra [2008, 2009] til [2009, 2010]. Så rykker alle
 *   2008-spillerne selv op på U19, og de årgange der er blevet for gamle
 *   falder ud af truppen. Ingen spillere skal røres.
 *
 *   Målt på prototypen: U17 gik fra 25 til 12 spillere og U19 fra 29 til 28,
 *   uden at én spiller blev redigeret.
 *
 * UNDTAGELSER
 *   En stærk spiller kan spille op eller ned. Det sættes på spilleren i
 *   feltet "Spiller på andet hold", som overstyrer udregningen.
 */
export default defineType({
  name: 'hold',
  title: 'Hold',
  type: 'document',
  fields: [
    defineField({
      name: 'navn',
      title: 'Navn',
      type: 'string',
      description: 'Fx "U17" eller "U19"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'foedselsaar',
      title: 'Årgange på holdet',
      type: 'array',
      of: [{ type: 'number' }],
      description:
        'Hvilke fødselsår holdet består af, fx 2008 og 2009. Spillerne ' +
        'tilknyttes automatisk ud fra deres fødselsår — ret kun her ved ' +
        'sæsonskifte.',
      validation: (Rule) =>
        Rule.required().min(1).error('Angiv mindst én årgang'),
    }),
    defineField({
      name: 'raekke',
      title: 'Række',
      type: 'string',
      description: 'Fx "U17 Liga"',
    }),
    defineField({
      name: 'traenere',
      title: 'Trænere',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'person' }] }],
      description: 'Peger på staben, så en trænerudskiftning kun rettes ét sted.',
    }),
    defineField({
      name: 'holdfoto',
      title: 'Holdfoto',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'raekkefoelge',
      title: 'Rækkefølge',
      type: 'number',
      description: 'Styrer hvilket hold der vises først. Lavest tal først.',
      initialValue: 1,
    }),
  ],

  preview: {
    select: { titel: 'navn', aar: 'foedselsaar', raekke: 'raekke', media: 'holdfoto' },
    prepare: ({ titel, aar, raekke, media }) => ({
      title: titel,
      subtitle: [
        Array.isArray(aar) ? `Årgang ${aar.join('–')}` : null,
        raekke,
      ].filter(Boolean).join(' · '),
      media,
    }),
  },

  orderings: [
    { title: 'Rækkefølge', name: 'raekkefoelge',
      by: [{ field: 'raekkefoelge', direction: 'asc' }] },
  ],
});
