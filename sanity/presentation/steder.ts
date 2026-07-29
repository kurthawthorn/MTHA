import { defineLocations, type DocumentLocationResolvers } from 'sanity/presentation';
import { sti } from './site';

/**
 * HVOR VISES DETTE DOKUMENT?
 *
 * Et dokument i Sanity har ingen adresse. "Christian Guldhammer Højbak" er et
 * sæt felter — ikke en side. Sitet er det der beslutter at han vises på
 * /spillere/christian-guldhammer-hojbak, på truppen og i tællingen på
 * forsiden.
 *
 * Presentation-værktøjet kan derfor ikke selv gætte hvad det skal vise, når
 * Lars åbner en spiller. Det er hele formålet med listen her: for hver
 * dokumenttype siger den hvilke sider dokumentet optræder på. Værktøjet
 * springer selv til den første, og viser resten som en liste man kan klikke i.
 *
 * TO STEDER SKAL RETTES SAMMEN
 *   Får en dokumenttype en ny side ude på sitet, skal den tilføjes her. Ellers
 *   virker forhåndsvisningen stadig — men den åbner det forkerte sted, og det
 *   ser ud som en fejl i værktøjet frem for en manglende linje i en fil.
 *
 * `showHref: false` bruges hvor adressen ikke siger redaktøren noget. "Alle
 * sponsorer" er tydeligere end "Alle sponsorer /MTHA/sponsorer".
 */
export const steder: DocumentLocationResolvers = {
  /* Det redaktørerne bruger oftest. En nyhed vises tre steder. */
  nyhed: defineLocations({
    select: { titel: 'titel', slug: 'slug.current' },
    resolve: (doc) => ({
      locations: [
        {
          title: doc?.titel || 'Nyheden',
          href: sti(`/nyheder/${doc?.slug}`),
        },
        { title: 'Alle nyheder', href: sti('/nyheder'), showHref: false },
        { title: 'Forsiden — de tre nyeste', href: sti('/'), showHref: false },
      ].filter((l) => !l.href.includes('undefined')),
    }),
  }),

  spiller: defineLocations({
    select: { navn: 'navn', slug: 'slug.current' },
    resolve: (doc) =>
      doc?.slug
        ? {
            locations: [
              { title: doc.navn || 'Spillerprofilen', href: sti(`/spillere/${doc.slug}`) },
            ],
          }
        : {
            /* Uden webadresse bygges der ingen side. Det er værd at sige
               højt frem for at vise en tom forhåndsvisning. */
            message: 'Spilleren har ingen webadresse endnu, så der findes ingen side.',
            tone: 'caution',
          },
  }),

  /*
   * Holdets id er `hold-u17` i Sanity, men `/hold/u17` ude på sitet.
   * Præfikset fjernes af `udenPraefiks()` i poc/src/data/akademi.ts, og skal
   * derfor fjernes her også — ellers peger linket på /hold/hold-u17.
   */
  hold: defineLocations({
    select: { navn: 'navn', id: '_id' },
    resolve: (doc) => ({
      locations: [
        {
          title: doc?.navn ? `Truppen — ${doc.navn}` : 'Truppen',
          href: sti(`/hold/${String(doc?.id ?? '').replace(/^hold-/, '')}`),
        },
        { title: 'Forsiden — årgangskortene', href: sti('/'), showHref: false },
      ],
    }),
  }),

  /* Staben har ingen underside pr. person — alle 25 står på én side. */
  person: defineLocations({
    select: { navn: 'navn' },
    resolve: (doc) => ({
      locations: [
        { title: doc?.navn ? `Staben — ${doc.navn}` : 'Staben', href: sti('/staben') },
      ],
    }),
  }),

  /*
   * En sponsor vises på sponsorsiden, i sidefoden på hver side — og på
   * profilen for hver elev de støtter. Det sidste kan ikke slås op herfra:
   * koblingen sidder på SPILLEREN, netop for at et sponsorat kun skal
   * vedligeholdes ét sted. Derfor nævnes det i stedet som en note.
   */
  sponsor: defineLocations({
    select: { navn: 'navn' },
    resolve: (doc) => ({
      locations: [
        { title: doc?.navn ? `Sponsorer — ${doc.navn}` : 'Sponsorer', href: sti('/sponsorer') },
      ],
      message: 'Logoet vises også i sidefoden og hos de elever sponsoren støtter.',
    }),
  }),

  vaerdi: defineLocations({
    select: { titel: 'titel', forside: 'paaForsiden' },
    resolve: (doc) => ({
      locations: [
        { title: doc?.titel ? `Værdier — ${doc.titel}` : 'Værdier', href: sti('/vaerdier') },
        ...(doc?.forside
          ? [{ title: 'Forsiden — “Det vi bygger på”', href: sti('/'), showHref: false }]
          : []),
      ],
    }),
  }),

  uddannelse: defineLocations({
    select: { kort: 'kort', sted: 'sted' },
    resolve: (doc) => ({
      locations: [
        {
          title: doc?.kort ? `Uddannelse — ${doc.kort}` : 'Uddannelse',
          href: sti('/uddannelse'),
        },
        { title: 'Bliv elev', href: sti('/bliv-elev'), showHref: false },
      ],
    }),
  }),

  titel: defineLocations({
    select: { aar: 'aar' },
    resolve: (doc) => ({
      locations: [
        {
          title: doc?.aar ? `Trofæskabet — ${doc.aar}` : 'Trofæskabet',
          href: sti('/vaerdier#trofaeskabet'),
        },
        { title: 'Forsiden — medaljerækken', href: sti('/'), showHref: false },
      ],
    }),
  }),

  /*
   * Sæsonen er ét dokument, men det vigtigste af dem alle: hver pris og hver
   * SU-sats på sitet regnes ud af det. Derfor tre sider, ikke én — så Lars kan
   * se konsekvensen af at rette et beløb, i stedet for at gætte hvor det slår
   * igennem.
   */
  saeson: defineLocations({
    select: { navn: 'navn' },
    resolve: () => ({
      locations: [
        { title: 'Bliv elev — priser', href: sti('/bliv-elev') },
        { title: 'Økonomi — de to regnestykker', href: sti('/bliv-elev/oekonomi') },
        { title: 'Bolig', href: sti('/bolig'), showHref: false },
      ],
      message: 'Alle priser, satser og årstal på sitet regnes ud af dette dokument.',
    }),
  }),

  indstillinger: defineLocations({
    select: { motto: 'motto' },
    resolve: () => ({
      locations: [
        { title: 'Forsiden', href: sti('/') },
        { title: 'Værdier — historien', href: sti('/vaerdier'), showHref: false },
      ],
      message: 'Motto, tal og kontaktoplysninger står på hver side.',
    }),
  }),
};
