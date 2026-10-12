import type { PoolConnection } from 'mysql2/promise';
import type {
  CountRow,
  NumericValueRow,
  OpenRouteKeyRow,
  RouteCodeRow,
  RouteKeySalesmanRow
} from './shared.repository';
import { required } from './shared.repository';

type SendDataPostProcessingParams = {
  userid: string | number | null;
  routecode: string | number | null;
  routekey: string | number | null;
  routeclosed: string | number | null;
};

export async function runSendDataPostProcessing(
  connection: PoolConnection,
  params: SendDataPostProcessingParams
): Promise<void> {
  await insertSyncLog(connection, params);

  if (await isRouteClosed(connection, required(params.routekey))) {
    await rebuildSuggestedSalesInvoiceAfterRouteFilter(connection, required(params.routecode));
    await updateDataPosting(connection, required(params.routecode));
    await rebuildAverageSalesQuantity(connection, required(params.routecode));
  }
}

async function insertSyncLog(
  connection: PoolConnection,
  params: SendDataPostProcessingParams
): Promise<void> {
  if (Number(params.userid ?? 0) === 0 || Number(params.routekey ?? 0) === 0) {
    return;
  }

  const [routeRows] = await connection.execute<RouteCodeRow[]>(
    `
      SELECT routecode
      FROM routemaster
      WHERE salesmancode = :userId
      LIMIT 1
    `,
    { userId: required(params.userid) }
  );
  const routeCode = routeRows[0]?.routecode;

  if (routeCode === null || routeCode === undefined) {
    return;
  }

  const [routeKeyRows] = await connection.execute<OpenRouteKeyRow[]>(
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
      userId: required(params.userid),
      routeCode,
      syncType: '2',
      routeClosed: String(required(params.routeclosed)) === '1' ? '1' : '0',
      routeKey: routeKeyRows[0]?.routekey ?? 0
    }
  );
}

