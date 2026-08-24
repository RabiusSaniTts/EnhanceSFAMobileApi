import { withTransaction } from '../../../shared/db/transaction';
import { mapCompanyDeviceResponse } from './auth.mapper';
import {
  autoAssignDeviceForRegisteredRoute,
  countSalesmanByCredentials,
  ensureDeviceRegistered,
  findAssignedDeviceIdByCredentials,
  findLatestAppVersion,
  findRouteVersion,
  findSalesmanLoginSuccessRows,
  getUseEncryptionFlag
} from './repository/auth.repository';
import type {
  CompanyIdByDeviceResponseItem,
  SalesmanLoginResponseItem,
  SalesmanVersionCheckResponseItem
} from './auth.types';

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
