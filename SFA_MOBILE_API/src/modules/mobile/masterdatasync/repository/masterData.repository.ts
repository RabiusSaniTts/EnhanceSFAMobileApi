import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import type { MasterDataSyncResponseSections } from "../masterdatasync.types";

interface MasterDataSyncInput {
  routeId: number;
}

type GenericRow = RowDataPacket & Record<string, unknown>;

interface ItemSyncInput {
  routeId: number;
}

export async function getMasterDataSyncSections(
  connection: PoolConnection,
  input: MasterDataSyncInput,
): Promise<MasterDataSyncResponseSections> {
  const itemSections = await getItemSyncSections(connection, input);
  const customerSections = await getCustomerSyncSections(connection, input);
  const promotionPricingSections = await getPromotionPricingSyncSections(connection, input);
  const surveySections = await getSurveySyncSections(connection);
  const reasonSections = await getReasonSyncSections(connection, input);
  const otherSections = await getOtherSyncSections(connection);

  return {
    ...itemSections,
    ...customerSections,
    ...promotionPricingSections,
    ...surveySections,
    ...reasonSections,
    ...otherSections,
  };
}


async function getItemSyncSections(
  connection: PoolConnection,
  input: ItemSyncInput
): Promise<MasterDataSyncResponseSections> {
  const [
    itemGroup,
    itemMaster,
    itemPackageMaster,
    routeGoal,
    avgSalesQty,
    outletItemCodes,
    taxMaster,
    itemMustHeader,
    itemMustDetail,
    itemNrp,
    customerNrp,
    customerItemGroups,
    customerItemMap
  ] = await Promise.all([
    getItemGroup(connection, input.routeId),
    getItemMaster(connection, input.routeId),
    getItemPackageMaster(connection),
    getRouteGoal(connection, input.routeId),
    getAverageSalesQty(connection, input.routeId),
    getOutletItemCodes(connection, input.routeId),
    getTaxMaster(connection),
    getItemMustHeader(connection, input.routeId),
    getItemMustDetail(connection, input.routeId),
    getItemNrp(connection, input.routeId),
    getCustomerNrp(connection, input.routeId),
    getCustomerItemGroups(connection, input.routeId),
    getCustomerItemMap(connection, input.routeId)
  ]);

  return {
    itemgroup: itemGroup,
    ItemMaster: itemMaster,
    itempackagemaster: itemPackageMaster,
    routegoal: routeGoal,
    avgsalesqty: avgSalesQty,
    outletitemcodes: outletItemCodes,
    taxmaster: taxMaster,
    itemmustheader: itemMustHeader,
    itemmustdetail: itemMustDetail,
    itemnrp: itemNrp,
    custnrp: customerNrp,
    customeritemgrp: customerItemGroups,
    customeritemmap: customerItemMap
  };
}

