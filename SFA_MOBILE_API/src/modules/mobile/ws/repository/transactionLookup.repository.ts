import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import type { ImportInventoryCountRow, TransactionCountRow } from '../types/wsLookup.types';

type CountRow = RowDataPacket & { CloudCount: string | number };
type RouteKeyRow = RowDataPacket & { routekey: string | number | null };

export async function getTransactionDataCounts(
  connection: PoolConnection,
  routeKey: string | number
): Promise<TransactionCountRow[]> {
  const [rows] = await connection.execute<(RowDataPacket & TransactionCountRow)[]>(
    `
      SELECT 'SEDY' TYPE, COUNT(*) CloudCount FROM startendday WHERE routekey = :routeKey
      UNION
      SELECT 'IVTH' TYPE, COUNT(*) CloudCount FROM inventorytransactionheader WHERE routekey = :routeKey AND data = 0 AND voidflag = 0
      UNION
      SELECT 'IVTD' TYPE, COUNT(*) CloudCount FROM inventorytransactiondetail WHERE routekey = :routeKey
      UNION
      SELECT 'IVSD' TYPE, COUNT(*) CloudCount FROM inventorysummarydetail WHERE routekey = :routeKey
      UNION
      SELECT 'RSCS' TYPE, COUNT(*) CloudCount FROM routesequencecustomerstatus WHERE routekey = :routeKey
      UNION
      SELECT 'RSCC' TYPE, IFNULL(SUM(servicedflag), 0) CloudCount FROM routesequencecustomerstatus WHERE routekey = :routeKey
      UNION
      SELECT 'CVLG' TYPE, COUNT(*) CloudCount FROM customervisitlog WHERE routekey = :routeKey
      UNION
      SELECT 'INVH' TYPE, COUNT(*) CloudCount FROM invoiceheader WHERE routekey = :routeKey
      UNION
      SELECT 'INVD' TYPE, COUNT(*) CloudCount FROM invoicedetail WHERE routekey = :routeKey
      UNION
      SELECT 'INVR' TYPE, COUNT(*) CloudCount FROM invoicerxddetail WHERE routekey = :routeKey
      UNION
      SELECT 'BAED' TYPE, COUNT(*) CloudCount FROM batchexpirydetail WHERE routekey = :routeKey
      UNION
      SELECT 'SAOH' TYPE, COUNT(*) CloudCount FROM salesorderheader WHERE routekey = :routeKey
      UNION
      SELECT 'SAOD' TYPE, COUNT(*) CloudCount FROM salesorderdetail WHERE routekey = :routeKey
      UNION
      SELECT 'SAOR' TYPE, COUNT(*) CloudCount FROM orderrxddetail WHERE routekey = :routeKey
      UNION
      SELECT 'PRMD' TYPE, COUNT(*) CloudCount FROM promotiondetail WHERE routekey = :routeKey
      UNION
      SELECT 'ARHR' TYPE, COUNT(*) CloudCount FROM arheader WHERE routekey = :routeKey
      UNION
      SELECT 'ARDL' TYPE, COUNT(*) CloudCount FROM ardetail WHERE routekey = :routeKey
      UNION
      SELECT DISTINCT
        'CCDS' TYPE,
        COALESCE((SELECT COUNT(ih.invoicenumber) FROM invoiceheader ih WHERE ih.routekey = ccd.routekey AND ih.paymenttype IN (0, 4) AND ih.voidflag = 0), 0) +
        COALESCE((SELECT COUNT(ah.invoicenumber) FROM arheader ah WHERE ah.routekey = ccd.routekey AND ah.voidflag = 0), 0) CloudCount
      FROM cashcheckdetail ccd
      WHERE ccd.routekey = :routeKey
      UNION
      SELECT 'CUOC' TYPE, COUNT(*) CloudCount FROM customeroperationscontrol WHERE routekey = :routeKey
      UNION
      SELECT 'CPPD' TYPE, COUNT(*) CloudCount FROM customerpromotionplandetail WHERE routekey = :routeKey
      UNION
      SELECT 'SADS' TYPE, COUNT(*) CloudCount FROM surveyauditdetail WHERE routekey = :routeKey
      UNION
      SELECT 'PECD' TYPE, COUNT(*) CloudCount FROM posequipmentchangedetail WHERE routekey = :routeKey
      UNION
      SELECT 'CUID' TYPE, COUNT(*) CloudCount FROM customerinventorydetail WHERE routekey = :routeKey
      UNION
      SELECT 'NOSC' TYPE, COUNT(*) CloudCount FROM nonservicedcustomer WHERE routekey = :routeKey
      UNION
      SELECT 'NOSH' TYPE, COUNT(*) CloudCount FROM nosalesheader WHERE routekey = :routeKey
      UNION
      SELECT 'AORL' TYPE, COUNT(*) CloudCount FROM t_access_override_log WHERE routekey = :routeKey
    `,
    { routeKey }
  );

  return rows;
}

export async function getImportInventoryCounts(
  connection: PoolConnection,
  routeCode: string | number
): Promise<ImportInventoryCountRow[]> {
  const routeKey = await getLatestClosedRouteKey(connection, routeCode);
  const [loadRows] = await connection.execute<CountRow[]>(
    `
      SELECT IFNULL(SUM(totunits), 0) AS CloudCount
      FROM startingloaddetail
      WHERE routecode = :routeCode
      AND status = 0
      AND ddate = CURRENT_DATE()
      AND totunits > 0
    `,
    { routeCode }
  );
  const [inventoryRows] = await connection.execute<CountRow[]>(
    `
      SELECT IFNULL(SUM(quantity), 0) AS CloudCount
      FROM inventorytransactiondetail
      WHERE transactiontypecode = 5
      AND quantity > 0
      AND routekey = :routeKey
    `,
    { routeKey }
  );

  return [
    { TTYPE: 'SLD', CloudCount: loadRows[0]?.CloudCount ?? 0 },
    { TTYPE: 'ISD', CloudCount: inventoryRows[0]?.CloudCount ?? 0 }
  ];
}

async function getLatestClosedRouteKey(
  connection: PoolConnection,
  routeCode: string | number
): Promise<string | number> {
  const [rows] = await connection.execute<RouteKeyRow[]>(
    `
      SELECT COALESCE(MAX(routekey), 0) AS routekey
      FROM startendday
      WHERE routeclosed = 1
      AND routecode = :routeCode
    `,
    { routeCode }
  );

  return rows[0]?.routekey ?? 0;
}
