import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import type {
  BatchExpiryDetailUploadItem,
  CustomerInvoiceUploadItem,
  InvoiceDetailUploadItem,
  InvoiceHeaderUploadItem,
  InvoiceRxdDetailUploadItem,
  PromotionDetailUploadItem
} from '../transactions.types';
import type {
  CountRow,
  GeneratedDocumentNumberRow,
  TransactionKeyRow
} from './shared.repository';
import { nullable, required } from './shared.repository';

export async function saveInvoiceHeader(
  connection: PoolConnection,
  item: InvoiceHeaderUploadItem
): Promise<number> {
  const existingTransactionKey = await getInvoiceHeaderTransactionKey(
    connection,
    item.invoicenumber
  );

  if (existingTransactionKey !== null) {
    await connection.execute(
      'UPDATE invoiceheader SET voidflag = :voidFlag WHERE invoicenumber = :invoiceNumber',
      {
        invoiceNumber: item.invoicenumber,
        voidFlag: item.voidflag
      }
    );
    await connection.execute(
      'UPDATE customerinvoice SET voidflag = :voidFlag WHERE invoicenumber = :invoiceNumber',
      {
        invoiceNumber: item.invoicenumber,
        voidFlag: item.voidflag
      }
    );
    return existingTransactionKey;
  }

  const documentNumber = await getNextInvoiceDocumentNumber(connection, item.routecode);
  const [insertResult] = await connection.execute<ResultSetHeader>(
    `
      INSERT INTO invoiceheader SET
        routekey = :routeKey,
        visitkey = :visitKey,
        documentnumber = :documentNumber,
        invoicenumber = :invoiceNumber,
        transactiondate = check_monthclosing_time(:transactionDate),
        transactiontime = :transactionTime,
        dsdnumber = :dsdNumber,
        ponumber = :poNumber,
        customercode = :customerCode,
        routecode = :routeCode,
        salesmancode = :salesmanCode,
        presoldordernumber = :presoldOrderNumber,
        presalesmancode = :preSalesmanCode,
        presalesroutecode = :preSalesRouteCode,
        orderdeliverydate = :orderDeliveryDate,
        orderdeliveryroutecode = :orderDeliveryRouteCode,
        totalinvoiceamount = :totalInvoiceAmount,
        totalsalesamount = :totalSalesAmount,
        totalreturnamount = :totalReturnAmount,
        totaldamagedamount = :totalDamagedAmount,
        totalfreesampleamount = :totalFreeSampleAmount,
        immediatepaid = :immediatePaid,
        amountpaid = :amountPaid,
        invoicebalance = :invoiceBalance,
        dexflag = :dexFlag,
        dexg86signature = :dexG86Signature,
        paymenttype = :paymentType,
        varianceflag = 0,
        splittransaction = CASE
          WHEN :invoiceBalance = 0 AND :totalSalesAmount > 0 AND :totalReturnAmount > 0 THEN 1
          ELSE 0
        END,
        voidflag = :voidFlag,
        transmitindicator = :transmitIndicator,
        paymentstatus = :paymentStatus,
        hhcinvoicenumber = :invoiceNumber * 10,
        totalpromoamount = :totalPromoAmount,
        gcpaymenttype = :gcPaymentType,
        hhcdocumentnumber = :hhcDocumentNumber,
        inventorykey = :inventoryKey,
        totaltaxesamount = :totalTaxesAmount,
        itemlinetaxamount = :itemLineTaxAmount,
        totaldiscountamount = :totalDiscountAmount,
        voidreasoncode = :voidReasonCode,
        totalexpiryamount = :totalExpiryAmount,
        currencycode = get_default_currencycode_routecode(:routeCode),
        totalmanualfree = :totalManualFree,
        totallimitedfree = :totalLimitedFree,
        totalrebaterent = :totalRebateRent,
        totalfixedrent = :totalFixedRent,
        actualtransactiondate = :transactionDate,
        boentry = :boEntry,
        hhctransactionkey = :hhcTransactionKey,
        data = :data,
        comments = :comments,
        totaldiscdistributionamount = :totalDiscDistributionAmount,
        totalreplacementamount = :totalReplacementAmount,
        comments2 = :comments2,
        record_flag = '1',
        lineitemdiscount = :lineItemDiscount,
        totalreturnpromoamount = :totalReturnPromoAmount,
        returnlineitemdiscount = :returnLineItemDiscount,
        totalbuybackfreeamount = :totalBuybackFreeAmount,
        roundtotalsalesamount = :roundTotalSalesAmount,
        diffround = :diffRound,
        receivedtime = CURTIME(),
        headerdiscounttaxamt = :headerDiscountTaxAmount
    `,
    mapInvoiceHeaderParams(item, documentNumber)
  );

  return insertResult.insertId;
}