async function getItemGroup(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        ig.itemgroupcode,
        ig.submajorcategorycode,
        ig.itemgroupname,
        CASE
          WHEN ig.arbitemgroup = '' THEN ig.itemgroupname
          ELSE ig.arbitemgroup
        END AS arbitemgroup,
        ig.activestatus
      FROM itemgroup AS ig
      WHERE ig.activestatus = 1
      AND ig.itemgroupcode IN (
        SELECT DISTINCT im.itemgroupcode
        FROM itemmaster im
        INNER JOIN routeitemmapping map
          ON map.itemcode = im.actualitemcode
          AND im.activeitem = 1
        INNER JOIN routemaster rm
          ON rm.routeitemgrpcode = map.routeitemgrpcode
          AND rm.routecode = :routeId
      )
    `,
    { routeId }
  );

  return rows;
}

async function getItemMaster(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        item.actualitemcode,
        item.itemgroupcode,
        item.itemtype,
        REPLACE(REPLACE(REPLACE(item.itemshortdescription, 'Â ', ''), 'Ã‰', ''), '''', '') AS itemshortdescription,
        REPLACE(REPLACE(REPLACE(REPLACE(item.itemdescription, 'Â ', ''), 'Ã‰', ''), '''', ''), 'Ã‚', '') AS itemdescription,
        item.unitspercase,
        item.defaultsalesprice,
        item.defaultreturnprice,
        REPLACE(REPLACE(REPLACE(item.barcode1, 'Ã‚', ''), 'Â ', ''), 'Ã‰', '') AS arbitemshortdescription,
        '' AS arbitemdescription,
        item.activeitem,
        item.caseprice,
        item.returncaseprice,
        item.alternatecode,
        IFNULL(item.memo1, 0) AS memo1,
        IFNULL(item.memo2, 0) AS memo2,
        item.tcallowed,
        item.printsequenceroute,
        item.printsequencecust,
        item.packagecode,
        item.warehousestock,
        item.defaultgoodreturnprice,
        item.defaultgoodreturncaseprice,
        item.allowbatchentry,
        REPLACE(REPLACE(REPLACE(TRIM(item.barcode1), 'Â ', '0'), 'Ã‰', ''), 'Ã‚', '') AS barcode1,
        IFNULL(item.barcode2, 0) AS barcode2,
        item.barcode3,
        item.majorcategorycode,
        item.majorcategorydesciption,
        item.submajorcategorycode,
        item.submajorcategorydesciption,
        item.companygroupcode,
        item.companygroupname,
        item.itemgroupname,
        item.enabletax,
        item.itemtaxkey1,
        item.itemtaxkey2,
        item.itemtaxkey3,
        IFNULL(CASE WHEN item.nrp_flag = 'Y' THEN 0 ELSE 1 END, 1) AS nrp_flag,
        IFNULL(CASE WHEN item.div_nrp_flag = 'Y' THEN 0 ELSE 1 END, 1) AS div_nrp_flag
      FROM itemmaster AS item
      LEFT JOIN routeitemmapping AS rim ON rim.itemcode = item.actualitemcode
      LEFT JOIN routemaster AS rm ON rm.routeitemgrpcode = rim.routeitemgrpcode
      WHERE item.activeitem = 1
      AND rm.routecode = :routeId
    `,
    { routeId }
  );

  return rows;
}

async function getItemPackageMaster(
  connection: PoolConnection
): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        packagecode,
        alternatecode,
        packagedescription,
        arbpackagedescription,
        activestatus
      FROM itempackagemaster
    `
  );

  return rows;
}

async function getRouteGoal(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        primary_key,
        routecode,
        salesmancode,
        packagenumber,
        fromdate,
        todate,
        quantity,
        achievequantity,
        todaysgoal,
        todaysachieve,
        targettype,
        commision,
        commisonpercent,
        insentive,
        insentivepercent,
        goaltype
      FROM routegoal
      WHERE routecode = :routeId
      AND CURDATE() BETWEEN fromdate AND todate
    `,
    { routeId }
  );

  return rows;
}

async function getAverageSalesQty(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT table_id, itemcode, routecode, itemqty
      FROM averagesalesqty
      WHERE routecode = :routeId
    `,
    { routeId }
  );

  return rows;
}

async function getOutletItemCodes(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        primary_key,
        groupcode,
        itemcode,
        outletitemcode,
        IFNULL(customercode, 0) AS customercode
      FROM outletitemcodes
      WHERE groupcode IN (
        SELECT outletsubtype
        FROM customermaster
        WHERE routecode = :routeId
        AND outletsubtype > 0
      )
      AND 1 = 0
      ORDER BY itemcode
    `,
    { routeId }
  );

  return rows;
}

async function getTaxMaster(connection: PoolConnection): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        taxcode,
        taxdescription,
        arbtaxdescription,
        taxtype,
        taxpercentage,
        taxbase
      FROM tbltaxmaster
    `
  );

  return rows;
}

async function getItemMustHeader(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  if (
    !(await tableExists(connection, 'itemmustheader')) ||
    !(await tableExists(connection, 'customermaster'))
  ) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT *
      FROM itemmustheader
      WHERE itemmustcode IN (
        SELECT DISTINCT itemmustkey
        FROM customermaster
        WHERE routecode = :routeId
      )
    `,
    { routeId }
  );

  return rows;
}

