import { withTransaction } from '../../../shared/db/transaction';
import { mapCompanyDeviceResponse } from './auth.mapper';
import {
  autoAssignDeviceForRegisteredRoute,
  countSalesmanByCredentials,
  ensureDeviceRegistered,
  findRouteCodeBySalesman,
  findAssignedDeviceIdByCredentials,
  findLatestAppVersion,
  findRouteVersion,
  findSalesmanLoginSuccessRows,
  getUseEncryptionFlag,
  insertSyncLog,
  insertSyncService
} from './repository/auth.repository';
import type {
  CompanyIdByDeviceResponseItem,
  SalesmanLoginResponseItem,
  SalesmanVersionCheckResponseItem,
  UpdateSyncDateParams,
  UpdateSyncDateQuery,
  UpdateSyncDateResponse
} from './auth.types';
import type { FastifyRequest } from 'fastify';
import { ApiError } from '../../../shared/middleware/errors';

export async function getCompanyIdByDevice(
  deviceId: string
): Promise<CompanyIdByDeviceResponseItem[]> {
  return withTransaction(async (connection) => {
    await ensureDeviceRegistered(connection, deviceId);
    const appVersion = await findLatestAppVersion(connection);
    return mapCompanyDeviceResponse(appVersion);
  });
}

export async function loginSalesman(
  username: string,
  password: string,
  deviceId: string
): Promise<SalesmanLoginResponseItem[]> {
  return withTransaction(async (connection) => {
    await autoAssignDeviceForRegisteredRoute(connection, username, deviceId);

    const salesmanCount = await countSalesmanByCredentials(
      connection,
      username,
      password
    );

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

    return findSalesmanLoginSuccessRows(
      connection,
      username,
      password,
      useEncryption
    );
  });
}

export async function checkSalesmanVersion(
  routeCode: string,
  currentVersion: string
): Promise<SalesmanVersionCheckResponseItem[]> {
  return withTransaction(async (connection) => {
    const routeVersion = await findRouteVersion(connection, routeCode);

    if (
      routeVersion?.VER_STS === '1' &&
      routeVersion.VER_NO !== currentVersion
    ) {
      return [{ STATUS: 0 }];
    }

    return [{ STATUS: 1 }];
  });
}

export async function updateSyncDate(
  request: FastifyRequest<{
    Params: UpdateSyncDateParams;
    Querystring: UpdateSyncDateQuery;
  }>
): Promise<UpdateSyncDateResponse> {
  const userId = readParam(request, 'userid');
  const deviceId = readParam(request, 'deviceid');
  const routeCodeParam = readOptionalParam(request, 'routecode') ?? readOptionalParam(request, 'routeid');
  const routeKey = readOptionalParam(request, 'routekey') ?? '0';
  const routeClosed = readOptionalParam(request, 'routeclosed') ?? '0';

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

  return { status: 'success' };
}

function readParam(
  request: FastifyRequest<{
    Params: UpdateSyncDateParams;
    Querystring: UpdateSyncDateQuery;
  }>,
  field: keyof UpdateSyncDateParams
): string {
  const value = readOptionalParam(request, field);

  if (value === undefined || value === null || value === '') {
    throw new ApiError(400, `Missing ${field}`);
  }

  return value;
}

function readOptionalParam(
  request: FastifyRequest<{
    Params: UpdateSyncDateParams;
    Querystring: UpdateSyncDateQuery;
  }>,
  field: keyof UpdateSyncDateParams
): string | undefined {
  const value = request.params[field] ?? request.query[field] ?? readBodyField(request.body, field);

  return value === undefined || value === null || value === '' ? undefined : String(value);
}

function readBodyField(body: unknown, field: string): unknown {
  if (body === undefined || body === null || body === '') {
    return undefined;
  }

  if (typeof body === 'string') {
    const trimmedBody = body.trim();

    if (trimmedBody === '' || trimmedBody === '{}') {
      return undefined;
    }

    if (trimmedBody.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmedBody);
        return isPlainObject(parsed) ? parsed[field] : undefined;
      } catch {
        throw new ApiError(400, 'Invalid index/updatesyncdate JSON payload');
      }
    }

    return new URLSearchParams(trimmedBody).get(field) ?? undefined;
  }

  return isPlainObject(body) ? body[field] : undefined;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
