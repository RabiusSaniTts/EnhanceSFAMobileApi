/**
 * @author MD.Rabius Sani Raju
 * @date 2026-10-15
 */

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

/** Registers a device and returns the legacy application-version response. */
export async function companyIdByDevice(
  request: FastifyRequest<{ Params: Record<string, string> }>,
  reply: FastifyReply
) {
  // Registration and version lookup use one transaction connection.
  const result = await withTransaction(async (connection) => {
    await ensureDeviceRegistered(connection, request.params.deviceid);
    // Null means tbl_version has no configured application version.
    const appVersion = await findLatestAppVersion(connection);

    // Preserve the array wrapper and exact Zend response keys.
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

/**
 * Authenticates a salesman and validates the assigned handset.
 * STATUS 0 succeeds, 1 rejects credentials, 2 reports another device, and 3
 * reports that no device is assigned.
 */
export async function salesmanLogin(
  request: FastifyRequest<{ Params: Record<string, string> }>,
  reply: FastifyReply
) {
  // Username is preserved; Zend trimmed the password before comparison.
  const username = request.params.username;
  const password = request.params.password.trim();
  // deviceId is compared with routemaster.device_assigned_id.
  const deviceId = request.params.deviceid;

  const result = await withTransaction(async (connection) => {
    // Routes approved for automatic registration may bind this device first.
    await autoAssignDeviceForRegisteredRoute(connection, username, deviceId);

    // These values control login status and the successful response payload.
    const salesmanCount = await countSalesmanByCredentials(connection, username, password);
    const useEncryption = await getUseEncryptionFlag(connection);

    if (salesmanCount === 0) {
      // Invalid username or password.
      return [{ STATUS: 1 }];
    }

    const assignedDeviceId = await findAssignedDeviceIdByCredentials(
      connection,
      username,
      password
    );

    if (assignedDeviceId === '-') {
      // The dash is the legacy sentinel for an unassigned device.
      return [{ STATUS: 3 }];
    }

    if (assignedDeviceId !== deviceId) {
      // The route belongs to a different handset.
      return [{ STATUS: 2 }];
    }

    // Successful rows contain STATUS 0 and the legacy salesman columns.
    return findSalesmanLoginSuccessRows(connection, username, password, useEncryption);
  });

  await reply.send(result);
}

/** Checks whether the installed mobile version is allowed for this route. */
export async function salesmanVersionCheck(
  request: FastifyRequest<{ Params: Record<string, string> }>,
  reply: FastifyReply
) {
  const result = await withTransaction(async (connection) => {
    // A missing rule means the route is not version-restricted.
    const routeVersion = await findRouteVersion(connection, request.params.routecode);

    if (
      routeVersion?.VER_STS === '1' &&
      routeVersion.VER_NO !== request.params.verno
    ) {
      // STATUS 0 blocks the current application version.
      return [{ STATUS: 0 }];
    }

    // STATUS 1 permits the mobile workflow to continue.
    return [{ STATUS: 1 }];
  });

  await reply.send(result);
}

/**
 * Records a synchronization attempt in the two legacy sync tables. Values may
 * arrive through path parameters, query parameters, or a legacy request body.
 */
export async function updateSyncDate(
  request: FastifyRequest<{
    Params: Record<string, string | undefined>;
    Querystring: Record<string, string | undefined>;
  }>,
  reply: FastifyReply
) {
  // userId and deviceId are mandatory audit identifiers.
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
  // The short URL calls the route value routeid; the full URL uses routecode.
  const routeCodeParam =
    readOptionalRequestParam(request, 'routecode', 'Invalid index/updatesyncdate JSON payload') ??
    readOptionalRequestParam(request, 'routeid', 'Invalid index/updatesyncdate JSON payload');
  // Missing route state receives the same zero defaults used by Zend.
  const routeKey =
    readOptionalRequestParam(request, 'routekey', 'Invalid index/updatesyncdate JSON payload') ??
    '0';
  const routeClosed =
    readOptionalRequestParam(request, 'routeclosed', 'Invalid index/updatesyncdate JSON payload') ??
    '0';

  await withTransaction(async (connection) => {
    // Prefer the database mapping, then fall back to the supplied route value.
    const routeCode = (await findRouteCodeBySalesman(connection, userId)) ?? routeCodeParam;

    if (routeCode === undefined || routeCode === null || routeCode === '') {
      throw new ApiError(400, 'Missing routecode');
    }

    // Always write the primary sync-service audit record.
    await insertSyncService(connection, {
      userId,
      deviceId,
      routeCode,
      routeKey,
      routeClosed
    });

    // The model skips synclog for legacy zero-user or zero-route-key requests.
    await insertSyncLog(connection, {
      userId,
      routeCode,
      routeKey,
      routeClosed,
      syncType: '1'
    });
  });

  // Keep the exact success object expected by the mobile application.
  await reply.send({ status: 'success' });
}
