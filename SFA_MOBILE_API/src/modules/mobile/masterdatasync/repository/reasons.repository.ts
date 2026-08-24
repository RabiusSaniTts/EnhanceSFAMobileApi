import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import type { MasterDataSyncResponseSections } from '../masterdatasync.types';

interface ReasonSyncInput {
  routeId: number;
}

type GenericRow = RowDataPacket & Record<string, unknown>;

export async function getReasonSyncSections(
  connection: PoolConnection,
  input: ReasonSyncInput
): Promise<MasterDataSyncResponseSections> {
  const [
    nonServiceReasons,
    expenseReasons,
    expiryReturnReasons,
    returnItemReasons,
    freeGoodReasons,
    voidReasons,
    routeBook,
    salesTrend,
    tempCustomerInventory
  ] = await Promise.all([
    getNonServiceReasons(connection),
    getExpenseReasons(connection),
    getExpiryReturnReasons(connection),
    getReturnItemReasons(connection),
    getFreeGoodReasons(connection),
    getVoidReasons(connection),
    getRouteBook(connection, input.routeId),
    getSalesTrend(connection, input.routeId),
    getTempCustomerInventory(connection, input.routeId)
  ]);

  return {
    nonservreasons: nonServiceReasons,
    expreasons: expenseReasons,
    expiryreturnreasons: expiryReturnReasons,
    retitmreasons: returnItemReasons,
    freegoodreasons: freeGoodReasons,
    voidreasons: voidReasons,
    routebook: routeBook,
    salestrend: salesTrend,
    tempcustinventory: tempCustomerInventory
  };
}

async function getNonServiceReasons(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'nonservreasons'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT code, alternatecode, description, arbdescription, hhcdescription, created, cdat, modified, mdat
      FROM nonservreasons
    `
  );

  return rows;
}

async function getExpenseReasons(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'expreasons'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT code, alternatecode, description, arbdescription, hhcdescription, created, cdat, modified, mdat
      FROM expreasons
    `
  );

  return rows;
}

async function getExpiryReturnReasons(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'expiryreturnreasons'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT code, alternatecode, description, arbdescription, hhcdescription, created, cdat, modified, mdat
      FROM expiryreturnreasons
    `
  );

  return rows;
}

async function getReturnItemReasons(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'retitmreasons'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT code, alternatecode, description, arbdescription, hhcdescription, created, cdat, modified, mdat
      FROM retitmreasons
    `
  );

  return rows;
}

async function getFreeGoodReasons(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'freegoodreasons'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT reason_code, alternatereasoncode, reason_desc, reason_arb_desc, created, cdat, modified, mdat
      FROM freegoodreasons
    `
  );

  return rows;
}

async function getVoidReasons(connection: PoolConnection): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'voidreasons'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT code, alternatecode, description, arbdescription, hhcdescription, created, cdat, modified, mdat
      FROM voidreasons
    `
  );

  return rows;
}

async function getRouteBook(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'routebook'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT transactiondate, invoicenumber, customercode, itemcode, salesqty, returnqty, damageqty, freeqty
      FROM routebook
      WHERE routecode = :routeId
    `,
    { routeId }
  );

  return rows;
}

async function getSalesTrend(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'salestrend'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT transactiondate, totalinvoiceamount, totalsalesamount, totalreturnamount, totaldamageamount
      FROM salestrend
      WHERE routecode = :routeId
    `,
    { routeId }
  );

  return rows;
}

async function getTempCustomerInventory(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'tempcustomerinventory'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT itemcode, alternatecode, customercode, expirydate, batchnumber, quantity, entryflag, barcode
      FROM tempcustomerinventory
      WHERE entryflag = 0
      AND routecode = :routeId
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
