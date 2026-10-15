import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { nullable, required } from '../../../../shared/utils/commonUtils';
/** Inserts a customer operation once and prevents duplicate upload records. */
export async function saveCustomerOperationControl(connection: PoolConnection, item: Record<string, any>): Promise<boolean> {
    const [rows] = await connection.execute<(RowDataPacket & {
        count: number;
    })[]>(`
      SELECT COUNT(*) AS count
      FROM customeroperationscontrol
      WHERE routekey = :routeKey
      AND visitkey = :visitKey
    `, {
        routeKey: required(item.routekey),
        visitKey: required(item.visitkey)
    });
    if (Number(rows[0]?.count ?? 0) === 0) {
        await connection.execute(`
        INSERT INTO customeroperationscontrol SET
          visitkey = :visitKey,
          routekey = :routeKey,
          customercode = :customerCode,
          routecode = :routeCode,
          salesmancode = :salesmanCode,
          odometerreading = :odometerReading,
          visitstartdate = :visitStartDate,
          visitstarttime = :visitStartTime,
          visitenddate = :visitEndDate,
          visitendtime = CASE WHEN :visitEndTime = '0' THEN :visitStartTime ELSE :visitEndTime END,
          totaltransactions = :totalTransactions,
          addedcustomer = :addedCustomer,
          voidflag = :voidFlag,
          scannerindicator = :scannerIndicator,
          reasoncode = :reasonCode,
          latitude = :latitude,
          longitude = :longitude,
          radius = :radius,
          log_id = :logId
      `, {
            visitKey: required(item.visitkey),
            routeKey: required(item.routekey),
            customerCode: required(item.customercode),
            routeCode: required(item.routecode),
            salesmanCode: nullable(item.salesmancode),
            odometerReading: nullable(item.odometerreading),
            visitStartDate: nullable(item.visitstartdate),
            visitStartTime: nullable(item.visitstarttime),
            visitEndDate: nullable(item.visitenddate),
            visitEndTime: nullable(item.visitendtime),
            totalTransactions: nullable(item.totaltransactions),
            addedCustomer: nullable(item.addedcustomer),
            voidFlag: nullable(item.voidflag),
            scannerIndicator: nullable(item.scannerindicator),
            reasonCode: nullable(item.reasoncode),
            latitude: nullable(item.latitude),
            longitude: nullable(item.longitude),
            radius: nullable(item.radius),
            logId: nullable(item.log_id)
        });
    }
    return Number(item.routekey) > 0;
}
/** Saves a customer visit event used for route activity reporting. */
export async function saveCustomerVisitLog(connection: PoolConnection, item: Record<string, any>): Promise<boolean> {
    await connection.execute(`
      INSERT INTO customervisitlog SET
        logkey = :logKey,
        routekey = :routeKey,
        customercode = :customerCode,
        routecode = :routeCode,
        salesmancode = :salesmanCode,
        logstartdate = :logStartDate,
        logstarttime = :logStartTime,
        logenddate = :logEndDate,
        logendtime = :logEndTime,
        mdate = CURRENT_DATE()
      ON DUPLICATE KEY UPDATE
        customercode = VALUES(customercode),
        routecode = VALUES(routecode),
        salesmancode = VALUES(salesmancode),
        logstartdate = VALUES(logstartdate),
        logstarttime = VALUES(logstarttime),
        logenddate = VALUES(logenddate),
        logendtime = VALUES(logendtime),
        mdate = CURRENT_DATE()
    `, {
        logKey: required(item.log_id),
        routeKey: required(item.routekey),
        customerCode: required(item.customercode),
        routeCode: required(item.routecode),
        salesmanCode: nullable(item.salesmancode),
        logStartDate: nullable(item.log_startdate),
        logStartTime: nullable(item.log_starttime),
        logEndDate: nullable(item.log_enddate),
        logEndTime: nullable(item.log_endtime)
    });
    return Number(item.routekey) > 0;
}
/** Applies mobile route/odometer state changes to routemaster. */
export async function updateRouteMasterFromUpload(connection: PoolConnection, item: Record<string, any>): Promise<boolean> {
    await connection.execute(`
      UPDATE routemaster
      SET
        mdat = CURRENT_DATE(),
        hhcordseq = :hhcOrderSequence,
        hhcinvseq = :hhcInvoiceSequence,
        hhccshseq = :hhcCashSequence,
        hhcivtseq = :hhcInventorySequence,
        bodocseq = :boDocumentSequence,
        routebalance = :routeBalance,
        hhcarseq = :hhcArSequence,
        hhcloadseq = :hhcLoadSequence
      WHERE routecode = :routeCode
    `, {
        routeCode: required(item.routecode),
        hhcOrderSequence: nullable(item.hhcordseq),
        hhcInvoiceSequence: nullable(item.hhcinvseq),
        hhcCashSequence: nullable(item.hhccshseq),
        hhcInventorySequence: nullable(item.hhcivtseq),
        boDocumentSequence: nullable(item.bodocseq),
        routeBalance: nullable(item.routebalance),
        hhcArSequence: nullable(item.hhcarseq),
        hhcLoadSequence: nullable(item.hhcloadseq)
    });
    return Number(item.routecode) > 0;
}
/** Inserts or updates a customer's route sequence for the requested day. */
export async function saveCustomerSequence(connection: PoolConnection, item: Record<string, any>): Promise<boolean> {
    await connection.execute(`
      INSERT INTO temp_cust_seq_sts SET
        routekey = :routeKey,
        seqweeknumber = :sequenceWeekNumber,
        seqweekday = :sequenceWeekDay,
        routecode = :routeCode,
        customercode = :customerCode,
        sequencenumber = :sequenceNumber,
        schelduledflag = :scheduledFlag,
        servicedflag = :servicedFlag,
        scannedflag = :scannedFlag
    `, {
        routeKey: required(item.routekey),
        sequenceWeekNumber: required(item.seqweeknumber),
        sequenceWeekDay: required(item.seqweekday),
        routeCode: required(item.routecode),
        customerCode: required(item.customercode),
        sequenceNumber: nullable(item.sequencenumber),
        scheduledFlag: nullable(item.schelduledflag),
        servicedFlag: nullable(item.servicedflag),
        scannedFlag: nullable(item.scannedflag)
    });
    if (Number(item.seqweeknumber) === 0 || Number(item.seqweekday) === 0) {
        return false;
    }
    const exists = await customerSequenceExists(connection, item);
    if (!exists) {
        await connection.execute(`
        INSERT INTO routesequencecustomerstatus SET
          routekey = :routeKey,
          seqweeknumber = :sequenceWeekNumber,
          seqweekday = :sequenceWeekDay,
          routecode = :routeCode,
          customercode = :customerCode,
          sequencenumber = :sequenceNumber,
          schelduledflag = :scheduledFlag,
          servicedflag = :servicedFlag,
          scannedflag = :scannedFlag
      `, {
            routeKey: required(item.routekey),
            sequenceWeekNumber: required(item.seqweeknumber),
            sequenceWeekDay: required(item.seqweekday),
            routeCode: required(item.routecode),
            customerCode: required(item.customercode),
            sequenceNumber: nullable(item.sequencenumber),
            scheduledFlag: nullable(item.schelduledflag),
            servicedFlag: nullable(item.servicedflag),
            scannedFlag: nullable(item.scannedflag)
        });
        return Number(item.routekey) > 0;
    }
    await connection.execute(`
      UPDATE routesequencecustomerstatus
      SET
        servicedflag = :servicedFlag,
        scannedflag = :scannedFlag
      WHERE routekey = :routeKey
      AND routecode = :routeCode
      AND customercode = :customerCode
      AND seqweekday = :sequenceWeekDay
      AND seqweeknumber = :sequenceWeekNumber
      AND sequencenumber = :sequenceNumber
    `, {
        routeKey: required(item.routekey),
        sequenceWeekNumber: required(item.seqweeknumber),
        sequenceWeekDay: required(item.seqweekday),
        routeCode: required(item.routecode),
        customerCode: required(item.customercode),
        sequenceNumber: nullable(item.sequencenumber),
        scheduledFlag: nullable(item.schelduledflag),
        servicedFlag: nullable(item.servicedflag),
        scannedFlag: nullable(item.scannedflag)
    });
    return Number(item.routekey) > 0;
}
/** Checks the composite sequence identity before choosing insert or update. */
async function customerSequenceExists(connection: PoolConnection, item: Record<string, any>): Promise<boolean> {
    const [rows] = await connection.execute<(RowDataPacket & {
        count: number;
    })[]>(`
      SELECT COUNT(*) AS count
      FROM routesequencecustomerstatus
      WHERE routekey = :routeKey
      AND customercode = :customerCode
      AND seqweekday = :sequenceWeekDay
      AND seqweeknumber = :sequenceWeekNumber
      AND sequencenumber = :sequenceNumber
    `, {
        routeKey: required(item.routekey),
        sequenceWeekNumber: required(item.seqweeknumber),
        sequenceWeekDay: required(item.seqweekday),
        routeCode: required(item.routecode),
        customerCode: required(item.customercode),
        sequenceNumber: nullable(item.sequencenumber),
        scheduledFlag: nullable(item.schelduledflag),
        servicedFlag: nullable(item.servicedflag),
        scannedFlag: nullable(item.scannedflag)
    });
    return Number(rows[0]?.count ?? 0) > 0;
}
