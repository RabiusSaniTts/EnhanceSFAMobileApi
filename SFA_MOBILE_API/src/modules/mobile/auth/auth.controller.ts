import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  checkSalesmanVersion,
  getCompanyIdByDevice,
  loginSalesman,
  updateSyncDate as updateSyncDateService
} from './auth.service';
import type {
  CompanyIdByDeviceParams,
  SalesmanLoginParams,
  SalesmanVersionCheckParams,
  UpdateSyncDateParams,
  UpdateSyncDateQuery
} from './auth.types';

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
