import type { PoolConnection, RowDataPacket } from 'mysql2/promise';

/**
 * Registers a previously unknown handset. `INSERT IGNORE` makes repeated
 * device-check calls safe and leaves an existing registration unchanged.
 *
 * @param connection Active database transaction connection.
 * @param deviceId Mobile handset identifier stored in tbl_device.
 * @returns Resolves after the registration attempt completes.
 */
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

/**
 * @param connection Active database transaction connection.
 * @returns The configured application URL/version row, or null when absent.
 */
export async function findLatestAppVersion(
  connection: PoolConnection
): Promise<RowDataPacket | null> {
  const [rows] = await connection.execute<RowDataPacket[]>(
    'SELECT url, verno FROM tbl_version LIMIT 1'
  );

  // Device check returns only the first configured version, matching Zend.
  return rows[0] ?? null;
}

/**
 * Assigns the calling device to a salesman whose route is enabled for automatic
 * device registration.
 *
 * @param connection Active database transaction connection.
 * @param username Salesman username used to locate the route.
 * @param deviceId Handset identifier written to routemaster.
 * @returns Resolves after the route update completes.
 */
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

/**
 * @param connection Active database transaction connection.
 * @param username Username received from the login URL.
 * @param password Trimmed password received from the login URL.
 * @returns Number of matching salesman rows; zero means invalid credentials.
 */
export async function countSalesmanByCredentials(
  connection: PoolConnection,
  username: string,
  password: string
): Promise<number> {
  const [rows] = await connection.execute<RowDataPacket[]>(
    `
      SELECT COUNT(*) AS count
      FROM salesman
      WHERE username = :username
      AND userpassword = :password
    `,
    { username, password }
  );

  // COUNT(*) produces one row; zero is retained as a defensive fallback.
  return rows[0]?.count ?? 0;
}

/**
 * @param connection Active database transaction connection.
 * @param username Validated salesman username.
 * @param password Validated salesman password.
 * @returns Assigned device ID, or `-` when no assignment exists.
 */
export async function findAssignedDeviceIdByCredentials(
  connection: PoolConnection,
  username: string,
  password: string
): Promise<string> {
  const [rows] = await connection.execute<RowDataPacket[]>(
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

  // The dash is required because the controller converts it to STATUS 3.
  return rows[0]?.deviceId ?? '-';
}

/**
 * Reproduces the legacy environment-based encryption flag.
 *
 * @param connection Active database transaction connection.
 * @returns 1 for an Ubuntu MySQL build; otherwise 0.
 */
export async function getUseEncryptionFlag(
  connection: PoolConnection
): Promise<0 | 1> {
  const [rows] = await connection.execute<RowDataPacket[]>(
    "SELECT CASE WHEN INSTR(VERSION(), 'ubuntu') THEN 1 ELSE 0 END AS useencription"
  );

  // The misspelled key is intentional and belongs to the mobile contract.
  return rows[0]?.useencription ?? 0;
}

/**
 * Loads the successful-login response without renaming database columns.
 *
 * @param connection Active database transaction connection.
 * @param username Validated salesman username.
 * @param password Validated salesman password.
 * @param useEncryption Legacy flag returned as `useencription`.
 * @returns Salesman/route rows containing STATUS 0.
 */
export async function findSalesmanLoginSuccessRows(
  connection: PoolConnection,
  username: string,
  password: string,
  useEncryption: 0 | 1
): Promise<RowDataPacket[]> {
  const [rows] = await connection.execute<RowDataPacket[]>(
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

  // Direct rows preserve the field names and value shapes consumed by mobile.
  return rows;
}

/**
 * @param connection Active database transaction connection.
 * @param routeCode Route checked before start-day processing.
 * @returns Route version rule, or null when no restriction is configured.
 */
export async function findRouteVersion(
  connection: PoolConnection,
  routeCode: string
): Promise<RowDataPacket | null> {
  const [rows] = await connection.execute<RowDataPacket[]>(
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

/**
 * @param connection Active database transaction connection.
 * @param userId Salesman code supplied by the synchronization request.
 * @returns The salesman's route code, or null when no mapping exists.
 */
export async function findRouteCodeBySalesman(
  connection: PoolConnection,
  userId: string | number
): Promise<number | null> {
  const [rows] = await connection.execute<RowDataPacket[]>(
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

/**
 * Inserts the primary synchronization audit row.
 *
 * @param connection Active database transaction connection.
 * @param params User, device, route, route-key, and route-closed values.
 * @returns Resolves after tbl_syncservice is updated.
 */
export async function insertSyncService(
  connection: PoolConnection,
  params: Record<string, string | number | null>
): Promise<void> {
  await connection.execute(
    `
      INSERT INTO tbl_syncservice
        (userid, deviceid, syncdate, synctime, routecode, synctype, routeclosed, routekey)
      VALUES
        (:userId, :deviceId, CURDATE(), CURTIME(), :routeCode, '1', :routeClosed, :routeKey)
    `,
    {
      // Explicit bindings prevent undefined values from reaching mysql2.
      userId: params.userId,
      deviceId: params.deviceId,
      routeCode: params.routeCode,
      routeClosed: String(params.routeClosed) === '1' ? '1' : '0',
      routeKey: params.routeKey
    }
  );
}

/**
 * Inserts the secondary sync log for an active route day. Requests with a zero
 * user ID or route key intentionally produce no synclog row, as Zend did.
 *
 * @param connection Active database transaction connection.
 * @param params User, route-state, and synchronization-type values.
 * @returns Resolves after insertion or after an intentional early return.
 */
export async function insertSyncLog(
  connection: PoolConnection,
  params: Record<string, string | number | null>
): Promise<void> {
  // Login/initial-sync calls may not have an active route day yet.
  if (Number(params.userId) === 0 || Number(params.routeKey) === 0) {
    return;
  }

  // Resolve route code again so synclog uses the authoritative route mapping.
  const routeCode = await findRouteCodeBySalesman(connection, params.userId ?? 0);

  if (routeCode === null) {
    // A salesman without a route cannot produce a valid synclog record.
    return;
  }

  // Use the currently open database route key instead of trusting the request.
  const [routeKeyRows] = await connection.execute<RowDataPacket[]>(
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
      // Normalize booleans/strings to the legacy '1' or '0' database value.
      userId: params.userId,
      routeCode,
      syncType: params.syncType,
      routeClosed: String(params.routeClosed) === '1' ? '1' : '0',
      routeKey: routeKeyRows[0]?.routekey ?? 0
    }
  );
}
