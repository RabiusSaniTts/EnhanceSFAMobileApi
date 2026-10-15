/**
 * @author MD.Rabius Sani Raju
 * @date 2026-10-15
 */

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

/** Parses a named WS value containing a JSON array; missing values become an empty array. */
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

/** Reduces a date/time value to the YYYY-MM-DD part used by start-day checks. */
function normalizeDate(value: string): string {
  return String(value).trim().slice(0, 10);
}

/** Merges legacy body, path, and query values; query values have highest priority. */
function readLegacyParams(request: FastifyRequest): Record<string, any> {
  return {
    ...parseLegacyBodyValues(request.body, 'Invalid WS JSON payload'),
    ...((request.params as Record<string, any> | undefined) ?? {}),
    ...((request.query as Record<string, any> | undefined) ?? {})
  };
}

/** Parses one named legacy parameter as an array of plain records. */
function parseLegacyArrayParam(
  params: Record<string, any>,
  field: string
): Record<string, any>[] {
  return parseLegacyRecordArray(params[field], `Invalid ${field} payload`);
}

/** Reads a required scalar parameter and rejects missing or structured values. */
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

/** Returns the first available scalar from a list of compatible parameter names. */
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

/** Sends the check-load result as plain text for the legacy mobile parser. */
export async function checkLoad(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const params = readLegacyParams(request);
  const isLoaded = await withTransaction((connection) =>
    checkRouteLoad(connection, requireParam(params, 'userid'), requireParam(params, 'routeid'))
  );

  await reply.type('text/plain').send(isLoaded ? '1' : '0');
}

/** Sends the end-day acknowledgement as JSON text, matching Zend serialization. */
export async function endDay(
  request: FastifyRequest<{ Querystring: Record<string, string | undefined> }>,
  reply: FastifyReply
): Promise<void> {
  const items = parseWsArrayItems(request, 'endday');
  const result =
    items.length === 0
      ? { endday: [] }
      : await withTransaction(async (connection) => {
          const endday = [];

          for (const item of items) {
            const updatedEndDay = await updateEndDay(connection, item);

            if (updatedEndDay !== null) {
              // Echo persisted values so mobile can confirm the route was closed.
              endday.push({
                routekey: Number(updatedEndDay.routekey),
                routeenddate: updatedEndDay.routeenddate,
                routeendtime: updatedEndDay.routeendtime
              });
            }
          }

          return { endday };
        });

  await reply.type('text/plain').send(JSON.stringify(result));
}
/** Processes logout and returns the empty response expected by mobile. */
export async function logout(
  request: FastifyRequest<{ Querystring: Record<string, string | undefined> }>,
  reply: FastifyReply
): Promise<void> {
  const items = parseWsArrayItems(request, 'logout');

  if (items.length > 0) {
    await withTransaction(async (connection) => {
      for (const item of items) {
        await resolveLogoutRouteKey(connection, item);
      }
    });
  }

  await reply.send('');
}

/** Saves temporary customer inventory and returns an empty JSON object as text. */
export async function getCustomerInvoice(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const items = parseLegacyArrayParam(readLegacyParams(request), 'tempcustomerinventory');

  if (items.length > 0) {
    await withTransaction(async (connection) => {
      for (const item of items) {
        await saveTempCustomerInventory(connection, item);
      }
    });
  }

  const result = {};
  await reply.type('text/plain').send(JSON.stringify(result));
}
/** Sends customer balance rows in the legacy response envelope. */
export async function getCustomerBalance(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const params = parseLegacyArrayParam(readLegacyParams(request), 'customerbalance');
  const result =
    params.length === 0
      ? { customerbalance: [] }
      : {
          customerbalance: await withTransaction((connection) =>
            getCustomerBalanceData(
              connection,
              requireParam(params[0] ?? {}, 'routecode'),
              requireParam(params[0] ?? {}, 'customercode')
            )
          )
        };

  await reply.type('text/plain').send(JSON.stringify(result));
}
/** Sends customer item-group sections as JSON text. */
export async function getCustomerItemGroup(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const params = readLegacyParams(request);
  const result = await withTransaction((connection) =>
    getCustomerItemGroupData(connection, requireParam(params, 'routeid'))
  );

  await reply.type('text/plain').send(JSON.stringify(result));
}
/** Sends a single customer-master result as JSON text. */
export async function customerMaster(
  request: FastifyRequest<{
    Params: Record<string, string | undefined>;
    Querystring: Record<string, string | undefined>;
  }>,
  reply: FastifyReply
): Promise<void> {
  const routeCode = readRequiredRequestParam(request, 'routecode', 'Invalid WS JSON payload');
  const customerCode = readRequiredRequestParam(request, 'customercode', 'Invalid WS JSON payload');
  const customer = await withTransaction((connection) =>
    findCustomerMaster(connection, routeCode, customerCode)
  );
  const result = customer ?? {};

  await reply.type('text/plain').send(JSON.stringify(result));
}
/** Sends transaction reconciliation counts for a route key. */
export async function transactionData(
  request: FastifyRequest<{
    Params: Record<string, string | undefined>;
    Querystring: Record<string, string | undefined>;
  }>,
  reply: FastifyReply
): Promise<void> {
  const routeKey = readRequiredRequestParam(request, 'routekey', 'Invalid WS JSON payload');
  const result = await withTransaction((connection) =>
    getTransactionDataCounts(connection, routeKey)
  );

  await reply.type('text/plain').send(JSON.stringify(result));
}
/** Sends starting-load and imported-inventory counts for a route. */
export async function importInventoryCount(
  request: FastifyRequest<{
    Params: Record<string, string | undefined>;
    Querystring: Record<string, string | undefined>;
  }>,
  reply: FastifyReply
): Promise<void> {
  const routeCode = readRequiredRequestParam(request, 'routecode', 'Invalid WS JSON payload');
  const result = await withTransaction((connection) =>
    getImportInventoryCounts(connection, routeCode)
  );

  await reply.type('text/plain').send(JSON.stringify(result));
}

