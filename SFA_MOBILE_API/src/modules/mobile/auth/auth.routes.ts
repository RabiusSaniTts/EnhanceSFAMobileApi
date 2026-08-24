import type { FastifyInstance } from 'fastify';
import { masterDataSyncAction } from '../masterdatasync/masterdatasync.controller';
import {
  companyIdByDevice,
  salesmanLogin,
  salesmanVersionCheck,
  updateSyncDate
} from './auth.controller';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.route({
    method: ['GET', 'POST'],
    url: '/api/index/companyidbydevice/deviceid/:deviceid',
    handler: companyIdByDevice
  });

  app.route({
    method: ['GET', 'POST'],
    url: '/api/index/salesmanlogin/username/:username/password/:password/deviceid/:deviceid',
    handler: salesmanLogin
  });

  app.route({
    method: ['GET', 'POST'],
    url: '/api/index/salesmanverchk/routecode/:routecode/verno/:verno',
    handler: salesmanVersionCheck
  });

  app.route({
    method: ['GET', 'POST'],
    url: '/api/index/getsyncdata1/routeid/:routeid/userid/:userid/deviceid/:deviceid/mdate/:mdate/table/:table',
    handler: masterDataSyncAction
  });

  app.route({
    method: ['GET', 'POST'],
    url: '/api/index/updatesyncdate/routeid/:routeid',
    handler: updateSyncDate
  });
}
