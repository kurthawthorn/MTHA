import { defineField, defineType } from 'sanity';

/**
 * SPONSOR — én virksomhed. Registret bag alle sponsorvisninger.
 *
 * ÉT STED, MANGE VISNINGER
 *   Et logo uploades én gang og bruges herefter automatisk:
 *     * sponsorsiden, i den række niveauet hører til
 *     * sidefoden (kun hovedsponsor og topsponsorer)
 *     * spillerkortet og spillerprofilen for de elever de støtter
 *   Skifter virksomheden navn, logo eller hjemmeside, rettes det ét sted.
 *
 * SÅDAN TILFØJER MAN EN SPONSOR
 *   Tryk "Sponsorer" → "+" → navn, logo, hjemmeside, niveau → Udgiv.
 *   Sponsoren er straks på sponsorsiden. Ca. 30 sekunder.
 *
 * SÅDAN KNYTTER MAN EN SPONSOR TIL EN SPILLER
 *   Det gøres på SPILLEREN, i feltet "Personlig sponsor". Sponsoren ved ikke
 *   selv hvem den støtter — så undgår man at skulle rette to steder, og
 *   tællingen "støtter N spillere" udregnes af sig selv.
 *
 * SÅDAN STOPPER ET SPONSORAT
 *   Slå `aktiv` fra, eller sæt `aftaleUdloeber`. Sponsoren forsvinder fra
 *   sitet, men bliver i registret — så historikken og de gamle nyheder holder,
 *   og en genoptaget aftale er ét klik.
 */
export default defineType({
  name: 'sponsor',
  title: 'Sponsor',
  type: 'document',
  fields: [
    defineField({
      name: 'navn',
      title: 'Virksomhedens navn',
      type: 'string',
      description: 'Sådan som virksomheden selv skriver det.',
      validation: (Rule) => Rule.required().error('Navn skal udfyldes'),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      description:
        'Helst PNG eller SVG med gennemsigtig baggrund. Logoet skaleres og ' +
        'centreres automatisk, så rækken bliver rolig uanset format.',
      options: { hotspot: false },
      validation: (Rule) => Rule.required().warning('Uden logo vises kun navnet'),
    }),
    defineField({
      name: 'url',
      title: 'Hjemmeside',
      type: 'url',
      description: 'Logoet bliver et link hertil. Åbnes i ny fane.',
      validation: (Rule) =>
        Rule.uri({ scheme: ['http', 'https'] })
          .warning('Uden hjemmeside bliver logoet ikke klikbart'),
    }),
    defineField({
      name: 'niveau',
      title: 'Niveau',
      type: 'string',
      description: 'Styrer hvor og hvor stort logoet vises.',
      options: {
        list: [
          { title: 'Hovedsponsor', value: 'hovedsponsor' },
          { title: 'Topsponsor', value: 'topsponsor' },
          { title: 'Sponsor', value: 'sponsor' },
          { title: 'Samarbejdspartner', value: 'partner' },
        ],
        layout: 'radio',
      },
      initialValue: 'sponsor',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'aftaleUdloeber',
      title: 'Aftalen udløber',
      type: 'date',
      description:
        'Valgfrit. Bruges til at minde ledelsen om at aftalen skal fornyes — ' +
        'sponsoren skjules ikke automatisk.',
    }),
    defineField({
      name: 'aktiv',
      title: 'Aktiv',
      type: 'boolean',
      description:
        'Slå fra når sponsoratet stopper. Sponsoren bliver i registret, så ' +
        'historikken holder og en genoptaget aftale er ét klik.',
      initialValue: true,
    }),
  ],

  preview: {
    select: { titel: 'navn', niveau: 'niveau', media: 'logo', aktiv: 'aktiv',
              udloeber: 'aftaleUdloeber' },
    prepare: ({ titel, niveau, media, aktiv, udloeber }) => ({
      title: titel,
      subtitle: [
        niveau,
        udloeber ? `udløber ${udloeber}` : null,
        aktiv ? null
: 'STOPPET',
      ].filter(Boolean).join(' · '),
      media,
    }),
  },

  orderings: [
    { title: 'Niveau', name: 'niveau',
      by: [{ field: 'niveau', direction: 'asc' }, { field: 'navn', direction: 'asc' }] },
    { title: 'Navn', name: 'navn', by: [{ field: 'navn', direction: 'asc' }] },
  ],
});
