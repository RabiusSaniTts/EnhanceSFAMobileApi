import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import type { MasterDataSyncResponseSections } from '../masterdatasync.types';

interface SettingSyncInput {
  routeId: number;
}

type GenericRow = RowDataPacket & Record<string, unknown>;
type RouteCodeRow = RowDataPacket & { routecode: number };
type ScalarRow = RowDataPacket & {
  routekey?: number | null;
  routeitemgrpcode?: number | null;
  depotcode?: number | null;
  transferinventoryflag?: string | number | null;
  transactionnoseq?: number | null;
  invoicenumber?: string | number | null;
  documentnumber?: string | number | null;
  maxdocumentnumber?: string | number | null;
};

export async function getSettingSyncSections(
  connection: PoolConnection,
  input: SettingSyncInput
): Promise<MasterDataSyncResponseSections> {
  const latestRouteKey = await getLatestClosedRouteKey(connection, input.routeId);

  await maintainRouteSyncSideEffects(connection, {
    routeId: input.routeId,
    latestRouteKey
  });

  const routeCodes = await getSyncRouteCodes(connection, input.routeId);

  const [
    controlPanel,
    setup,
    companyDetail,
    salesmanMaster,
    routeMaster,
    startEndDay,
    syncTime,
    currencyMaster
  ] = await Promise.all([
    getControlPanel(connection),
    getSetup(connection),
    getCompanyDetail(connection),
    getSalesmanMaster(connection, input.routeId),
    getRouteMaster(connection, routeCodes),
    getStartEndDay(connection, input.routeId),
    getSyncTime(connection),
    getCurrencyMaster(connection, input.routeId)
  ]);

  return {
    ControlPanel: controlPanel,
    Setup: setup,
    companydetail: companyDetail,
    SalesmanMaster: salesmanMaster,
    RouteMaster: routeMaster,
    startendday: startEndDay,
    synctime: syncTime,
    CurrencyMaster: currencyMaster
  };
}

async function getLatestClosedRouteKey(
  connection: PoolConnection,
  routeId: number
): Promise<number> {
  const [rows] = await connection.execute<ScalarRow[]>(
    `
      SELECT COALESCE(MAX(routekey), 0) AS routekey
      FROM startendday
      WHERE routeclosed = 1
      AND routecode = :routeId
    `,
    { routeId }
  );

  return Number(rows[0]?.routekey ?? 0);
}

async function maintainRouteSyncSideEffects(
  connection: PoolConnection,
  input: { routeId: number; latestRouteKey: number }
): Promise<void> {
  const [routeRows] = await connection.execute<ScalarRow[]>(
    `
      SELECT COALESCE(routeitemgrpcode, 0) AS routeitemgrpcode
      FROM routemaster
      WHERE routecode = :routeId
      LIMIT 1
    `,
    { routeId: input.routeId }
  );

  const routeItemGroupCode = Number(routeRows[0]?.routeitemgrpcode ?? 0);

  await connection.execute(
    `
      INSERT IGNORE INTO routeitemmapping (routeitemgrpcode, itemcode, transferstatus)
      SELECT :routeItemGroupCode, itd.itemcode, 0
      FROM inventorytransactiondetail itd
      LEFT JOIN routeitemmapping rim
        ON rim.itemcode = itd.itemcode
        AND rim.routeitemgrpcode = :routeItemGroupCode
      WHERE itd.transactiontypecode = 5
      AND itd.quantity > 0
      AND itd.routekey = :latestRouteKey
      AND rim.itemcode IS NULL
    `,
    {
      routeItemGroupCode,
      latestRouteKey: input.latestRouteKey
    }
  );

  await connection.execute(
    `
      UPDATE routemaster
      SET inventoryreportcontrol = (
        SELECT COALESCE(SUM(quantity), 0)
        FROM inventorytransactiondetail
        WHERE transactiontypecode = 5
        AND quantity > 0
        AND routekey = :latestRouteKey
      )
      WHERE routecode = :routeId
    `,
    {
      latestRouteKey: input.latestRouteKey,
      routeId: input.routeId
    }
  );

  await connection.execute(
    `
      UPDATE routemaster
      SET enablestockicon = (
        SELECT COALESCE(SUM(sld.totunits), 0)
        FROM startingloaddetail sld
        WHERE sld.status = 0
        AND sld.ddate = CURDATE()
        AND sld.routecode = :routeId
      )
      WHERE routecode = :routeId
    `,
    { routeId: input.routeId }
  );

  await updateRouteSequenceNumbers(connection, input.routeId);
}

