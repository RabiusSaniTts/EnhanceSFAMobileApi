import type { PoolConnection, ResultSetHeader } from 'mysql2/promise';
import type {
  InventorySummaryDetailUploadItem,
  InventoryTransactionDetailUploadItem,
  InventoryTransactionHeaderUploadItem
} from '../transactions.types';
import type {
  CountRow,
  TransactionKeyRow
} from './shared.repository';
import { nullable, required } from './shared.repository';

export async function saveInventoryTransactionHeader(
  connection: PoolConnection,
  item: InventoryTransactionHeaderUploadItem
): Promise<number> {
  const existingDetailKey = await getInventoryDetailKey(connection, required(item.documentnumber));

  if (existingDetailKey !== null) {
    return existingDetailKey;
  }

  const [insertResult] = await connection.execute<ResultSetHeader>(
    `
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
    `,
    mapInventoryTransactionHeaderParams(item)
  );

  if (Number(item.loadnumber ?? 0) > 0) {
    await connection.execute(
      `
        UPDATE startingloaddetail
        SET status = 1
        WHERE routecode = :routeCode
        AND loadperiodnumber = :loadNumber
      `,
      {
        routeCode: required(item.routecode),
        loadNumber: required(item.loadnumber)
      }
    );
  }

  return insertResult.insertId;
}

export async function saveInventoryTransactionDetail(
  connection: PoolConnection,
  item: InventoryTransactionDetailUploadItem,
  detailKey: number
): Promise<boolean> {
  const params = mapInventoryTransactionDetailParams(item, detailKey);
  const [rows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS count
      FROM inventorytransactiondetail
      WHERE itemcode = :itemCode
      AND routekey = :routeKey
      AND detailkey = :detailKey
      AND transactiontypecode = :transactionTypeCode
    `,
    params
  );

  if (Number(rows[0]?.count ?? 0) === 0) {
    await connection.execute(
      `
        INSERT INTO inventorytransactiondetail SET
          routekey = :routeKey, detailkey = :detailKey, transactiontypecode = :transactionTypeCode,
          itemcode = :itemCode, quantity = :quantity, requestedqty = :requestedQty,
          weighted = :weighted, itemprice = :itemPrice, batchdetailkey = :batchDetailKey,
          itemcaseprice = :itemCasePrice, currencycode = get_default_currencycode_routekey(:routeKey),
          record_flag = '1', expirydate = :expiryDate, reasoncode = :reasonCode
      `,
      params
    );
  } else {
    await connection.execute(
      `
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
      `,
      params
    );
  }

  return Number(item.routekey) > 0;
}

export async function saveInventorySummaryDetail(
  connection: PoolConnection,
  item: InventorySummaryDetailUploadItem
): Promise<boolean> {
  const params = mapInventorySummaryDetailParams(item);
  const [rows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS count
      FROM inventorysummarydetail
      WHERE itemcode = :itemCode
      AND routekey = :routeKey
      AND record_flag = '1'
    `,
    params
  );

  const assignmentSql = INVENTORY_SUMMARY_COLUMNS
    .map((column) => `${column} = :${column}`)
    .join(', ');
  const vanStockInsert =
    '(beginstockqty + loadqty + loadaddqty - loadcutqty - saleqty + returnqty - freesampleqty - promoqty)';
  const vanStockUpdate =
    '(beginstockqty + loadqty + loadaddqty - loadcutqty - saleqty + returnqty - freesampleqty - promoqty + returnfreeqty)';

  if (Number(rows[0]?.count ?? 0) === 0) {
    await connection.execute(
      `
        INSERT INTO inventorysummarydetail SET
          ${assignmentSql},
          currencycode = get_default_currencycode_routekey(:routekey),
          mdat = CURRENT_DATE(),
          vanstock = ${vanStockInsert},
          vanstockvalue = ${vanStockInsert} * :stdsalesprice,
          record_flag = '1'
      `,
      params
    );
  } else {
    await connection.execute(
      `
        UPDATE inventorysummarydetail SET
          ${assignmentSql},
          currencycode = get_default_currencycode_routekey(:routekey),
          mdat = CURRENT_DATE(),
          vanstock = ${vanStockUpdate},
          vanstockvalue = ${vanStockUpdate} * :stdsalesprice
        WHERE itemcode = :itemcode
        AND routekey = :routekey
        AND record_flag = '1'
      `,
      params
    );
  }

  return Number(item.routekey) > 0;
}

