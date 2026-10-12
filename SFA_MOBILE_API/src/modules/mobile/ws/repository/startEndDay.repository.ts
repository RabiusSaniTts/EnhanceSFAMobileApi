import type { PoolConnection, ResultSetHeader } from 'mysql2/promise';
import type {
  CreatedStartDay,
  EndDayRequestItem,
  EndDayResponseItem,
  LogoutRequestItem,
  RouteHierarchy,
  StartDayRequestItem
} from '../types/startEndDay.types';
import type {
  CreatedStartDayRow,
  CurrentDateRow,
  EndDayResponseRow,
  OpenRouteKeyRow,
  RouteClosedRow,
  RouteCodeRow,
  RouteHierarchyRow,
  RouteVersionRow
} from '../../transactions/repository/shared.repository';

export async function getDatabaseCurrentDate(connection: PoolConnection): Promise<string> {
  const [rows] = await connection.execute<CurrentDateRow[]>(
    "SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS currentDate"
  );

  return rows[0]?.currentDate;
}

export async function getRouteVersion(
  connection: PoolConnection,
  routeCode: string | number
): Promise<RouteVersionRow | null> {
  const [rows] = await connection.execute<RouteVersionRow[]>(
    `
      SELECT
        VER_NO AS versionNo,
        VER_STS AS versionStatus
      FROM route_version_map
      WHERE route_code = :routeCode
      LIMIT 1
    `,
    { routeCode }
  );

  return rows[0] ?? null;
}

export async function getLatestRouteClosedStatus(
  connection: PoolConnection,
  routeCode: string | number
): Promise<number> {
  const [rows] = await connection.execute<RouteClosedRow[]>(
    `
      SELECT routeclosed
      FROM startendday
      WHERE routecode = :routeCode
      ORDER BY routekey DESC
      LIMIT 1
    `,
    { routeCode }
  );

  return Number(rows[0]?.routeclosed ?? 2);
}

export async function getRouteHierarchy(
  connection: PoolConnection,
  routeCode: string | number
): Promise<RouteHierarchy> {
  const [rows] = await connection.execute<RouteHierarchyRow[]>(
    `
      SELECT
        rm.subareacode,
        sam.supervisorcode,
        sam.areacode,
        am.areamanagercode,
        am.depotcode,
        dm.branchmanagercode,
        dm.cmpycode,
        co.nationalsalesmanagercode,
        rm.amountdecimaldigits,
        rm.memo1 AS tourid
      FROM routemaster rm
      INNER JOIN subareamaster sam ON sam.subareacode = rm.subareacode
      INNER JOIN areamaster am ON am.areacode = sam.areacode
      INNER JOIN depotmaster dm ON dm.depotcode = am.depotcode
      INNER JOIN company co ON co.cmpycode = dm.cmpycode
      WHERE rm.routecode = :routeCode
      LIMIT 1
    `,
    { routeCode }
  );

  return (
    rows[0] ?? {
      subareacode: null,
      supervisorcode: null,
      areacode: null,
      areamanagercode: null,
      depotcode: null,
      branchmanagercode: null,
      cmpycode: null,
      nationalsalesmanagercode: null,
      amountdecimaldigits: null,
      tourid: null
    }
  );
}

export async function createStartDay(
  connection: PoolConnection,
  item: StartDayRequestItem,
  routeHierarchy: RouteHierarchy
): Promise<CreatedStartDay> {
  const [insertResult] = await connection.execute<ResultSetHeader>(
    `
      INSERT INTO startendday SET
        routecode = :routeCode,
        salesmancode = :salesmanCode,
        routestartdate = CURDATE(),
        routestarttime = CURTIME(),
        routestartodometer = :routeStartOdometer,
        triptype = 0,
        areacode = :areaCode,
        areamanagercode = :areaManagerCode,
        branchmanagercode = :branchManagerCode,
        cmpycode = :companyCode,
        currencycode = :currencyCode,
        depotcode = :depotCode,
        nationalsalesmanagercode = :nationalSalesManagerCode,
        subareacode = :subAreaCode,
        supervisorcode = :supervisorCode,
        dataconrefnumber = :deviceId,
        versionno = :versionNo,
        tourid = :tourId
    `,
    {
      routeCode: item.routecode,
      salesmanCode: item.salesmancode,
      routeStartOdometer: item.routestartodometer,
      areaCode: routeHierarchy.areacode,
      areaManagerCode: routeHierarchy.areamanagercode,
      branchManagerCode: routeHierarchy.branchmanagercode,
      companyCode: routeHierarchy.cmpycode,
      currencyCode: routeHierarchy.amountdecimaldigits,
      depotCode: routeHierarchy.depotcode,
      nationalSalesManagerCode: routeHierarchy.nationalsalesmanagercode,
      subAreaCode: routeHierarchy.subareacode,
      supervisorCode: routeHierarchy.supervisorcode,
      deviceId: item.deviceid,
      versionNo: item.ver,
      tourId: routeHierarchy.tourid
    }
  );

  const [rows] = await connection.execute<CreatedStartDayRow[]>(
    `
      SELECT routekey, routestartdate, routestarttime, routestartodometer
      FROM startendday
      WHERE routekey = :routeKey
    `,
    { routeKey: insertResult.insertId }
  );

  return rows[0];
}