async function updateRouteSequenceNumbers(
  connection: PoolConnection,
  routeId: number
): Promise<void> {
  const [routeRows] = await connection.execute<ScalarRow[]>(
    `
      SELECT COALESCE(transactionnoseq, 0) AS transactionnoseq
      FROM routemaster
      WHERE routecode = :routeId
      LIMIT 1
    `,
    { routeId }
  );

  const useDexFlagSequences = Number(routeRows[0]?.transactionnoseq ?? 0) > 0;

  const invoiceNumber = useDexFlagSequences
    ? await getMaxInvoiceNumber(connection, routeId, 0)
    : await getMaxInvoiceNumber(connection, routeId);
  const invoiceReturnNumber = useDexFlagSequences
    ? await getMaxInvoiceNumber(connection, routeId, 1)
    : invoiceNumber;
  const swapNumber = useDexFlagSequences
    ? await getMaxInvoiceNumber(connection, routeId, 2)
    : invoiceNumber;
  const arNumber = await getMaxArNumber(connection, routeId);
  const orderNumber = await getMaxSalesOrderNumber(connection, routeId);
  const documentNumber = await getMaxDocumentNumber(connection, routeId);

  await connection.execute(
    `
      UPDATE routemaster
      SET
        hhcinvseq = :invoiceSequence,
        hhcarseq = :arSequence,
        hhcordseq = :orderSequence,
        bodocseq = :documentSequence,
        hhcinvretseq = :invoiceReturnSequence,
        hhcswapseq = :swapSequence
      WHERE routecode = :routeId
    `,
    {
      invoiceSequence: toRouteTransactionSequence(invoiceNumber, routeId, true),
      invoiceReturnSequence: toRouteTransactionSequence(
        invoiceReturnNumber,
        routeId,
        true
      ),
      swapSequence: toRouteTransactionSequence(swapNumber, routeId, true),
      arSequence: toRouteTransactionSequence(arNumber, routeId, true),
      orderSequence: toRouteTransactionSequence(orderNumber, routeId, true),
      documentSequence: toRouteTransactionSequence(documentNumber, routeId, false),
      routeId
    }
  );

  await connection.execute(
    `
      UPDATE routemaster
      SET vehicleodometer = COALESCE(
        (
          SELECT sed.routeendodometer
          FROM startendday sed
          WHERE sed.routeclosed = 1
          AND sed.routecode = routemaster.routecode
          ORDER BY sed.routekey DESC
          LIMIT 1
        ),
        0
      )
      WHERE routecode = :routeId
    `,
    { routeId }
  );
}

async function getMaxInvoiceNumber(
  connection: PoolConnection,
  routeId: number,
  dexFlag?: number
): Promise<string> {
  const dexFlagFilter = dexFlag === undefined ? '' : 'AND dexflag = :dexFlag';
  const params: Record<string, number> =
    dexFlag === undefined ? { routeId } : { routeId, dexFlag };
  const [rows] = await connection.execute<ScalarRow[]>(
    `
      SELECT COALESCE(MAX(invoicenumber), 0) AS invoicenumber
      FROM invoiceheader
      WHERE routecode = :routeId
      ${dexFlagFilter}
    `,
    params
  );

  return String(rows[0]?.invoicenumber ?? '0');
}

async function getMaxArNumber(
  connection: PoolConnection,
  routeId: number
): Promise<string> {
  const [rows] = await connection.execute<ScalarRow[]>(
    `
      SELECT COALESCE(MAX(invoicenumber), 0) AS invoicenumber
      FROM arheader
      WHERE routecode = :routeId
    `,
    { routeId }
  );

  return String(rows[0]?.invoicenumber ?? '0');
}

async function getMaxSalesOrderNumber(
  connection: PoolConnection,
  routeId: number
): Promise<string> {
  const [rows] = await connection.execute<ScalarRow[]>(
    `
      SELECT COALESCE(MAX(invoicenumber), 0) AS invoicenumber
      FROM salesorderheader
      WHERE routecode = :routeId
    `,
    { routeId }
  );

  return String(rows[0]?.invoicenumber ?? '0');
}

async function getMaxDocumentNumber(
  connection: PoolConnection,
  routeId: number
): Promise<string> {
  const [rows] = await connection.execute<ScalarRow[]>(
    `
      SELECT MAX(maxdocumentnumber) AS maxdocumentnumber
      FROM (
        SELECT COALESCE(MAX(documentnumber), 0) AS maxdocumentnumber
        FROM inventorytransactionheader
        WHERE routecode = :routeId
        UNION
        SELECT COALESCE(MAX(documentnumber), 0) AS maxdocumentnumber
        FROM invoiceheader
        WHERE routecode = :routeId
        UNION
        SELECT COALESCE(MAX(documentnumber), 0) AS maxdocumentnumber
        FROM salesorderheader
        WHERE routecode = :routeId
        UNION
        SELECT COALESCE(MAX(documentnumber), 0) AS maxdocumentnumber
        FROM arheader
        WHERE routecode = :routeId
      ) tblmax
    `,
    { routeId }
  );

  return String(rows[0]?.maxdocumentnumber ?? '0');
}

