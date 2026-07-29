import { defineField, defineType } from 'sanity';

/**
 * SPILLER — én elev.
 *
 * SÅDAN TILFØJER MAN EN SPILLER
 *   Tryk "Spillere" → "+" → udfyld felterne → Udgiv. Cirka 40 sekunder.
 *   Portrættet trækkes ind fra kamerarullen; beskæring om ansigtet og
 *   komprimering til WebP sker automatisk.
 *
 * SÅDAN FJERNER MAN EN SPILLER
 *   Slå `aktiv` fra. Spilleren forsvinder fra truppen med det samme, men
 *   profilen, fotoet og historikken består — så gamle nyheder ikke får
 *   døde links, og så holdet fra en tidligere sæson stadig kan vises.
 *   Rigtig sletning er også muligt, men bør være undtagelsen.
 *
 * SÅDAN FLYTTER MAN EN ÅRGANG OP
 *   Det gør man IKKE her. Holdtilknytningen udregnes ud fra fødselsåret:
 *   holdet "U17" er defineret ved årgangene 2008 og 2009, så ved sæsonskifte
 *   rettes de to årstal på HOLDET — og alle spillerne flytter sig selv.
 *   Se sanity/schemas/hold.ts.
 *
 *   Derfor er `foedselsaar` det vigtigste felt her. Det er stamdata, der
 *   aldrig ændrer sig, og det er påkrævet.
 */
export default defineType({
  name: 'spiller',
  title: 'Spiller',
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
      description: 'Dannes automatisk ud fra navnet. Rør den kun hvis du ved hvorfor.',
      options: { source: 'navn', maxLength: 72 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'portraet',
      title: 'Portræt',
      type: 'image',
      // hotspot: redaktøren markerer ansigtet én gang, og alle formater
      // — miniature, kort, profil — beskæres derefter korrekt automatisk.
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt-tekst',
          type: 'string',
          description: 'Beskriv billedet for skærmlæsere. Udfyldes automatisk med navnet.',
        }),
      ],
    }),
    defineField({
      name: 'foedselsaar',
      title: 'Fødselsår',
      type: 'number',
      description:
        'STAMDATA. Holdtilknytningen udregnes herudfra — ret aldrig dette ' +
        'felt for at flytte en spiller til et andet hold.',
      validation: (Rule) =>
        Rule.required().min(2000).max(2020).integer()
          .error('Fødselsår skal udfyldes — holdet udregnes ud fra det'),
    }),
    defineField({
      name: 'holdOverstyring',
      title: 'Spiller på andet hold',
      type: 'reference',
      to: [{ type: 'hold' }],
      description:
        'Kun hvis spilleren spiller op eller ned — fx en stærk spiller fra ' +
        'årgang 2010 der spiller på U17. Lad feltet stå tomt i alle ' +
        'almindelige tilfælde.',
    }),
    defineField({
      name: 'rygnummer',
      title: 'Rygnummer',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(99).integer(),
    }),
    defineField({
      name: 'position',
      title: 'Position',
      type: 'string',
      options: {
        list: [
          'Målvogter', 'Venstre fløj', 'Venstre back',
          'Playmaker', 'Streg', 'Højre back', 'Højre fløj',
        ],
        layout: 'dropdown',
      },
    }),
    defineField({ name: 'moderklub', title: 'Moderklub', type: 'string' }),
    defineField({
      name: 'uddannelse',
      title: 'Uddannelse',
      type: 'string',
      options: { list: ['STX', 'HHX', 'HF'], layout: 'radio', direction: 'horizontal' },
    }),
    /*
     * LANDSHOLD — et ja/nej, der tegner et mærke på portrættet.
     *
     * Feltet er et boolean og ikke en fritekst, fordi det skal kunne bruges
     * til noget: sitet sætter dannebrogsmærket øverst til højre på billedet,
     * og listen "Landsholdsspillere" i menuen tælles af det. Stod der en
     * sætning i et tekstfelt, kunne ingen af de to ting laves.
     *
     * Der er INGEN standardværdi. En spiller er ikke landsholdsspiller før
     * nogen har sagt det — og det her er en oplysning der står på et ungt
     * menneskes cv, så et gæt fra systemets side ville være forkert.
     */
    defineField({
      name: 'landshold',
      title: 'Har spillet på landsholdet',
      type: 'boolean',
      description:
        'Slå til når spilleren har været udtaget til et dansk ungdoms- eller ' +
        'A-landshold. Så kommer der et dannebrogsmærke øverst til højre på ' +
        'portrættet — både på profilen og på spillerkortet i truppen.',
    }),
    defineField({
      name: 'landsholdNiveau',
      title: 'Hvilket landshold',
      type: 'string',
      description:
        'Valgfrit. Fx "U18". Står med på mærket når det er udfyldt; ellers ' +
        'står der bare "Landshold".',
      // Feltet er meningsløst når kontakten er slået fra — så skjul det frem
      // for at lade det stå og invitere til at blive udfyldt alligevel.
      hidden: ({ document }) => !document?.landshold,
      validation: (Rule) => Rule.max(14).warning('Hold det kort — der er lidt plads på mærket'),
    }),

    defineField({
      name: 'sponsor',
      title: 'Personlig sponsor',
      type: 'reference',
      to: [{ type: 'sponsor' }],
      description:
        'Peger på sponsorregistret. Skifter sponsoren logo, opdateres det ét ' +
        'sted og slår igennem alle steder.',
    }),
    defineField({
      name: 'aktiv',
      title: 'Aktiv på akademiet',
      type: 'boolean',
      description:
        'Slå fra når spilleren stopper. Profilen består, men vises ikke i truppen.',
      initialValue: true,
    }),
  ],

  // Listen i redigeringsvinduet: navn, hold og nummer — så man kan finde folk
  preview: {
    select: { titel: 'navn', aar: 'foedselsaar', nr: 'rygnummer',
              media: 'portraet', aktiv: 'aktiv', op: 'holdOverstyring.navn',
              landshold: 'landshold', niveau: 'landsholdNiveau' },
    prepare: ({ titel, aar, nr, media, aktiv, op, landshold, niveau }) => ({
      title: `${nr ? `#${nr} ` : ''}${titel}`,
      subtitle: [
        aar ? `Årgang ${aar}` : 'Mangler fødselsår',
        op ? `spiller på ${op}` : null,
        landshold ? `${niveau || 'landshold'} 🇩🇰` : null,
        aktiv ? null : 'STOPPET',
      ].filter(Boolean).join(' · '),
      media,
    }),
  },

  orderings: [
    { title: 'Rygnummer', name: 'nr', by: [{ field: 'rygnummer', direction: 'asc' }] },
    { title: 'Navn', name: 'navn', by: [{ field: 'navn', direction: 'asc' }] },
    { title: 'Årgang', name: 'aar', by: [{ field: 'foedselsaar', direction: 'asc' }] },
  ],
});
