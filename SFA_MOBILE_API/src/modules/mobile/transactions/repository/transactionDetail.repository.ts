import type { PoolConnection, ResultSetHeader } from 'mysql2/promise';
import type {
  ArTransactionDetailItem,
  InvoiceTransactionDetailItem
} from '../types/senddata.types';
import type { TransactionKeyRow } from './shared.repository';
import { nullable, required } from './shared.repository';

export async function saveInvoiceTransactionDetail(
  connection: PoolConnection,
  item: InvoiceTransactionDetailItem
): Promise<boolean> {
  const transactionKey = await getInvoiceHeaderTransactionKey(
    connection,
    required(item.routekey),
    required(item.visitkey)
  );

  if (transactionKey === null) {
    return false;
  }

  const [result] = await connection.execute<ResultSetHeader>(
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
      ON DUPLICATE KEY UPDATE transactionkey = :transactionKey
    `,
    mapInvoiceDetailParams(item, transactionKey)
  );

  return result.affectedRows >= 0;
}

export async function saveArTransactionDetail(
  connection: PoolConnection,
  item: ArTransactionDetailItem
): Promise<boolean> {
  const transactionKey = await getArHeaderTransactionKey(
    connection,
    required(item.routekey),
    required(item.visitkey)
  );

  if (transactionKey === null) {
    return false;
  }

  const params = mapArDetailParams(item, transactionKey);
  const [result] = await connection.execute<ResultSetHeader>(
    `
      INSERT INTO ardetail SET
        routekey = :routeKey,
        visitkey = :visitKey,
        transactionkey = :transactionKey,
        invoicenumber = :invoiceNumber,
        salesmancode = :salesmanCode,
        invoicedate = :invoiceDate,
        totalinvoiceamount = :totalInvoiceAmount,
        onacctreasoncode = :onAccountReasonCode,
        amountpaid = :amountPaid,
        invoicebalance = :invoiceBalance,
        arcollectiontype = :arCollectionType,
        chequestatusindicator = :chequeStatusIndicator,
        referenceno = :referenceNo,
        currencycode = get_default_currencycode_routekey(:routeKey),
        pdcbalance = :pdcBalance,
        alternateinvoicenumber = :alternateInvoiceNumber,
        receivedtime = CURTIME(),
        deductionamount = :deductionAmount
      ON DUPLICATE KEY UPDATE transactionkey = :transactionKey
    `,
    params
  );

  await connection.execute(
    `
      UPDATE customerinvoice
      SET amountpaid = amountpaid + :amountPaid,
        invoicebalance = invoicebalance - :amountPaid
      WHERE invoicenumber = :invoiceNumber
    `,
    params
  );

  return result.affectedRows >= 0;
}

async function getInvoiceHeaderTransactionKey(
  connection: PoolConnection,
  routeKey: string | number,
  visitKey: string | number
): Promise<number | null> {
  const [rows] = await connection.execute<TransactionKeyRow[]>(
    `
      SELECT transactionkey
      FROM invoiceheader
      WHERE routekey = :routeKey
      AND visitkey = :visitKey
      LIMIT 1
    `,
    { routeKey, visitKey }
  );

  return rows[0]?.transactionkey ?? null;
}

async function getArHeaderTransactionKey(
  connection: PoolConnection,
  routeKey: string | number,
  visitKey: string | number
): Promise<number | null> {
  const [rows] = await connection.execute<TransactionKeyRow[]>(
    `
      SELECT transactionkey
      FROM arheader
      WHERE routekey = :routeKey
      AND visitkey = :visitKey
      LIMIT 1
    `,
    { routeKey, visitKey }
  );

  return rows[0]?.transactionkey ?? null;
}

function mapInvoiceDetailParams(item: InvoiceTransactionDetailItem, transactionKey: number) {
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
    modifiedDate: nullable(item.mdat),
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

function mapArDetailParams(item: ArTransactionDetailItem, transactionKey: number) {
  return {
    routeKey: required(item.routekey),
    visitKey: required(item.visitkey),
    transactionKey,
    invoiceNumber: required(item.invoicenumber),
    invoiceDate: nullable(item.invoicedate),
    totalInvoiceAmount: nullable(item.totalinvoiceamount),
    onAccountReasonCode: nullable(item.onacctreasoncode),
    amountPaid: nullable(item.amountpaid),
    invoiceBalance: nullable(item.invoicebalance),
    arCollectionType: nullable(item.arcollectiontype),
    chequeStatusIndicator: nullable(item.chequestatusindicator),
    referenceNo: nullable(item.sapchequestatusindicator),
    pdcBalance: nullable(item.pdcbalance),
    alternateInvoiceNumber: nullable(item.alternateinvoicenumber),
    salesmanCode: nullable(item.salesmancode),
    deductionAmount: nullable(item.deductionamount)
  };
}
