import type { FastifyReply, FastifyRequest } from 'fastify';
import { NotImplementedApiError } from '../../../shared/middleware/errors';
import {
  checkSalesmanVersion,
  getCompanyIdByDevice,
  loginSalesman
} from './index.service';
import type {
  CompanyIdByDeviceParams,
  SalesmanLoginParams,
  SalesmanVersionCheckParams
} from './index.types';

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

export async function getSyncData1() {
  throw new NotImplementedApiError('index/getsyncdata1');
}

export async function updateSyncDate() {
  throw new NotImplementedApiError('index/updatesyncdate');
}
