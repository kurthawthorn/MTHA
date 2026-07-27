import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'INDSÆT_PROJEKT_ID',
    dataset: 'production',
  },
  /** Adressen studioet får ved `npm run deploy`: mtha.sanity.studio */
  studioHost: 'mtha',
});
