import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import type { MasterDataSyncResponseSections } from '../masterdatasync.types';

interface CustomerSyncInput {
  routeId: number;
}

type GenericRow = RowDataPacket & Record<string, unknown>;
type SetupRoutePlanRow = RowDataPacket & {
  journeyplanflag: string | number | null;
  routesequenceplanflag: string | number | null;
};
type WeekRow = RowDataPacket & { rp32weeknumber: number | null };
type DayRow = RowDataPacket & { dayNumber: number };
type CodeRow = RowDataPacket & { customercode: number | string };
type ScalarRow = RowDataPacket & {
  division?: string | number | null;
  itemmustkey?: string | number | null;
  status?: string | number | null;
};

export async function getCustomerSyncSections(
  connection: PoolConnection,
  input: CustomerSyncInput
): Promise<MasterDataSyncResponseSections> {
  const routeCustomerCodes = await getRouteCustomerCodes(connection, input.routeId);
  const routeWeek = await getRouteSequenceWeek(connection);

  const [customerMaster, salesCalendar, routeSequence, customerInvoice] =
    await Promise.all([
      getCustomerMaster(connection, input.routeId, routeCustomerCodes),
      getSalesCalendar(connection),
      getRouteSequence(connection, input.routeId, routeCustomerCodes, routeWeek),
      getCustomerInvoice(connection, input.routeId, routeCustomerCodes)
    ]);

  return {
    CustomerMaster: customerMaster,
    salescalender: salesCalendar,
    routesequence: routeSequence,
    customerinvoice: customerInvoice
  };
}

async function getRouteCustomerCodes(
  connection: PoolConnection,
  routeId: number
): Promise<Array<number | string>> {
  const [setupRows] = await connection.execute<SetupRoutePlanRow[]>(
    'SELECT journeyplanflag, routesequenceplanflag FROM setup LIMIT 1'
  );

  const journeyPlanFlag = String(setupRows[0]?.journeyplanflag ?? '');
  const [dayRows] = await connection.execute<DayRow[]>(
    'SELECT DAYOFWEEK(CURRENT_DATE()) AS dayNumber'
  );
  const dayNumber = dayRows[0]?.dayNumber ?? 0;

  if (journeyPlanFlag === '2') {
    return selectCustomerCodes(
      connection,
      'SELECT DISTINCT customercode FROM routesequence WHERE routecode = ?',
      [routeId]
    );
  }

  const dayColumn = getCallRestrictionColumn(dayNumber);

  return selectCustomerCodes(
    connection,
    `
      SELECT DISTINCT customercode
      FROM routesequence
      WHERE ${dayColumn} = 1
      AND routecode = ?
    `,
    [routeId]
  );
}

async function selectCustomerCodes(
  connection: PoolConnection,
  sql: string,
  values: unknown[]
): Promise<Array<number | string>> {
  const [rows] = await connection.query<CodeRow[]>(sql, values);
  return rows.map((row) => row.customercode);
}

function getCallRestrictionColumn(dayNumber: number): string {
  switch (dayNumber) {
    case 1:
      return 'callrestrictiondays7';
    case 2:
      return 'callrestrictiondays1';
    case 3:
      return 'callrestrictiondays2';
    case 4:
      return 'callrestrictiondays3';
    case 5:
      return 'callrestrictiondays4';
    case 6:
      return 'callrestrictiondays5';
    default:
      return 'callrestrictiondays6';
  }
}

async function getRouteSequenceWeek(connection: PoolConnection): Promise<number> {
  const [setupRows] = await connection.execute<SetupRoutePlanRow[]>(
    'SELECT routesequenceplanflag FROM setup LIMIT 1'
  );

  if (String(setupRows[0]?.routesequenceplanflag ?? '') === '1') {
    return 9;
  }

  const [weekRows] = await connection.execute<WeekRow[]>(
    `
      SELECT rp32weeknumber
      FROM salescalender
      WHERE CURRENT_DATE() BETWEEN weekstartdate AND weekenddate
      LIMIT 1
    `
  );

  return Number(weekRows[0]?.rp32weeknumber ?? 9);
}

function buildInClause(values: unknown[]): string {
  return values.map(() => '?').join(', ');
}