function toRouteTransactionSequence(
  value: string,
  routeId: number,
  hasSeparatorAfterRoute: boolean
): number {
  if (value === '0') {
    return 1;
  }

  const prefixLength = String(routeId).length + (hasSeparatorAfterRoute ? 1 : 0);
  const sequencePart = value.slice(prefixLength);
  const sequence = Number.parseInt(sequencePart, 10);

  return Number.isNaN(sequence) ? 0 : sequence;
}

async function getSyncRouteCodes(
  connection: PoolConnection,
  routeId: number
): Promise<number[]> {
  const [depotRows] = await connection.execute<ScalarRow[]>(
    `
      SELECT am.depotcode
      FROM areamaster am
      INNER JOIN subareamaster sam ON am.areacode = sam.areacode
      INNER JOIN routemaster rm ON sam.subareacode = rm.subareacode
      WHERE rm.routecode = :routeId
      LIMIT 1
    `,
    { routeId }
  );

  const depotCode = depotRows[0]?.depotcode;

  if (depotCode === null || depotCode === undefined) {
    return [routeId];
  }

  const [setupRows] = await connection.execute<ScalarRow[]>(
    'SELECT transferinventoryflag FROM setup LIMIT 1'
  );
  const transferFlag = String(setupRows[0]?.transferinventoryflag ?? '');

  const condition =
    transferFlag === '0'
      ? 'AND rm.routecode = :routeId'
      : transferFlag === '1'
        ? 'AND rm.depotrouteflag = 0'
        : transferFlag === '2'
          ? 'AND rm.depotrouteflag = 1'
          : 'AND rm.depotrouteflag < 2';

  const [rows] = await connection.execute<RouteCodeRow[]>(
    `
      SELECT DISTINCT rm.routecode
      FROM areamaster am
      INNER JOIN subareamaster sam ON am.areacode = sam.areacode
      INNER JOIN routemaster rm ON sam.subareacode = rm.subareacode
      WHERE rm.activestatus = 1
      AND am.depotcode = :depotCode
      ${condition}
    `,
    { depotCode, routeId }
  );

  const routeCodes = rows.map((row) => Number(row.routecode));

  if (transferFlag === '2' && !routeCodes.includes(routeId)) {
    routeCodes.push(routeId);
  }

  return routeCodes.length > 0 ? routeCodes : [routeId];
}

async function getControlPanel(connection: PoolConnection): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT flagid, formid, flagname, status, 0 AS flagvalue
      FROM controlpanel
      ORDER BY flagid
    `
  );

  return rows;
}

async function getSetup(connection: PoolConnection): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>('SELECT * FROM setup');
  return rows;
}

async function getCompanyDetail(connection: PoolConnection): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>('SELECT * FROM company');
  return rows;
}

async function getSalesmanMaster(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        sm.salesmancode,
        sm.salesmanname1,
        sm.salesmanname2,
        sm.arbsalesmanname1,
        sm.messagekey,
        sm.pricingkey,
        sm.created,
        sm.cdat,
        sm.modified,
        sm.mdat,
        sup.supervisorname AS memo1,
        sup.contactno AS memo2,
        sm.alternatesalesmancode,
        sm.type,
        sm.activestatus,
        sm.parentcompany,
        sm.ansalesmancode,
        sm.username,
        sm.userpassword
      FROM routemaster rm
      INNER JOIN salesman sm ON sm.salesmancode = rm.salesmancode
      INNER JOIN subareamaster sam ON sam.subareacode = rm.subareacode
      INNER JOIN supervisor sup ON sup.supervisorcode = sam.supervisorcode
      WHERE rm.routecode = :routeId
    `,
    { routeId }
  );

  return rows;
}

async function getRouteMaster(
  connection: PoolConnection,
  routeCodes: number[]
): Promise<GenericRow[]> {
  const placeholders = routeCodes.map(() => '?').join(', ');
  const [rows] = await connection.query<GenericRow[]>(
    `
      SELECT
        route.*,
        route.creditlimit AS routecreditlimit
      FROM routemaster AS route
      WHERE route.routecode IN (${placeholders})
    `,
    routeCodes
  );

  return rows;
}

async function getStartEndDay(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT *
      FROM startendday
      WHERE routecode = :routeId
      AND routeclosed = 1
      ORDER BY routekey DESC
      LIMIT 0
    `,
    { routeId }
  );

  return rows;
}

async function getSyncTime(connection: PoolConnection): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    'SELECT CURRENT_DATE() AS synctime'
  );
  return rows;
}

async function getCurrencyMaster(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT *
      FROM currencymaster
      WHERE currencycode IN (
        SELECT amountdecimaldigits
        FROM routemaster
        WHERE routecode = :routeId
      )
    `,
    { routeId }
  );

  return rows;
}