async function getItemMustDetail(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  if (
    !(await tableExists(connection, 'itemmustdetail')) ||
    !(await tableExists(connection, 'customermaster'))
  ) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT *
      FROM itemmustdetail
      WHERE itemmustcode IN (
        SELECT DISTINCT itemmustkey
        FROM customermaster
        WHERE routecode = :routeId
      )
    `,
    { routeId }
  );

  return rows;
}

async function getItemNrp(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  if (
    !(await tableExists(connection, 'itemmaster')) ||
    !(await tableExists(connection, 'divisionmaster')) ||
    !(await tableExists(connection, 'routeitemmapping')) ||
    !(await tableExists(connection, 'routemaster'))
  ) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        item.actualitemcode AS ACTUALITEMCODE,
        CASE WHEN item.NRP_FLAG = 'Y' THEN 0 ELSE 1 END AS ITEM_RET,
        dm.divisionname AS DIVISIONNAME,
        CASE WHEN dm.NRP_FLAG = 'Y' THEN 0 ELSE 1 END AS DIV_RET
      FROM itemmaster item
      INNER JOIN divisionmaster dm ON item.division = dm.divisionname
      LEFT JOIN routeitemmapping rim ON rim.itemcode = item.actualitemcode
      LEFT JOIN routemaster rm ON rm.routeitemgrpcode = rim.routeitemgrpcode
      WHERE rm.routecode = :routeId
    `,
    { routeId }
  );

  return rows;
}

async function getCustomerNrp(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  if (
    !(await tableExists(connection, 'customermaster')) ||
    !(await tableExists(connection, 'routesequence'))
  ) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT DISTINCT
        cn.customercode AS CUSTOMERCODE,
        CASE WHEN cn.nrp_flag = 'Y' THEN 0 ELSE 1 END AS CUST_RET
      FROM customermaster cn
      INNER JOIN routesequence rs ON cn.customercode = rs.customercode
      WHERE rs.routecode = :routeId
    `,
    { routeId }
  );

  return rows;
}

async function getCustomerItemGroups(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  if (
    !(await tableExists(connection, 'customeritemgrp')) ||
    !(await tableExists(connection, 'customermaster')) ||
    !(await tableExists(connection, 'routesequence'))
  ) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT DISTINCT
        cig.customeritemgrpcode,
        cig.categoryid,
        cig.itemgroupcode,
        cig.description,
        cig.created,
        cig.cdat,
        cig.modified,
        cig.mdat,
        cig.transferstatus
      FROM customeritemgrp cig
      INNER JOIN customermaster cm ON cm.itemmapkey = cig.customeritemgrpcode
      LEFT JOIN routesequence rs ON rs.customercode = cm.customercode
      WHERE rs.routecode = :routeId
      ORDER BY cig.customeritemgrpcode
    `,
    { routeId }
  );

  return rows;
}