async function getCustomerMaster(
  connection: PoolConnection,
  routeId: number,
  routeCustomerCodes: Array<number | string>
): Promise<GenericRow[]> {
  const [routeRows] = await connection.execute<ScalarRow[]>(
    `
      SELECT
        COALESCE(division, 0) AS division,
        COALESCE(itemmustkey, 0) AS itemmustkey
      FROM routemaster
      WHERE routecode = :routeId
      LIMIT 1
    `,
    { routeId }
  );

  const division = routeRows[0]?.division ?? 0;
  const defaultItemMustKey = routeRows[0]?.itemmustkey ?? 0;

  const selectedCustomerSql =
    routeCustomerCodes.length > 0
      ? `
        SELECT
          cm.*,
          CASE WHEN COALESCE(cm.itemmustkey, 0) > 0 THEN cm.itemmustkey ELSE ? END AS itemmustkey,
          COALESCE(dc.discount, 0) AS tcspecialdiscount,
          IFNULL(cm.visualcode, 0) AS visualcode,
          IFNULL(cm.distribution_check_id, 0) AS distribution_check_id,
          0 AS splitfree,
          IFNULL(CASE WHEN cm.nrp_flag = 'Y' THEN 0 ELSE 1 END, 1) AS nrp_flag,
          IFNULL(cm.invpromoyn, 0) AS invpromoyn,
          IFNULL(cm.invpromoplan, 0) AS invpromoplan,
          IFNULL(cm.combopromoyn, 0) AS combopromoyn,
          IFNULL(cm.combopromoplan, 0) AS combopromoplan,
          IFNULL(cm.rebateprintyn, 0) AS rebateprintyn,
          CASE WHEN cm.invoicepaymentterms = 2 THEN cm.creditlimitdays ELSE 0 END AS creditlimitdays,
          CASE WHEN cm.invoicepaymentterms = 2 THEN cm.creditlimit ELSE 0 END AS creditlimit,
          CASE WHEN cm.invoicepaymentterms > 1 THEN cm.enablearcollection ELSE 0 END AS enablearcollection,
          ABS(cm.alternatecode) AS alternatecode
        FROM customermaster cm
        LEFT JOIN customerdiscountcap dc
          ON dc.customercode = cm.customercode
          AND dc.divison = ?
        WHERE cm.customercode IN (${buildInClause(routeCustomerCodes)})
        AND cm.type <= 3
        AND cm.activecustomer = 1
      `
      : '';

  const templateCustomerSql = `
    SELECT
      cm.*,
      cm.itemmustkey AS itemmustkey,
      cm.tcspecialdiscount AS tcspecialdiscount,
      IFNULL(cm.visualcode, 0) AS visualcode,
      IFNULL(cm.distribution_check_id, 0) AS distribution_check_id,
      0 AS splitfree,
      IFNULL(CASE WHEN cm.nrp_flag = 'Y' THEN 0 ELSE 1 END, 1) AS nrp_flag,
      IFNULL(cm.invpromoyn, 0) AS invpromoyn,
      IFNULL(cm.invpromoplan, 0) AS invpromoplan,
      IFNULL(cm.combopromoyn, 0) AS combopromoyn,
      IFNULL(cm.combopromoplan, 0) AS combopromoplan,
      IFNULL(cm.rebateprintyn, 0) AS rebateprintyn,
      CASE WHEN cm.invoicepaymentterms = 2 THEN cm.creditlimitdays ELSE 0 END AS creditlimitdays,
      CASE WHEN cm.invoicepaymentterms = 2 THEN cm.creditlimit ELSE 0 END AS creditlimit,
      CASE WHEN cm.invoicepaymentterms > 1 THEN cm.enablearcollection ELSE 0 END AS enablearcollection,
      ABS(cm.alternatecode) AS alternatecode
    FROM customermaster cm
    WHERE cm.templateindicator = 1
    AND cm.activecustomer = 1
  `;

  const sql =
    selectedCustomerSql.length > 0
      ? `${selectedCustomerSql} UNION ${templateCustomerSql}`
      : templateCustomerSql;

  const values =
    selectedCustomerSql.length > 0
      ? [defaultItemMustKey, division, ...routeCustomerCodes]
      : [];

  const [rows] = await connection.query<GenericRow[]>(sql, values);
  return rows;
}

async function getSalesCalendar(connection: PoolConnection): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT salesyear, weeknumber, weekstartdate, weekenddate, rp32weeknumber, salesperiod
      FROM salescalender
      WHERE salesyear = YEAR(CURRENT_DATE())
    `
  );

  return rows;
}

async function getRouteSequence(
  connection: PoolConnection,
  routeId: number,
  routeCustomerCodes: Array<number | string>,
  routeWeek: number
): Promise<GenericRow[]> {
  if (routeCustomerCodes.length === 0) {
    return [];
  }

  const [rows] = await connection.query<GenericRow[]>(
    `
      SELECT
        rs.rp32weeknumber,
        rs.routecode,
        rs.customercode,
        rs.callrestrictiondays1,
        rs.callrestrictiondays2,
        rs.callrestrictiondays3,
        rs.callrestrictiondays4,
        rs.callrestrictiondays5,
        rs.callrestrictiondays6,
        rs.callrestrictiondays7,
        rs.monseq,
        rs.tueseq,
        rs.wedseq,
        rs.thuseq,
        rs.friseq,
        rs.satseq,
        rs.sunseq
      FROM routesequence rs
      WHERE rs.customercode IN (${buildInClause(routeCustomerCodes)})
      AND rs.rp32weeknumber = ?
      AND rs.routecode = ?
    `,
    [...routeCustomerCodes, routeWeek, routeId]
  );

  return rows;
}

async function getCustomerInvoice(
  connection: PoolConnection,
  routeId: number,
  routeCustomerCodes: Array<number | string>
): Promise<GenericRow[]> {
  if (routeCustomerCodes.length === 0) {
    return [];
  }

  const [flagRows] = await connection.execute<ScalarRow[]>(
    'SELECT status FROM controlpanel WHERE flagid = 51 LIMIT 1'
  );
  const useSalesmanJoin = String(flagRows[0]?.status ?? '') === '1';

  const joinClause = useSalesmanJoin
    ? 'INNER JOIN salesman sm ON sm.salesmancode = ci.salesmancode'
    : 'LEFT JOIN salesman sm ON sm.salesmancode = ci.salesmancode';

  const routeFilter = useSalesmanJoin ? '' : 'AND ci.routecode = ?';
  const values = useSalesmanJoin
    ? [routeId, ...routeCustomerCodes]
    : [routeId, ...routeCustomerCodes, routeId];

  const [rows] = await connection.query<GenericRow[]>(
    `
      SELECT
        ci.transactionkey,
        ci.transactiontype,
        ci.documentnumber,
        ci.invoicenumber,
        ci.transactiondate,
        ci.transactiontime,
        ci.customercode,
        ? AS routecode,
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
      ${joinClause}
      WHERE ci.customercode IN (${buildInClause(routeCustomerCodes)})
      AND ci.transactiontype = 2
      AND ci.voidflag = 0
      AND ci.duedate IS NOT NULL
      ${routeFilter}
    `,
    values
  );

  return rows;
}
