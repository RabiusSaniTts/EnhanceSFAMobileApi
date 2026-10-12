import type { PoolConnection, ResultSetHeader } from 'mysql2/promise';
import type {
  ArDetailUploadItem,
  ArHeaderUploadItem,
  CashCheckDetailUploadItem
} from '../transactions.types';
import type {
  CountRow,
  GeneratedDocumentNumberRow,
  TransactionKeyRow
} from './shared.repository';
import { nullable, required } from './shared.repository';

export async function saveArHeader(
  connection: PoolConnection,
  item: ArHeaderUploadItem
): Promise<number> {
  const existingTransactionKey = await getArHeaderTransactionKey(connection, required(item.invoicenumber));

  if (existingTransactionKey !== null) {
    await connection.execute(
      'UPDATE arheader SET voidflag = :voidFlag WHERE invoicenumber = :invoiceNumber',
      { invoiceNumber: required(item.invoicenumber), voidFlag: nullable(item.voidflag) }
    );
    return existingTransactionKey;
  }

  const documentNumber = await getNextArDocumentNumber(connection, required(item.routecode));
  const [insertResult] = await connection.execute<ResultSetHeader>(
    `
      INSERT INTO arheader SET
        routekey = :routeKey, visitkey = :visitKey, documentnumber = :documentNumber,
        transactiondate = check_monthclosing_time(:transactionDate), transactiontime = :transactionTime,
        customercode = :customerCode, routecode = :routeCode, salesmancode = :salesmanCode,
        voidflag = :voidFlag, splittransaction = :splitTransaction, transmitindicator = :transmitIndicator,
        totalinvoiceamount = :totalInvoiceAmount, amountpaid = :amountPaid, invoicebalance = :invoiceBalance,
        invoicenumber = :invoiceNumber, hhcdocumentnumber = :hhcDocumentNumber,
        hhcinvoicenumber = :hhcInvoiceNumber, voidreasoncode = :voidReasonCode,
        chequecollection = :chequeCollection, currencycode = get_default_currencycode_routekey(:routeKey),
        hhctransactionkey = :hhcTransactionKey, data = :data, comments = :comments,
        advancepaymentflag = :advancePaymentFlag, excesspayment = :excessPayment,
        comments2 = :comments2, record_flag = '1', actualtransactiondate = :transactionDate,
        receivedtime = CURTIME(), deductionflag = :deductionFlag
    `,
    mapArHeaderParams(item, documentNumber)
  );

  return insertResult.insertId;
}

export async function saveArDetail(
  connection: PoolConnection,
  item: ArDetailUploadItem,
  transactionKey: number
): Promise<boolean> {
  const [rows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS count
      FROM ardetail
      WHERE routekey = :routeKey
      AND visitkey = :visitKey
      AND invoicenumber = :invoiceNumber
    `,
    {
      routeKey: required(item.routekey),
      visitKey: required(item.visitkey),
      invoiceNumber: required(item.invoicenumber)
    }
  );

  if (Number(rows[0]?.count ?? 0) > 0) {
    return false;
  }

  await connection.execute(
    `
      INSERT INTO ardetail SET
        routekey = :routeKey, visitkey = :visitKey, transactionkey = :transactionKey,
        invoicenumber = :invoiceNumber, salesmancode = :salesmanCode, invoicedate = :invoiceDate,
        totalinvoiceamount = :totalInvoiceAmount, onacctreasoncode = :onAccountReasonCode,
        amountpaid = :amountPaid, invoicebalance = :invoiceBalance, arcollectiontype = :arCollectionType,
        chequestatusindicator = :chequeStatusIndicator, referenceno = :referenceNo,
        currencycode = get_default_currencycode_routekey(:routeKey), pdcbalance = :pdcBalance,
        alternateinvoicenumber = :alternateInvoiceNumber, receivedtime = CURTIME(),
        deductionamount = :deductionAmount
    `,
    mapArDetailParams(item, transactionKey)
  );

  await connection.execute(
    `
      UPDATE customerinvoice
      SET amountpaid = amountpaid + :amountPaid,
        invoicebalance = invoicebalance - :amountPaid
      WHERE invoicenumber = :invoiceNumber
    `,
    {
      amountPaid: nullable(item.amountpaid),
      invoiceNumber: required(item.invoicenumber)
    }
  );

  return true;
}

export async function saveCashCheckDetail(
  connection: PoolConnection,
  item: CashCheckDetailUploadItem
): Promise<boolean> {
  const params = mapCashCheckDetailParams(item);
  const [rows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS count
      FROM cashcheckdetail
      WHERE routekey = :routeKey
      AND visitkey = :visitKey
      AND hhctransactionkey = :hhcTransactionKey
    `,
    params
  );

  if (Number(rows[0]?.count ?? 0) === 0) {
    await connection.execute(
      `
        INSERT INTO cashcheckdetail SET
          routekey = :routeKey, visitkey = :visitKey, typecode = :typeCode,
          checknumber = :checkNumber, amount = :amount, updateindicator = :updateIndicator,
          checkdate = :checkDate, bankcode = :bankCode, checkstatus = :checkStatus,
          branchcode = :branchCode, drawercode = :drawerCode,
          chequestatusindicator = :chequeStatusIndicator,
          sapchequestatusindicator = :sapChequeStatusIndicator,
          currencycode = get_default_currencycode_routekey(:routeKey),
          hhctransactionkey = :hhcTransactionKey, paymenttype = :paymentType,
          transactiontype = :transactionType, checktype = :checkType
      `,
      params
    );
  } else {
    await connection.execute(
      `
        UPDATE cashcheckdetail SET
          typecode = :typeCode, checknumber = :checkNumber, amount = :amount,
          updateindicator = :updateIndicator, checkdate = :checkDate, bankcode = :bankCode,
          checkstatus = :checkStatus, branchcode = :branchCode, drawercode = :drawerCode,
          chequestatusindicator = :chequeStatusIndicator,
          sapchequestatusindicator = :sapChequeStatusIndicator,
          currencycode = get_default_currencycode_routekey(:routeKey),
          paymenttype = :paymentType, transactiontype = :transactionType, checktype = :checkType
        WHERE routekey = :routeKey
        AND visitkey = :visitKey
        AND hhctransactionkey = :hhcTransactionKey
      `,
      params
    );
  }

  return Number(item.routekey) > 0;
}

