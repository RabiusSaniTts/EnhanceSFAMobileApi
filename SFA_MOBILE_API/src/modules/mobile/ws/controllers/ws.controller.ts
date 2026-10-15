import type { FastifyReply, FastifyRequest } from 'fastify';
import { withTransaction } from '../../../../shared/db/transaction';
import { ApiError } from '../../../../shared/middleware/errors';
import {
  parseLegacyBodyValues,
  parseLegacyRecordArray,
  readRequiredRequestParam
} from '../../../../shared/utils/commonUtils';
import {
  createStartDay,
  getDatabaseCurrentDate,
  getLatestRouteClosedStatus,
  getRouteHierarchy,
  getRouteVersion,
  resolveLogoutRouteKey,
  updateEndDay
} from '../models/startEndDay.model';
import {
  checkRouteLoad,
  findCustomerMaster,
  getCustomerBalanceData,
  getCustomerItemGroupData,
  getDeliveryData,
  getOrderStatusData,
  getVisualDataSections,
  getWarehouseStockData,
  getWhStockData,
  saveTempCustomerInventory
} from '../models/wsLookup.model';
import {
  getImportInventoryCounts,
  getTransactionDataCounts
} from '../models/transactionLookup.model';
async function processStartDay(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  const items = parseWsArrayItems(request, 'startday');

  if (items.length === 0) {
    return { startday: [] };
  }

  return withTransaction(async (connection) => {
    const currentDate = await getDatabaseCurrentDate(connection);
    const startday = [];

    for (const item of items) {
      const routeVersion = await getRouteVersion(connection, item.routecode);
      const routeClosed = await getLatestRouteClosedStatus(connection, item.routecode);

      if (currentDate !== normalizeDate(item.startdate)) {
        startday.push({ status: 2 as const });
        continue;
      }

      if (
        String(routeVersion?.versionStatus ?? '0') === '1' &&
        String(routeVersion?.versionNo ?? '0') !== String(item.ver)
      ) {
        startday.push({
          status: 0 as const,
          routekey: '',
          routestartdate: null,
          routestarttime: null,
          routestartodometer: null
        });
        continue;
      }

      if (routeClosed === 0) {
        startday.push({ status: 1 as const });
        continue;
      }

      const routeHierarchy = await getRouteHierarchy(connection, item.routecode);
      const createdStartDay = await createStartDay(connection, item, routeHierarchy);

      startday.push({
        status: 0 as const,
        routekey: String(createdStartDay.routekey),
        routestartdate: createdStartDay.routestartdate,
        routestarttime: createdStartDay.routestarttime,
        routestartodometer: createdStartDay.routestartodometer
      });
    }

    return { startday };
  });
}

async function processEndDay(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  const items = parseWsArrayItems(request, 'endday');

  if (items.length === 0) {
    return { endday: [] };
  }

  return withTransaction(async (connection) => {
    const endday = [];

    for (const item of items) {
      const updatedEndDay = await updateEndDay(connection, item);

      if (updatedEndDay !== null) {
        endday.push({
          routekey: Number(updatedEndDay.routekey),
          routeenddate: updatedEndDay.routeenddate,
          routeendtime: updatedEndDay.routeendtime
        });
      }
    }

    return { endday };
  });
}

async function processLogout(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  const items = parseWsArrayItems(request, 'logout');

  if (items.length === 0) {
    return;
  }

  await withTransaction(async (connection) => {
    for (const item of items) {
      await resolveLogoutRouteKey(connection, item);
    }
  });
}

async function processCheckLoad(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  const params = readLegacyParams(request);
  const isLoaded = await withTransaction((connection) =>
    checkRouteLoad(connection, requireParam(params, 'userid'), requireParam(params, 'routeid'))
  );

  return isLoaded ? '1' : '0';
}

async function processDelivery(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  const params = parseLegacyArrayParam(readLegacyParams(request), 'delivery');

  if (params.length === 0) {
    return { deliveryheader: [], deliverydetail: [] };
  }

  return withTransaction((connection) => getDeliveryData(connection, params[0] ?? {}));
}

