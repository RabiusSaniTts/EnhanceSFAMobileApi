import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import type { TempCustomerInventoryItem } from '../types/wsLookup.types';

type CountRow = RowDataPacket & { cnt: number };

export async function checkRouteLoad(
  connection: PoolConnection,
  userId: string | number,
  routeId: string | number
): Promise<boolean> {
  const [controlRows] = await connection.execute<(RowDataPacket & { status: number })[]>(
    `
      SELECT status
      FROM controlpanel
      WHERE flagid = 72
      LIMIT 1
    `
  );

  if (Number(controlRows[0]?.status ?? 0) === 0) {
    return true;
  }

  const [rows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS cnt
      FROM startingloaddetail sd
      WHERE sd.status = 0
      AND sd.routecode = :routeId
      AND DATE(sd.ddate) = CURRENT_DATE()
      AND sd.salesmancode = :userId
    `,
    { routeId, userId }
  );

  return Number(rows[0]?.cnt ?? 0) > 0;
}

export async function getDeliveryData(
  connection: PoolConnection,
  filters: {
    customercode?: unknown;
    orderdate?: unknown;
    orderno?: unknown;
    lpono?: unknown;
  }
): Promise<{
  deliveryheader: Record<string, unknown>[];
  deliverydetail: Record<string, unknown>[];
}> {
  const orderNumbers = await getDeliveryOrderNumbers(connection, filters);

  if (orderNumbers.length === 0) {
    return { deliveryheader: [], deliverydetail: [] };
  }

  const [deliveryheader] = await connection.query<RowDataPacket[]>(
    `
      SELECT
        dh.deliveryno,
        dh.orderno,
        dh.customercode,
        dh.deliveryroute,
        dh.deliverydate,
        dh.drivercode,
        dh.loadsheetnumber,
        cm.alternatecode AS reference,
        dh.totalamount
      FROM deliveryheader dh
      INNER JOIN customermaster cm ON cm.customercode = dh.customercode
      WHERE dh.orderno IN (?)
    `,
    [orderNumbers]
  );

  const [deliverydetail] = await connection.query<RowDataPacket[]>(
    `
      SELECT dd.*
      FROM deliveryheader dh
      INNER JOIN deliverydetail dd ON dd.deliveryno = dh.deliveryno
      WHERE dh.orderno IN (?)
    `,
    [orderNumbers]
  );

  return { deliveryheader, deliverydetail };
}

export async function getWhStockData(
  connection: PoolConnection,
  routeCode: string | number
): Promise<Record<string, unknown>[]> {
  const [rows] = await connection.execute<RowDataPacket[]>(
    `
      SELECT
        item.actualitemcode,
        item.defaultsalesprice,
        item.defaultreturnprice,
        item.caseprice,
        item.returncaseprice,
        item.warehousestock
      FROM itemmaster item
      LEFT JOIN routeitemmapping rim ON rim.itemcode = item.actualitemcode
      LEFT JOIN routemaster rm ON rm.routeitemgrpcode = rim.routeitemgrpcode
      WHERE item.activeitem = 1
      AND rm.routecode = :routeCode
    `,
    { routeCode }
  );

  return rows;
}

export async function saveTempCustomerInventory(
  connection: PoolConnection,
  item: TempCustomerInventoryItem
): Promise<boolean> {
  const params = {
    routeKey: item.routekey ?? null,
    visitKey: item.visitkey ?? null,
    itemCode: item.itemcode ?? null,
    alternateCode: item.alternatecode ?? null,
    customerCode: item.customercode ?? null,
    expiryDate: item.expirydate ?? null,
    barcode: item.barcode ?? null,
    quantity: item.quantity ?? null,
    entryFlag: item.entryflag ?? null,
    routeCode: item.routecode ?? null,
    salesmanCode: item.salesmancode ?? null
  };
  const [rows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS cnt
      FROM tempcustomerinventory
      WHERE itemcode = :itemCode
      AND expirydate = :expiryDate
      AND customercode = :customerCode
      AND quantity = :quantity
    `,
    params
  );

  if (Number(rows[0]?.cnt ?? 0) === 0) {
    const [result] = await connection.execute<ResultSetHeader>(
      `
        INSERT INTO tempcustomerinventory SET
          routekey = :routeKey,
          visitkey = :visitKey,
          itemcode = :itemCode,
          alternatecode = :alternateCode,
          quantity = :quantity,
          customercode = :customerCode,
          barcode = :barcode,
          entryflag = :entryFlag,
          expirydate = :expiryDate,
          routecode = :routeCode,
          salesmancode = :salesmanCode
      `,
      params
    );

    return result.affectedRows > 0;
  }

  const [result] = await connection.execute<ResultSetHeader>(
    `
      UPDATE tempcustomerinventory SET
        routekey = :routeKey,
        visitkey = :visitKey,
        quantity = :quantity,
        entryflag = :entryFlag,
        expirydate = :expiryDate
      WHERE itemcode = :itemCode
      AND expirydate = :expiryDate
      AND customercode = :customerCode
    `,
    params
  );

  return result.affectedRows >= 0;
}

