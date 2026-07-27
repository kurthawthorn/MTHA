import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'g4s1nwak',
    dataset: 'production',
  },
  /** Adressen studioet får ved `npm run deploy`: mtha.sanity.studio */
  studioHost: 'mtha',
});