export async function saveInvoiceDetail(
  connection: PoolConnection,
  item: InvoiceDetailUploadItem,
  transactionKey: number
): Promise<boolean> {
  const [rows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS count
      FROM invoicedetail
      WHERE routekey = :routeKey
      AND visitkey = :visitKey
      AND itemcode = :itemCode
    `,
    {
      routeKey: item.routekey,
      visitKey: item.visitkey,
      itemCode: item.itemcode
    }
  );

  if (Number(rows[0]?.count ?? 0) > 0) {
    return false;
  }

  await connection.execute(
    `
      INSERT INTO invoicedetail SET
        routekey = :routeKey,
        visitkey = :visitKey,
        transactionkey = :transactionKey,
        itemcode = :itemCode,
        salesqty = :salesQty,
        returnqty = :returnQty,
        damagedqty = :damagedQty,
        freesampleqty = :freeSampleQty,
        salesprice = :salesPrice,
        returnprice = :returnPrice,
        stdsalesprice = :stdSalesPrice,
        stdreturnprice = :stdReturnPrice,
        promoqty = :promoQty,
        salesitemexcisetax = :salesItemExciseTax,
        salesitemgsttax = :salesItemGstTax,
        returnitemexcisetax = :returnItemExciseTax,
        returnitemgsttax = :returnItemGstTax,
        damageditemexcisetax = :damagedItemExciseTax,
        damageditemgsttax = :damagedItemGstTax,
        fgitemexcisetax = :fgItemExciseTax,
        fgitemgsttax = :fgItemGstTax,
        promoitemexcisetax = :promoItemExciseTax,
        promoitemgsttax = :promoItemGstTax,
        coopid = :coopId,
        batchdetailkey = :batchDetailKey,
        salescaseprice = :salesCasePrice,
        returncaseprice = :returnCasePrice,
        stdsalescaseprice = :stdSalesCasePrice,
        stdreturncaseprice = :stdReturnCasePrice,
        goodreturnprice = :goodReturnPrice,
        goodreturncaseprice = :goodReturnCasePrice,
        stdgoodreturncaseprice = :stdGoodReturnCasePrice,
        stdgoodreturnprice = :stdGoodReturnPrice,
        expiryqty = :expiryQty,
        currencycode = get_default_currencycode_routekey(:routeKey),
        returnfreeqty = :returnFreeQty,
        manualfreeqty = :manualFreeQty,
        limitedfreeqty = :limitedFreeQty,
        rebaterentqty = :rebateRentQty,
        fixedrentqty = :fixedRentQty,
        pricechgindicator = :priceChangeIndicator,
        discountamount = :discountAmount,
        discountpercentage = :discountPercentage,
        promoamount = :promoAmount,
        replacementqty = :replacementQty,
        replacementprice = :replacementPrice,
        replacementcaseprice = :replacementCasePrice,
        promovalue = :promoValue,
        mdat = :modifiedDate,
        sales_amount = :salesAmount,
        returnpromovalue = :returnPromoValue,
        returnpromoamount = :returnPromoAmount,
        return_amount = :returnAmount,
        returnfreesampleqty = :returnFreeSampleQty,
        roundsalesamount = :roundSalesAmount,
        diffround = :diffRound,
        linetotal = :lineTotal,
        receivedtime = CURTIME()
    `,
    mapInvoiceDetailParams(item, transactionKey)
  );

  return true;
}

export async function saveInvoiceRxdDetail(
  connection: PoolConnection,
  item: InvoiceRxdDetailUploadItem,
  transactionKey: number
): Promise<boolean> {
  const [rows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS count
      FROM invoicerxddetail
      WHERE routekey = :routeKey
      AND visitkey = :visitKey
      AND itemcode = :itemCode
      AND itemtransactiontype = :itemTransactionType
      AND reasoncode = :reasonCode
    `,
    {
      routeKey: item.routekey,
      visitKey: item.visitkey,
      itemCode: item.itemcode,
      itemTransactionType: item.itemtransactiontype,
      reasonCode: item.reasoncode
    }
  );

  if (Number(rows[0]?.count ?? 0) > 0 || Number(item.itemcode) <= 0) {
    return false;
  }

  await connection.execute(
    `
      INSERT INTO invoicerxddetail SET
        routekey = :routeKey,
        visitkey = :visitKey,
        transactionkey = :transactionKey,
        itemtransactiontype = :itemTransactionType,
        itemcode = :itemCode,
        itemtranstypeseq = :itemTransactionTypeSequence,
        reasoncode = :reasonCode,
        quantity = :quantity,
        catchweightqty = :catchWeightQty,
        weighted = :weighted,
        instructioncode = :instructionCode,
        currencycode = get_default_currencycode_routekey(:routeKey),
        expirydate = :expiryDate,
        invoiceno = :invoiceNumber,
        receivedtime = CURTIME()
    `,
    {
      routeKey: item.routekey,
      visitKey: item.visitkey,
      transactionKey,
      itemTransactionType: item.itemtransactiontype,
      itemCode: item.itemcode,
      itemTransactionTypeSequence: item.itemtranstypeseq,
      reasonCode: item.reasoncode,
      quantity: nullable(item.quantity),
      catchWeightQty: nullable(item.catchweightqty),
      weighted: nullable(item.weighted),
      instructionCode: nullable(item.instructioncode),
      expiryDate: nullable(item.expirydate),
      invoiceNumber: nullable(item.invoicenumber)
    }
  );

  return true;
}