export async function getCustomerBalanceData(
  connection: PoolConnection,
  routeCode: string | number,
  customerCode: string | number
): Promise<Record<string, unknown>[]> {
  const [rows] = await connection.execute<RowDataPacket[]>(
    `
      SELECT
        ci.transactionkey,
        ci.transactiontype,
        ci.documentnumber,
        ci.invoicenumber,
        ci.transactiondate,
        ci.transactiontime,
        ci.customercode,
        :routeCode AS routecode,
        ci.salesmancode,
        ci.totalinvoiceamount,
        ci.totalsalesamount,
        ci.totalreturnamount,
        ci.totaldamagedamount,
        ci.totalfreesampleamount,
        ci.immediatepaid,
        ci.amountpaid,
        ci.dnamountpaid,
        ci.cnamountpaid,
        ci.invoicebalance,
        ci.paymenttype,
        ci.voidflag,
        ci.paymentstatus,
        ci.hhcinvoicenumber,
        sm.alternatesalesmancode AS remarks1,
        '' AS remarks2,
        ci.routestartdate,
        ci.erpreferencenumber,
        ci.mdat,
        ci.totalpromoamount,
        ci.gcpaymenttype,
        ci.totaltaxesamount,
        ci.itemlinetaxamount,
        ci.totaldiscountamount,
        ci.pdcindicator,
        ci.chequecollection,
        ci.totalexpiryamount,
        ci.currencycode,
        ci.pdcbalance,
        ci.totalmanualfree,
        ci.totallimitedfree,
        ci.totalrebaterent,
        ci.totalfixedrent,
        ci.data,
        ci.totaldiscdistributionamount,
        ci.totalreplacementamount,
        ci.pdcdate,
        ci.totalbuybackfreeamount,
        ci.duedate
      FROM customerinvoice ci
      INNER JOIN salesman sm ON sm.salesmancode = ci.salesmancode
      WHERE ci.transactiontype = 2
      AND ci.voidflag = 0
      AND ci.duedate IS NOT NULL
      AND ci.customercode = :customerCode
    `,
    { routeCode, customerCode }
  );

  return rows;
}

export async function getWarehouseStockData(
  connection: PoolConnection,
  routeId: string | number
): Promise<Record<string, unknown>[]> {
  const [rows] = await connection.execute<RowDataPacket[]>(
    `
      SELECT
        ws.warehousecode,
        ws.trandate,
        ws.itemcode,
        IFNULL(ws.cases, 0) AS cases,
        IFNULL(ws.units, 0) AS units,
        CASE WHEN ws.totunits < im.unitspercase THEN im.unitspercase ELSE ws.totunits END AS totunits,
        IFNULL(ws.upc, 0) AS upc,
        IFNULL(ws.caseprice, 0) AS caseprice,
        IFNULL(ws.eachprice, 0) AS eachprice,
        IFNULL(ws.balanceqty, 0) AS balanceqty
      FROM warehousestock ws
      INNER JOIN SFA_ROUTE_WH_MAP rwm ON rwm.ROUTE_CODE = :routeId AND ws.WAREHOUSECODE = rwm.WH_CODE
      INNER JOIN routemaster rm ON rm.ROUTECODE = rwm.ROUTE_CODE
      INNER JOIN routeitemgrp rtg ON rtg.routeitemgrpcode = rm.routeitemgrpcode
      INNER JOIN routeitemmapping rim ON rim.routeitemgrpcode = rtg.routeitemgrpcode
      INNER JOIN itemmaster im ON im.actualitemcode = rim.itemcode AND rim.itemcode = ws.itemcode
      WHERE rwm.route_code = :routeId
      AND ws.totunits > 0
    `,
    { routeId }
  );

  return rows;
}

export async function getOrderStatusData(
  connection: PoolConnection,
  userId: string | number
): Promise<Record<string, unknown>[]> {
  const [rows] = await connection.execute<RowDataPacket[]>(
    `
      SELECT
        rm.routecode,
        sm.salesmancode,
        cm.customercode,
        cm.customername,
        IFNULL(t.ordernumber, 0) AS ordernumber,
        IFNULL(t.orderamount, 0) AS orderamount,
        IFNULL(t.orderdate, 0) AS orderdate,
        IFNULL(t.invoicenumber, 0) AS invoicenumber,
        IFNULL(t.invoiceamount, 0) AS invoiceamount,
        IFNULL(t.invoicedate, 0) AS invoicedate,
        IFNULL(t.differenceamount, 0) AS differenceamount,
        CASE WHEN t.status IS NULL OR t.status = '' THEN 0 ELSE t.status END AS status,
        IFNULL(cm.alternatecode, 0) AS alternatecode,
        IFNULL(t.ordernumber, 0) AS alternateordernumber,
        IFNULL(t.invoicenumber, 0) AS alternateinvoicenumber,
        IFNULL(t.differencedate, 0) AS differencedate,
        CASE WHEN t.ordercategory IS NULL OR t.ordercategory = '' THEN 0 ELSE t.ordercategory END AS ordercategory
      FROM orderstatus t
      INNER JOIN salesman sm ON sm.alternatesalesmancode = t.salesmancode
      INNER JOIN routemaster rm ON rm.salesmancode = sm.salesmancode
      INNER JOIN customermaster cm ON cm.alternatecode = t.customercode
      WHERE sm.salesmancode = :userId
    `,
    { userId }
  );

  return rows;
}

