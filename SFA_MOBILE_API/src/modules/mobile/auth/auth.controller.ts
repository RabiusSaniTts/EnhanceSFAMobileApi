import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  checkSalesmanVersion,
  getCompanyIdByDevice,
  loginSalesman,
  updateSyncDate as updateSyncDateService
} from './auth.service';

interface CompanyIdByDeviceParams {
  deviceid: string;
}

interface SalesmanLoginParams {
  username: string;
  password: string;
  deviceid: string;
}

interface SalesmanVersionCheckParams {
  routecode: string;
  verno: string;
}

interface UpdateSyncDateParams {
  routeid?: string;
  userid?: string;
  deviceid?: string;
  routecode?: string;
  routekey?: string;
  routeclosed?: string;
}

interface UpdateSyncDateQuery {
  routeid?: string;
  userid?: string;
  deviceid?: string;
  routecode?: string;
  routekey?: string;
  routeclosed?: string;
}

export async function companyIdByDevice(
  request: FastifyRequest<{ Params: CompanyIdByDeviceParams }>,
  reply: FastifyReply
) {
  const result = await getCompanyIdByDevice(request.params.deviceid);
  await reply.send(result);
}

export async function salesmanLogin(
  request: FastifyRequest<{ Params: SalesmanLoginParams }>,
  reply: FastifyReply
) {
  const result = await loginSalesman(
    request.params.username,
    request.params.password.trim(),
    request.params.deviceid
  );
  await reply.send(result);
}

export async function salesmanVersionCheck(
  request: FastifyRequest<{ Params: SalesmanVersionCheckParams }>,
  reply: FastifyReply
) {
  const result = await checkSalesmanVersion(
    request.params.routecode,
    request.params.verno
  );
  await reply.send(result);
}

export async function updateSyncDate(
  request: FastifyRequest<{
    Params: UpdateSyncDateParams;
    Querystring: UpdateSyncDateQuery;
  }>,
  reply: FastifyReply
) {
  const result = await updateSyncDateService(request);
  await reply.send(result);
}
