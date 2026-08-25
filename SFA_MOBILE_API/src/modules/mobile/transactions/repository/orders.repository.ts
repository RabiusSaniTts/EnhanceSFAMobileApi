import type { PoolConnection, ResultSetHeader } from 'mysql2/promise';
import type {
  OrderRxdDetailUploadItem,
  SalesOrderDetailUploadItem,
  SalesOrderHeaderUploadItem
} from '../transactions.types';
import type {
  CountRow,
  GeneratedDocumentNumberRow,
  TransactionKeyRow
} from './shared.repository';
import { nullable, required } from './shared.repository';

export async function saveSalesOrderHeader(
  connection: PoolConnection,
  item: SalesOrderHeaderUploadItem
): Promise<number> {
  const existingTransactionKey = await getSalesOrderTransactionKey(connection, required(item.invoicenumber));

  if (existingTransactionKey !== null) {
    await connection.execute(
      'UPDATE salesorderheader SET voidflag = :voidFlag WHERE invoicenumber = :invoiceNumber',
      { invoiceNumber: required(item.invoicenumber), voidFlag: nullable(item.voidflag) }
    );
    return existingTransactionKey;
  }

  const documentNumber = await getNextSalesOrderDocumentNumber(connection, required(item.routecode));
  const [insertResult] = await connection.execute<ResultSetHeader>(
    `
      INSERT INTO salesorderheader SET
        routekey = :routeKey,
        visitkey = :visitKey,
        documentnumber = :documentNumber,
        invoicenumber = :invoiceNumber,
        transactiondate = :transactionDate,
        transactiontime = :transactionTime,
        dsdnumber = :dsdNumber,
        ponumber = :poNumber,
        customercode = :customerCode,
        routecode = :routeCode,
        salesmancode = :salesmanCode,
        orderdeliveryroutecode = :orderDeliveryRouteCode,
        orderdeliverydate = :orderDeliveryDate,
        totalinvoiceamount = :totalInvoiceAmount,
        totalsalesamount = :totalSalesAmount,
        totalreturnamount = :totalReturnAmount,
        totaldamagedamount = :totalDamagedAmount,
        dexflag = :dexFlag,
        splittransaction = :splitTransaction,
        voidflag = :voidFlag,
        transmitindicator = :transmitIndicator,
        hhcinvoicenumber = :hhcInvoiceNumber,
        paymenttype = :paymentType,
        hhcdocumentnumber = :hhcDocumentNumber,
        voidreasoncode = :voidReasonCode,
        advanceused = :advanceUsed,
        paymentstatus = :paymentStatus,
        advancebalance = :advanceBalance,
        mdat = CURRENT_DATE(),
        advancereceived = :advanceReceived,
        currencycode = get_default_currencycode_routekey(:routeKey),
        status = :status,
        refnumber = :refNumber,
        totalfreesampleamount = :totalFreeSampleAmount,
        deliverystatus = :deliveryStatus,
        data = :data,
        comments = :comments,
        actualtransactiondate = :actualTransactionDate,
        comments2 = :comments2,
        hhctransactionkey = :hhcTransactionKey,
        totalpromoamount = :totalPromoAmount,
        record_flag = '1',
        receivedtime = CURTIME(),
        totallineitemtax = :totalLineItemTax
    `,
    mapSalesOrderHeaderParams(item, documentNumber)
  );

  return insertResult.insertId;
}

