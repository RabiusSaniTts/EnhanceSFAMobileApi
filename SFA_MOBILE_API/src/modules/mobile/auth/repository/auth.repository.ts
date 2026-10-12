import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import type {
  AppVersionRow,
  RouteVersionRow,
  SalesmanLoginSuccessResponseItem
} from '../auth.types';

type AppVersionDbRow = RowDataPacket & AppVersionRow;
type CountDbRow = RowDataPacket & { count: number };
type DeviceIdDbRow = RowDataPacket & { deviceId: string };
type UseEncryptionDbRow = RowDataPacket & { useencription: 0 | 1 };
type SalesmanLoginSuccessDbRow = RowDataPacket & SalesmanLoginSuccessResponseItem;
type RouteVersionDbRow = RowDataPacket & RouteVersionRow;
type RouteCodeDbRow = RowDataPacket & { routecode: string | number | null };
type RouteKeyDbRow = RowDataPacket & { routekey: string | number | null };

export async function ensureDeviceRegistered(
  connection: PoolConnection,
  deviceId: string
): Promise<void> {
  await connection.execute(
    `
      INSERT IGNORE INTO tbl_device (company_id, device_id, remarks)
      VALUES (:companyId, :deviceId, :remarks)
    `,
    {
      companyId: 1,
      deviceId,
      remarks: 'Auto Registered'
    }
  );
}

export async function findLatestAppVersion(
  connection: PoolConnection
): Promise<AppVersionRow | null> {
  const [rows] = await connection.execute<AppVersionDbRow[]>(
    'SELECT url, verno FROM tbl_version LIMIT 1'
  );

  return rows[0] ?? null;
}

export async function autoAssignDeviceForRegisteredRoute(
  connection: PoolConnection,
  username: string,
  deviceId: string
): Promise<void> {
  await connection.execute(
    `
      UPDATE routemaster
      SET device_assigned_id = :deviceId
      WHERE salesmancode = (
        SELECT salesmancode
        FROM salesman
        WHERE username = :username
        LIMIT 1
      )
      AND routecode IN (
        SELECT routecode
        FROM auto_reg_device_routes
        WHERE sts = 1
      )
    `,
    { username, deviceId }
  );
}

export async function countSalesmanByCredentials(
  connection: PoolConnection,
  username: string,
  password: string
): Promise<number> {
  const [rows] = await connection.execute<CountDbRow[]>(
    `
      SELECT COUNT(*) AS count
      FROM salesman
      WHERE username = :username
      AND userpassword = :password
    `,
    { username, password }
  );

  return rows[0]?.count ?? 0;
}

export async function findAssignedDeviceIdByCredentials(
  connection: PoolConnection,
  username: string,
  password: string
): Promise<string> {
  const [rows] = await connection.execute<DeviceIdDbRow[]>(
    `
      SELECT
        CASE
          WHEN COALESCE(rm.device_assigned_id, '') = '' THEN '-'
          ELSE COALESCE(rm.device_assigned_id, '')
        END AS deviceId
      FROM routemaster rm
      INNER JOIN salesman sm ON sm.salesmancode = rm.salesmancode
      WHERE sm.username = :username
      AND sm.userpassword = :password
      LIMIT 1
    `,
    { username, password }
  );

  return rows[0]?.deviceId ?? '-';
}

export async function getUseEncryptionFlag(
  connection: PoolConnection
): Promise<0 | 1> {
  const [rows] = await connection.execute<UseEncryptionDbRow[]>(
    "SELECT CASE WHEN INSTR(VERSION(), 'ubuntu') THEN 1 ELSE 0 END AS useencription"
  );

  return rows[0]?.useencription ?? 0;
}

export async function findSalesmanLoginSuccessRows(
  connection: PoolConnection,
  username: string,
  password: string,
  useEncryption: 0 | 1
): Promise<SalesmanLoginSuccessResponseItem[]> {
  const [rows] = await connection.execute<SalesmanLoginSuccessDbRow[]>(
    `
      SELECT
        0 AS STATUS,
        rm.routecode,
        sm.cdat,
        sm.salesmancode,
        sm.salesmanname1,
        sm.salesmanname2,
        sm.arbsalesmanname1,
        sm.messagekey,
        sm.pricingkey,
        sm.created,
        sm.modified,
        sm.mdat,
        sm.memo1,
        sm.memo2,
        sm.alternatesalesmancode,
        sm.type,
        sm.activestatus,
        sm.parentcompany,
        sm.ansalesmancode,
        sm.username,
        sm.userpassword,
        :useEncryption AS useencription
      FROM salesman sm
      LEFT JOIN routemaster rm ON rm.salesmancode = sm.salesmancode
      WHERE sm.username = :username
      AND sm.userpassword = :password
    `,
    { username, password, useEncryption }
  );

  return rows;
}

export async function findRouteVersion(
  connection: PoolConnection,
  routeCode: string
): Promise<RouteVersionRow | null> {
  const [rows] = await connection.execute<RouteVersionDbRow[]>(
    `
      SELECT VER_NO, VER_STS
      FROM route_version_map
      WHERE ROUTE_CODE = :routeCode
      LIMIT 1
    `,
    { routeCode }
  );

  return rows[0] ?? null;
}

export async function findRouteCodeBySalesman(
  connection: PoolConnection,
  userId: string | number
): Promise<string | number | null> {
  const [rows] = await connection.execute<RouteCodeDbRow[]>(
    `
      SELECT routecode
      FROM routemaster
      WHERE salesmancode = :userId
      LIMIT 1
    `,
    { userId }
  );

  return rows[0]?.routecode ?? null;
}

export async function insertSyncService(
  connection: PoolConnection,
  params: {
    userId: string | number;
    deviceId: string;
    routeCode: string | number;
    routeKey: string | number | null;
    routeClosed: string | number;
  }
): Promise<void> {
  await connection.execute(
    `
      INSERT INTO tbl_syncservice
        (userid, deviceid, syncdate, synctime, routecode, synctype, routeclosed, routekey)
      VALUES
        (:userId, :deviceId, CURDATE(), CURTIME(), :routeCode, '1', :routeClosed, :routeKey)
    `,
    {
      userId: params.userId,
      deviceId: params.deviceId,
      routeCode: params.routeCode,
      routeClosed: String(params.routeClosed) === '1' ? '1' : '0',
      routeKey: params.routeKey
    }
  );
}

export async function insertSyncLog(
  connection: PoolConnection,
  params: {
    userId: string | number;
    routeCode: string | number;
    routeKey: string | number;
    routeClosed: string | number;
    syncType: string | number;
  }
): Promise<void> {
  if (Number(params.userId) === 0 || Number(params.routeKey) === 0) {
    return;
  }

  const routeCode = await findRouteCodeBySalesman(connection, params.userId);

  if (routeCode === null) {
    return;
  }

  const [routeKeyRows] = await connection.execute<RouteKeyDbRow[]>(
    `
      SELECT COALESCE(MAX(routekey), 0) AS routekey
      FROM startendday
      WHERE routeclosed = 0
      AND routecode = :routeCode
    `,
    { routeCode }
  );

  await connection.execute(
    `
      INSERT INTO synclog(userid, syncdate, routecode, synctime, synctype, routeclosed, routekey)
      VALUES(:userId, CURDATE(), :routeCode, CURTIME(), :syncType, :routeClosed, :routeKey)
    `,
    {
      userId: params.userId,
      routeCode,
      syncType: params.syncType,
      routeClosed: String(params.routeClosed) === '1' ? '1' : '0',
      routeKey: routeKeyRows[0]?.routekey ?? 0
    }
  );
}
