/**
 * @author MD.Rabius Sani Raju
 * @date 2026-10-15
 */

import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { nullable, required } from '../../../../shared/utils/commonUtils';
/** Saves an AR collection header and returns its transaction key. */
export async function saveArHeader(connection: PoolConnection, item: Record<string, any>): Promise<number> {
    const existingTransactionKey = await getArHeaderTransactionKey(connection, required(item.invoicenumber));
    if (existingTransactionKey !== null) {
        await connection.execute('UPDATE arheader SET voidflag = :voidFlag WHERE invoicenumber = :invoiceNumber', { invoiceNumber: required(item.invoicenumber), voidFlag: nullable(item.voidflag) });
        return existingTransactionKey;
    }
    const documentNumber = await getNextArDocumentNumber(connection, required(item.routecode));
    const [insertResult] = await connection.execute<ResultSetHeader>(`
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
    `, {
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
    });
    return insertResult.insertId;
}
/** Saves an AR detail linked to the resolved header transaction key. */
export async function saveArDetail(connection: PoolConnection, item: Record<string, any>, transactionKey: number): Promise<boolean> {
    const [rows] = await connection.execute<(RowDataPacket & {
        count: number;
    })[]>(`
      SELECT COUNT(*) AS count
      FROM ardetail
      WHERE routekey = :routeKey
      AND visitkey = :visitKey
      AND invoicenumber = :invoiceNumber
    `, {
        routeKey: required(item.routekey),
        visitKey: required(item.visitkey),
        invoiceNumber: required(item.invoicenumber)
    });
    if (Number(rows[0]?.count ?? 0) > 0) {
        return false;
    }
    await connection.execute(`
      INSERT INTO ardetail SET
        routekey = :routeKey, visitkey = :visitKey, transactionkey = :transactionKey,
        invoicenumber = :invoiceNumber, salesmancode = :salesmanCode, invoicedate = :invoiceDate,
        totalinvoiceamount = :totalInvoiceAmount, onacctreasoncode = :onAccountReasonCode,
        amountpaid = :amountPaid, invoicebalance = :invoiceBalance, arcollectiontype = :arCollectionType,
        chequestatusindicator = :chequeStatusIndicator, referenceno = :referenceNo,
        currencycode = get_default_currencycode_routekey(:routeKey), pdcbalance = :pdcBalance,
        alternateinvoicenumber = :alternateInvoiceNumber, receivedtime = CURTIME(),
        deductionamount = :deductionAmount
    `, {
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
    });
    await connection.execute(`
      UPDATE customerinvoice
      SET amountpaid = amountpaid + :amountPaid,
        invoicebalance = invoicebalance - :amountPaid
      WHERE invoicenumber = :invoiceNumber
    `, {
        amountPaid: nullable(item.amountpaid),
        invoiceNumber: required(item.invoicenumber)
    });
    return true;
}
/** Saves cash or cheque payment information with legacy defaults. */
export async function saveCashCheckDetail(connection: PoolConnection, item: Record<string, any>): Promise<boolean> {
    const params = {
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
    const [rows] = await connection.execute<(RowDataPacket & {
        count: number;
    })[]>(`
      SELECT COUNT(*) AS count
      FROM cashcheckdetail
      WHERE routekey = :routeKey
      AND visitkey = :visitKey
      AND hhctransactionkey = :hhcTransactionKey
    `, params);
    if (Number(rows[0]?.count ?? 0) === 0) {
        await connection.execute(`
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
      `, params);
    }
    else {
        await connection.execute(`
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
      `, params);
    }
    return Number(item.routekey) > 0;
}
/** Finds an existing AR header key so retry uploads remain idempotent. */
async function getArHeaderTransactionKey(connection: PoolConnection, invoiceNumber: string | number): Promise<number | null> {
    const [rows] = await connection.execute<(RowDataPacket & {
        transactionkey: number;
    })[]>(`
      SELECT transactionkey
      FROM arheader
      WHERE invoicenumber = :invoiceNumber
      LIMIT 1
    `, { invoiceNumber });
    return rows[0]?.transactionkey ?? null;
}
/** Allocates the next AR document number for a route. */
async function getNextArDocumentNumber(connection: PoolConnection, routeCode: string | number): Promise<number> {
    const [rows] = await connection.execute<(RowDataPacket & {
        documentNumber: number;
    })[]>(`
      SELECT COALESCE(
        MAX(documentnumber) + 1,
        CAST(CONCAT(CAST(:routeCode AS CHAR), '000001') AS UNSIGNED)
      ) AS documentNumber
      FROM arheader
      WHERE routecode = :routeCode
    `, { routeCode });
    return rows[0]?.documentNumber ?? Number(`${routeCode}000001`);
}
/** Applies the database length limit without changing null or numeric values. */
function truncateCheckNumber(value: unknown): string | number | null {
    const checkNumber = nullable(value);
    if (typeof checkNumber !== 'string') {
        return checkNumber;
    }
    return checkNumber.length > 10 ? checkNumber.slice(0, 10) : checkNumber;
}