async function getCustomerItemMap(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  if (
    !(await tableExists(connection, 'customeritemmapping')) ||
    !(await tableExists(connection, 'customeritemgrp')) ||
    !(await tableExists(connection, 'customermaster')) ||
    !(await tableExists(connection, 'routesequence'))
  ) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT DISTINCT
        cim.customeritemgrpcode,
        cim.itemcode,
        cim.transferstatus
      FROM customeritemmapping cim
      INNER JOIN customeritemgrp cig
        ON cim.customeritemgrpcode = cig.customeritemgrpcode
      INNER JOIN customermaster cm
        ON cm.itemmapkey = cig.customeritemgrpcode
      LEFT JOIN routesequence rs ON rs.customercode = cm.customercode
      WHERE rs.routecode = :routeId
      ORDER BY cim.itemcode
    `,
    { routeId }
  );

  return rows;
}

interface CustomerSyncInput {
  routeId: number;
}

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

async function getCustomerSyncSections(
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

  const customerMasterSql =
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
        UNION
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
      `
      : `
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

  const values =
    routeCustomerCodes.length > 0
      ? [defaultItemMustKey, division, ...routeCustomerCodes]
      : [];

  const [rows] = await connection.query<GenericRow[]>(customerMasterSql, values);
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

interface PromotionPricingSyncInput {
  routeId: number;
}


async function getPromotionPricingSyncSections(
  connection: PoolConnection,
  input: PromotionPricingSyncInput
): Promise<MasterDataSyncResponseSections> {
  const [
    discountKeyHeader,
    discountKeyDetail,
    distributionKeyDetails,
    productGroupHeader,
    productGroupDetail,
    promoKeyHeader,
    promoKeyDetail,
    promoPlanHeader,
    promoPlanDetail,
    promotionAssignmentAdvanced,
    customerPricing1,
    pricingDetail1
  ] = await Promise.all([
    getDiscountKeyHeader(connection),
    getDiscountKeyDetail(connection),
    getDistributionKeyDetails(connection),
    getProductGroupHeader(connection, input.routeId),
    getProductGroupDetail(connection, input.routeId),
    getPromoKeyHeader(connection, input.routeId),
    getPromoKeyDetail(connection, input.routeId),
    getPromoPlanHeader(connection, input.routeId),
    getPromoPlanDetail(connection, input.routeId),
    getPromotionAssignmentAdvanced(connection, input.routeId),
    getCustomerPricing1(connection, input.routeId),
    getPricingDetail1(connection, input.routeId)
  ]);

  return {
    discountkeyheader: discountKeyHeader,
    discountkeydetail: discountKeyDetail,
    distributionkeydetails: distributionKeyDetails,
    productgroupheader: productGroupHeader,
    productgroupdetail: productGroupDetail,
    promokeyheader: promoKeyHeader,
    promokeydetail: promoKeyDetail,
    promoplanheader: promoPlanHeader,
    promoplandetail: promoPlanDetail,
    promotionassignmentadvanced: promotionAssignmentAdvanced,
    customerpricing1: customerPricing1,
    pricingdetail1: pricingDetail1
  };
}

async function getDiscountKeyHeader(connection: PoolConnection): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT discountkey, description, arbdescription, startdate, enddate, active
      FROM discountkeyheader
      WHERE enddate >= CURRENT_DATE()
    `
  );

  return rows;
}

async function getDiscountKeyDetail(connection: PoolConnection): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT discountkey, actualitemcode, mindiscount, maxdiscount
      FROM discountkeydetail
    `
  );

  return rows;
}

async function getDistributionKeyDetails(
  connection: PoolConnection
): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT distributionkey, item, value
      FROM distributionkeydetails
    `
  );

  return rows;
}