async function getArHeaderTransactionKey(
  connection: PoolConnection,
  invoiceNumber: string | number
): Promise<number | null> {
  const [rows] = await connection.execute<TransactionKeyRow[]>(
    `
      SELECT transactionkey
      FROM arheader
      WHERE invoicenumber = :invoiceNumber
      LIMIT 1
    `,
    { invoiceNumber }
  );

  return rows[0]?.transactionkey ?? null;
}

async function getNextArDocumentNumber(
  connection: PoolConnection,
  routeCode: string | number
): Promise<string | number> {
  const [rows] = await connection.execute<GeneratedDocumentNumberRow[]>(
    `
      SELECT COALESCE(
        MAX(documentnumber) + 1,
        CAST(CONCAT(CAST(:routeCode AS CHAR), '000001') AS UNSIGNED)
      ) AS documentNumber
      FROM arheader
      WHERE routecode = :routeCode
    `,
    { routeCode }
  );

  return rows[0]?.documentNumber ?? `${routeCode}000001`;
}

function mapArHeaderParams(item: ArHeaderUploadItem, documentNumber: string | number) {
  return {
    routeKey: required(item.routekey),
    visitKey: required(item.visitkey),
    documentNumber,
    transactionDate: required(item.transactiondate),
    transactionTime: nullable(item.transactiontime),
    customerCode: required(item.customercode),
    routeCode: required(item.routecode),
    salesmanCode: nullable(item.salesmancode),
    voidFlag: nullable(item.voidflag),
    splitTransaction: nullable(item.splittransaction),
    transmitIndicator: nullable(item.transmitindicator),
    totalInvoiceAmount: nullable(item.totalinvoiceamount),
    amountPaid: nullable(item.amountpaid),
    invoiceBalance: nullable(item.invoicebalance),
    invoiceNumber: required(item.invoicenumber),
    hhcDocumentNumber: nullable(item.hhcdocumentnumber),
    hhcInvoiceNumber: nullable(item.hhcinvoicenumber),
    voidReasonCode: nullable(item.voidreasoncode),
    chequeCollection: nullable(item.chequecollection),
    hhcTransactionKey: nullable(item.hhctransactionkey),
    data: nullable(item.data),
    comments: nullable(item.comments),
    advancePaymentFlag: nullable(item.advancepaymentflag),
    excessPayment: nullable(item.excesspayment),
    comments2: nullable(item.comments2),
    deductionFlag: nullable(item.deductionflag)
  };
}

function mapArDetailParams(item: ArDetailUploadItem, transactionKey: number) {
  return {
    routeKey: required(item.routekey),
    visitKey: required(item.visitkey),
    transactionKey,
    invoiceNumber: required(item.invoicenumber),
    salesmanCode: nullable(item.salesmancode),
    invoiceDate: required(item.invoicedate),
    totalInvoiceAmount: nullable(item.totalinvoiceamount),
    onAccountReasonCode: nullable(item.onacctreasoncode),
    amountPaid: nullable(item.amountpaid),
    invoiceBalance: nullable(item.invoicebalance),
    arCollectionType: nullable(item.arcollectiontype),
    chequeStatusIndicator: nullable(item.chequestatusindicator),
    referenceNo: nullable(item.sapchequestatusindicator),
    pdcBalance: nullable(item.pdcbalance),
    alternateInvoiceNumber: nullable(item.alternateinvoicenumber),
    deductionAmount: nullable(item.deductionamount)
  };
}

function mapCashCheckDetailParams(item: CashCheckDetailUploadItem) {
  return {
    routeKey: required(item.routekey),
    visitKey: required(item.visitkey),
    typeCode: nullable(item.typecode),
    paymentType: nullable(item.paymenttype),
    checkNumber: truncateCheckNumber(item.checknumber),
    amount: nullable(item.amount),
    updateIndicator: nullable(item.updateindicator),
    checkDate: nullable(item.checkdate),
    bankCode: nullable(item.bankcode),
    checkStatus: nullable(item.checkstatus),
    branchCode: nullable(item.branchcode),
    drawerCode: nullable(item.drawercode),
    chequeStatusIndicator: nullable(item.chequestatusindicator),
    sapChequeStatusIndicator: nullable(item.sapchequestatusindicator),
    hhcTransactionKey: nullable(item.hhctransactionkey),
    transactionType: nullable(item.transactiontype),
    checkType: nullable(item.checktype)
  };
}

function truncateCheckNumber(value: unknown): string | number | null {
  const checkNumber = nullable(value);

  if (typeof checkNumber !== 'string') {
    return checkNumber;
  }

  return checkNumber.length > 10 ? checkNumber.slice(0, 10) : checkNumber;
}
