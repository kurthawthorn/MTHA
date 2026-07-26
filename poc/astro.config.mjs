import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://m-tha.dk',
  // Statisk output: hver side bygges som en faerdig fil og kan ligge
  // gratis paa Cloudflare Pages. Ingen server der skal opdateres.
  output: 'static',
  build: { inlineStylesheets: 'auto' },
  compressHTML: true,
});