async function isRouteClosed(
  connection: PoolConnection,
  routeKey: string | number
): Promise<boolean> {
  const [rows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS count
      FROM startendday
      WHERE routekey = :routeKey
      AND routeclosed = 1
    `,
    { routeKey }
  );

  return Number(rows[0]?.count ?? 0) > 0;
}

async function rebuildSuggestedSalesInvoiceAfterRouteFilter(
  connection: PoolConnection,
  routeCode: string | number
): Promise<void> {
  await connection.execute('DELETE FROM suggestedsalesinvoice WHERE routecode = :routeCode', {
    routeCode
  });

  const [salesStatusRows] = await connection.execute<NumericValueRow[]>(
    `
      SELECT status AS value
      FROM controlpanel
      WHERE flagid = 15
      LIMIT 1
    `
  );

  if (Number(salesStatusRows[0]?.value ?? 0) !== 1) {
    return;
  }

  const [routeTypeRows] = await connection.execute<NumericValueRow[]>(
    `
      SELECT COALESCE(routetype, 0) AS value
      FROM routemaster
      WHERE routecode = :routeCode
      LIMIT 1
    `,
    { routeCode }
  );
  const routeType = Number(routeTypeRows[0]?.value ?? 0);
  const [offtakeRows] = await connection.execute<NumericValueRow[]>(
    'SELECT COALESCE(offtakeparameter, 1) * 7 AS value FROM setup LIMIT 1'
  );
  const offtakeDays = Number(offtakeRows[0]?.value ?? 7);

  if (routeType === 1 || routeType === 3) {
    await insertRouteTypeSuggestedSales(connection, routeCode, offtakeDays);
  } else {
    await insertDeliveryRouteSuggestedSales(connection, routeCode, offtakeDays);
  }

  if (routeType === 0 || routeType === 2) {
    await roundSuggestedSalesToCases(connection, routeCode);
  }

  await connection.execute(
    'DELETE FROM suggestedsalesinvoice WHERE routecode = :routeCode AND offtakeqty = 0',
    { routeCode }
  );
}

async function insertRouteTypeSuggestedSales(
  connection: PoolConnection,
  routeCode: string | number,
  offtakeDays: number
): Promise<void> {
  await connection.execute(
    `
      INSERT INTO suggestedsalesinvoice (
        routecode, customercode, transactiondate, itemcode, transactiontype,
        lastvisitshelfstock, lastvisitsales, currentvisitshelfstock, currentvisitsales,
        offtakeqty, currentvisitgsales, currentvisitreturns, currentvisitsecondarysales, mdat
      )
      SELECT
        coc.routecode,
        coc.customercode,
        CURDATE(),
        id.itemcode,
        4,
        COALESCE(SUM(qtyloc1each + qtyloc2each + qtyloc3each), 0),
        COALESCE(AVG(id.salesqty - id.returnqty - id.damagedqty), 0),
        0,
        0,
        CASE
          WHEN AVG(id.salesqty - id.returnqty - id.damagedqty) < 0 THEN 0
          ELSE AVG(id.salesqty - id.returnqty - id.damagedqty)
            + ROUND(
              AVG(id.salesqty - id.returnqty - id.damagedqty)
              * (SELECT COALESCE(offtakeparameter, 0) FROM itemmaster im WHERE im.actualitemcode = id.itemcode),
              0
            )
        END,
        0,
        0,
        0,
        CURDATE()
      FROM customeroperationscontrol coc
      LEFT OUTER JOIN invoiceheader ih
        ON ih.routekey = coc.routekey
        AND ih.visitkey = coc.visitkey
        AND ih.voidflag = 0
      INNER JOIN invoicedetail id
        ON id.routekey = ih.routekey
        AND id.visitkey = ih.visitkey
      LEFT OUTER JOIN customerinventorydetail cid
        ON cid.routekey = coc.routekey
        AND cid.visitkey = coc.visitkey
      INNER JOIN customermaster cm
        ON cm.customercode = coc.customercode
        AND cm.enablesuggestsales = 1
      WHERE DATE(coc.visitstartdate) > DATE_SUB(CURDATE(), INTERVAL :offtakeDays DAY)
      AND coc.routecode = :routeCode
      GROUP BY coc.routecode, coc.customercode, id.itemcode
      HAVING offtakeqty > 0
    `,
    { routeCode, offtakeDays }
  );
}

async function insertDeliveryRouteSuggestedSales(
  connection: PoolConnection,
  routeCode: string | number,
  offtakeDays: number
): Promise<void> {
  await connection.execute(
    `
      INSERT INTO suggestedsalesinvoice (
        routecode, customercode, transactiondate, itemcode, transactiontype,
        lastvisitshelfstock, lastvisitsales, currentvisitshelfstock, currentvisitsales,
        offtakeqty, currentvisitgsales, currentvisitreturns, currentvisitsecondarysales, mdat
      )
      SELECT
        ih.deliveryroute,
        ih.customercode,
        CURDATE(),
        id.itemcode,
        4,
        0,
        COALESCE(AVG(id.salesqty), 0),
        0,
        0,
        CASE
          WHEN AVG(id.salesqty) < 0 THEN 0
          ELSE AVG(id.salesqty)
            + ROUND(
              AVG(id.salesqty)
              * (SELECT COALESCE(offtakeparameter, 0) FROM itemmaster im WHERE im.actualitemcode = id.itemcode),
              0
            )
        END,
        0,
        0,
        0,
        CURDATE()
      FROM deliveryheader ih
      INNER JOIN deliverydetail id
        ON id.deliveryno = ih.deliveryno
      INNER JOIN customermaster cm
        ON cm.customercode = ih.customercode
        AND cm.enablesuggestsales = 1
      WHERE DATE(ih.deliverydate) > DATE_SUB(CURDATE(), INTERVAL :offtakeDays DAY)
      AND ih.deliveryroute = :routeCode
      GROUP BY ih.deliveryroute, ih.customercode, id.itemcode
      HAVING offtakeqty > 0
    `,
    { routeCode, offtakeDays }
  );
}

async function roundSuggestedSalesToCases(
  connection: PoolConnection,
  routeCode: string | number
): Promise<void> {
  await connection.execute(
    `
      UPDATE suggestedsalesinvoice ss
      INNER JOIN itemmaster im
        ON im.actualitemcode = ss.itemcode
      SET ss.offtakeqty = ss.offtakeqty + (im.unitspercase - (ss.offtakeqty MOD im.unitspercase))
      WHERE ss.routecode = :routeCode
      AND ss.offtakeqty > 0
      AND im.unitspercase > 0
      AND (ss.offtakeqty MOD im.unitspercase > 0)
    `,
    { routeCode }
  );
}

async function updateDataPosting(
  connection: PoolConnection,
  routeCode: string | number
): Promise<void> {
  const [rows] = await connection.execute<RouteKeySalesmanRow[]>(
    `
      SELECT routekey, salesmancode
      FROM startendday
      WHERE routecode = :routeCode
      ORDER BY routekey DESC
      LIMIT 1
    `,
    { routeCode }
  );
  const routeKey = rows[0]?.routekey;

  if (Number(routeKey ?? 0) <= 0) {
    return;
  }

  await connection.execute(
    `
      DELETE ird
      FROM invoicerxddetail ird
      LEFT JOIN invoicedetail id
        ON id.transactionkey = ird.transactionkey
        AND id.itemcode = ird.itemcode
        AND ird.itemtransactiontype = 3
      WHERE id.manualfreeqty = 0
      AND id.routekey = :routeKey
    `,
    { routeKey }
  );

  await connection.execute(
    `
      UPDATE customeroperationscontrol coc
      INNER JOIN invoiceheader ih
        ON coc.routekey = ih.routekey
        AND coc.visitkey = ih.visitkey
      SET coc.customercode = ih.customercode
      WHERE coc.customercode <> ih.customercode
      AND coc.routekey = :routeKey
    `,
    { routeKey }
  );

  await connection.execute(
    `
      UPDATE customeroperationscontrol coc
      INNER JOIN arheader ah
        ON coc.routekey = ah.routekey
        AND coc.visitkey = ah.visitkey
      SET coc.customercode = ah.customercode
      WHERE coc.customercode <> ah.customercode
      AND coc.routekey = :routeKey
    `,
    { routeKey }
  );
}

async function rebuildAverageSalesQuantity(
  connection: PoolConnection,
  routeCode: string | number
): Promise<void> {
  const [rows] = await connection.execute<NumericValueRow[]>(
    `
      SELECT defaultrequestdays AS value
      FROM routemaster
      WHERE routecode = :routeCode
      LIMIT 1
    `,
    { routeCode }
  );

  if (Number(rows[0]?.value ?? 0) <= 0) {
    return;
  }

  await connection.execute('DELETE FROM averagesalesqty WHERE routecode = :routeCode', {
    routeCode
  });

  await connection.execute(
    `
      INSERT INTO averagesalesqty(itemcode, routecode, itemqty)
      SELECT
        id.itemcode,
        red.routecode,
        FORMAT(AVG(id.salesqty), 0) AS avgqty
      FROM invoicedetail id
      INNER JOIN startendday red
        ON red.routekey = id.routekey
      INNER JOIN routemaster rm
        ON rm.routecode = red.routecode
      WHERE red.routestartdate >= (CURDATE() - INTERVAL rm.defaultrequestdays DAY)
      AND rm.loadreqrolluporders = 1
      AND rm.routecode = :routeCode
      GROUP BY id.itemcode, red.routecode
      HAVING red.routecode > 0
      ON DUPLICATE KEY UPDATE itemqty = VALUES(itemqty)
    `,
    { routeCode }
  );
}
