import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import type { MasterDataSyncResponseSections } from '../masterdatasync.types';

type GenericRow = RowDataPacket & Record<string, unknown>;

export async function getSurveySyncSections(
  connection: PoolConnection
): Promise<MasterDataSyncResponseSections> {
  const [
    posMaster,
    customerPosInventory,
    customerPosLimit,
    posInstructions,
    customerSurveyPlan,
    customerSurveyKeyPlan,
    customerSurveyKey,
    customerSurveyDefinition,
    customerSurveyDefAssign,
    lookupIndexDetail
  ] = await Promise.all([
    getPosMaster(connection),
    getCustomerPosInventory(connection),
    getCustomerPosLimit(connection),
    getPosInstructions(connection),
    getCustomerSurveyPlan(connection),
    getCustomerSurveyKeyPlan(connection),
    getCustomerSurveyKey(connection),
    getCustomerSurveyDefinition(connection),
    getCustomerSurveyDefAssign(connection),
    getLookupIndexDetail(connection)
  ]);

  return {
    POSmaster: posMaster,
    customerposinventory: customerPosInventory,
    customerposlimit: customerPosLimit,
    posinstructions: posInstructions,
    customersurveyplan: customerSurveyPlan,
    customersurveykeyplan: customerSurveyKeyPlan,
    customersurveykey: customerSurveyKey,
    customersurveydefinition: customerSurveyDefinition,
    customersurveydefassign: customerSurveyDefAssign,
    lookupindexdetail: lookupIndexDetail
  };
}

async function getPosMaster(connection: PoolConnection): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'posmaster'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        itemcode,
        alternatecode,
        itemdescription,
        arbitemdescription,
        itemvalue,
        inventorytype,
        created,
        cdat,
        modified,
        mdat,
        activestatus
      FROM posmaster
    `
  );

  return rows;
}

async function getCustomerPosInventory(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'customerposinventory'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT customercode, itemcode, quantity, serialnumber
      FROM customerposinventory
    `
  );

  return rows;
}

async function getCustomerPosLimit(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'customerposlimit'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT customercode, poslimit, posbalance
      FROM customerposlimit
    `
  );

  return rows;
}

async function getPosInstructions(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'posinstructions'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        posinstructioncode,
        posinstructionname,
        arbposinstructionname,
        created,
        cdat,
        modified,
        mdat
      FROM posinstructions
    `
  );

  return rows;
}

async function getCustomerSurveyPlan(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'customersurveyplan'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        surveyplankey,
        surveysequencenumber,
        surveymandatory,
        surveydescription,
        arbsurveydescription
      FROM customersurveyplan
    `
  );

  return rows;
}

async function getCustomerSurveyKeyPlan(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'customersurveykeyplan'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT primary_key, surveyplankey, surveykey
      FROM customersurveykeyplan
    `
  );

  return rows;
}

async function getCustomerSurveyKey(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'customersurveykey'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        surveykey,
        surveydescription,
        arbsurveydescription,
        surveyplankey,
        created,
        cdat,
        modified,
        mdat,
        activestatus
      FROM customersurveykey
    `
  );

  return rows;
}

async function getCustomerSurveyDefinition(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'customersurveydefinition'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        surveydefkey,
        surveyindex,
        lineindex,
        surveyrectype,
        surveyprompt,
        arbsurveyprompt,
        responselength,
        responsedecimalpos,
        lookuptype,
        lookupindex,
        retainvalue,
        activestatus,
        created,
        cdat,
        modified,
        mdat
      FROM customersurveydefinition
    `
  );

  return rows;
}

async function getCustomerSurveyDefAssign(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'customersurveydefassign'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT surveyplankey, surveydefkey
      FROM customersurveydefassign
    `
  );

  return rows;
}

async function getLookupIndexDetail(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'lookupindexdetail'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT primary_key, transactionkey, description, arbdescription
      FROM lookupindexdetail
    `
  );

  return rows;
}

async function tableExists(
  connection: PoolConnection,
  tableName: string
): Promise<boolean> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = :tableName
      LIMIT 1
    `,
    { tableName }
  );

  return rows.length > 0;
}
