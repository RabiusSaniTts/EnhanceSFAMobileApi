import type { PoolConnection, ResultSetHeader } from 'mysql2/promise';
import type {
  AccessOverrideLogUploadItem,
  CustomerImageUploadItem,
  PosEquipmentChangeDetailUploadItem,
  PosMasterUploadItem,
  SurveyAuditDetailUploadItem
} from '../transactions.types';
import type {
  CountRow
} from './shared.repository';
import { nullable, required } from './shared.repository';

export async function saveSurveyAuditDetail(
  connection: PoolConnection,
  item: SurveyAuditDetailUploadItem
): Promise<boolean> {
  const params = mapSurveyAuditDetailParams(item);
  const [rows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS count
      FROM surveyauditdetail
      WHERE routekey = :routeKey
      AND visitkey = :visitKey
      AND surveydefkey = :surveyDefKey
    `,
    params
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
      params
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
      params
    );
  }

  return Number(item.routekey) > 0;
}

export async function savePosEquipmentChangeDetail(
  connection: PoolConnection,
  item: PosEquipmentChangeDetailUploadItem
): Promise<boolean> {
  const params = mapPosEquipmentChangeDetailParams(item);
  const [rows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS count
      FROM posequipmentchangedetail
      WHERE routekey = :routeKey
      AND visitkey = :visitKey
      AND itemcode = :itemCode
    `,
    params
  );

  if (Number(rows[0]?.count ?? 0) === 0) {
    await connection.execute(
      `
        INSERT INTO posequipmentchangedetail SET
          routekey = :routeKey, visitkey = :visitKey, posaction = :posAction,
          itemcode = :itemCode, quantity = :quantity, serialnumber = :serialNumber,
          instructioncode = :instructionCode
      `,
      params
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
      params
    );
  }

  return Number(item.routekey) > 0;
}

export async function savePosMaster(
  connection: PoolConnection,
  item: PosMasterUploadItem
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

export async function saveCustomerImage(
  connection: PoolConnection,
  item: CustomerImageUploadItem
): Promise<boolean> {
  const params = mapCustomerImageParams(item);
  const [rows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS count
      FROM customerimages
      WHERE imagename = :imageName
      AND routekey = :routeKey
      AND customercode = :customerCode
    `,
    params
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
    params
  );

  return insertResult.insertId > 0;
}

export async function saveAccessOverrideLog(
  connection: PoolConnection,
  item: AccessOverrideLogUploadItem
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

function mapSurveyAuditDetailParams(item: SurveyAuditDetailUploadItem) {
  return {
    routeKey: required(item.routekey),
    visitKey: required(item.visitkey),
    surveyDefKey: required(item.surveydefkey),
    surveyPage: nullable(item.surveypage),
    surveyIndex: nullable(item.surveyindex),
    surveyRecType: nullable(item.surveyrectype),
    lookupType: nullable(item.lookuptype),
    surveyResponse: nullable(item.surveyresponse)
  };
}

function mapPosEquipmentChangeDetailParams(item: PosEquipmentChangeDetailUploadItem) {
  return {
    routeKey: required(item.routekey),
    visitKey: required(item.visitkey),
    posAction: nullable(item.posaction),
    itemCode: required(item.itemcode),
    quantity: nullable(item.quantity),
    serialNumber: nullable(item.serialnumber),
    instructionCode: nullable(item.instructioncode)
  };
}

function mapCustomerImageParams(item: CustomerImageUploadItem) {
  return {
    imageName: required(item.imagename),
    customerCode: required(item.customercode),
    imageNo: nullable(item.imageno),
    imagePath: nullable(item.imagepath),
    routeCode: required(item.routecode),
    routeKey: required(item.routekey),
    transactionDate: nullable(item.transactiondate),
    transactionTime: nullable(item.transactiontime),
    visitKey: required(item.visitkey)
  };
}
