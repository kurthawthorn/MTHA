import { defineField, defineType } from 'sanity';

/**
 * SÆSON — ét dokument, og det er ledelsens vigtigste.
 *
 * Alt der varierer fra sæson til sæson står her og kun her: årstal, priser,
 * SU-satser og estimater. Ingen side gentager et beløb.
 *
 * SÅDAN RULLER MAN TIL NÆSTE SÆSON
 *   1. Ret navn, fra og til
 *   2. Ret årgangene på HOLDENE (se hold.ts) — spillerne flytter sig selv
 *   3. Ret de beløb der er ændret
 *   Færdig. Priser, årstal og overskrifter opdateres over hele sitet.
 *
 * HVORFOR DET HER DOKUMENT ER DET VIGTIGSTE
 *   Da prototypen blev bygget, viste det sig at prisen for ophold stod i TRE
 *   forskellige versioner: 2.495 kr. på forsiden af m-tha.dk, 2.395 kr. i
 *   forældrebrochuren og 2.255 kr. i visionsbrochuren. Ingen af dem var
 *   forkerte da de blev skrevet — de blev bare aldrig rettet samtidig.
 *   Med ét dokument kan det ikke ske igen.
 */
export default defineType({
  name: 'saeson',
  title: 'Sæson',
  type: 'document',
  // Kun ét dokument af denne type. Studioet viser den direkte frem for en liste.
  __experimental_actions: ['update', 'publish'],
  groups: [
    { name: 'aar', title: 'Årstal', default: true },
    { name: 'priser', title: 'Priser' },
    { name: 'su', title: 'SU og estimater' },
  ],
  fields: [
    defineField({
      name: 'navn', title: 'Sæson', type: 'string', group: 'aar',
      description: 'Fx "2025–2026". Vises på optagelses- og økonomisiden.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'fra', title: 'Fra år', type: 'number', group: 'aar',
      validation: (Rule) => Rule.required().integer() }),
    defineField({ name: 'til', title: 'Til år', type: 'number', group: 'aar',
      validation: (Rule) => Rule.required().integer() }),
    defineField({
      name: 'bekraeftet', title: 'Tallene er bekræftet', type: 'boolean',
      group: 'aar', initialValue: false,
      description:
        'Sæt til når ledelsen har gennemgået beløbene. Er den slået fra, ' +
        'vises en note på økonomisiden om at tallene er vejledende.',
    }),

    defineField({ name: 'opholdBoende', title: 'Ophold på akademiet (kr./md)',
      type: 'number', group: 'priser',
      description: 'Inkl. kost, logi, vask, akademitræning, tøjpakke og sociale arrangementer.',
      validation: (Rule) => Rule.required().min(0) }),
    defineField({ name: 'husleje', title: 'Husleje, Traneholm (kr./md)',
      type: 'number', group: 'priser',
      description: '1-rumsbolig, ekskl. forbrug.' }),
    defineField({ name: 'forbrug', title: 'Forbrug, aconto (kr./md)',
      type: 'number', group: 'priser' }),
    defineField({ name: 'boligstoette', title: 'Boligstøtte, ca. (kr./md)',
      type: 'number', group: 'priser' }),
    defineField({ name: 'hjemmeboende', title: 'Akademiet, hjemmeboende (kr./md)',
      type: 'number', group: 'priser',
      description:
        'Muligheden for at bo hjemme fremgår ikke af den nuværende hjemmeside, ' +
        'men står i brochuren. Den er formentlig den billigste indgang for en ' +
        'lokal familie.' }),
    defineField({ name: 'traenerHfMors', title: 'Fradrag, træner i HF Mors (kr./md)',
      type: 'number', group: 'priser' }),

    defineField({ name: 'suHjemmeboende', title: 'SU, hjemmeboende (kr./md før skat)',
      type: 'number', group: 'su' }),
    defineField({ name: 'suUdeboende', title: 'SU, udeboende (kr./md før skat)',
      type: 'number', group: 'su' }),
    defineField({ name: 'suAar', title: 'SU-satsernes år', type: 'number', group: 'su',
      description: 'Satserne ændres årligt. Tjek su.dk.' }),
    defineField({ name: 'estimatMad', title: 'Estimat: mad, vand og varme hjemme (kr./md)',
      type: 'number', group: 'su' }),
    defineField({ name: 'estimatTransport', title: 'Estimat: transport (kr./md)',
      type: 'number', group: 'su' }),
  ],

  preview: {
    select: { navn: 'navn', bekraeftet: 'bekraeftet' },
    prepare: ({ navn, bekraeftet }) => ({
      title: `Sæson ${navn ?? '—'}`,
      subtitle: bekraeftet ? 'Tallene er bekræftet' : 'Tallene er IKKE bekræftet',
    }),
  },
});