async function getProductGroupHeader(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT DISTINCT pgh.*
      FROM productgroupheader pgh
      WHERE pgh.groupnumber IN (
        SELECT ppd.qualificationgroup
        FROM promokeyheader pkh
        INNER JOIN promokeydetail pkd
          ON pkh.promotionkey = pkd.promotionkey
          AND CURRENT_DATE() BETWEEN pkd.startdate AND pkd.enddate
        INNER JOIN promoplanheader pph ON pkd.plannumber = pph.plannumber
        INNER JOIN promoplandetail ppd ON pph.plannumber = ppd.plannumber
        WHERE pkh.promotionkey IN (
          SELECT DISTINCT cm.promotionkey
          FROM customermaster cm
          INNER JOIN routesequence rs
            ON cm.customercode = rs.customercode
            AND rs.routecode = :routeId
        )
        AND pkd.qualificationgroup IN (
          SELECT DISTINCT pgd.groupnumber
          FROM productgroupdetail pgd
          WHERE pgd.itemcode IN (
            SELECT DISTINCT rim.itemcode
            FROM routeitemmapping rim
            WHERE rim.routeitemgrpcode = (
              SELECT routeitemgrpcode
              FROM routemaster
              WHERE routecode = :routeId
              LIMIT 1
            )
          )
        )
        UNION
        SELECT ppd.assignmentgroup
        FROM promokeyheader pkh
        INNER JOIN promokeydetail pkd
          ON pkh.promotionkey = pkd.promotionkey
          AND CURRENT_DATE() BETWEEN pkd.startdate AND pkd.enddate
        INNER JOIN promoplanheader pph ON pkd.plannumber = pph.plannumber
        INNER JOIN promoplandetail ppd ON pph.plannumber = ppd.plannumber
        WHERE pkh.promotionkey IN (
          SELECT DISTINCT cm.promotionkey
          FROM customermaster cm
          INNER JOIN routesequence rs
            ON cm.customercode = rs.customercode
            AND rs.routecode = :routeId
        )
      )
    `,
    { routeId }
  );

  return rows;
}

async function getProductGroupDetail(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT DISTINCT pgd.*
      FROM productgroupdetail pgd
      WHERE pgd.groupnumber IN (
        SELECT ppd.qualificationgroup
        FROM promokeyheader pkh
        INNER JOIN promokeydetail pkd
          ON pkh.promotionkey = pkd.promotionkey
          AND CURRENT_DATE() BETWEEN pkd.startdate AND pkd.enddate
        INNER JOIN promoplanheader pph ON pkd.plannumber = pph.plannumber
        INNER JOIN promoplandetail ppd ON pph.plannumber = ppd.plannumber
        WHERE pkh.promotionkey IN (
          SELECT DISTINCT cm.promotionkey
          FROM customermaster cm
          INNER JOIN routesequence rs
            ON cm.customercode = rs.customercode
            AND rs.routecode = :routeId
        )
        UNION
        SELECT ppd.assignmentgroup
        FROM promokeyheader pkh
        INNER JOIN promokeydetail pkd
          ON pkh.promotionkey = pkd.promotionkey
          AND CURRENT_DATE() BETWEEN pkd.startdate AND pkd.enddate
        INNER JOIN promoplanheader pph ON pkd.plannumber = pph.plannumber
        INNER JOIN promoplandetail ppd ON pph.plannumber = ppd.plannumber
        WHERE pkh.promotionkey IN (
          SELECT DISTINCT cm.promotionkey
          FROM customermaster cm
          INNER JOIN routesequence rs
            ON cm.customercode = rs.customercode
            AND rs.routecode = :routeId
        )
      )
    `,
    { routeId }
  );

  return rows;
}

async function getPromoKeyHeader(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT pkh.promotionkey, pkh.description, pkh.arbdescription, pkh.activeindicator, pkh.type
      FROM promokeyheader pkh
      WHERE pkh.promotionkey IN (
        SELECT DISTINCT cm.promotionkey
        FROM customermaster cm
        INNER JOIN routesequence rs
          ON cm.customercode = rs.customercode
          AND rs.routecode = :routeId
      )
    `,
    { routeId }
  );

  return rows;
}

async function getPromoKeyDetail(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        pkd.primary_key,
        pkd.plannumber,
        pkd.promotionkey,
        pkd.startdate,
        pkd.enddate,
        pkd.promotiontypecode,
        pkd.qualificationgroup,
        pkd.assignmentgroup,
        pkd.assignmentnumber,
        pkd.performcriteriakey,
        pkd.rangebasis,
        pkd.amountbasis,
        pkd.exclusionoption,
        pkd.active,
        pkd.iscase
      FROM promokeyheader pkh
      INNER JOIN promokeydetail pkd
        ON pkh.promotionkey = pkd.promotionkey
        AND CURRENT_DATE() BETWEEN pkd.startdate AND pkd.enddate
      WHERE pkh.promotionkey IN (
        SELECT DISTINCT cm.promotionkey
        FROM customermaster cm
        INNER JOIN routesequence rs
          ON cm.customercode = rs.customercode
          AND rs.routecode = :routeId
      )
    `,
    { routeId }
  );

  return rows;
}

