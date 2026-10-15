/**
 * @author MD.Rabius Sani Raju
 * @date 2026-10-15
 */

import type { FastifyInstance } from 'fastify';
import {
  companyIdByDevice,
  salesmanLogin,
  salesmanVersionCheck,
  updateSyncDate
} from './controllers/auth.controller';

/**
 * Registers the legacy authentication and device-management endpoints used by
 * the PhoneGap application. Paths and methods are mobile compatibility contracts.
 *
 * @param app Fastify application that receives the route registrations.
 * @returns Resolves after all authentication routes have been registered.
 */
export async function authRoutes(app: FastifyInstance): Promise<void> {
  // Registers a device when necessary and returns the current app version.
  app.route({ method: 'POST', url: '/api/index/companyidbydevice/deviceid/:deviceid', handler: companyIdByDevice });
  // Validates credentials and confirms that the device is assigned to the route.
  app.route({ method: 'POST', url: '/api/index/salesmanlogin/username/:username/password/:password/deviceid/:deviceid', handler: salesmanLogin });
  // GET remains supported because the existing start-day screen uses it.
  app.route({ method: ['GET', 'POST'], url: '/api/index/salesmanverchk/routecode/:routecode/verno/:verno', handler: salesmanVersionCheck });
  // Short legacy form; routeid is available as the route-code fallback.
  app.route({ method: 'POST', url: '/api/index/updatesyncdate/routeid/:routeid', handler: updateSyncDate });
  // Full legacy form containing user, device, route, and route-day state.
  app.route({ method: 'POST', url: '/api/index/updatesyncdate/userid/:userid/deviceid/:deviceid/routecode/:routecode/routekey/:routekey/routeclosed/:routeclosed', handler: updateSyncDate });
}
