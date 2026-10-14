import { withTransaction } from '../../../shared/db/transaction';
import { ApiError } from '../../../shared/middleware/errors';
import { isPlainObject } from '../../../shared/utils/commonUtils';
import {
  createStartDay,
  getDatabaseCurrentDate,
  getLatestRouteClosedStatus,
  getRouteHierarchy,
  getRouteVersion,
  resolveLogoutRouteKey,
  updateEndDay
} from './repository/startEndDay.repository';
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
} from './repository/wsLookup.repository';
import {
  getImportInventoryCounts,
  getTransactionDataCounts
} from './repository/transactionLookup.repository';
import type {
  LegacyTransactionReply,
  LegacyTransactionRequest
} from '../transactions/types/shared.types';

type LegacyParams = Record<string, unknown>;
type TempCustomerInventoryItem = Record<string, string | number | null | undefined>;
type CheckLoadResponse = '0' | '1';

interface StartDayRequestItem {
  routecode: string | number;
  salesmancode: string | number;
  routestartodometer: string | number;
  deviceid: string;
  ver: string;
  startdate: string;
}

type StartDayResponse = {
  startday: Array<
    | {
        status: 0;
        routekey: string;
        routestartdate: string | null;
        routestarttime: string | null;
        routestartodometer: string | number | null;
      }
    | { status: 1 | 2 }
  >;
};

interface EndDayRequestItem {
  routekey: string | number;
  routeenddate: string;
  routeendtime: string;
  routeendodometer: string | number;
  totaldocuments: string | number;
  totalcash: string | number;
  totalchecks: string | number;
  totalorderamount: string | number;
  totalinvoiceamount: string | number;
  totalchargesales: string | number;
  totalcashsales: string | number;
  totalacctsreceivable: string | number;
  totalexpenses: string | number;
  inventoryvariance: string | number;
  cashvariance: string | number;
}

type EndDayResponse = {
  endday: Array<{
    routekey: number;
    routeenddate: string | null;
    routeendtime: string | null;
  }>;
};

interface LogoutRequestItem {
  routekey: string | number;
  routecode: string | number;
  status?: string | number;
}

interface DeliveryResponse {
  deliveryheader: Record<string, unknown>[];
  deliverydetail: Record<string, unknown>[];
}

interface WarehouseStockResponse {
  warehousestock: Record<string, unknown>[];
}

interface WhStockResponse {
  whstock: Record<string, unknown>[];
}

interface CustomerBalanceResponse {
  customerbalance: Record<string, unknown>[];
}

interface CustomerItemGroupResponse {
  customeritemgrp: Record<string, unknown>[];
  customeritemmap: Record<string, unknown>[];
}

interface OrderStatusResponse {
  orderstatus: Record<string, unknown>[];
}

interface VisualDataResponse {
  visualheader: Record<string, unknown>[];
  visualdetail: Record<string, unknown>[];
}

interface CustomerMasterParams {
  routecode?: string;
  customercode?: string;
}

interface CustomerMasterQuery {
  routecode?: string;
  customercode?: string;
}

type CustomerMasterResponse = Record<string, unknown>;

interface TransactionParams {
  routekey?: string;
  routecode?: string;
}

interface TransactionQuery {
  routekey?: string;
  routecode?: string;
}

interface TransactionCountRow {
  TYPE: string;
  CloudCount: string | number;
}

interface ImportInventoryCountRow {
  TTYPE: string;
  CloudCount: string | number;
}