async function getPromoPlanHeader(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT DISTINCT
        pph.plannumber,
        pph.plandescription,
        pph.arbplandescription,
        pph.plantypecode,
        pph.activeindicator
      FROM promokeyheader pkh
      INNER JOIN promokeydetail pkd
        ON pkh.promotionkey = pkd.promotionkey
        AND CURRENT_DATE() BETWEEN pkd.startdate AND pkd.enddate
      INNER JOIN promoplanheader pph ON pkd.plannumber = pph.plannumber
      WHERE pkh.promotionkey IN (
        SELECT DISTINCT cm.promotionkey
        FROM customermaster cm
        INNER JOIN routesequence rs
          ON cm.customercode = rs.customercode
          AND rs.routecode = :routeId
      )
    `,
    { routeId }
  );

  return rows;
}

async function getPromoPlanDetail(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT DISTINCT
        ppd.plannumber,
        ppd.qualificationgroup,
        ppd.assignmentgroup,
        ppd.performcriteriakey,
        ppd.rangebasis,
        ppd.amountbasis,
        ppd.exclusionoption,
        ppd.assignmentnumber,
        ppd.plandescription,
        ppd.arbplandescription,
        ppd.promotiontypecode,
        ppd.rentindicator,
        ppd.iscase,
        ppd.onetimeuse,
        ppd.enforcepromotion
      FROM promokeyheader pkh
      INNER JOIN promokeydetail pkd
        ON pkh.promotionkey = pkd.promotionkey
        AND CURRENT_DATE() BETWEEN pkd.startdate AND pkd.enddate
      INNER JOIN promoplanheader pph ON pkd.plannumber = pph.plannumber
      INNER JOIN promoplandetail ppd ON pph.plannumber = ppd.plannumber
      WHERE pkh.promotionkey IN (
        SELECT DISTINCT cm.promotionkey
        FROM customermaster cm
        INNER JOIN routesequence rs
          ON cm.customercode = rs.customercode
          AND rs.routecode = :routeId
      )
    `,
    { routeId }
  );

  return rows;
}

async function getPromotionAssignmentAdvanced(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  const hasAdvancedAssignments = await tableExists(
    connection,
    'promotionassignmentadvanced'
  );

  if (!hasAdvancedAssignments) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT DISTINCT
        pa.range_id,
        pa.plannumber,
        pa.assignmentnumber,
        pa.rangelow,
        pa.rangehigh,
        pa.repeatingrange,
        pa.promotionamount
      FROM promokeyheader pkh
      INNER JOIN promokeydetail pkd
        ON pkh.promotionkey = pkd.promotionkey
        AND CURRENT_DATE() BETWEEN pkd.startdate AND pkd.enddate
      INNER JOIN promoplanheader pph ON pkd.plannumber = pph.plannumber
      INNER JOIN promotionassignmentadvanced pa ON pph.plannumber = pa.plannumber
      WHERE pkh.promotionkey IN (
        SELECT DISTINCT cm.promotionkey
        FROM customermaster cm
        INNER JOIN routesequence rs
          ON cm.customercode = rs.customercode
          AND rs.routecode = :routeId
      )
    `,
    { routeId }
  );

  return rows;
}

async function getCustomerPricing1(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        cp.primary_key,
        cp.pricingplankey,
        cp.customerpricingkey,
        cp.description,
        cp.startdate,
        cp.enddate,
        cp.arbdescription,
        cp.contractno,
        cp.active,
        cp.sequencecode
      FROM customerpricingplanheader1 cpph
      INNER JOIN customerpricing1 cp
        ON cpph.pricingplankey = cp.pricingplankey
        AND (cp.enddate >= CURRENT_DATE() OR cp.enddate = '0000-00-00 00:00:00')
      INNER JOIN pricingplanheader1 pph ON cp.customerpricingkey = pph.customerpricingkey
      WHERE cpph.pricingplankey IN (
        SELECT DISTINCT cm.pricingkey
        FROM customermaster cm
        INNER JOIN routesequence rs
          ON cm.customercode = rs.customercode
          AND rs.routecode = :routeId
      )
    `,
    { routeId }
  );

  return rows;
}

