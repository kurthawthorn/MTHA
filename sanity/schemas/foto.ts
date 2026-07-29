import { defineField, defineType } from 'sanity';
/*
 * Pladserne ligger ÉT sted, i sitet. Se `poc/src/data/fotoslots.ts` for hvorfor
 * det er en lukket liste, og hvordan man tilføjer en plads.
 */
import { FOTO_VALG } from '../../poc/src/data/fotoslots';

/**
 * FOTO — et af de redaktionelle billeder på sitet.
 *
 * HVORFOR DENNE TYPE FINDES
 *   Før lå de 13 fotos som filer på m-tha.dk, og bygningen hentede dem hver
 *   gang. Det havde tre problemer:
 *
 *     1. Det tog 36 af bygningens 65 sekunder — over halvdelen af tiden gik med
 *        at hente billeder fra en One.com-side.
 *     2. Lars kunne ikke skifte dem. Et nyt hero-billede krævede at nogen lagde
 *        en fil på det gamle site med det rigtige filnavn.
 *     3. Hentningen kunne fejle. Workflowet havde `continue-on-error`, så en
 *        udgivelse kunne lykkes med farvede pladsholdere i stedet for fotos.
 *
 *   Nu ligger de her. Bygningen henter intet fra m-tha.dk, og et nyt forsidefoto
 *   er: vælg pladsen, træk fotoet ind, Udgiv.
 *
 * SÅDAN SKIFTER MAN FORSIDENS STORE BILLEDE
 *   Billeder → “Forsiden — det store billede øverst” → træk et nyt foto ind i
 *   feltet → marker hvad billedet handler om (hotspot) → Udgiv.
 *
 * ALT-TEKSTEN ER PÅKRÆVET
 *   Et foto uden alt-tekst er usynligt for en skærmlæser og for Google. Feltet
 *   er derfor obligatorisk — undtagen når billedet er ren pynt, og det er der en
 *   kontakt til. Se `dekorativ`.
 */
export default defineType({
  name: 'foto',
  title: 'Billede',
  type: 'document',
  fields: [
    defineField({
      name: 'noegle',
      title: 'Hvor skal billedet stå',
      type: 'string',
      description:
        'Pladsen på sitet. Der kan kun være ét billede pr. plads — vælger du ' +
        'en plads der allerede er i brug, får du to der slås om samme sted.',
      options: { list: FOTO_VALG, layout: 'dropdown' },
      validation: (Rule) => Rule.required().error('Vælg hvor billedet skal stå'),
    }),
    defineField({
      name: 'billede',
      title: 'Billede',
      type: 'image',
      // hotspot: nogle af pladserne er brede (holdfoto 21:8, hero 100vw), og
      // der beskaeres derfor kraftigt. Uden et hotspot holdes der fast i
      // midten — se portraetAnker() i poc/src/lib/sanity.ts.
      options: { hotspot: true },
      validation: (Rule) => Rule.required().error('Der skal være et billede'),
    }),
    defineField({
      name: 'alt',
      title: 'Alt-tekst',
      type: 'string',
      description:
        'Beskriv hvad man ser, for dem der ikke kan se det. Fx "U19-holdet ' +
        'jubler med guldmedaljer efter DM-finalen 2025".',
      validation: (Rule) =>
        Rule.custom((v, ctx) =>
          v || (ctx.document as { dekorativ?: boolean })?.dekorativ
            ? true
            : 'Skriv en alt-tekst, eller slå "Rent pynt" til',
        ),
    }),
    defineField({
      name: 'dekorativ',
      title: 'Rent pynt',
      type: 'boolean',
      description:
        'Slå til når billedet ikke tilføjer noget — fx baggrunden bag en ' +
        'overskrift, hvor teksten allerede siger det hele. Så får det en tom ' +
        'alt-tekst, hvilket er det RIGTIGE for et pyntebillede: en skærmlæser ' +
        'springer det over frem for at læse en beskrivelse op der ikke hjælper.',
      initialValue: false,
    }),
    defineField({
      name: 'fotograf',
      title: 'Fotograf',
      type: 'string',
      description:
        'Valgfrit. Bruges ikke på sitet endnu, men billederne tilhører nogen, ' +
        'og det er nemmere at skrive ned nu end at finde ud af bagefter.',
    }),
  ],

  preview: {
    select: { noegle: 'noegle', alt: 'alt', media: 'billede', dekorativ: 'dekorativ' },
    prepare: ({ noegle, alt, media, dekorativ }) => ({
      /* Pladsen som titel, ikke nøglen: redaktøren leder efter "forsiden",
         ikke efter "dm-2025-vinder". */
      title: FOTO_VALG.find((v) => v.value === noegle)?.title ?? noegle ?? 'Uden plads',
      subtitle: dekorativ ? 'rent pynt — ingen alt-tekst' : (alt || '⚠ mangler alt-tekst'),
      media,
    }),
  },

  orderings: [
    { title: 'Plads', name: 'plads', by: [{ field: 'noegle', direction: 'asc' }] },
  ],
});
