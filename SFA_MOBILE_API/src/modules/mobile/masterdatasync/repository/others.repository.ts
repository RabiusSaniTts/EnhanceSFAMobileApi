import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import type { MasterDataSyncResponseSections } from '../masterdatasync.types';

type GenericRow = RowDataPacket & Record<string, unknown>;

export async function getOtherSyncSections(
  connection: PoolConnection
): Promise<MasterDataSyncResponseSections> {
  const [
    customerMessages,
    salesmanMessages,
    vanMaster,
    bankMaster,
    cashDescription,
    inventoryLocation
  ] = await Promise.all([
    getCustomerMessages(connection),
    getSalesmanMessages(connection),
    getVanMaster(connection),
    getBankMaster(connection),
    getCashDescription(connection),
    getInventoryLocation(connection)
  ]);

  return {
    customermessages: customerMessages,
    salesmanmessages: salesmanMessages,
    vanmaster: vanMaster,
    bankmaster: bankMaster,
    cashdesc: cashDescription,
    inventorylocation: inventoryLocation
  };
}

async function getCustomerMessages(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'customermessages'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        messagekey,
        alternatecode,
        messagedescription,
        messageline1,
        messageline2,
        messageline3,
        messageline4,
        arbmessageline1,
        arbmessageline2,
        arbmessageline3,
        arbmessageline4,
        created,
        cdat,
        modified,
        mdat,
        activestatus
      FROM customermessages
    `
  );

  return rows;
}

async function getSalesmanMessages(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'salesmanmessages'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        messagekey,
        alternatecode,
        messagedescription,
        message1,
        message2,
        message3,
        message4,
        arbmessageline1,
        arbmessageline2,
        arbmessageline3,
        arbmessageline4,
        created,
        cdat,
        modified,
        mdat,
        activestatus
      FROM salesmanmessages
    `
  );

  return rows;
}

async function getVanMaster(connection: PoolConnection): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'vanmaster'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        vancode,
        alternatecode,
        vandescription,
        arbvandescription,
        activestatus,
        vanregno,
        vanmodel,
        vantype,
        created,
        cdat,
        modified,
        mdat
      FROM vanmaster
    `
  );

  return rows;
}

async function getBankMaster(connection: PoolConnection): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'bankmaster'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT
        bankcode,
        bankname,
        arbbankname,
        bankbalance,
        created,
        cdat,
        modified,
        mdat,
        activestatus,
        alternatecode,
        type,
        acnumber
      FROM bankmaster
    `
  );

  return rows;
}

async function getCashDescription(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'cashdesc'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT code, alternatecode, description, arbdescription, hhcdescription, created, cdat, modified, mdat
      FROM cashdesc
    `
  );

  return rows;
}

async function getInventoryLocation(
  connection: PoolConnection
): Promise<GenericRow[]> {
  if (!(await tableExists(connection, 'inventorylocation'))) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT code, alternatecode, description, arbdescription, hhcdescription
      FROM inventorylocation
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