/** Sends delivery header and detail arrays. */
export async function getDelivery(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const params = parseLegacyArrayParam(readLegacyParams(request), 'delivery');
  const result =
    params.length === 0
      ? { deliveryheader: [], deliverydetail: [] }
      : await withTransaction((connection) => getDeliveryData(connection, params[0] ?? {}));

  await reply.type('text/plain').send(JSON.stringify(result));
}

/** Sends order-status rows for the requested salesman/route identifier. */
export async function getOrderStatus(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const params = readLegacyParams(request);
  const orderstatus = await withTransaction((connection) =>
    getOrderStatusData(connection, readRequiredAnyParam(params, ['userid', 'routeid']))
  );
  const result = { orderstatus };

  await reply.type('text/plain').send(JSON.stringify(result));
}

/** Sends visual master header/detail sections. */
export async function getVisualData(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const result = await withTransaction((connection) => getVisualDataSections(connection));

  await reply.type('text/plain').send(JSON.stringify(result));
}

/** Sends route-mapped warehouse stock rows. */
export async function getWarehouseStock(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const params = readLegacyParams(request);
  const warehousestock = await withTransaction((connection) =>
    getWarehouseStockData(connection, requireParam(params, 'routeid'))
  );
  const result = { warehousestock };

  await reply.type('text/plain').send(JSON.stringify(result));
}

/** Sends item-level warehouse stock in the `whstock` envelope. */
export async function getWhStock(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const params = parseLegacyArrayParam(readLegacyParams(request), 'whstock');
  const result =
    params.length === 0
      ? { whstock: [] }
      : {
          whstock: await withTransaction((connection) =>
            getWhStockData(connection, requireParam(params[0] ?? {}, 'routecode'))
          )
        };

  await reply.type('text/plain').send(JSON.stringify(result));
}

/** Handles the legacy WS senddata call used to create start day. */
export async function wsSendData(
  request: FastifyRequest<{ Querystring: Record<string, string | undefined> }>,
  reply: FastifyReply
): Promise<void> {
  // startday is a JSON array encoded in a legacy query/body field.
  const items = parseWsArrayItems(request, 'startday');
  const result =
    items.length === 0
      ? { startday: [] }
      : await withTransaction(async (connection) => {
          // Database date avoids differences between the API and MySQL server clocks.
          const currentDate = await getDatabaseCurrentDate(connection);
          // One status/result is returned for each submitted start-day record.
          const startday = [];

          for (const item of items) {
            const routeVersion = await getRouteVersion(connection, item.routecode);
            const routeClosed = await getLatestRouteClosedStatus(connection, item.routecode);

            if (currentDate !== normalizeDate(item.startdate)) {
              // Status 2 means the device start date differs from the server date.
              startday.push({ status: 2 as const });
              continue;
            }

            if (
              String(routeVersion?.versionStatus ?? '0') === '1' &&
              String(routeVersion?.versionNo ?? '0') !== String(item.ver)
            ) {
              // Status 0 with an empty route key represents a blocked app version.
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
              // Status 1 means this route already has an open day.
              startday.push({ status: 1 as const });
              continue;
            }

            const routeHierarchy = await getRouteHierarchy(connection, item.routecode);
            const createdStartDay = await createStartDay(connection, item, routeHierarchy);

            // Status 0 with route details represents successful start-day creation.
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

  await reply.type('text/plain').send(JSON.stringify(result));
}


