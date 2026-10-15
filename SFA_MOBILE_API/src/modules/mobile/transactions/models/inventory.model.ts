/**
 * @author MD.Rabius Sani Raju
 * @date 2026-10-15
 */

import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { nullable, required } from '../../../../shared/utils/commonUtils';
/** Saves an inventory transaction header and returns its detail key. */
export async function saveInventoryTransactionHeader(connection: PoolConnection, item: Record<string, any>): Promise<number> {
    const existingDetailKey = await getInventoryDetailKey(connection, required(item.documentnumber));
    if (existingDetailKey !== null) {
        return existingDetailKey;
    }
    const [insertResult] = await connection.execute<ResultSetHeader>(`
      INSERT INTO inventorytransactionheader SET
        inventorykey = :inventoryKey, routekey = :routeKey, transactiontype = :transactionType,
        routecode = :routeCode, salesmancode = :salesmanCode, transactiondate = :transactionDate,
        transactiontime = :transactionTime, documentnumber = :documentNumber,
        odometerreading = :odometerReading,
        transferlocationcode = CASE
          WHEN :transactionType = 4 AND :transferLocationCode = 0 THEN 1
          ELSE :transferLocationCode
        END,
        referencenumber = :referenceNumber, requestdate = :requestDate,
        deliverydate = IF(:transactionType < 4, :transactionDate, :requestDate + INTERVAL 1 DAY),
        securitycode = :securityCode, transmitindicator = :transmitIndicator,
        voidflag = :voidFlag, hhcdocumentnumber = :documentNumber, loadnumber = :loadNumber,
        refdocumentnumber = :refDocumentNumber, currencycode = get_default_currencycode_routecode(:routeCode),
        actualtransactiondate = :actualTransactionDate, inventorynumber = :documentNumber,
        data = :data, record_flag = '1', isurgent = :isUrgent, receivedtime = NOW(),
        EG_LR_APPROVED = (
          CASE
            WHEN :transactionType = 4
              AND EXISTS (
                SELECT 1
                FROM routemaster
                WHERE divisioncode IN (SELECT divisioncode FROM divison_approval_control)
                AND routecode = :routeCode
              )
            THEN 0
            ELSE 1
          END
        )
    `, {
        inventoryKey: required(item.inventorykey),
        routeKey: required(item.routekey),
        transactionType: required(item.transactiontype),
        routeCode: required(item.routecode),
        salesmanCode: nullable(item.salesmancode),
        transactionDate: required(item.transactiondate),
        transactionTime: nullable(item.transactiontime),
        documentNumber: required(item.documentnumber),
        odometerReading: nullable(item.odometerreading),
        transferLocationCode: nullable(item.transferlocationcode),
        referenceNumber: nullable(item.referencenumber),
        requestDate: nullable(item.requestdate),
        securityCode: nullable(item.securitycode),
        transmitIndicator: nullable(item.transmitindicator),
        voidFlag: nullable(item.voidflag),
        loadNumber: nullable(item.loadnumber),
        refDocumentNumber: nullable(item.refdocumentnumber),
        actualTransactionDate: nullable(item.actualtransactiondate),
        data: nullable(item.data),
        isUrgent: nullable(item.isurgent)
    });
    if (Number(item.loadnumber ?? 0) > 0) {
        await connection.execute(`
        UPDATE startingloaddetail
        SET status = 1
        WHERE routecode = :routeCode
        AND loadperiodnumber = :loadNumber
      `, {
            routeCode: required(item.routecode),
            loadNumber: required(item.loadnumber)
        });
    }
    return insertResult.insertId;
}
/** Saves one inventory movement linked to its parent detail key. */
export async function saveInventoryTransactionDetail(connection: PoolConnection, item: Record<string, any>, detailKey: number): Promise<boolean> {
    const params = {
        routeKey: required(item.routekey),
        detailKey,
        transactionTypeCode: required(item.transactiontypecode),
        itemCode: required(item.itemcode),
        quantity: nullable(item.quantity),
        requestedQty: nullable(item.quantity),
        weighted: nullable(item.weighted),
        itemPrice: nullable(item.itemprice),
        batchDetailKey: nullable(item.batchdetailkey),
        itemCasePrice: nullable(item.itemcaseprice),
        expiryDate: nullable(item.expirydate),
        reasonCode: nullable(item.reasoncode)
    };
    const [rows] = await connection.execute<(RowDataPacket & {
        count: number;
    })[]>(`
      SELECT COUNT(*) AS count
      FROM inventorytransactiondetail
      WHERE itemcode = :itemCode
      AND routekey = :routeKey
      AND detailkey = :detailKey
      AND transactiontypecode = :transactionTypeCode
    `, params);
    if (Number(rows[0]?.count ?? 0) === 0) {
        await connection.execute(`
        INSERT INTO inventorytransactiondetail SET
          routekey = :routeKey, detailkey = :detailKey, transactiontypecode = :transactionTypeCode,
          itemcode = :itemCode, quantity = :quantity, requestedqty = :requestedQty,
          weighted = :weighted, itemprice = :itemPrice, batchdetailkey = :batchDetailKey,
          itemcaseprice = :itemCasePrice, currencycode = get_default_currencycode_routekey(:routeKey),
          record_flag = '1', expirydate = :expiryDate, reasoncode = :reasonCode
      `, params);
    }
    else {
        await connection.execute(`
        UPDATE inventorytransactiondetail SET
          quantity = :quantity, requestedqty = :requestedQty, weighted = :weighted,
          itemprice = :itemPrice, batchdetailkey = :batchDetailKey,
          itemcaseprice = :itemCasePrice, currencycode = get_default_currencycode_routekey(:routeKey),
          expirydate = :expiryDate, reasoncode = :reasonCode
        WHERE itemcode = :itemCode
        AND routekey = :routeKey
        AND detailkey = :detailKey
        AND record_flag = '1'
        AND transactiontypecode = :transactionTypeCode
      `, params);
    }
    return Number(item.routekey) > 0;
}
/** Inserts or updates the route inventory summary reported by mobile. */
export async function saveInventorySummaryDetail(connection: PoolConnection, item: Record<string, any>): Promise<boolean> {
    const params = {
        inventorykey: required(item.inventorykey),
        itemcode: required(item.itemcode),
        routekey: required(item.routekey),
        weighted: nullable(item.weighted),
        beginstockqty: nullable(item.beginstockqty),
        loadqty: nullable(item.loadqty),
        loadaddqty: nullable(item.loadaddqty),
        loadcutqty: nullable(item.loadcutqty),
        loadreqqty: nullable(item.loadreqqty),
        saleqty: nullable(item.saleqty),
        returnqty: nullable(item.returnqty),
        damagedaddqty: nullable(item.damagedaddqty),
        damagedcutqty: nullable(item.damagedcutqty),
        endstockqty: nullable(item.endstockqty),
        unloadqty: nullable(item.unloadqty),
        damagedunloadqty: nullable(item.damagedunloadqty),
        freesampleqty: nullable(item.freesampleqty),
        truckdamagedunloadqty: nullable(item.truckdamagedunloadqty),
        stdsalesprice: nullable(item.stdsalesprice),
        stdreturnprice: nullable(item.stdreturnprice),
        cashsalesqty: nullable(item.cashsalesqty),
        cashsalesvalue: nullable(item.cashsalesvalue),
        tcsalesqty: nullable(item.tcsalesqty),
        tcsalesvalue: nullable(item.tcsalesvalue),
        gcsalesqty: nullable(item.gcsalesqty),
        gcsalesvalue: nullable(item.gcsalesvalue),
        cashdamagedqty: nullable(item.cashdamagedqty),
        cashdamagedvalue: nullable(item.cashdamagedvalue),
        tcdamagedqty: nullable(item.tcdamagedqty),
        tcdamagedvalue: nullable(item.tcdamagedvalue),
        gcdamagedqty: nullable(item.gcdamagedqty),
        gcdamagedvalue: nullable(item.gcdamagedvalue),
        cashreturnqty: nullable(item.cashreturnqty),
        cashreturnvalue: nullable(item.cashreturnvalue),
        tcreturnqty: nullable(item.tcreturnqty),
        tcreturnvalue: nullable(item.tcreturnvalue),
        gcreturnqty: nullable(item.gcreturnqty),
        gcreturnvalue: nullable(item.gcreturnvalue),
        promoqty: nullable(item.promoqty),
        cashsalesitemexcisetax: nullable(item.cashsalesitemexcisetax),
        cashsalesitemgsttax: nullable(item.cashsalesitemgsttax),
        cashreturnitemexcisetax: nullable(item.cashreturnitemexcisetax),
        cashreturnitemgsttax: nullable(item.cashreturnitemgsttax),
        cashdamageditemexcisetax: nullable(item.cashdamageditemexcisetax),
        cashdamageditemgsttax: nullable(item.cashdamageditemgsttax),
        cashfgitemexcisetax: nullable(item.cashfgitemexcisetax),
        cashfgitemgsttax: nullable(item.cashfgitemgsttax),
        cashpromoitemexcisetax: nullable(item.cashpromoitemexcisetax),
        cashpromoitemgsttax: nullable(item.cashpromoitemgsttax),
        tcsalesitemexcisetax: nullable(item.tcsalesitemexcisetax),
        tcsalesitemgsttax: nullable(item.tcsalesitemgsttax),
        tcreturnitemexcisetax: nullable(item.tcreturnitemexcisetax),
        tcreturnitemgsttax: nullable(item.tcreturnitemgsttax),
        tcdamageditemexcisetax: nullable(item.tcdamageditemexcisetax),
        tcdamageditemgsttax: nullable(item.tcdamageditemgsttax),
        tcfgitemexcisetax: nullable(item.tcfgitemexcisetax),
        tcfgitemgsttax: nullable(item.tcfgitemgsttax),
        tcpromoitemexcisetax: nullable(item.tcpromoitemexcisetax),
        tcpromoitemgsttax: nullable(item.tcpromoitemgsttax),
        gcsalesitemexcisetax: nullable(item.gcsalesitemexcisetax),
        gcsalesitemgsttax: nullable(item.gcsalesitemgsttax),
        gcreturnitemexcisetax: nullable(item.gcreturnitemexcisetax),
        gcreturnitemgsttax: nullable(item.gcreturnitemgsttax),
        gcdamageditemexcisetax: nullable(item.gcdamageditemexcisetax),
        gcdamageditemgsttax: nullable(item.gcdamageditemgsttax),
        gcfgitemexcisetax: nullable(item.gcfgitemexcisetax),
        gcfgitemgsttax: nullable(item.gcfgitemgsttax),
        gcpromoitemexcisetax: nullable(item.gcpromoitemexcisetax),
        gcpromoitemgsttax: nullable(item.gcpromoitemgsttax),
        batchdetailkey: nullable(item.batchdetailkey),
        stdsalescaseprice: nullable(item.stdsalescaseprice),
        stdreturncaseprice: nullable(item.stdreturncaseprice),
        expiryqty: nullable(item.expiryqty),
        stdgoodreturncaseprice: nullable(item.stdgoodreturncaseprice),
        stdgoodreturnprice: nullable(item.stdgoodreturnprice),
        returnfreeqty: nullable(item.returnfreeqty),
        damageqty: nullable(item.damageqty),
        expdmgfreeqty: nullable(item.expdmgfreeqty),
        expunloadqty: nullable(item.expunloadqty),
        dmgunloadqty: nullable(item.dmgunloadqty),
        expdmgfreeunloadqty: nullable(item.expdmgfreeunloadqty),
        rentqty: nullable(item.rentqty),
        loadadjustqty: nullable(item.loadadjustqty)
    };

    const [rows] = await connection.execute<(RowDataPacket & {
        count: number;
    })[]>(`
      SELECT COUNT(*) AS count
      FROM inventorysummarydetail
      WHERE itemcode = :itemcode
      AND routekey = :routekey
      AND record_flag = '1'
    `, params);

    if (Number(rows[0]?.count ?? 0) === 0) {
        await connection.execute(`
        INSERT INTO inventorysummarydetail SET
          inventorykey = :inventorykey,
          itemcode = :itemcode,
          routekey = :routekey,
          weighted = :weighted,
          beginstockqty = :beginstockqty,
          loadqty = :loadqty,
          loadaddqty = :loadaddqty,
          loadcutqty = :loadcutqty,
          loadreqqty = :loadreqqty,
          saleqty = :saleqty,
          returnqty = :returnqty,
          damagedaddqty = :damagedaddqty,
          damagedcutqty = :damagedcutqty,
          endstockqty = :endstockqty,
          unloadqty = :unloadqty,
          damagedunloadqty = :damagedunloadqty,
          freesampleqty = :freesampleqty,
          truckdamagedunloadqty = :truckdamagedunloadqty,
          stdsalesprice = :stdsalesprice,
          stdreturnprice = :stdreturnprice,
          cashsalesqty = :cashsalesqty,
          cashsalesvalue = :cashsalesvalue,
          tcsalesqty = :tcsalesqty,
          tcsalesvalue = :tcsalesvalue,
          gcsalesqty = :gcsalesqty,
          gcsalesvalue = :gcsalesvalue,
          cashdamagedqty = :cashdamagedqty,
          cashdamagedvalue = :cashdamagedvalue,
          tcdamagedqty = :tcdamagedqty,
          tcdamagedvalue = :tcdamagedvalue,
          gcdamagedqty = :gcdamagedqty,
          gcdamagedvalue = :gcdamagedvalue,
          cashreturnqty = :cashreturnqty,
          cashreturnvalue = :cashreturnvalue,
          tcreturnqty = :tcreturnqty,
          tcreturnvalue = :tcreturnvalue,
          gcreturnqty = :gcreturnqty,
          gcreturnvalue = :gcreturnvalue,
          promoqty = :promoqty,
          cashsalesitemexcisetax = :cashsalesitemexcisetax,
          cashsalesitemgsttax = :cashsalesitemgsttax,
          cashreturnitemexcisetax = :cashreturnitemexcisetax,
          cashreturnitemgsttax = :cashreturnitemgsttax,
          cashdamageditemexcisetax = :cashdamageditemexcisetax,
          cashdamageditemgsttax = :cashdamageditemgsttax,
          cashfgitemexcisetax = :cashfgitemexcisetax,
          cashfgitemgsttax = :cashfgitemgsttax,
          cashpromoitemexcisetax = :cashpromoitemexcisetax,
          cashpromoitemgsttax = :cashpromoitemgsttax,
          tcsalesitemexcisetax = :tcsalesitemexcisetax,
          tcsalesitemgsttax = :tcsalesitemgsttax,
          tcreturnitemexcisetax = :tcreturnitemexcisetax,
          tcreturnitemgsttax = :tcreturnitemgsttax,
          tcdamageditemexcisetax = :tcdamageditemexcisetax,
          tcdamageditemgsttax = :tcdamageditemgsttax,
          tcfgitemexcisetax = :tcfgitemexcisetax,
          tcfgitemgsttax = :tcfgitemgsttax,
          tcpromoitemexcisetax = :tcpromoitemexcisetax,
          tcpromoitemgsttax = :tcpromoitemgsttax,
          gcsalesitemexcisetax = :gcsalesitemexcisetax,
          gcsalesitemgsttax = :gcsalesitemgsttax,
          gcreturnitemexcisetax = :gcreturnitemexcisetax,
          gcreturnitemgsttax = :gcreturnitemgsttax,
          gcdamageditemexcisetax = :gcdamageditemexcisetax,
          gcdamageditemgsttax = :gcdamageditemgsttax,
          gcfgitemexcisetax = :gcfgitemexcisetax,
          gcfgitemgsttax = :gcfgitemgsttax,
          gcpromoitemexcisetax = :gcpromoitemexcisetax,
          gcpromoitemgsttax = :gcpromoitemgsttax,
          batchdetailkey = :batchdetailkey,
          stdsalescaseprice = :stdsalescaseprice,
          stdreturncaseprice = :stdreturncaseprice,
          expiryqty = :expiryqty,
          stdgoodreturncaseprice = :stdgoodreturncaseprice,
          stdgoodreturnprice = :stdgoodreturnprice,
          returnfreeqty = :returnfreeqty,
          damageqty = :damageqty,
          expdmgfreeqty = :expdmgfreeqty,
          expunloadqty = :expunloadqty,
          dmgunloadqty = :dmgunloadqty,
          expdmgfreeunloadqty = :expdmgfreeunloadqty,
          rentqty = :rentqty,
          loadadjustqty = :loadadjustqty,
          currencycode = get_default_currencycode_routekey(:routekey),
          mdat = CURRENT_DATE(),
          vanstock = (
            beginstockqty + loadqty + loadaddqty - loadcutqty
            - saleqty + returnqty - freesampleqty - promoqty
          ),
          vanstockvalue = (
            beginstockqty + loadqty + loadaddqty - loadcutqty
            - saleqty + returnqty - freesampleqty - promoqty
          ) * :stdsalesprice,
          record_flag = '1'
      `, params);
    }
    else {
        await connection.execute(`
        UPDATE inventorysummarydetail SET
          inventorykey = :inventorykey,
          itemcode = :itemcode,
          routekey = :routekey,
          weighted = :weighted,
          beginstockqty = :beginstockqty,
          loadqty = :loadqty,
          loadaddqty = :loadaddqty,
          loadcutqty = :loadcutqty,
          loadreqqty = :loadreqqty,
          saleqty = :saleqty,
          returnqty = :returnqty,
          damagedaddqty = :damagedaddqty,
          damagedcutqty = :damagedcutqty,
          endstockqty = :endstockqty,
          unloadqty = :unloadqty,
          damagedunloadqty = :damagedunloadqty,
          freesampleqty = :freesampleqty,
          truckdamagedunloadqty = :truckdamagedunloadqty,
          stdsalesprice = :stdsalesprice,
          stdreturnprice = :stdreturnprice,
          cashsalesqty = :cashsalesqty,
          cashsalesvalue = :cashsalesvalue,
          tcsalesqty = :tcsalesqty,
          tcsalesvalue = :tcsalesvalue,
          gcsalesqty = :gcsalesqty,
          gcsalesvalue = :gcsalesvalue,
          cashdamagedqty = :cashdamagedqty,
          cashdamagedvalue = :cashdamagedvalue,
          tcdamagedqty = :tcdamagedqty,
          tcdamagedvalue = :tcdamagedvalue,
          gcdamagedqty = :gcdamagedqty,
          gcdamagedvalue = :gcdamagedvalue,
          cashreturnqty = :cashreturnqty,
          cashreturnvalue = :cashreturnvalue,
          tcreturnqty = :tcreturnqty,
          tcreturnvalue = :tcreturnvalue,
          gcreturnqty = :gcreturnqty,
          gcreturnvalue = :gcreturnvalue,
          promoqty = :promoqty,
          cashsalesitemexcisetax = :cashsalesitemexcisetax,
          cashsalesitemgsttax = :cashsalesitemgsttax,
          cashreturnitemexcisetax = :cashreturnitemexcisetax,
          cashreturnitemgsttax = :cashreturnitemgsttax,
          cashdamageditemexcisetax = :cashdamageditemexcisetax,
          cashdamageditemgsttax = :cashdamageditemgsttax,
          cashfgitemexcisetax = :cashfgitemexcisetax,
          cashfgitemgsttax = :cashfgitemgsttax,
          cashpromoitemexcisetax = :cashpromoitemexcisetax,
          cashpromoitemgsttax = :cashpromoitemgsttax,
          tcsalesitemexcisetax = :tcsalesitemexcisetax,
          tcsalesitemgsttax = :tcsalesitemgsttax,
          tcreturnitemexcisetax = :tcreturnitemexcisetax,
          tcreturnitemgsttax = :tcreturnitemgsttax,
          tcdamageditemexcisetax = :tcdamageditemexcisetax,
          tcdamageditemgsttax = :tcdamageditemgsttax,
          tcfgitemexcisetax = :tcfgitemexcisetax,
          tcfgitemgsttax = :tcfgitemgsttax,
          tcpromoitemexcisetax = :tcpromoitemexcisetax,
          tcpromoitemgsttax = :tcpromoitemgsttax,
          gcsalesitemexcisetax = :gcsalesitemexcisetax,
          gcsalesitemgsttax = :gcsalesitemgsttax,
          gcreturnitemexcisetax = :gcreturnitemexcisetax,
          gcreturnitemgsttax = :gcreturnitemgsttax,
          gcdamageditemexcisetax = :gcdamageditemexcisetax,
          gcdamageditemgsttax = :gcdamageditemgsttax,
          gcfgitemexcisetax = :gcfgitemexcisetax,
          gcfgitemgsttax = :gcfgitemgsttax,
          gcpromoitemexcisetax = :gcpromoitemexcisetax,
          gcpromoitemgsttax = :gcpromoitemgsttax,
          batchdetailkey = :batchdetailkey,
          stdsalescaseprice = :stdsalescaseprice,
          stdreturncaseprice = :stdreturncaseprice,
          expiryqty = :expiryqty,
          stdgoodreturncaseprice = :stdgoodreturncaseprice,
          stdgoodreturnprice = :stdgoodreturnprice,
          returnfreeqty = :returnfreeqty,
          damageqty = :damageqty,
          expdmgfreeqty = :expdmgfreeqty,
          expunloadqty = :expunloadqty,
          dmgunloadqty = :dmgunloadqty,
          expdmgfreeunloadqty = :expdmgfreeunloadqty,
          rentqty = :rentqty,
          loadadjustqty = :loadadjustqty,
          currencycode = get_default_currencycode_routekey(:routekey),
          mdat = CURRENT_DATE(),
          vanstock = (
            beginstockqty + loadqty + loadaddqty - loadcutqty
            - saleqty + returnqty - freesampleqty - promoqty + returnfreeqty
          ),
          vanstockvalue = (
            beginstockqty + loadqty + loadaddqty - loadcutqty
            - saleqty + returnqty - freesampleqty - promoqty + returnfreeqty
          ) * :stdsalesprice
        WHERE itemcode = :itemcode
        AND routekey = :routekey
        AND record_flag = '1'
      `, params);
    }

    return Number(item.routekey) > 0;
}
/** Finds an existing inventory key by document number for retry handling. */
async function getInventoryDetailKey(connection: PoolConnection, documentNumber: string | number): Promise<number | null> {
    const [rows] = await connection.execute<(RowDataPacket & {
        transactionkey: number;
    })[]>(`
      SELECT detailkey AS transactionkey
      FROM inventorytransactionheader
      WHERE documentnumber = :documentNumber
      LIMIT 1
    `, { documentNumber });
    return rows[0]?.transactionkey ?? null;
}