async function getInventoryDetailKey(
  connection: PoolConnection,
  documentNumber: string | number
): Promise<number | null> {
  const [rows] = await connection.execute<TransactionKeyRow[]>(
    `
      SELECT detailkey AS transactionkey
      FROM inventorytransactionheader
      WHERE documentnumber = :documentNumber
      LIMIT 1
    `,
    { documentNumber }
  );

  return rows[0]?.transactionkey ?? null;
}

function mapInventoryTransactionHeaderParams(item: InventoryTransactionHeaderUploadItem) {
  return {
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
  };
}

function mapInventoryTransactionDetailParams(
  item: InventoryTransactionDetailUploadItem,
  detailKey: number
) {
  return {
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
}

const INVENTORY_SUMMARY_COLUMNS = [
  'inventorykey',
  'itemcode',
  'routekey',
  'weighted',
  'beginstockqty',
  'loadqty',
  'loadaddqty',
  'loadcutqty',
  'loadreqqty',
  'saleqty',
  'returnqty',
  'damagedaddqty',
  'damagedcutqty',
  'endstockqty',
  'unloadqty',
  'damagedunloadqty',
  'freesampleqty',
  'truckdamagedunloadqty',
  'stdsalesprice',
  'stdreturnprice',
  'cashsalesqty',
  'cashsalesvalue',
  'tcsalesqty',
  'tcsalesvalue',
  'gcsalesqty',
  'gcsalesvalue',
  'cashdamagedqty',
  'cashdamagedvalue',
  'tcdamagedqty',
  'tcdamagedvalue',
  'gcdamagedqty',
  'gcdamagedvalue',
  'cashreturnqty',
  'cashreturnvalue',
  'tcreturnqty',
  'tcreturnvalue',
  'gcreturnqty',
  'gcreturnvalue',
  'promoqty',
  'cashsalesitemexcisetax',
  'cashsalesitemgsttax',
  'cashreturnitemexcisetax',
  'cashreturnitemgsttax',
  'cashdamageditemexcisetax',
  'cashdamageditemgsttax',
  'cashfgitemexcisetax',
  'cashfgitemgsttax',
  'cashpromoitemexcisetax',
  'cashpromoitemgsttax',
  'tcsalesitemexcisetax',
  'tcsalesitemgsttax',
  'tcreturnitemexcisetax',
  'tcreturnitemgsttax',
  'tcdamageditemexcisetax',
  'tcdamageditemgsttax',
  'tcfgitemexcisetax',
  'tcfgitemgsttax',
  'tcpromoitemexcisetax',
  'tcpromoitemgsttax',
  'gcsalesitemexcisetax',
  'gcsalesitemgsttax',
  'gcreturnitemexcisetax',
  'gcreturnitemgsttax',
  'gcdamageditemexcisetax',
  'gcdamageditemgsttax',
  'gcfgitemexcisetax',
  'gcfgitemgsttax',
  'gcpromoitemexcisetax',
  'gcpromoitemgsttax',
  'batchdetailkey',
  'stdsalescaseprice',
  'stdreturncaseprice',
  'expiryqty',
  'stdgoodreturncaseprice',
  'stdgoodreturnprice',
  'returnfreeqty',
  'damageqty',
  'expdmgfreeqty',
  'expunloadqty',
  'dmgunloadqty',
  'expdmgfreeunloadqty',
  'rentqty',
  'loadadjustqty'
] as const;

function mapInventorySummaryDetailParams(
  item: InventorySummaryDetailUploadItem
): Record<string, string | number | null> {
  return Object.fromEntries(
    INVENTORY_SUMMARY_COLUMNS.map((column) => [
      column,
      column === 'inventorykey' || column === 'itemcode' || column === 'routekey'
        ? required(item[column])
        : nullable(item[column])
    ])
  );
}
