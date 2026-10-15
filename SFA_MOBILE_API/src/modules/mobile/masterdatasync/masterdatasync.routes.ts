/**
 * @author MD.Rabius Sani Raju
 * @date 2026-10-15
 */

import type { FastifyInstance } from 'fastify';
import { masterDataSyncAction } from './controllers/masterdatasync.controller';

/** Registers the legacy getsyncdata1 endpoint used for full mobile synchronization. */
export async function masterDataSyncRoutes(app: FastifyInstance): Promise<void> {
  app.route({ method: ['GET', 'POST'], url: '/api/index/getsyncdata1/routeid/:routeid/userid/:userid/deviceid/:deviceid/mdate/:mdate/table/:table', handler: masterDataSyncAction });
  app.route({ method: ['GET', 'POST'], url: '/api/index/getsyncdata1/routeid/:routeid/userid/:userid/deviceid/:deviceid/mdate/:mdate', handler: masterDataSyncAction });
  app.route({ method: ['GET', 'POST'], url: '/api/index/getsyncdata/routeid/:routeid/userid/:userid/deviceid/:deviceid/mdate/:mdate/table/:table', handler: masterDataSyncAction });
  app.route({ method: ['GET', 'POST'], url: '/api/index/getsyncdata/routeid/:routeid/userid/:userid/deviceid/:deviceid/mdate/:mdate', handler: masterDataSyncAction });
}
