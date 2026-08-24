import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import type { MasterDataSyncResponseSections } from '../masterdatasync.types';

interface CustomerItemGroupSyncInput {
  routeId: number;
}

type GenericRow = RowDataPacket & Record<string, unknown>;

export async function getCustomerItemGroupSyncSections(
  connection: PoolConnection,
  input: CustomerItemGroupSyncInput
): Promise<MasterDataSyncResponseSections> {
  const [customerItemGroups, customerItemMap] = await Promise.all([
    getCustomerItemGroups(connection, input.routeId),
    getCustomerItemMap(connection, input.routeId)
  ]);

  return {
    customeritemgrp: customerItemGroups,
    customeritemmap: customerItemMap
  };
}

async function getCustomerItemGroups(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  if (
    !(await tableExists(connection, 'customeritemgrp')) ||
    !(await tableExists(connection, 'customermaster')) ||
    !(await tableExists(connection, 'routesequence'))
  ) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT DISTINCT
        cig.customeritemgrpcode,
        cig.categoryid,
        cig.itemgroupcode,
        cig.description,
        cig.created,
        cig.cdat,
        cig.modified,
        cig.mdat,
        cig.transferstatus
      FROM customeritemgrp cig
      INNER JOIN customermaster cm ON cm.itemmapkey = cig.customeritemgrpcode
      LEFT JOIN routesequence rs ON rs.customercode = cm.customercode
      WHERE rs.routecode = :routeId
      ORDER BY cig.customeritemgrpcode
    `,
    { routeId }
  );

  return rows;
}

async function getCustomerItemMap(
  connection: PoolConnection,
  routeId: number
): Promise<GenericRow[]> {
  if (
    !(await tableExists(connection, 'customeritemmapping')) ||
    !(await tableExists(connection, 'customeritemgrp')) ||
    !(await tableExists(connection, 'customermaster')) ||
    !(await tableExists(connection, 'routesequence'))
  ) {
    return [];
  }

  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT DISTINCT
        cim.customeritemgrpcode,
        cim.itemcode,
        cim.transferstatus
      FROM customeritemmapping cim
      INNER JOIN customeritemgrp cig
        ON cim.customeritemgrpcode = cig.customeritemgrpcode
      INNER JOIN customermaster cm
        ON cm.itemmapkey = cig.customeritemgrpcode
      LEFT JOIN routesequence rs ON rs.customercode = cm.customercode
      WHERE rs.routecode = :routeId
      ORDER BY cim.itemcode
    `,
    { routeId }
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