async function getPricingDetail1(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT DISTINCT
        pd.primary_key,
        pd.customerpricingkey,
        pd.itemcode,
        pd.salesprice,
        pd.returnprice,
        pd.retailprice,
        pd.salescaseprice,
        pd.returncaseprice,
        pd.unitspercase,
        pd.stdsalesunitprice,
        pd.stdreturnunitprice,
        pd.stdsalescaseprice,
        pd.stdreturncaseprice
      FROM customerpricingplanheader1 cpph
      INNER JOIN customerpricing1 cp
        ON cpph.pricingplankey = cp.pricingplankey
        AND (cp.enddate >= CURRENT_DATE() OR cp.enddate = '0000-00-00 00:00:00')
      INNER JOIN pricingplanheader1 pph ON cp.customerpricingkey = pph.customerpricingkey
      INNER JOIN pricingdetail1 pd ON cp.customerpricingkey = pd.customerpricingkey
      INNER JOIN routeitemmapping rit
        ON rit.itemcode = pd.itemcode
        AND rit.routeitemgrpcode = COALESCE((
          SELECT routeitemgrpcode
          FROM routemaster
          WHERE routecode = :routeId
          LIMIT 1
        ), 0)
      WHERE cpph.pricingplankey IN (
        SELECT DISTINCT cm.pricingkey
        FROM customermaster cm
        INNER JOIN routesequence rs
          ON cm.customercode = rs.customercode
          AND rs.routecode = :routeId
      )
    `,
    { routeId }
  );

  return rows;
}

async function getSurveySyncSections(
  connection: PoolConnection
): Promise<MasterDataSyncResponseSections> {
  const [
    posMaster,
    customerPosInventory,
    customerPosLimit,
    posInstructions,
    customerSurveyPlan,
    customerSurveyKeyPlan,
    customerSurveyKey,
    customerSurveyDefinition,
    customerSurveyDefAssign,
    lookupIndexDetail
  ] = await Promise.all([
    getPosMaster(connection),
    getCustomerPosInventory(connection),
    getCustomerPosLimit(connection),
    getPosInstructions(connection),
    getCustomerSurveyPlan(connection),
    getCustomerSurveyKeyPlan(connection),
    getCustomerSurveyKey(connection),
    getCustomerSurveyDefinition(connection),
    getCustomerSurveyDefAssign(connection),
    getLookupIndexDetail(connection)
  ]);

  return {
    POSmaster: posMaster,
    customerposinventory: customerPosInventory,
    customerposlimit: customerPosLimit,
    posinstructions: posInstructions,
    customersurveyplan: customerSurveyPlan,
    customersurveykeyplan: customerSurveyKeyPlan,
    customersurveykey: customerSurveyKey,
    customersurveydefinition: customerSurveyDefinition,
    customersurveydefassign: customerSurveyDefAssign,
    lookupindexdetail: lookupIndexDetail
  };
}

async function getPosMaster(connection: PoolConnection): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'posmaster'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        itemcode,
        alternatecode,
        itemdescription,
        arbitemdescription,
        itemvalue,
        inventorytype,
        created,
        cdat,
        modified,
        mdat,
        activestatus
      FROM posmaster
    `
  );

  return rows;
}

async function getCustomerPosInventory(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'customerposinventory'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT customercode, itemcode, quantity, serialnumber
      FROM customerposinventory
    `
  );

  return rows;
}

async function getCustomerPosLimit(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'customerposlimit'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT customercode, poslimit, posbalance
      FROM customerposlimit
    `
  );

  return rows;
}

async function getPosInstructions(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'posinstructions'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        posinstructioncode,
        posinstructionname,
        arbposinstructionname,
        created,
        cdat,
        modified,
        mdat
      FROM posinstructions
    `
  );

  return rows;
}

async function getCustomerSurveyPlan(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'customersurveyplan'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        surveyplankey,
        surveysequencenumber,
        surveymandatory,
        surveydescription,
        arbsurveydescription
      FROM customersurveyplan
    `
  );

  return rows;
}

