import spiller from './spiller';
import hold from './hold';
import person from './person';
import sponsor from './sponsor';
import nyhed from './nyhed';
import saeson from './saeson';

/**
 * Seks dokumenttyper dækker hele akademiets indhold.
 *
 *   nyhed     det redaktørerne bruger oftest
 *   spiller   54 elever
 *   hold      årgangene — definerer hvilke fødselsår de består af
 *   person    trænere, ansatte og bestyrelse i én model
 *   sponsor   50 virksomheder og partnere
 *   saeson    ét dokument med alle priser og satser
 *
 * Formen er den samme som poc/src/data/ i prototypen, så etape 2 er et skift
 * af datakilde og ikke en omskrivning.
 */
export const schemaTypes = [nyhed, spiller, hold, person, sponsor, saeson];
