import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import type { MasterDataSyncResponseSections } from '../masterdatasync.types';

interface InventorySyncInput {
  routeId: number;
}

type GenericRow = RowDataPacket & Record<string, unknown>;

export async function getInventorySyncSections(
  connection: PoolConnection,
  input: InventorySyncInput
): Promise<MasterDataSyncResponseSections> {
  const [startingLoadDetail, inventorySummaryDetail] = await Promise.all([
    getStartingLoadDetail(connection, input.routeId),
    getInventorySummaryDetail(connection, input.routeId)
  ]);

  return {
    startingloaddetail: startingLoadDetail,
    inventorysummarydetail: inventorySummaryDetail
  };
}

async function getStartingLoadDetail(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        itemcode,
        routecode,
        ddate,
        caseprice,
        loadperiodnumber,
        cases,
        units,
        totunits,
        suggtotunits,
        rcvdtotunits,
        upc,
        loadtime,
        salesmancode,
        salesprice,
        returnprice,
        status,
        transactiondate,
        erpreferencenumber,
        currencycode,
        batchnumber,
        expirydate,
        warehouse,
        warehousestock,
        mdat
      FROM startingloaddetail
      WHERE routecode = :routeId
      AND status = 0
      AND ddate = CURDATE()
      AND totunits > 0
    `,
    { routeId }
  );

  return rows;
}

async function getInventorySummaryDetail(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        isd.inventorykey,
        isd.itemcode,
        isd.routekey,
        isd.weighted,
        isd.beginstockqty,
        isd.loadqty,
        isd.loadaddqty,
        isd.loadcutqty,
        isd.loadreqqty,
        isd.saleqty,
        isd.returnqty,
        isd.damagedaddqty,
        isd.damagedcutqty,
        isd.endstockqty,
        isd.unloadqty,
        isd.damagedunloadqty,
        isd.freesampleqty,
        isd.truckdamagedunloadqty,
        isd.stdsalesprice,
        isd.stdreturnprice,
        isd.cashsalesqty,
        isd.cashsalesvalue,
        isd.tcsalesqty,
        isd.tcsalesvalue,
        isd.gcsalesqty,
        isd.gcsalesvalue,
        isd.cashdamagedqty,
        isd.cashdamagedvalue,
        isd.tcdamagedqty,
        isd.tcdamagedvalue,
        isd.gcdamagedqty,
        isd.gcdamagedvalue,
        isd.cashreturnqty,
        isd.cashreturnvalue,
        isd.tcreturnqty,
        isd.tcreturnvalue,
        isd.gcreturnqty,
        isd.gcreturnvalue,
        isd.promoqty,
        isd.cashsalesitemexcisetax,
        isd.cashsalesitemgsttax,
        isd.cashreturnitemexcisetax,
        isd.cashreturnitemgsttax,
        isd.cashdamageditemexcisetax,
        isd.cashdamageditemgsttax,
        isd.cashfgitemexcisetax,
        isd.cashfgitemgsttax,
        isd.cashpromoitemexcisetax,
        isd.cashpromoitemgsttax,
        isd.tcsalesitemexcisetax,
        isd.tcsalesitemgsttax,
        isd.tcreturnitemexcisetax,
        isd.tcreturnitemgsttax,
        isd.tcdamageditemexcisetax,
        isd.tcdamageditemgsttax,
        isd.tcfgitemexcisetax,
        isd.tcfgitemgsttax,
        isd.tcpromoitemexcisetax,
        isd.tcpromoitemgsttax,
        isd.gcsalesitemexcisetax,
        isd.gcsalesitemgsttax,
        isd.gcreturnitemexcisetax,
        isd.gcreturnitemgsttax,
        isd.gcdamageditemexcisetax,
        isd.gcdamageditemgsttax,
        isd.gcfgitemexcisetax,
        isd.gcfgitemgsttax,
        isd.gcpromoitemexcisetax,
        isd.gcpromoitemgsttax,
        isd.batchdetailkey,
        isd.stdsalescaseprice,
        isd.stdreturncaseprice,
        isd.expiryqty,
        isd.stdgoodreturncaseprice,
        isd.stdgoodreturnprice,
        isd.currencycode,
        isd.returnfreeqty,
        isd.damageqty,
        isd.expdmgfreeqty,
        isd.expunloadqty,
        isd.dmgunloadqty,
        isd.expdmgfreeunloadqty,
        isd.rentqty,
        isd.mdat
      FROM inventorysummarydetail AS isd
      WHERE isd.routekey = (
        SELECT MAX(sed.routekey)
        FROM startendday sed
        WHERE sed.routecode = :routeId
      )
    `,
    { routeId }
  );

  return rows;
}