async function getCustomerSurveyKeyPlan(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'customersurveykeyplan'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT primary_key, surveyplankey, surveykey
      FROM customersurveykeyplan
    `
  );

  return rows;
}

async function getCustomerSurveyKey(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'customersurveykey'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        surveykey,
        surveydescription,
        arbsurveydescription,
        surveyplankey,
        created,
        cdat,
        modified,
        mdat,
        activestatus
      FROM customersurveykey
    `
  );

  return rows;
}

async function getCustomerSurveyDefinition(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'customersurveydefinition'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        surveydefkey,
        surveyindex,
        lineindex,
        surveyrectype,
        surveyprompt,
        arbsurveyprompt,
        responselength,
        responsedecimalpos,
        lookuptype,
        lookupindex,
        retainvalue,
        activestatus,
        created,
        cdat,
        modified,
        mdat
      FROM customersurveydefinition
    `
  );

  return rows;
}

async function getCustomerSurveyDefAssign(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'customersurveydefassign'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT surveyplankey, surveydefkey
      FROM customersurveydefassign
    `
  );

  return rows;
}

async function getLookupIndexDetail(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'lookupindexdetail'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT primary_key, transactionkey, description, arbdescription
      FROM lookupindexdetail
    `
  );

  return rows;
}

interface ReasonSyncInput {
  routeId: number;
}


async function getReasonSyncSections(
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

async function getOtherSyncSections(
  connection: PoolConnection
): Promise<MasterDataSyncResponseSections> {
  const [
    customerMessages,
    salesmanMessages,
    vanMaster,
    bankMaster,
    cashDescription,
    inventoryLocation
  ] = await Promise.all([
    getCustomerMessages(connection),
    getSalesmanMessages(connection),
    getVanMaster(connection),
    getBankMaster(connection),
    getCashDescription(connection),
    getInventoryLocation(connection)
  ]);

  return {
    customermessages: customerMessages,
    salesmanmessages: salesmanMessages,
    vanmaster: vanMaster,
    bankmaster: bankMaster,
    cashdesc: cashDescription,
    inventorylocation: inventoryLocation
  };
}

async function getCustomerMessages(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'customermessages'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        messagekey,
        alternatecode,
        messagedescription,
        messageline1,
        messageline2,
        messageline3,
        messageline4,
        arbmessageline1,
        arbmessageline2,
        arbmessageline3,
        arbmessageline4,
        created,
        cdat,
        modified,
        mdat,
        activestatus
      FROM customermessages
    `
  );

  return rows;
}

async function getSalesmanMessages(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'salesmanmessages'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        messagekey,
        alternatecode,
        messagedescription,
        message1,
        message2,
        message3,
        message4,
        arbmessageline1,
        arbmessageline2,
        arbmessageline3,
        arbmessageline4,
        created,
        cdat,
        modified,
        mdat,
        activestatus
      FROM salesmanmessages
    `
  );

  return rows;
}

async function getVanMaster(connection: PoolConnection): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'vanmaster'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        vancode,
        alternatecode,
        vandescription,
        arbvandescription,
        activestatus,
        vanregno,
        vanmodel,
        vantype,
        created,
        cdat,
        modified,
        mdat
      FROM vanmaster
    `
  );

  return rows;
}

async function getBankMaster(connection: PoolConnection): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'bankmaster'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        bankcode,
        bankname,
        arbbankname,
        bankbalance,
        created,
        cdat,
        modified,
        mdat,
        activestatus,
        alternatecode,
        type,
        acnumber
      FROM bankmaster
    `
  );

  return rows;
}

async function getCashDescription(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'cashdesc'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT code, alternatecode, description, arbdescription, hhcdescription, created, cdat, modified, mdat
      FROM cashdesc
    `
  );

  return rows;
}

async function getInventoryLocation(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'inventorylocation'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT code, alternatecode, description, arbdescription, hhcdescription
      FROM inventorylocation
    `
  );

  return rows;
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