export async function savePromotionDetail(
  connection: PoolConnection,
  item: PromotionDetailUploadItem,
  transactionKey: number
): Promise<boolean> {
  const params = mapPromotionDetailParams(item, transactionKey);
  const [rows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS count
      FROM promotiondetail
      WHERE routekey = :routeKey
      AND visitkey = :visitKey
      AND itemcode = :itemCode
      AND itemtransactiontype = :itemTransactionType
      AND promotiontypecode = :promotionTypeCode
      AND promotionplannumber = :promotionPlanNumber
    `,
    params
  );

  if (Number(rows[0]?.count ?? 0) === 0) {
    await connection.execute(
      `
        INSERT INTO promotiondetail SET
          routekey = :routeKey,
          visitkey = :visitKey,
          transactionkey = :transactionKey,
          itemtransactiontype = :itemTransactionType,
          itemcode = :itemCode,
          promotiontypecode = :promotionTypeCode,
          promotionamount = (:oldPromotionAmount * :promotionAmount) / 100,
          promotionquantity = :promotionQuantity,
          catchweightqty = :catchWeightQty,
          weighted = :weighted,
          promotionplannumber = :promotionPlanNumber,
          assignmentkey = :assignmentKey,
          exclusionoption = :exclusionOption,
          promochgindicator = :promoChangeIndicator,
          oldpromotionamount = :oldPromotionAmount,
          performindicator = :performIndicator,
          performcriteriakey = :performCriteriaKey,
          promotioncaseprice = :promotionCasePrice,
          currencycode = :currencyCode,
          memo1 = :memo1,
          promotionpercent = :promotionAmount
      `,
      params
    );
  } else {
    await connection.execute(
      `
        UPDATE promotiondetail SET
          itemtransactiontype = :itemTransactionType,
          promotiontypecode = :promotionTypeCode,
          promotionamount = (:oldPromotionAmount * :promotionAmount) / 100,
          promotionquantity = :promotionQuantity,
          catchweightqty = :catchWeightQty,
          weighted = :weighted,
          promotionplannumber = :promotionPlanNumber,
          assignmentkey = :assignmentKey,
          exclusionoption = :exclusionOption,
          promochgindicator = :promoChangeIndicator,
          oldpromotionamount = :oldPromotionAmount,
          performindicator = :performIndicator,
          performcriteriakey = :performCriteriaKey,
          promotioncaseprice = :promotionCasePrice,
          currencycode = :currencyCode,
          memo1 = :memo1,
          promotionpercent = :promotionAmount
        WHERE routekey = :routeKey
        AND visitkey = :visitKey
        AND itemcode = :itemCode
      `,
      params
    );
  }

  await connection.execute(
    `
      DELETE FROM promotiondetail
      WHERE promotiontypecode = 7
      AND routekey = :routeKey
      AND visitkey = :visitKey
      AND promotionquantity = 0
    `,
    params
  );

  return Number(item.routekey) > 0;
}

export async function saveCustomerInvoice(
  connection: PoolConnection,
  item: CustomerInvoiceUploadItem
): Promise<boolean> {
  const [rows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS count
      FROM customerinvoice
      WHERE invoicenumber = :invoiceNumber
    `,
    { invoiceNumber: item.invoicenumber }
  );

  if (Number(rows[0]?.count ?? 0) === 0) {
    await connection.execute(
      `
        INSERT INTO customerinvoice SET
          transactiontype = :transactionType,
          documentnumber = :documentNumber,
          invoicenumber = :invoiceNumber,
          transactiondate = check_monthclosing_time(:transactionDate),
          transactiontime = :transactionTime,
          customercode = :customerCode,
          routecode = :routeCode,
          salesmancode = :salesmanCode,
          totalinvoiceamount = :totalInvoiceAmount,
          totalsalesamount = :totalSalesAmount,
          totalreturnamount = :totalReturnAmount,
          totaldamagedamount = :totalDamagedAmount,
          totalfreesampleamount = :totalFreeSampleAmount,
          immediatepaid = :immediatePaid,
          amountpaid = :amountPaid,
          dnamountpaid = :dnAmountPaid,
          cnamountpaid = :cnAmountPaid,
          invoicebalance = :invoiceBalance,
          paymenttype = :paymentType,
          voidflag = :voidFlag,
          paymentstatus = :paymentStatus,
          hhcinvoicenumber = :hhcInvoiceNumber,
          remarks1 = :remarks1,
          remarks2 = :remarks2,
          erpreferencenumber = :erpReferenceNumber,
          mdat = CURRENT_DATE(),
          totalpromoamount = :totalPromoAmount,
          gcpaymenttype = :gcPaymentType,
          totaltaxesamount = :totalTaxesAmount,
          itemlinetaxamount = :itemLineTaxAmount,
          totaldiscountamount = :totalDiscountAmount,
          pdcindicator = :pdcIndicator,
          chequecollection = :chequeCollection,
          totalexpiryamount = :totalExpiryAmount,
          currencycode = get_default_currencycode_routecode(:routeCode),
          pdcbalance = :pdcBalance,
          totalmanualfree = :totalManualFree,
          totallimitedfree = :totalLimitedFree,
          totalrebaterent = :totalRebateRent,
          totalfixedrent = :totalFixedRent,
          data = :data,
          totaldiscdistributionamount = :totalDiscDistributionAmount,
          totalreplacementamount = :totalReplacementAmount,
          pdcdate = :pdcDate,
          routestartdate = :transactionDate,
          totalbuybackfreeamount = :totalBuybackFreeAmount,
          duedate = :dueDate
      `,
      mapCustomerInvoiceParams(item)
    );
  } else {
    await connection.execute(
      `
        UPDATE customerinvoice SET
          amountpaid = :amountPaid,
          invoicebalance = :invoiceBalance,
          voidflag = :voidFlag,
          mdat = CURRENT_DATE(),
          pdcindicator = :pdcIndicator,
          chequecollection = :chequeCollection,
          pdcbalance = :pdcBalance,
          pdcdate = :pdcDate
        WHERE invoicenumber = :invoiceNumber
      `,
      mapCustomerInvoiceParams(item)
    );
  }

  return Number(item.transactionkey) > 0;
}

