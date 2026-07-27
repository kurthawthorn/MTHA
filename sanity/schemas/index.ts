import spiller from './spiller';
import hold from './hold';
import person from './person';
import sponsor from './sponsor';
import nyhed from './nyhed';
import saeson from './saeson';
import vaerdi from './vaerdi';
import uddannelse from './uddannelse';
import titel from './titel';
import indstillinger from './indstillinger';

/**
 * Ti dokumenttyper daekker hele akademiets indhold.
 *
 *   nyhed          det redaktoererne bruger oftest
 *   spiller        54 elever
 *   hold           aargangene — definerer hvilke foedselsaar de bestaar af
 *   person         traenere, ansatte og bestyrelse i én model
 *   sponsor        51 virksomheder og partnere
 *   vaerdi         de fire baerende vaerdier
 *   uddannelse     fire veje, med koordinatorernes kontaktoplysninger
 *   titel          mesterskaberne i trofaeskabet
 *   saeson         ét dokument med alle priser og satser
 *   indstillinger  ét dokument med motto, tal og kontakt
 *
 * Efter dette findes der intet indhold tilbage i kodefiler. Alt kan rettes
 * i studioet.
 */
export const schemaTypes = [
  nyhed, spiller, hold, person, sponsor,
  vaerdi, uddannelse, titel,
  saeson, indstillinger,
];