export async function getCustomerItemGroupData(
  connection: PoolConnection,
  routeId: string | number
): Promise<{
  customeritemgrp: Record<string, unknown>[];
  customeritemmap: Record<string, unknown>[];
}> {
  const [customeritemgrp] = await connection.execute<RowDataPacket[]>(
    `
      SELECT DISTINCT cig.customeritemgrpcode, cig.*
      FROM customeritemgrp cig
      INNER JOIN customermaster cm ON cm.itemmapkey = cig.customeritemgrpcode
      LEFT JOIN routesequence rs ON rs.customercode = cm.customercode
      WHERE rs.routecode = :routeId
      ORDER BY cig.customeritemgrpcode
    `,
    { routeId }
  );

  const [customeritemmap] = await connection.execute<RowDataPacket[]>(
    `
      SELECT DISTINCT cim.customeritemgrpcode, cim.*
      FROM customeritemmapping cim
      INNER JOIN customeritemgrp cig ON cim.customeritemgrpcode = cig.customeritemgrpcode
      INNER JOIN customermaster cm ON cm.itemmapkey = cig.customeritemgrpcode
      LEFT JOIN routesequence rs ON rs.customercode = cm.customercode
      WHERE rs.routecode = :routeId
      ORDER BY cim.itemcode
    `,
    { routeId }
  );

  return { customeritemgrp, customeritemmap };
}

export async function findCustomerMaster(
  connection: PoolConnection,
  routeCode: string | number,
  customerCode: string | number
): Promise<Record<string, unknown> | null> {
  const [rows] = await connection.execute<RowDataPacket[]>(
    `
      SELECT
        cm.*,
        rm.usealternatecodes
      FROM customermaster cm
      LEFT JOIN routemaster rm ON rm.routecode = :routeCode
      WHERE cm.customercode = :customerCode
      LIMIT 1
    `,
    { routeCode, customerCode }
  );

  return rows[0] ?? null;
}

export async function getVisualDataSections(
  connection: PoolConnection
): Promise<{
  visualheader: Record<string, unknown>[];
  visualdetail: Record<string, unknown>[];
}> {
  const [visualheader] = await connection.execute<RowDataPacket[]>(
    `
      SELECT visualcode, visualdescription, arbvisualdescription, remarks
      FROM visualheader
    `
  );

  const [visualdetail] = await connection.execute<RowDataPacket[]>(
    `
      SELECT visualdetail_id, visualcode, imagename, imagepath, imagedescription
      FROM visualdetail
    `
  );

  return { visualheader, visualdetail };
}

async function getDeliveryOrderNumbers(
  connection: PoolConnection,
  filters: {
    customercode?: unknown;
    orderdate?: unknown;
    orderno?: unknown;
    lpono?: unknown;
  }
): Promise<Array<string | number>> {
  const customercode = stringValue(filters.customercode);
  const orderno = stringValue(filters.orderno);
  const lpono = stringValue(filters.lpono);

  if (customercode !== '') {
    const [rows] = await connection.execute<(RowDataPacket & { orderno: string | number })[]>(
      `
        SELECT dh.orderno
        FROM deliveryheader dh
        INNER JOIN customermaster cm ON cm.customercode = dh.customercode
        WHERE UPPER(cm.alternatecode) LIKE CONCAT('%', UPPER(:customercode), '%')
        ORDER BY dh.orderno
        LIMIT 10
      `,
      { customercode }
    );

    return rows.map((row) => row.orderno);
  }

  if (orderno !== '') {
    const [rows] = await connection.execute<(RowDataPacket & { orderno: string | number })[]>(
      `
        SELECT DISTINCT orderno
        FROM deliveryheader
        WHERE orderno LIKE CONCAT('%', :orderno, '%')
        ORDER BY orderno
        LIMIT 10
      `,
      { orderno }
    );

    return rows.map((row) => row.orderno);
  }

  if (lpono !== '') {
    const [rows] = await connection.execute<(RowDataPacket & { orderno: string | number })[]>(
      `
        SELECT DISTINCT orderno
        FROM deliveryheader
        WHERE UPPER(loadsheetnumber) LIKE CONCAT('%', UPPER(:lpono), '%')
        ORDER BY orderno
        LIMIT 10
      `,
      { lpono }
    );

    return rows.map((row) => row.orderno);
  }

  return [];
}

function stringValue(value: unknown): string {
  return value === undefined || value === null ? '' : String(value).trim();
}
