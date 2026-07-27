import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Nyheder ligger som markdown-filer i POC'en. Skemaet nedenfor er praecis det
 * samme som `nyhed`-dokumentet i Sanity, saa etape 1 skifter kun datakilde:
 * `getCollection('nyheder')` bliver til et Sanity-kald, og siderne roeres ikke.
 *
 * `kilde` skelner mellem noget nogen har skrevet i CMS'et og noget der er
 * hentet automatisk fra Instagram — saa staben kan noejes med at skrive ét sted.
 */
const nyheder = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/nyheder' }),
  schema: z.object({
    titel: z.string(),
    dato: z.coerce.date(),
    kategori: z.enum(['Kamp', 'Akademiet', 'Uddannelse', 'Sponsor']),
    resume: z.string(),
    holdId: z.string().optional(),
    kilde: z.enum(['cms', 'instagram']).default('cms'),
    fremhaevet: z.boolean().default(false),
    /** Nøgle til et af akademiets egne fotos i src/assets/fotos/ */
    fotoKey: z.string().optional(),
  }),
});

export const collections = { nyheder };
