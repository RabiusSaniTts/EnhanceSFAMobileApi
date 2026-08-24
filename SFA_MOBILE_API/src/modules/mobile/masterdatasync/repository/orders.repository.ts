import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import type { MasterDataSyncResponseSections } from '../masterdatasync.types';

interface OrderSyncInput {
  routeId: number;
}

type GenericRow = RowDataPacket & Record<string, unknown>;
type RouteKeyRow = RowDataPacket & { routekey: number };

export async function getOrderSyncSections(
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
