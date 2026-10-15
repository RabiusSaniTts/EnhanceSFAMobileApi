import type { FastifyInstance } from 'fastify';
import {
  companyIdByDevice,
  salesmanLogin,
  salesmanVersionCheck,
  updateSyncDate
} from './controllers/auth.controller';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.route({ method: 'POST', url: '/api/index/companyidbydevice/deviceid/:deviceid', handler: companyIdByDevice });
  app.route({ method: 'POST', url: '/api/index/salesmanlogin/username/:username/password/:password/deviceid/:deviceid', handler: salesmanLogin });
  app.route({ method: ['GET', 'POST'], url: '/api/index/salesmanverchk/routecode/:routecode/verno/:verno', handler: salesmanVersionCheck });
  app.route({ method: 'POST', url: '/api/index/updatesyncdate/routeid/:routeid', handler: updateSyncDate });
  app.route({ method: 'POST', url: '/api/index/updatesyncdate/userid/:userid/deviceid/:deviceid/routecode/:routecode/routekey/:routekey/routeclosed/:routeclosed', handler: updateSyncDate });
}