export async function saveSalesOrderDetail(
  connection: PoolConnection,
  item: SalesOrderDetailUploadItem,
  transactionKey: number
): Promise<boolean> {
  const [rows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS count
      FROM salesorderdetail
      WHERE routekey = :routeKey
      AND visitkey = :visitKey
      AND itemcode = :itemCode
    `,
    {
      routeKey: required(item.routekey),
      visitKey: required(item.visitkey),
      itemCode: required(item.itemcode)
    }
  );

  if (Number(rows[0]?.count ?? 0) > 0) {
    return false;
  }

  await connection.execute(
    `
      INSERT INTO salesorderdetail SET
        routekey = :routeKey, visitkey = :visitKey, transactionkey = :transactionKey, itemcode = :itemCode,
        salesqty = :salesQty, returnqty = :returnQty, damagedqty = :damagedQty, freesampleqty = :freeSampleQty,
        salesprice = :returnPrice, returnprice = :returnPrice, stdsalesprice = :stdSalesPrice, stdreturnprice = :stdReturnPrice,
        coopid = :coopId, salescaseprice = :returnCasePrice, returncaseprice = :returnCasePrice,
        stdsalescaseprice = :stdSalesCasePrice, stdreturncaseprice = :stdReturnCasePrice,
        currencycode = get_default_currencycode_routekey(:routeKey), allocated = :allocated,
        freegoodcases = :freeGoodCases, freegoodpcs = :freeGoodPcs, manualfreeqty = :manualFreeQty,
        salespcs = :salesPcs, allocatedcases = :allocatedCases, salescases = :salesCases,
        allocatedpcs = :allocatedPcs, returncases = :returnCases, returnpcs = :returnPcs,
        receivedtime = CURTIME(), promoamount = :promoAmount, salesordervat = :salesOrderVat,
        salesorderexcisetax = :salesOrderExciseTax, returnvat = :returnVat, returnexcisetax = :returnExciseTax,
        damagedvat = :damagedVat, damagedexcisetax = :damagedExciseTax, promovat = :promoVat,
        promoexcisetax = :promoExciseTax, fgvat = :fgVat, fgexcisetax = :fgExciseTax
    `,
    mapSalesOrderDetailParams(item, transactionKey)
  );

  return true;
}

export async function saveOrderRxdDetail(
  connection: PoolConnection,
  item: OrderRxdDetailUploadItem,
  transactionKey: number
): Promise<boolean> {
  const [rows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS count
      FROM orderrxddetail
      WHERE routekey = :routeKey
      AND visitkey = :visitKey
      AND itemcode = :itemCode
      AND itemtransactiontype = :itemTransactionType
      AND reasoncode = :reasonCode
    `,
    {
      routeKey: required(item.routekey),
      visitKey: required(item.visitkey),
      itemCode: required(item.itemcode),
      itemTransactionType: required(item.itemtransactiontype),
      reasonCode: required(item.reasoncode)
    }
  );

  if (Number(rows[0]?.count ?? 0) > 0) {
    return false;
  }

  await connection.execute(
    `
      INSERT INTO orderrxddetail SET
        routekey = :routeKey, visitkey = :visitKey, transactionkey = :transactionKey,
        itemtransactiontype = :itemTransactionType, itemcode = :itemCode,
        itemtranstypeseq = :itemTransactionTypeSequence, reasoncode = :reasonCode,
        quantity = :quantity, catchweightqty = :catchWeightQty, weighted = :weighted,
        instructioncode = :instructionCode, expirydate = :expiryDate, receivedtime = CURTIME()
    `,
    {
      routeKey: required(item.routekey),
      visitKey: required(item.visitkey),
      transactionKey,
      itemTransactionType: required(item.itemtransactiontype),
      itemCode: required(item.itemcode),
      itemTransactionTypeSequence: required(item.itemtranstypeseq),
      reasonCode: required(item.reasoncode),
      quantity: nullable(item.quantity),
      catchWeightQty: nullable(item.catchweightqty),
      weighted: nullable(item.weighted),
      instructionCode: nullable(item.instructioncode),
      expiryDate: nullable(item.expirydate)
    }
  );

  return true;
}

async function getSalesOrderTransactionKey(
  connection: PoolConnection,
  invoiceNumber: string | number
): Promise<number | null> {
  const [rows] = await connection.execute<TransactionKeyRow[]>(
    `
      SELECT transactionkey
      FROM salesorderheader
      WHERE invoicenumber = :invoiceNumber
      LIMIT 1
    `,
    { invoiceNumber }
  );

  return rows[0]?.transactionkey ?? null;
}

async function getNextSalesOrderDocumentNumber(
  connection: PoolConnection,
  routeCode: string | number
): Promise<string | number> {
  const [rows] = await connection.execute<GeneratedDocumentNumberRow[]>(
    `
      SELECT COALESCE(
        MAX(documentnumber) + 1,
        CAST(CONCAT(CAST(:routeCode AS CHAR), '000001') AS UNSIGNED)
      ) AS documentNumber
      FROM salesorderheader
      WHERE routecode = :routeCode
    `,
    { routeCode }
  );

  return rows[0]?.documentNumber ?? `${routeCode}000001`;
}

