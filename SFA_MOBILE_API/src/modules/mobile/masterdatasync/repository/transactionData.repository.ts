import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import type { MasterDataSyncResponseSections } from "../masterdatasync.types";

interface TransactionDataSyncInput {
  routeId: number;
  userId: number;
  deviceId: string;
}

type GenericRow = RowDataPacket & Record<string, unknown>;

interface InventorySyncInput {
  routeId: number;
}


async function getInventorySyncSections(
  connection: PoolConnection,
  input: InventorySyncInput
): Promise<MasterDataSyncResponseSections> {
  const [startingLoadDetail, inventorySummaryDetail] = await Promise.all([
    getStartingLoadDetail(connection, input.routeId),
    getInventorySummaryDetail(connection, input.routeId)
  ]);

  return {
    startingloaddetail: startingLoadDetail,
    inventorysummarydetail: inventorySummaryDetail
  };
}

async function getStartingLoadDetail(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        itemcode,
        routecode,
        ddate,
        caseprice,
        loadperiodnumber,
        cases,
        units,
        totunits,
        suggtotunits,
        rcvdtotunits,
        upc,
        loadtime,
        salesmancode,
        salesprice,
        returnprice,
        status,
        transactiondate,
        erpreferencenumber,
        currencycode,
        batchnumber,
        expirydate,
        warehouse,
        warehousestock,
        mdat
      FROM startingloaddetail
      WHERE routecode = :routeId
      AND status = 0
      AND ddate = CURDATE()
      AND totunits > 0
    `,
    { routeId }
  );

  return rows;
}

async function getInventorySummaryDetail(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        isd.inventorykey,
        isd.itemcode,
        isd.routekey,
        isd.weighted,
        isd.beginstockqty,
        isd.loadqty,
        isd.loadaddqty,
        isd.loadcutqty,
        isd.loadreqqty,
        isd.saleqty,
        isd.returnqty,
        isd.damagedaddqty,
        isd.damagedcutqty,
        isd.endstockqty,
        isd.unloadqty,
        isd.damagedunloadqty,
        isd.freesampleqty,
        isd.truckdamagedunloadqty,
        isd.stdsalesprice,
        isd.stdreturnprice,
        isd.cashsalesqty,
        isd.cashsalesvalue,
        isd.tcsalesqty,
        isd.tcsalesvalue,
        isd.gcsalesqty,
        isd.gcsalesvalue,
        isd.cashdamagedqty,
        isd.cashdamagedvalue,
        isd.tcdamagedqty,
        isd.tcdamagedvalue,
        isd.gcdamagedqty,
        isd.gcdamagedvalue,
        isd.cashreturnqty,
        isd.cashreturnvalue,
        isd.tcreturnqty,
        isd.tcreturnvalue,
        isd.gcreturnqty,
        isd.gcreturnvalue,
        isd.promoqty,
        isd.cashsalesitemexcisetax,
        isd.cashsalesitemgsttax,
        isd.cashreturnitemexcisetax,
        isd.cashreturnitemgsttax,
        isd.cashdamageditemexcisetax,
        isd.cashdamageditemgsttax,
        isd.cashfgitemexcisetax,
        isd.cashfgitemgsttax,
        isd.cashpromoitemexcisetax,
        isd.cashpromoitemgsttax,
        isd.tcsalesitemexcisetax,
        isd.tcsalesitemgsttax,
        isd.tcreturnitemexcisetax,
        isd.tcreturnitemgsttax,
        isd.tcdamageditemexcisetax,
        isd.tcdamageditemgsttax,
        isd.tcfgitemexcisetax,
        isd.tcfgitemgsttax,
        isd.tcpromoitemexcisetax,
        isd.tcpromoitemgsttax,
        isd.gcsalesitemexcisetax,
        isd.gcsalesitemgsttax,
        isd.gcreturnitemexcisetax,
        isd.gcreturnitemgsttax,
        isd.gcdamageditemexcisetax,
        isd.gcdamageditemgsttax,
        isd.gcfgitemexcisetax,
        isd.gcfgitemgsttax,
        isd.gcpromoitemexcisetax,
        isd.gcpromoitemgsttax,
        isd.batchdetailkey,
        isd.stdsalescaseprice,
        isd.stdreturncaseprice,
        isd.expiryqty,
        isd.stdgoodreturncaseprice,
        isd.stdgoodreturnprice,
        isd.currencycode,
        isd.returnfreeqty,
        isd.damageqty,
        isd.expdmgfreeqty,
        isd.expunloadqty,
        isd.dmgunloadqty,
        isd.expdmgfreeunloadqty,
        isd.rentqty,
        isd.mdat
      FROM inventorysummarydetail AS isd
      WHERE isd.routekey = (
        SELECT MAX(sed.routekey)
        FROM startendday sed
        WHERE sed.routecode = :routeId
      )
    `,
    { routeId }
  );

  return rows;
}

interface OrderSyncInput {
  routeId: number;
}

type RouteKeyRow = RowDataPacket & { routekey: number };

