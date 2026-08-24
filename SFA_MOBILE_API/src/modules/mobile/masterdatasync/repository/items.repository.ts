import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import type { MasterDataSyncResponseSections } from '../masterdatasync.types';

interface ItemSyncInput {
  routeId: number;
}

type GenericRow = RowDataPacket & Record<string, unknown>;

export async function getItemSyncSections(
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
    customerNrp
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
    getCustomerNrp(connection, input.routeId)
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
    custnrp: customerNrp
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
