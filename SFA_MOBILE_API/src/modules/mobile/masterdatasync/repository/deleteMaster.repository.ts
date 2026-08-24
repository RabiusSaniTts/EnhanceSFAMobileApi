import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import type { MasterDataSyncResponseSections } from '../masterdatasync.types';

interface DeleteMasterSyncInput {
  userId: number;
  deviceId: string;
}

interface SyncDateRow extends RowDataPacket {
  syncdate: string | null;
}

interface DeleteLogRow extends RowDataPacket {
  CODE: number;
  tablename: string;
  recordid: number;
}

type GenericRow = RowDataPacket & Record<string, unknown>;
type DeleteMasterRow = Record<string, unknown> & {
  CODE: number;
  tablename: string;
  recordid: number;
  fieldname: string | null;
};

const DELETE_MASTER_TABLES = [
  'customermaster',
  'salesman',
  'routemaster',
  'startingloaddetail',
  'itemgroup',
  'salescalender',
  'promoplandetail',
  'promoplanheader',
  'promokeydetail',
  'promokeyheader',
  'promotionassignmentadvanced',
  'promotioncontrol',
  'bankmaster',
  'productgroupheader',
  'productgroupdetail',
  'companydetail',
  'posmaster',
  'customerposinventory',
  'customerposlimit',
  'posinstructions',
  'nonservreasons',
  'expreasons',
  'expiryreturnreasons',
  'retitmreasons',
  'freegoodreasons',
  'voidreasons',
  'customersurveyplan',
  'customersurveykeyplan',
  'customersurveykey',
  'customersurveydefinition',
  'customersurveydefassign',
  'lookupindexdetail',
  'pricingdetail1',
  'customerpricing1'
] as const;

export async function getDeleteMasterSyncSections(
  connection: PoolConnection,
  input: DeleteMasterSyncInput
): Promise<MasterDataSyncResponseSections> {
  const deleteMaster = await getDeleteMaster(connection, input);

  return {
    deletemaster: deleteMaster
  };
}

async function getDeleteMaster(
  connection: PoolConnection,
  input: DeleteMasterSyncInput
): Promise<DeleteMasterRow[]> {
  if (
    !(await tableExists(connection, 'tbl_syncservice')) ||
    !(await tableExists(connection, 'logmaster'))
  ) {
    return [];
  }

  const syncDate = await getSyncDate(connection, input);

  if (!syncDate) {
    return [];
  }

  const [rows] = await connection.execute<DeleteLogRow[]>(
    `
      SELECT
        code AS CODE,
        tablename,
        recordid
      FROM logmaster
      WHERE operation_type = 'delete'
      AND cdat > :syncDate
      AND tablename IN (:tableNames)
    `,
    {
      syncDate,
      tableNames: [...DELETE_MASTER_TABLES]
    }
  );

  const primaryKeyByTable = await getPrimaryKeyByTable(connection, rows);

  return rows.map((row) => ({
    CODE: row.CODE,
    tablename: row.tablename,
    recordid: row.recordid,
    fieldname: primaryKeyByTable.get(row.tablename.trim()) ?? null
  }));
}

async function getSyncDate(
  connection: PoolConnection,
  input: DeleteMasterSyncInput
): Promise<string | null> {
  const [rows] = await connection.execute<SyncDateRow[]>(
    `
      SELECT syncdate
      FROM tbl_syncservice
      WHERE userid = :userId
      AND deviceid = :deviceId
      LIMIT 1
    `,
    {
      userId: input.userId,
      deviceId: input.deviceId
    }
  );

  return rows[0]?.syncdate ?? null;
}

async function getPrimaryKeyByTable(
  connection: PoolConnection,
  rows: DeleteLogRow[]
): Promise<Map<string, string>> {
  const tableNames = [...new Set(rows.map((row) => row.tablename.trim()))];

  if (tableNames.length === 0) {
    return new Map();
  }

  const [primaryKeys] = await connection.execute<GenericRow[]>(
    `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
      AND table_name IN (:tableNames)
      AND column_key = 'PRI'
      ORDER BY ordinal_position
    `,
    { tableNames }
  );

  const primaryKeyByTable = new Map<string, string>();

  for (const primaryKey of primaryKeys) {
    const tableName = String(primaryKey.table_name ?? '');
    const columnName = String(primaryKey.column_name ?? '');

    if (tableName && columnName && !primaryKeyByTable.has(tableName)) {
      primaryKeyByTable.set(tableName, columnName);
    }
  }

  return primaryKeyByTable;
}

async function tableExists(
  connection: PoolConnection,
  tableName: string
): Promise<boolean> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = :tableName
      LIMIT 1
    `,
    { tableName }
  );

  return rows.length > 0;
}
