import { defineConfig } from 'astro/config';

/**
 * GitHub Pages lægger et projekt-repo på /REPO/ frem for på roden. Derfor
 * sættes `base` af en miljøvariabel, som kun GitHub Actions udfylder:
 *
 *   lokalt          base = "/"          alt virker som hidtil
 *   GitHub Pages    base = "/MTHA/"     sat af workflowet
 *
 * Astro præfikser selv alle importerede billeder og stylesheets. De
 * hårdkodede links i skabelonerne (href="/nyheder" osv.) klarer
 * `tools/saet-basissti.mjs` efter bygningen — se den fil for hvorfor.
 */
const BASE = process.env.PUBLIC_BASE ?? '/';
const SITE = process.env.PUBLIC_SITE ?? 'https://m-tha.dk';

export default defineConfig({
  site: SITE,
  base: BASE,
  // Statisk output: hver side bygges som en faerdig fil og kan ligge
  // gratis paa GitHub Pages eller Cloudflare Pages. Ingen server.
  output: 'static',
  build: { inlineStylesheets: 'auto' },
  compressHTML: true,
});
