import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'g4s1nwak',
    dataset: 'production',
  },
  /** Adressen studioet er udgivet paa: https://mtha.sanity.studio */
  studioHost: 'mtha',
  deployment: {
    // Gemt her, saa `npm run deploy` ikke spoerger om det hver gang
    appId: 'mwz6boai4ekwyujqsgkxxexk',
  },
});