function mapSalesOrderHeaderParams(
  item: SalesOrderHeaderUploadItem,
  documentNumber: string | number
) {
  return {
    routeKey: required(item.routekey),
    visitKey: required(item.visitkey),
    documentNumber,
    invoiceNumber: required(item.invoicenumber),
    transactionDate: required(item.transactiondate),
    transactionTime: nullable(item.transactiontime),
    dsdNumber: nullable(item.dsdnumber),
    poNumber: nullable(item.ponumber),
    customerCode: required(item.customercode),
    routeCode: required(item.routecode),
    salesmanCode: nullable(item.salesmancode),
    orderDeliveryRouteCode: nullable(item.orderdeliveryroutecode),
    orderDeliveryDate: nullable(item.orderdeliverydate),
    totalInvoiceAmount: nullable(item.totalinvoiceamount),
    totalSalesAmount: nullable(item.totalsalesamount),
    totalReturnAmount: nullable(item.totalreturnamount),
    totalDamagedAmount: nullable(item.totaldamagedamount),
    dexFlag: nullable(item.dexflag),
    splitTransaction: nullable(item.splittransaction),
    voidFlag: nullable(item.voidflag),
    transmitIndicator: nullable(item.transmitindicator),
    hhcInvoiceNumber: nullable(item.hhcinvoicenumber),
    paymentType: nullable(item.paymenttype),
    hhcDocumentNumber: nullable(item.hhcdocumentnumber),
    voidReasonCode: nullable(item.voidreasoncode),
    advanceUsed: nullable(item.advanceused),
    paymentStatus: nullable(item.paymentstatus),
    advanceBalance: nullable(item.advancebalance),
    advanceReceived: nullable(item.advancereceived),
    status: nullable(item.status),
    refNumber: nullable(item.refnumber),
    totalFreeSampleAmount: nullable(item.totalfreesampleamount),
    deliveryStatus: nullable(item.deliverystatus),
    data: nullable(item.data),
    comments: nullable(item.comments),
    actualTransactionDate: nullable(item.actualtransactiondate),
    comments2: nullable(item.comments2),
    hhcTransactionKey: nullable(item.hhctransactionkey),
    totalPromoAmount: nullable(item.totalpromoamount),
    totalLineItemTax: nullable(item.totallineitemtax)
  };
}

function mapSalesOrderDetailParams(item: SalesOrderDetailUploadItem, transactionKey: number) {
  return {
    routeKey: required(item.routekey),
    visitKey: required(item.visitkey),
    transactionKey,
    itemCode: required(item.itemcode),
    salesQty: nullable(item.salesqty),
    returnQty: nullable(item.returnqty),
    damagedQty: nullable(item.damagedqty),
    freeSampleQty: nullable(item.freesampleqty),
    returnPrice: nullable(item.returnprice),
    stdSalesPrice: nullable(item.stdsalesprice),
    stdReturnPrice: nullable(item.stdreturnprice),
    coopId: nullable(item.coopid),
    returnCasePrice: nullable(item.returncaseprice),
    stdSalesCasePrice: nullable(item.stdsalescaseprice),
    stdReturnCasePrice: nullable(item.stdreturncaseprice),
    allocated: nullable(item.allocated),
    freeGoodCases: nullable(item.freegoodcases),
    freeGoodPcs: nullable(item.freegoodpcs),
    salesPcs: nullable(item.salespcs),
    allocatedCases: nullable(item.allocatedcases),
    salesCases: nullable(item.salescases),
    allocatedPcs: nullable(item.allocatedpcs),
    returnCases: nullable(item.returncases),
    returnPcs: nullable(item.returnpcs),
    manualFreeQty: nullable(item.manualfreeqty),
    promoAmount: nullable(item.promoamount),
    salesOrderVat: nullable(item.salesordervat),
    salesOrderExciseTax: nullable(item.salesorderexcisetax),
    returnVat: nullable(item.returnvat),
    returnExciseTax: nullable(item.returnexcisetax),
    damagedVat: nullable(item.damagedvat),
    damagedExciseTax: nullable(item.damagedexcisetax),
    promoVat: nullable(item.promovat),
    promoExciseTax: nullable(item.promoexcisetax),
    fgVat: nullable(item.fgvat),
    fgExciseTax: nullable(item.fgexcisetax)
  };
}