export async function saveBatchExpiryDetail(
  connection: PoolConnection,
  item: BatchExpiryDetailUploadItem
): Promise<boolean> {
  const [flagRows] = await connection.execute<(RowDataPacket & { status: number | null })[]>(
    `
      SELECT status
      FROM controlpanel
      WHERE flagid = 1
      LIMIT 1
    `
  );

  if (Number(flagRows[0]?.status ?? 0) !== 1) {
    return Number(item.routekey) > 0;
  }

  const params = mapBatchExpiryDetailParams(item);
  const [rows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS count
      FROM batchexpirydetail
      WHERE routekey = :routeKey
      AND batchnumber = :batchNumber
      AND itemcode = :itemCode
      AND visitkey = :visitKey
      AND transactiontypecode = :transactionTypeCode
      AND batchdetailkey = :batchDetailKey
    `,
    params
  );

  if (Number(rows[0]?.count ?? 0) === 0) {
    await connection.execute(
      `
        INSERT INTO batchexpirydetail SET
          routekey = :routeKey,
          batchdetailkey = :batchDetailKey,
          batchnumber = :batchNumber,
          itemcode = :itemCode,
          quantity = :quantity,
          transactiontypecode = :transactionTypeCode,
          expirydate = :expiryDate,
          visitkey = :visitKey
      `,
      params
    );
  } else {
    await connection.execute(
      `
        UPDATE batchexpirydetail SET
          batchdetailkey = :batchDetailKey,
          quantity = :quantity,
          expirydate = :expiryDate
        WHERE routekey = :routeKey
        AND batchnumber = :batchNumber
        AND itemcode = :itemCode
        AND visitkey = :visitKey
        AND transactiontypecode = :transactionTypeCode
        AND batchdetailkey = :batchDetailKey
      `,
      params
    );
  }

  return Number(item.routekey) > 0;
}

async function getInvoiceHeaderTransactionKey(
  connection: PoolConnection,
  invoiceNumber: string | number
): Promise<number | null> {
  const [rows] = await connection.execute<TransactionKeyRow[]>(
    `
      SELECT transactionkey
      FROM invoiceheader
      WHERE invoicenumber = :invoiceNumber
      LIMIT 1
    `,
    { invoiceNumber }
  );

  return rows[0]?.transactionkey ?? null;
}

async function getNextInvoiceDocumentNumber(
  connection: PoolConnection,
  routeCode: string | number
): Promise<string | number> {
  const [rows] = await connection.execute<GeneratedDocumentNumberRow[]>(
    `
      SELECT COALESCE(
        MAX(documentnumber) + 1,
        CAST(CONCAT(CAST(:routeCode AS CHAR), '000001') AS UNSIGNED)
      ) AS documentNumber
      FROM invoiceheader
      WHERE routecode = :routeCode
    `,
    { routeCode }
  );

  return rows[0]?.documentNumber ?? `${routeCode}000001`;
}

function mapInvoiceHeaderParams(
  item: InvoiceHeaderUploadItem,
  documentNumber: string | number
) {
  return {
    routeKey: required(item.routekey),
    visitKey: required(item.visitkey),
    documentNumber,
    invoiceNumber: required(item.invoicenumber),
    transactionDate: required(item.transactiondate),
    transactionTime: item.transactiontime,
    dsdNumber: nullable(item.dsdnumber),
    poNumber: nullable(item.ponumber),
    customerCode: required(item.customercode),
    routeCode: required(item.routecode),
    salesmanCode: item.salesmancode,
    presoldOrderNumber: nullable(item.presoldordernumber),
    preSalesmanCode: nullable(item.presalesmancode),
    preSalesRouteCode: nullable(item.presalesroutecode),
    orderDeliveryDate: nullable(item.orderdeliverydate),
    orderDeliveryRouteCode: nullable(item.orderdeliveryroutecode),
    totalInvoiceAmount: nullable(item.totalinvoiceamount),
    totalSalesAmount: nullable(item.totalsalesamount),
    totalReturnAmount: nullable(item.totalreturnamount),
    totalDamagedAmount: nullable(item.totaldamagedamount),
    totalFreeSampleAmount: nullable(item.totalfreesampleamount),
    immediatePaid: nullable(item.immediatepaid),
    amountPaid: nullable(item.amountpaid),
    invoiceBalance: nullable(item.invoicebalance),
    dexFlag: nullable(item.dexflag),
    dexG86Signature: nullable(item.dexg86signature),
    paymentType: nullable(item.paymenttype),
    voidFlag: nullable(item.voidflag),
    transmitIndicator: nullable(item.transmitindicator),
    paymentStatus: nullable(item.paymentstatus),
    totalPromoAmount: nullable(item.totalpromoamount),
    gcPaymentType: nullable(item.gcpaymenttype),
    hhcDocumentNumber: nullable(item.hhcdocumentnumber),
    inventoryKey: nullable(item.inventorykey),
    totalTaxesAmount: nullable(item.totaltaxesamount),
    itemLineTaxAmount: nullable(item.itemlinetaxamount),
    totalDiscountAmount: nullable(item.totaldiscountamount),
    voidReasonCode: nullable(item.voidreasoncode),
    totalExpiryAmount: nullable(item.totalexpiryamount),
    totalManualFree: nullable(item.totalmanualfree),
    totalLimitedFree: nullable(item.totallimitedfree),
    totalRebateRent: nullable(item.totalrebaterent),
    totalFixedRent: nullable(item.totalfixedrent),
    boEntry: nullable(item.boentry),
    hhcTransactionKey: nullable(item.hhctransactionkey),
    data: nullable(item.data),
    comments: nullable(item.comments),
    totalDiscDistributionAmount: nullable(item.totaldiscdistributionamount),
    totalReplacementAmount: nullable(item.totalreplacementamount),
    comments2: nullable(item.comments2),
    lineItemDiscount: nullable(item.lineitemdiscount),
    totalReturnPromoAmount: nullable(item.totalreturnpromoamount),
    returnLineItemDiscount: nullable(item.returnlineitemdiscount),
    totalBuybackFreeAmount: nullable(item.totalbuybackfreeamount),
    roundTotalSalesAmount: nullable(item.roundtotalsalesamount),
    diffRound: nullable(item.diffround),
    headerDiscountTaxAmount: nullable(item.headerdiscounttaxamt)
  };
}

function mapInvoiceDetailParams(item: InvoiceDetailUploadItem, transactionKey: number) {
  return {
    routeKey: required(item.routekey),
    visitKey: required(item.visitkey),
    transactionKey,
    itemCode: required(item.itemcode),
    salesQty: nullable(item.salesqty),
    returnQty: nullable(item.returnqty),
    damagedQty: nullable(item.damagedqty),
    freeSampleQty: nullable(item.freesampleqty),
    salesPrice: nullable(item.salesprice),
    returnPrice: nullable(item.returnprice),
    stdSalesPrice: nullable(item.stdsalesprice),
    stdReturnPrice: nullable(item.stdreturnprice),
    promoQty: nullable(item.promoqty),
    salesItemExciseTax: nullable(item.salesitemexcisetax),
    salesItemGstTax: nullable(item.salesitemgsttax),
    returnItemExciseTax: nullable(item.returnitemexcisetax),
    returnItemGstTax: nullable(item.returnitemgsttax),
    damagedItemExciseTax: nullable(item.damageditemexcisetax),
    damagedItemGstTax: nullable(item.damageditemgsttax),
    fgItemExciseTax: nullable(item.fgitemexcisetax),
    fgItemGstTax: nullable(item.fgitemgsttax),
    promoItemExciseTax: nullable(item.promoitemexcisetax),
    promoItemGstTax: nullable(item.promoitemgsttax),
    coopId: nullable(item.coopid),
    batchDetailKey: nullable(item.batchdetailkey),
    salesCasePrice: nullable(item.salescaseprice),
    returnCasePrice: nullable(item.returncaseprice),
    stdSalesCasePrice: nullable(item.stdsalescaseprice),
    stdReturnCasePrice: nullable(item.stdreturncaseprice),
    goodReturnPrice: nullable(item.goodreturnprice),
    goodReturnCasePrice: nullable(item.goodreturncaseprice),
    stdGoodReturnCasePrice: nullable(item.stdgoodreturncaseprice),
    stdGoodReturnPrice: nullable(item.stdgoodreturnprice),
    expiryQty: nullable(item.expiryqty),
    returnFreeQty: nullable(item.returnfreeqty),
    manualFreeQty: nullable(item.manualfreeqty),
    limitedFreeQty: nullable(item.limitedfreeqty),
    rebateRentQty: nullable(item.rebaterentqty),
    fixedRentQty: nullable(item.fixedrentqty),
    priceChangeIndicator: nullable(item.pricechgindicator),
    discountAmount: nullable(item.discountamount),
    discountPercentage: nullable(item.discountpercentage),
    promoAmount: nullable(item.promoamount),
    replacementQty: nullable(item.replacementqty),
    replacementPrice: nullable(item.replacementprice),
    replacementCasePrice: nullable(item.replacementcaseprice),
    promoValue: nullable(item.promovalue),
    modifiedDate: item.mdat,
    salesAmount: nullable(item.sales_amount),
    returnPromoValue: nullable(item.returnpromovalue),
    returnPromoAmount: nullable(item.returnpromoamount),
    returnAmount: nullable(item.return_amount),
    returnFreeSampleQty: nullable(item.returnfreesampleqty),
    roundSalesAmount: nullable(item.roundsalesamount),
    diffRound: nullable(item.diffround),
    lineTotal: nullable(item.amount)
  };
}

function mapPromotionDetailParams(item: PromotionDetailUploadItem, transactionKey: number) {
  return {
    routeKey: item.routekey,
    visitKey: item.visitkey,
    transactionKey,
    itemTransactionType: item.itemtransactiontype,
    itemCode: item.itemcode,
    promotionTypeCode: item.promotiontypecode,
    promotionAmount: nullable(item.promotionamount),
    promotionQuantity: nullable(item.promotionquantity),
    catchWeightQty: nullable(item.catchweightqty),
    weighted: nullable(item.weighted),
    promotionPlanNumber: nullable(item.promotionplannumber),
    assignmentKey: nullable(item.assignmentkey),
    exclusionOption: nullable(item.exclusionoption),
    promoChangeIndicator: nullable(item.promochgindicator),
    oldPromotionAmount: nullable(item.oldpromotionamount),
    performIndicator: nullable(item.performindicator),
    performCriteriaKey: nullable(item.performcriteriakey),
    promotionCasePrice: nullable(item.promotioncaseprice),
    currencyCode: nullable(item.currencycode),
    memo1: nullable(item.memo1)
  };
}

function mapCustomerInvoiceParams(item: CustomerInvoiceUploadItem) {
  return {
    transactionKey: item.transactionkey,
    transactionType: nullable(item.transactiontype),
    documentNumber: item.documentnumber,
    invoiceNumber: item.invoicenumber,
    transactionDate: item.transactiondate,
    transactionTime: nullable(item.transactiontime),
    customerCode: item.customercode,
    routeCode: item.routecode,
    salesmanCode: nullable(item.salesmancode),
    totalInvoiceAmount: nullable(item.totalinvoiceamount),
    totalSalesAmount: nullable(item.totalsalesamount),
    totalReturnAmount: nullable(item.totalreturnamount),
    totalDamagedAmount: nullable(item.totaldamagedamount),
    totalFreeSampleAmount: nullable(item.totalfreesampleamount),
    immediatePaid: nullable(item.immediatepaid),
    amountPaid: nullable(item.amountpaid),
    dnAmountPaid: nullable(item.dnamountpaid),
    cnAmountPaid: nullable(item.cnamountpaid),
    invoiceBalance: nullable(item.invoicebalance),
    paymentType: nullable(item.paymenttype),
    voidFlag: nullable(item.voidflag),
    paymentStatus: nullable(item.paymentstatus),
    hhcInvoiceNumber: nullable(item.hhcinvoicenumber),
    remarks1: nullable(item.remarks1),
    remarks2: nullable(item.remarks2),
    erpReferenceNumber: nullable(item.erpreferencenumber),
    totalPromoAmount: nullable(item.totalpromoamount),
    gcPaymentType: nullable(item.gcpaymenttype),
    totalTaxesAmount: nullable(item.totaltaxesamount),
    itemLineTaxAmount: nullable(item.itemlinetaxamount),
    totalDiscountAmount: nullable(item.totaldiscountamount),
    pdcIndicator: nullable(item.pdcindicator),
    chequeCollection: nullable(item.chequecollection),
    totalExpiryAmount: nullable(item.totalexpiryamount),
    pdcBalance: nullable(item.pdcbalance),
    totalManualFree: nullable(item.totalmanualfree),
    totalLimitedFree: nullable(item.totallimitedfree),
    totalRebateRent: nullable(item.totalrebaterent),
    totalFixedRent: nullable(item.totalfixedrent),
    data: nullable(item.data),
    totalDiscDistributionAmount: nullable(item.totaldiscdistributionamount),
    totalReplacementAmount: nullable(item.totalreplacementamount),
    pdcDate: nullable(item.pdcdate),
    totalBuybackFreeAmount: nullable(item.totalbuybackfreeamount),
    dueDate: nullable(item.duedate)
  };
}

function mapBatchExpiryDetailParams(item: BatchExpiryDetailUploadItem) {
  return {
    routeKey: required(item.routekey),
    batchDetailKey: required(item.batchdetailkey),
    batchNumber: required(item.batchnumber),
    itemCode: required(item.itemcode),
    quantity: nullable(item.quantity),
    transactionTypeCode: required(item.transactiontypecode),
    expiryDate: nullable(item.expirydate),
    visitKey: required(item.visitkey)
  };
}
