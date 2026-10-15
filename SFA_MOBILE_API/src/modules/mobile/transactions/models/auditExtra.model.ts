/**
 * @author MD.Rabius Sani Raju
 * @date 2026-10-15
 */

import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { nullable, required } from '../../../../shared/utils/commonUtils';


/** Inserts or updates one survey response and reports persistence success. */
export async function saveSurveyAuditDetail(
  connection: PoolConnection,
  item: Record<string, any>
): Promise<boolean> {
  const [rows] = await connection.execute<(RowDataPacket & { count: number })[]>(
    `
      SELECT COUNT(*) AS count
      FROM surveyauditdetail
      WHERE routekey = :routeKey
      AND visitkey = :visitKey
      AND surveydefkey = :surveyDefKey
    `,
    {
      routeKey: required(item.routekey),
      visitKey: required(item.visitkey),
      surveyDefKey: required(item.surveydefkey)
    }
  );

  if (Number(rows[0]?.count ?? 0) === 0) {
    await connection.execute(
      `
        INSERT INTO surveyauditdetail SET
          routekey = :routeKey, visitkey = :visitKey, surveydefkey = :surveyDefKey,
          surveypage = :surveyPage, surveyindex = :surveyIndex,
          surveyrectype = :surveyRecType, lookuptype = :lookupType,
          surveyresponse = :surveyResponse
      `,
      {
        routeKey: required(item.routekey),
        visitKey: required(item.visitkey),
        surveyDefKey: required(item.surveydefkey),
        surveyPage: nullable(item.surveypage),
        surveyIndex: nullable(item.surveyindex),
        surveyRecType: nullable(item.surveyrectype),
        lookupType: nullable(item.lookuptype),
        surveyResponse: nullable(item.surveyresponse)
      }
    );
  } else {
    await connection.execute(
      `
        UPDATE surveyauditdetail SET
          surveypage = :surveyPage,
          surveyindex = :surveyIndex,
          surveyrectype = :surveyRecType,
          lookuptype = :lookupType,
          surveyresponse = :surveyResponse
        WHERE routekey = :routeKey
        AND visitkey = :visitKey
        AND surveydefkey = :surveyDefKey
      `,
      {
        routeKey: required(item.routekey),
        visitKey: required(item.visitkey),
        surveyDefKey: required(item.surveydefkey),
        surveyPage: nullable(item.surveypage),
        surveyIndex: nullable(item.surveyindex),
        surveyRecType: nullable(item.surveyrectype),
        lookupType: nullable(item.lookuptype),
        surveyResponse: nullable(item.surveyresponse)
      }
    );
  }

  return Number(item.routekey) > 0;
}
/** Saves a POS equipment change scoped to route, visit, and item. */
export async function savePosEquipmentChangeDetail(
  connection: PoolConnection,
  item: Record<string, any>
): Promise<boolean> {
  const [rows] = await connection.execute<(RowDataPacket & { count: number })[]>(
    `
      SELECT COUNT(*) AS count
      FROM posequipmentchangedetail
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

  if (Number(rows[0]?.count ?? 0) === 0) {
    await connection.execute(
      `
        INSERT INTO posequipmentchangedetail SET
          routekey = :routeKey, visitkey = :visitKey, posaction = :posAction,
          itemcode = :itemCode, quantity = :quantity, serialnumber = :serialNumber,
          instructioncode = :instructionCode
      `,
      {
        routeKey: required(item.routekey),
        visitKey: required(item.visitkey),
        posAction: nullable(item.posaction),
        itemCode: required(item.itemcode),
        quantity: nullable(item.quantity),
        serialNumber: nullable(item.serialnumber),
        instructionCode: nullable(item.instructioncode)
      }
    );
  } else {
    await connection.execute(
      `
        UPDATE posequipmentchangedetail SET
          routekey = :routeKey, visitkey = :visitKey, posaction = :posAction,
          itemcode = :itemCode, quantity = :quantity, serialnumber = :serialNumber,
          instructioncode = :instructionCode
        WHERE routekey = :routeKey
        AND visitkey = :visitKey
        AND itemcode = :itemCode
      `,
      {
        routeKey: required(item.routekey),
        visitKey: required(item.visitkey),
        posAction: nullable(item.posaction),
        itemCode: required(item.itemcode),
        quantity: nullable(item.quantity),
        serialNumber: nullable(item.serialnumber),
        instructionCode: nullable(item.instructioncode)
      }
    );
  }

  return Number(item.routekey) > 0;
}
/** Updates mobile-managed values for an existing POS master record. */
export async function savePosMaster(
  connection: PoolConnection,
  item: Record<string, any>
): Promise<number> {
  const [insertResult] = await connection.execute<ResultSetHeader>(
    `
      INSERT INTO posmaster SET
        alternatecode = :alternateCode,
        itemdescription = :itemDescription,
        arbitemdescription = :arbItemDescription,
        itemvalue = :itemValue,
        inventorytype = :inventoryType,
        created = :created,
        cdat = CURRENT_DATE(),
        modified = :created,
        mdat = CURRENT_DATE(),
        activestatus = :activeStatus
    `,
    {
      alternateCode: nullable(item.itemcode),
      itemDescription: nullable(item.itemdescription),
      arbItemDescription: nullable(item.arbitemdescription),
      itemValue: nullable(item.itemvalue),
      inventoryType: nullable(item.inventorytype),
      created: nullable(item.created),
      activeStatus: nullable(item.activestatus)
    }
  );

  return insertResult.insertId;
}

/** Saves customer-image metadata; binary upload is handled by the controller. */
export async function saveCustomerImage(
  connection: PoolConnection,
  item: Record<string, any>
): Promise<boolean> {
  const [rows] = await connection.execute<(RowDataPacket & { count: number })[]>(
    `
      SELECT COUNT(*) AS count
      FROM customerimages
      WHERE imagename = :imageName
      AND routekey = :routeKey
      AND customercode = :customerCode
    `,
    {
      imageName: required(item.imagename),
      routeKey: required(item.routekey),
      customerCode: required(item.customercode)
    }
  );

  if (Number(rows[0]?.count ?? 0) > 0) {
    return false;
  }

  const [insertResult] = await connection.execute<ResultSetHeader>(
    `
      INSERT INTO customerimages SET
        imagename = :imageName,
        customercode = :customerCode,
        imageno = :imageNo,
        imagepath = :imagePath,
        routecode = :routeCode,
        routekey = :routeKey,
        transactiondate = :transactionDate,
        transactiontime = :transactionTime,
        visitkey = :visitKey
    `,
    {
      imageName: required(item.imagename),
      customerCode: required(item.customercode),
      imageNo: nullable(item.imageno),
      imagePath: nullable(item.imagepath),
      routeCode: required(item.routecode),
      routeKey: required(item.routekey),
      transactionDate: nullable(item.transactiondate),
      transactionTime: nullable(item.transactiontime),
      visitKey: required(item.visitkey)
    }
  );

  return insertResult.insertId > 0;
}

/** Stores an access-override audit event and reports insertion success. */
export async function saveAccessOverrideLog(
  connection: PoolConnection,
  item: Record<string, any>
): Promise<boolean> {
  await connection.execute(
    `
      INSERT INTO t_access_override_log SET
        routekey = :routeKey,
        visitkey = :visitKey,
        \`type\` = :type,
        routecode = :routeCode,
        customercode = :customerCode,
        salesmancode = :salesmanCode,
        featureid = :featureId,
        accesskey = :accessKey,
        accesstime = :accessTime,
        voidflag = :voidFlag,
        validflag = :validFlag
    `,
    {
      routeKey: required(item.routekey),
      visitKey: required(item.visitkey),
      type: nullable(item.type),
      routeCode: required(item.routecode),
      customerCode: nullable(item.customercode),
      salesmanCode: nullable(item.salesmancode),
      featureId: required(item.featureid),
      accessKey: nullable(item.accesskey),
      accessTime: nullable(item.accesstime),
      voidFlag: nullable(item.voidflag),
      validFlag: nullable(item.validflag)
    }
  );

  return Number(item.routekey) > 0;
}

