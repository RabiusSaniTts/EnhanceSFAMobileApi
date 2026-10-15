import type { FastifyReply, FastifyRequest } from 'fastify';
import { withTransaction } from '../../../../shared/db/transaction';
import { ApiError } from '../../../../shared/middleware/errors';
import {
  readOptionalRequestParam,
  readRequiredRequestParam
} from '../../../../shared/utils/commonUtils';
import {
  autoAssignDeviceForRegisteredRoute,
  countSalesmanByCredentials,
  ensureDeviceRegistered,
  findAssignedDeviceIdByCredentials,
  findLatestAppVersion,
  findRouteCodeBySalesman,
  findRouteVersion,
  findSalesmanLoginSuccessRows,
  getUseEncryptionFlag,
  insertSyncLog,
  insertSyncService
} from '../models/auth.model';

export async function companyIdByDevice(
  request: FastifyRequest<{ Params: Record<string, string> }>,
  reply: FastifyReply
) {
  const result = await withTransaction(async (connection) => {
    await ensureDeviceRegistered(connection, request.params.deviceid);
    const appVersion = await findLatestAppVersion(connection);

    return [
      {
        status: '1',
        url: appVersion?.url ?? null,
        ver: appVersion?.verno ?? null
      }
    ];
  });

  await reply.send(result);
}

export async function salesmanLogin(
  request: FastifyRequest<{ Params: Record<string, string> }>,
  reply: FastifyReply
) {
  const username = request.params.username;
  const password = request.params.password.trim();
  const deviceId = request.params.deviceid;

  const result = await withTransaction(async (connection) => {
    await autoAssignDeviceForRegisteredRoute(connection, username, deviceId);

    const salesmanCount = await countSalesmanByCredentials(connection, username, password);
    const useEncryption = await getUseEncryptionFlag(connection);

    if (salesmanCount === 0) {
      return [{ STATUS: 1 }];
    }

    const assignedDeviceId = await findAssignedDeviceIdByCredentials(
      connection,
      username,
      password
    );

    if (assignedDeviceId === '-') {
      return [{ STATUS: 3 }];
    }

    if (assignedDeviceId !== deviceId) {
      return [{ STATUS: 2 }];
    }

    return findSalesmanLoginSuccessRows(connection, username, password, useEncryption);
  });

  await reply.send(result);
}

export async function salesmanVersionCheck(
  request: FastifyRequest<{ Params: Record<string, string> }>,
  reply: FastifyReply
) {
  const result = await withTransaction(async (connection) => {
    const routeVersion = await findRouteVersion(connection, request.params.routecode);

    if (
      routeVersion?.VER_STS === '1' &&
      routeVersion.VER_NO !== request.params.verno
    ) {
      return [{ STATUS: 0 }];
    }

    return [{ STATUS: 1 }];
  });

  await reply.send(result);
}

export async function updateSyncDate(
  request: FastifyRequest<{
    Params: Record<string, string | undefined>;
    Querystring: Record<string, string | undefined>;
  }>,
  reply: FastifyReply
) {
  const userId = readRequiredRequestParam(
    request,
    'userid',
    'Invalid index/updatesyncdate JSON payload'
  );
  const deviceId = readRequiredRequestParam(
    request,
    'deviceid',
    'Invalid index/updatesyncdate JSON payload'
  );
  const routeCodeParam =
    readOptionalRequestParam(request, 'routecode', 'Invalid index/updatesyncdate JSON payload') ??
    readOptionalRequestParam(request, 'routeid', 'Invalid index/updatesyncdate JSON payload');
  const routeKey =
    readOptionalRequestParam(request, 'routekey', 'Invalid index/updatesyncdate JSON payload') ??
    '0';
  const routeClosed =
    readOptionalRequestParam(request, 'routeclosed', 'Invalid index/updatesyncdate JSON payload') ??
    '0';

  await withTransaction(async (connection) => {
    const routeCode = (await findRouteCodeBySalesman(connection, userId)) ?? routeCodeParam;

    if (routeCode === undefined || routeCode === null || routeCode === '') {
      throw new ApiError(400, 'Missing routecode');
    }

    await insertSyncService(connection, {
      userId,
      deviceId,
      routeCode,
      routeKey,
      routeClosed
    });

    await insertSyncLog(connection, {
      userId,
      routeCode,
      routeKey,
      routeClosed,
      syncType: '1'
    });
  });

  await reply.send({ status: 'success' });
}