export async function updateEndDay(
  connection: PoolConnection,
  item: EndDayRequestItem
): Promise<EndDayResponseItem | null> {
  await connection.execute(
    `
      UPDATE startendday
      SET
        routeenddate = :routeEndDate,
        routeendodometer = :routeEndOdometer,
        routeendtime = CURTIME(),
        routeclosed = 1,
        totaldocuments = :totalDocuments,
        totalcash = :totalCash,
        totalchecks = :totalChecks,
        totalcheckrequests = 0,
        totalorderamount = :totalOrderAmount,
        totalinvoiceamount = :totalInvoiceAmount,
        totalchargesales = :totalChargeSales,
        totalcashsales = :totalCashSales,
        totalacctsreceivable = :totalAccountsReceivable,
        totalexpenses = :totalExpenses,
        inventoryvariance = :inventoryVariance,
        cashvariance = :cashVariance,
        totalfullservicesales = 0,
        totalfullservicecash = 0,
        exportedflag = 0,
        routejourneyid = 0,
        modifieddate = CURDATE(),
        modifiedtime = CURTIME(),
        data = 0
      WHERE routekey = :routeKey
    `,
    {
      routeKey: item.routekey,
      routeEndDate: item.routeenddate,
      routeEndOdometer: item.routeendodometer,
      totalDocuments: item.totaldocuments,
      totalCash: item.totalcash,
      totalChecks: item.totalchecks,
      totalOrderAmount: item.totalorderamount,
      totalInvoiceAmount: item.totalinvoiceamount,
      totalChargeSales: item.totalchargesales,
      totalCashSales: item.totalcashsales,
      totalAccountsReceivable: item.totalacctsreceivable,
      totalExpenses: item.totalexpenses,
      inventoryVariance: item.inventoryvariance,
      cashVariance: item.cashvariance
    }
  );

  const routeCode = await getTabletTripRouteCode(connection, item.routekey);

  if (routeCode !== null) {
    await connection.execute(
      `
        UPDATE routemaster
        SET vehicleodometer = :routeEndOdometer
        WHERE routecode = :routeCode
      `,
      {
        routeCode,
        routeEndOdometer: item.routeendodometer
      }
    );
  }

  const [rows] = await connection.execute<EndDayResponseRow[]>(
    `
      SELECT routekey, routeenddate, routeendtime
      FROM startendday
      WHERE routekey = :routeKey
    `,
    { routeKey: item.routekey }
  );

  return rows[0] ?? null;
}

export async function resolveLogoutRouteKey(
  connection: PoolConnection,
  item: LogoutRequestItem
): Promise<number> {
  const [rows] = await connection.execute<OpenRouteKeyRow[]>(
    `
      SELECT routekey
      FROM startendday
      WHERE triptype = 0
      AND routeclosed = 0
      AND routecode = :routeCode
      LIMIT 1
    `,
    { routeCode: item.routecode }
  );

  return Number(rows[0]?.routekey ?? 0);
}

async function getTabletTripRouteCode(
  connection: PoolConnection,
  routeKey: string | number
): Promise<string | number | null> {
  const [rows] = await connection.execute<RouteCodeRow[]>(
    `
      SELECT routecode
      FROM startendday
      WHERE routekey = :routeKey
      AND triptype = 0
      LIMIT 1
    `,
    { routeKey }
  );

  return rows[0]?.routecode ?? null;
}