async function processWhStock(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  const params = parseLegacyArrayParam(readLegacyParams(request), 'whstock');

  if (params.length === 0) {
    return { whstock: [] };
  }

  const whstock = await withTransaction((connection) =>
    getWhStockData(connection, requireParam(params[0] ?? {}, 'routecode'))
  );

  return { whstock };
}

async function processCustomerInvoice(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<Record<string, never>> {
  const items = parseLegacyArrayParam(readLegacyParams(request), 'tempcustomerinventory');

  if (items.length === 0) {
    return {};
  }

  await withTransaction(async (connection) => {
    for (const item of items) {
      await saveTempCustomerInventory(connection, item);
    }
  });

  return {};
}

async function processCustomerBalance(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  const params = parseLegacyArrayParam(readLegacyParams(request), 'customerbalance');

  if (params.length === 0) {
    return { customerbalance: [] };
  }

  const customerbalance = await withTransaction((connection) =>
    getCustomerBalanceData(
      connection,
      requireParam(params[0] ?? {}, 'routecode'),
      requireParam(params[0] ?? {}, 'customercode')
    )
  );

  return { customerbalance };
}

async function processWarehouseStock(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  const params = readLegacyParams(request);
  const warehousestock = await withTransaction((connection) =>
    getWarehouseStockData(connection, requireParam(params, 'routeid'))
  );

  return { warehousestock };
}

async function processOrderStatus(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  const params = readLegacyParams(request);
  const orderstatus = await withTransaction((connection) =>
    getOrderStatusData(connection, readRequiredAnyParam(params, ['userid', 'routeid']))
  );

  return { orderstatus };
}

async function processCustomerItemGroup(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  const params = readLegacyParams(request);

  return withTransaction((connection) =>
    getCustomerItemGroupData(connection, requireParam(params, 'routeid'))
  );
}

async function processVisualData(
  _request: FastifyRequest,
  _reply: FastifyReply
) {
  return withTransaction((connection) => getVisualDataSections(connection));
}

async function processCustomerMaster(
  request: FastifyRequest & {
    params: Record<string, string | undefined>;
    query: Record<string, string | undefined>;
  }
) {
  const routeCode = readRequiredRequestParam(request, 'routecode', 'Invalid WS JSON payload');
  const customerCode = readRequiredRequestParam(request, 'customercode', 'Invalid WS JSON payload');

  const customer = await withTransaction((connection) =>
    findCustomerMaster(connection, routeCode, customerCode)
  );

  return customer ?? {};
}

async function processTransactionData(
  request: FastifyRequest & {
    params: Record<string, string | undefined>;
    query: Record<string, string | undefined>;
  }
) {
  const routeKey = readRequiredRequestParam(request, 'routekey', 'Invalid WS JSON payload');

  return withTransaction((connection) => getTransactionDataCounts(connection, routeKey));
}

async function processImportInventoryCount(
  request: FastifyRequest & {
    params: Record<string, string | undefined>;
    query: Record<string, string | undefined>;
  }
) {
  const routeCode = readRequiredRequestParam(request, 'routecode', 'Invalid WS JSON payload');

  return withTransaction((connection) => getImportInventoryCounts(connection, routeCode));
}

function parseWsArrayItems(
  request: FastifyRequest,
  field: string
): Record<string, any>[] {
  const value = readLegacyParams(request)[field];

  if (value === undefined || value === null || value === '') {
    return [];
  }

  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    throw new ApiError(400, `Invalid ${field} payload`);
  }
}

function normalizeDate(value: string): string {
  return String(value).trim().slice(0, 10);
}

function readLegacyParams(request: FastifyRequest): Record<string, any> {
  return {
    ...parseLegacyBodyValues(request.body, 'Invalid WS JSON payload'),
    ...((request.params as Record<string, any> | undefined) ?? {}),
    ...((request.query as Record<string, any> | undefined) ?? {})
  };
}