export async function startDay(
  request: LegacyTransactionRequest,
  _reply: LegacyTransactionReply
): Promise<StartDayResponse> {
  const items = parseStartDayItems(request);

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

export async function endDay(
  request: LegacyTransactionRequest,
  _reply: LegacyTransactionReply
): Promise<EndDayResponse> {
  const items = parseEndDayItems(request);

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

export async function logout(
  request: LegacyTransactionRequest,
  _reply: LegacyTransactionReply
): Promise<void> {
  const items = parseLogoutItems(request);

  if (items.length === 0) {
    return;
  }

  await withTransaction(async (connection) => {
    for (const item of items) {
      await resolveLogoutRouteKey(connection, item);
    }
  });
}

export async function checkLoad(
  request: LegacyTransactionRequest,
  _reply: LegacyTransactionReply
): Promise<CheckLoadResponse> {
  const params = readLegacyParams(request);
  const isLoaded = await withTransaction((connection) =>
    checkRouteLoad(connection, requireParam(params, 'userid'), requireParam(params, 'routeid'))
  );

  return isLoaded ? '1' : '0';
}

export async function getDelivery(
  request: LegacyTransactionRequest,
  _reply: LegacyTransactionReply
): Promise<DeliveryResponse> {
  const params = parseLegacyArrayParam(readLegacyParams(request), 'delivery');

  if (params.length === 0) {
    return { deliveryheader: [], deliverydetail: [] };
  }

  return withTransaction((connection) => getDeliveryData(connection, params[0] ?? {}));
}

export async function getWhStock(
  request: LegacyTransactionRequest,
  _reply: LegacyTransactionReply
): Promise<WhStockResponse> {
  const params = parseLegacyArrayParam(readLegacyParams(request), 'whstock');

  if (params.length === 0) {
    return { whstock: [] };
  }

  const whstock = await withTransaction((connection) =>
    getWhStockData(connection, requireParam(params[0] ?? {}, 'routecode'))
  );

  return { whstock };
}

export async function getCustomerInvoice(
  request: LegacyTransactionRequest,
  _reply: LegacyTransactionReply
): Promise<Record<string, never>> {
  const items = parseLegacyArrayParam(readLegacyParams(request), 'tempcustomerinventory');

  if (items.length === 0) {
    return {};
  }

  await withTransaction(async (connection) => {
    for (const item of items as TempCustomerInventoryItem[]) {
      await saveTempCustomerInventory(connection, item);
    }
  });

  return {};
}

export async function getCustomerBalance(
  request: LegacyTransactionRequest,
  _reply: LegacyTransactionReply
): Promise<CustomerBalanceResponse> {
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

export async function getWarehouseStock(
  request: LegacyTransactionRequest,
  _reply: LegacyTransactionReply
): Promise<WarehouseStockResponse> {
  const params = readLegacyParams(request);
  const warehousestock = await withTransaction((connection) =>
    getWarehouseStockData(connection, requireParam(params, 'routeid'))
  );

  return { warehousestock };
}

export async function getOrderStatus(
  request: LegacyTransactionRequest,
  _reply: LegacyTransactionReply
): Promise<OrderStatusResponse> {
  const params = readLegacyParams(request);
  const orderstatus = await withTransaction((connection) =>
    getOrderStatusData(connection, readRequiredAnyParam(params, ['userid', 'routeid']))
  );

  return { orderstatus };
}

export async function getCustomerItemGroup(
  request: LegacyTransactionRequest,
  _reply: LegacyTransactionReply
): Promise<CustomerItemGroupResponse> {
  const params = readLegacyParams(request);

  return withTransaction((connection) =>
    getCustomerItemGroupData(connection, requireParam(params, 'routeid'))
  );
}

export async function getVisualData(
  _request: LegacyTransactionRequest,
  _reply: LegacyTransactionReply
): Promise<VisualDataResponse> {
  return withTransaction((connection) => getVisualDataSections(connection));
}

export async function getCustomerMaster(
  request: LegacyTransactionRequest & {
    params: CustomerMasterParams;
    query: CustomerMasterQuery;
  }
): Promise<CustomerMasterResponse> {
  const routeCode = readRequestParam(request, 'routecode');
  const customerCode = readRequestParam(request, 'customercode');

  const customer = await withTransaction((connection) =>
    findCustomerMaster(connection, routeCode, customerCode)
  );

  return customer ?? {};
}

export async function getTransactionData(
  request: LegacyTransactionRequest & {
    params: TransactionParams;
    query: TransactionQuery;
  }
): Promise<TransactionCountRow[]> {
  const routeKey = readTransactionParam(request, 'routekey');

  return withTransaction((connection) => getTransactionDataCounts(connection, routeKey));
}

export async function getImportInventoryCount(
  request: LegacyTransactionRequest & {
    params: TransactionParams;
    query: TransactionQuery;
  }
): Promise<ImportInventoryCountRow[]> {
  const routeCode = readTransactionParam(request, 'routecode');

  return withTransaction((connection) => getImportInventoryCounts(connection, routeCode));
}

function parseStartDayItems(request: LegacyTransactionRequest): StartDayRequestItem[] {
  const rawStartDay = readLegacyParams(request).startday;

  if (rawStartDay === undefined || rawStartDay === null || rawStartDay === '') {
    return [];
  }

  try {
    const parsed = JSON.parse(String(rawStartDay));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    throw new ApiError(400, 'Invalid startday payload');
  }
}

function parseEndDayItems(request: LegacyTransactionRequest): EndDayRequestItem[] {
  const rawEndDay = readLegacyParams(request).endday;

  if (rawEndDay === undefined || rawEndDay === null || rawEndDay === '') {
    return [];
  }

  try {
    const parsed = JSON.parse(String(rawEndDay));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    throw new ApiError(400, 'Invalid endday payload');
  }
}

function parseLogoutItems(request: LegacyTransactionRequest): LogoutRequestItem[] {
  const rawLogout = readLegacyParams(request).logout;

  if (rawLogout === undefined || rawLogout === null || rawLogout === '') {
    return [];
  }

  try {
    const parsed = JSON.parse(String(rawLogout));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    throw new ApiError(400, 'Invalid logout payload');
  }
}

function normalizeDate(value: string): string {
  return String(value).trim().slice(0, 10);
}

function readLegacyParams(request: LegacyTransactionRequest): LegacyParams {
  return {
    ...readLegacyBodyParams(request.body),
    ...((request.params as LegacyParams | undefined) ?? {}),
    ...((request.query as LegacyParams | undefined) ?? {})
  };
}

function readLegacyBodyParams(body: unknown): LegacyParams {
  if (body === undefined || body === null || body === '') {
    return {};
  }

  if (typeof body === 'string') {
    const trimmedBody = body.trim();

    if (trimmedBody === '') {
      return {};
    }

    if (trimmedBody.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmedBody);
        return isPlainObject(parsed) ? parsed : {};
      } catch {
        throw new ApiError(400, 'Invalid WS JSON payload');
      }
    }

    return Object.fromEntries(new URLSearchParams(trimmedBody));
  }

  return isPlainObject(body) ? body : {};
}

function readRequestParam(
  request: LegacyTransactionRequest & {
    params: CustomerMasterParams;
    query: CustomerMasterQuery;
  },
  field: keyof CustomerMasterParams
): string {
  const value =
    request.params[field] ?? request.query[field] ?? readLegacyBodyParams(request.body)[field];

  if (value === undefined || value === null || value === '') {
    throw new ApiError(400, `Missing ${field}`);
  }

  return String(value);
}

function readTransactionParam(
  request: LegacyTransactionRequest & {
    params: TransactionParams;
    query: TransactionQuery;
  },
  field: keyof TransactionParams
): string {
  const value =
    request.params[field] ?? request.query[field] ?? readLegacyBodyParams(request.body)[field];

  if (value === undefined || value === null || value === '') {
    throw new ApiError(400, `Missing ${field}`);
  }

  return String(value);
}

function parseLegacyArrayParam(params: LegacyParams, field: string): LegacyParams[] {
  const value = params[field];

  if (value === undefined || value === null || value === '') {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(isPlainObject);
  }

  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed.filter(isPlainObject) : [];
  } catch {
    throw new ApiError(400, `Invalid ${field} payload`);
  }
}

function requireParam(params: LegacyParams, field: string): string | number {
  const value = params[field];

  if (value === undefined || value === null || value === '') {
    throw new ApiError(400, `Missing ${field}`);
  }

  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }

  throw new ApiError(400, `Invalid ${field}`);
}

function readRequiredAnyParam(params: LegacyParams, fields: string[]): string | number {
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

