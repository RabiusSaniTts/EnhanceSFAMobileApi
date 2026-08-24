import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import type { MasterDataSyncResponseSections } from '../masterdatasync.types';

interface PromotionPricingSyncInput {
  routeId: number;
}

type GenericRow = RowDataPacket & Record<string, unknown>;

export async function getPromotionPricingSyncSections(
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