function parseLegacyArrayParam(
  params: Record<string, any>,
  field: string
): Record<string, any>[] {
  return parseLegacyRecordArray(params[field], `Invalid ${field} payload`);
}

function requireParam(params: Record<string, any>, field: string): string | number {
  const value = params[field];

  if (value === undefined || value === null || value === '') {
    throw new ApiError(400, `Missing ${field}`);
  }

  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }

  throw new ApiError(400, `Invalid ${field}`);
}

function readRequiredAnyParam(
  params: Record<string, any>,
  fields: string[]
): string | number {
  for (const field of fields) {
    const value = params[field];

    if (value === undefined || value === null || value === '') {
      continue;
    }

    if (typeof value === 'number' || typeof value === 'string') {
      return value;
    }

    throw new ApiError(400, `Invalid ${field}`);
  }

  throw new ApiError(400, `Missing ${fields.join(' or ')}`);
}

export async function checkLoad(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const result = await processCheckLoad(request, reply);
  await reply.type('text/plain').send(result);
}

export async function endDay(
  request: FastifyRequest<{ Querystring: Record<string, string | undefined> }>,
  reply: FastifyReply
): Promise<void> {
  const result = await processEndDay(request, reply);
  await reply.type('text/plain').send(JSON.stringify(result));
}

export async function logout(
  request: FastifyRequest<{ Querystring: Record<string, string | undefined> }>,
  reply: FastifyReply
): Promise<void> {
  await processLogout(request, reply);
  await reply.send('');
}

export async function getCustomerInvoice(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const result = await processCustomerInvoice(request, reply);
  await reply.type('text/plain').send(JSON.stringify(result));
}

export async function getCustomerBalance(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const result = await processCustomerBalance(request, reply);
  await reply.type('text/plain').send(JSON.stringify(result));
}

export async function getCustomerItemGroup(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const result = await processCustomerItemGroup(request, reply);
  await reply.type('text/plain').send(JSON.stringify(result));
}

export async function customerMaster(
  request: FastifyRequest<{
    Params: Record<string, string | undefined>;
    Querystring: Record<string, string | undefined>;
  }>,
  reply: FastifyReply
): Promise<void> {
  const result = await processCustomerMaster(request);
  await reply.type('text/plain').send(JSON.stringify(result));
}

export async function transactionData(
  request: FastifyRequest<{
    Params: Record<string, string | undefined>;
    Querystring: Record<string, string | undefined>;
  }>,
  reply: FastifyReply
): Promise<void> {
  const result = await processTransactionData(request);
  await reply.type('text/plain').send(JSON.stringify(result));
}

export async function importInventoryCount(
  request: FastifyRequest<{
    Params: Record<string, string | undefined>;
    Querystring: Record<string, string | undefined>;
  }>,
  reply: FastifyReply
): Promise<void> {
  const result = await processImportInventoryCount(request);
  await reply.type('text/plain').send(JSON.stringify(result));
}

export async function getDelivery(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const result = await processDelivery(request, reply);
  await reply.type('text/plain').send(JSON.stringify(result));
}

export async function getOrderStatus(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const result = await processOrderStatus(request, reply);
  await reply.type('text/plain').send(JSON.stringify(result));
}

export async function getVisualData(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const result = await processVisualData(request, reply);
  await reply.type('text/plain').send(JSON.stringify(result));
}

export async function getWarehouseStock(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const result = await processWarehouseStock(request, reply);
  await reply.type('text/plain').send(JSON.stringify(result));
}

export async function getWhStock(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const result = await processWhStock(request, reply);
  await reply.type('text/plain').send(JSON.stringify(result));
}

export async function wsSendData(
  request: FastifyRequest<{ Querystring: Record<string, string | undefined> }>,
  reply: FastifyReply
): Promise<void> {
  const result = await processStartDay(request, reply);
  await reply.type('text/plain').send(JSON.stringify(result));
}