async function getOrderSyncSections(
  connection: PoolConnection,
  input: OrderSyncInput
): Promise<MasterDataSyncResponseSections> {
  const routeKey = await getLatestClosedRouteKey(connection, input.routeId);
  const [
    salesOrderHeader,
    salesOrderDetail,
    suggestedSalesInvoice,
    inventoryTransactionDetail,
    customerFocBalance,
    customerFocDetail,
    journeyPlanCreditLimit,
    batchExpiryDetail,
    customerFoc
  ] = await Promise.all([
    getSalesOrderHeader(connection, input.routeId),
    getSalesOrderDetail(connection, input.routeId),
    getSuggestedSalesInvoice(connection, input.routeId),
    getInventoryTransactionDetail(connection, routeKey),
    getCustomerFocBalance(connection, input.routeId),
    getCustomerFocDetail(connection, input.routeId),
    getJourneyPlanCreditLimit(connection),
    getBatchExpiryDetail(connection, routeKey),
    getCustomerFoc(connection, input.routeId)
  ]);

  return {
    salesorderheader: salesOrderHeader,
    salesorderdetail: salesOrderDetail,
    suggestedsalesinvoice: suggestedSalesInvoice,
    inventorytransactiondetail: inventoryTransactionDetail,
    customer_foc_balance: customerFocBalance,
    customer_foc_detail: customerFocDetail,
    journeyplancreditlimit: journeyPlanCreditLimit,
    batchexpirydetail: batchExpiryDetail,
    customer_foc: customerFoc
  };
}

async function getLatestClosedRouteKey(
  connection: PoolConnection,
  routeId: number
): Promise<number> {
  if (!(await tableExists(connection, 'startendday'))) {
    return 0;
  }

  const [rows] = await connection.execute<RouteKeyRow[]>(
    `
      SELECT COALESCE(MAX(routekey), 0) AS routekey
      FROM startendday
      WHERE routeclosed = 1
      AND routecode = :routeId
    `,
    { routeId }
  );

  return rows[0]?.routekey ?? 0;
}

async function getSalesOrderHeader(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'deliveryheader'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT *
      FROM deliveryheader
      WHERE delivered = 0
      AND deliveryroute = :routeId
      AND deliverydate = CURRENT_DATE()
    `,
    { routeId }
  );

  return rows;
}

async function getSalesOrderDetail(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  if (
    !(await tableExists(connection, 'deliveryheader')) ||
    !(await tableExists(connection, 'deliverydetail'))
  ) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT dd.*
      FROM deliveryheader dh
      INNER JOIN deliverydetail dd
        ON dd.deliveryno = dh.deliveryno
      WHERE dh.delivered = 0
      AND dh.deliveryroute = :routeId
      AND dh.deliverydate = CURRENT_DATE()
    `,
    { routeId }
  );

  return rows;
}

async function getSuggestedSalesInvoice(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'suggestedsalesinvoice'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT *
      FROM suggestedsalesinvoice
      WHERE routecode = :routeId
    `,
    { routeId }
  );

  return rows;
}

async function getInventoryTransactionDetail(
  connection: PoolConnection,
  routeKey: number
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'inventorytransactiondetail')) || routeKey === 0) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT *
      FROM inventorytransactiondetail
      WHERE transactiontypecode = 5
      AND quantity > 0
      AND routekey = :routeKey
    `,
    { routeKey }
  );

  return rows;
}

async function getCustomerFocBalance(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  if (
    !(await tableExists(connection, 'customer_foc_balance')) ||
    !(await tableExists(connection, 'routesequence'))
  ) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT *
      FROM customer_foc_balance
      WHERE customercode IN (
        SELECT DISTINCT customercode
        FROM routesequence
        WHERE routecode = :routeId
      )
    `,
    { routeId }
  );

  return rows;
}

async function getCustomerFocDetail(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  if (
    !(await tableExists(connection, 'customer_foc_detail')) ||
    !(await tableExists(connection, 'routesequence'))
  ) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT *
      FROM customer_foc_detail
      WHERE customercode IN (
        SELECT DISTINCT customercode
        FROM routesequence
        WHERE routecode = :routeId
      )
    `,
    { routeId }
  );

  return rows;
}

async function getJourneyPlanCreditLimit(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'journeyplancreditlimit'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT *
      FROM journeyplancreditlimit
    `
  );

  return rows;
}

async function getBatchExpiryDetail(
  connection: PoolConnection,
  routeKey: number
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'batchexpirydetail')) || routeKey === 0) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT *
      FROM batchexpirydetail
      WHERE routekey = :routeKey
    `,
    { routeKey }
  );

  return rows;
}

async function getCustomerFoc(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  if (
    !(await tableExists(connection, 'customer_foc')) ||
    !(await tableExists(connection, 'routesequence'))
  ) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT *
      FROM customer_foc
      WHERE customercode IN (
        SELECT DISTINCT customercode
        FROM routesequence
        WHERE routecode = :routeId
      )
      AND CURRENT_DATE() BETWEEN startdate AND enddate
    `,
    { routeId }
  );

  return rows;
}

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

async function getDeleteMasterSyncSections(
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

export async function getTransactionDataSyncSections(
  connection: PoolConnection,
  input: TransactionDataSyncInput,
): Promise<MasterDataSyncResponseSections> {
  const inventorySections = await getInventorySyncSections(connection, {
    routeId: input.routeId,
  });
  const orderSections = await getOrderSyncSections(connection, {
    routeId: input.routeId,
  });
  const deleteMasterSections = await getDeleteMasterSyncSections(connection, {
    userId: input.userId,
    deviceId: input.deviceId,
  });

  return {
    ...inventorySections,
    ...orderSections,
    ...deleteMasterSections,
  };
}

async function tableExists(
  connection: PoolConnection,
  tableName: string,
): Promise<boolean> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = :tableName
      LIMIT 1
    `,
    { tableName },
  );

  return rows.length > 0;
}

