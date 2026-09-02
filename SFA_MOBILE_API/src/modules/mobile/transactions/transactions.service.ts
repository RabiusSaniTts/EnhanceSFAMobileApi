import { withTransaction } from '../../../shared/db/transaction';
import { ApiError } from '../../../shared/middleware/errors';
import {
  saveCustomerOperationControl,
  saveCustomerSequence,
  saveCustomerVisitLog,
  updateRouteMasterFromUpload
} from './repository/routeActivity.repository';
import {
  saveBatchExpiryDetail,
  saveCustomerInvoice,
  saveInvoiceDetail,
  saveInvoiceHeader,
  saveInvoiceRxdDetail,
  savePromotionDetail
} from './repository/sales.repository';
import {
  saveOrderRxdDetail,
  saveSalesOrderDetail,
  saveSalesOrderHeader
} from './repository/orders.repository';
import { saveArDetail, saveArHeader, saveCashCheckDetail } from './repository/collections.repository';
import {
  saveInventorySummaryDetail,
  saveInventoryTransactionDetail,
  saveInventoryTransactionHeader
} from './repository/inventory.repository';
import {
  saveCustomerDistributionCheck,
  saveCustomerFocBalance,
  saveCustomerInventoryCheck,
  saveCustomerInventoryDetail,
  saveCustomerMaster,
  saveEndDayDetailUpload,
  saveNoSalesHeader,
  saveNonServicedCustomer,
  saveRouteGoal
} from './repository/customerService.repository';
import {
  saveAccessOverrideLog,
  saveCustomerImage,
  savePosEquipmentChangeDetail,
  savePosMaster,
  saveSurveyAuditDetail
} from './repository/auditExtra.repository';
import { runSendDataPostProcessing } from './repository/routeClose.repository';
import {
  saveArTransactionDetail,
  saveInvoiceTransactionDetail
} from './repository/transactionDetail.repository';
import type {
  AccessOverrideLogUploadItem,
  CustomerImageUploadItem,
  PosEquipmentChangeDetailUploadItem,
  PosMasterUploadItem,
  SurveyAuditDetailUploadItem
} from './types/auditExtra.types';
import type {
  ArDetailUploadItem,
  ArHeaderUploadItem,
  CashCheckDetailUploadItem
} from './types/collections.types';
import type {
  CustomerDistributionCheckUploadItem,
  CustomerFocBalanceUploadItem,
  CustomerInventoryCheckUploadItem,
  CustomerInventoryDetailUploadItem,
  CustomerMasterUploadItem,
  EndDayDetailUploadItem,
  NoSalesHeaderUploadItem,
  NonServicedCustomerUploadItem,
  RouteGoalUploadItem
} from './types/customerService.types';
import type {
  InventorySummaryDetailUploadItem,
  InventoryTransactionDetailUploadItem,
  InventoryTransactionHeaderUploadItem
} from './types/inventory.types';
import type {
  OrderRxdDetailUploadItem,
  SalesOrderDetailUploadItem,
  SalesOrderHeaderUploadItem
} from './types/orders.types';
import type {
  CustomerOperationControlItem,
  CustomerSequenceRequestItem,
  CustomerSequenceResponse,
  CustomerVisitLogItem,
  RouteMasterUploadItem
} from './types/routeActivity.types';
import type {
  BatchExpiryDetailUploadItem,
  CustomerInvoiceUploadItem,
  InvoiceDetailUploadItem,
  InvoiceHeaderUploadItem,
  InvoiceRxdDetailUploadItem,
  PromotionDetailUploadItem
} from './types/sales.types';
import { SEND_DATA_ARRAY_FIELDS } from './types/senddata.types';
import type {
  ArTransactionDetailItem,
  ArTransactionDetailResponse,
  InvoiceTransactionDetailItem,
  InvoiceTransactionDetailResponse,
  SendDataArrayField,
  SendDataPayload,
  SendDataResponse
} from './types/senddata.types';
import type {
  LegacyTransactionReply,
  LegacyTransactionRequest
} from './types/shared.types';

type MutableSendDataResponse = Record<SendDataArrayField, Record<string, unknown>[]>;

export async function sendData(
  request: LegacyTransactionRequest,
  _reply: LegacyTransactionReply
): Promise<SendDataResponse> {
  const payload = parseSendDataPayload(request);

  return withTransaction(async (connection) => {
    const response = createEmptySendDataResponse();
    const invoiceTransactionKeys = new Map<string, number>();
    const orderTransactionKeys = new Map<string, number>();
    const arTransactionKeys = new Map<string, number>();
    const inventoryDetailKeys = new Map<string, number>();

    for (const item of asRecords<CustomerOperationControlItem>(payload.customeroperationscontrol)) {
      if (await saveCustomerOperationControl(connection, item)) {
        response.customeroperationscontrol.push({
          routekey: item.routekey,
          visitkey: item.visitkey,
          customercode: item.customercode
        });
      }
    }

    for (const item of asRecords<CustomerVisitLogItem>(payload.customervisitlog)) {
      if (await saveCustomerVisitLog(connection, item)) {
        response.customervisitlog.push({
          routekey: item.routekey,
          log_id: item.log_id,
          customercode: item.customercode
        });
      }
    }

    for (const item of asRecords<CustomerMasterUploadItem>(payload.customermaster)) {
      if (await saveCustomerMaster(connection, item)) {
        response.customermaster.push({
          customercode: item.customercode
        });
      }
    }

    for (const item of asRecords<RouteMasterUploadItem>(payload.routemaster)) {
      if (await updateRouteMasterFromUpload(connection, item)) {
        response.routemaster.push({ routecode: item.routecode });
      }
    }

    for (const item of asRecords<CustomerSequenceRequestItem>(payload.routesequencecustomerstatus)) {
      if (await saveCustomerSequence(connection, item)) {
        response.routesequencecustomerstatus.push({
          routekey: item.routekey,
          customercode: item.customercode
        });
      }
    }

    for (const item of asRecords<InvoiceHeaderUploadItem>(payload.invoiceheader)) {
      const transactionKey = await saveInvoiceHeader(connection, item);
      invoiceTransactionKeys.set(String(Number(item.transactionkey)), transactionKey);

      if (transactionKey > 0) {
        response.invoiceheader.push({
          routekey: item.routekey,
          visitkey: item.visitkey
        });
      }
    }

    for (const item of asRecords<InvoiceDetailUploadItem>(payload.invoicedetail)) {
      const transactionKey = invoiceTransactionKeys.get(String(Number(item.transactionkey)));

      if (transactionKey === undefined) {
        continue;
      }

      if (await saveInvoiceDetail(connection, item, transactionKey)) {
        response.invoicedetail.push({
          routekey: item.routekey,
          visitkey: item.visitkey,
          itemcode: item.itemcode
        });
      }
    }

    for (const item of asRecords<InvoiceRxdDetailUploadItem>(payload.invoicerxddetail)) {
      const transactionKey = invoiceTransactionKeys.get(String(Number(item.transactionkey)));

      if (transactionKey === undefined) {
        continue;
      }

      if (await saveInvoiceRxdDetail(connection, item, transactionKey)) {
        response.invoicerxddetail.push({
          routekey: item.routekey,
          visitkey: item.visitkey,
          itemcode: item.itemcode
        });
      }
    }

    for (const item of asRecords<PromotionDetailUploadItem>(payload.promotiondetail)) {
      if (String(item.itemtransactiontype) === '4') {
        continue;
      }

      const transactionKey = invoiceTransactionKeys.get(String(Number(item.transactionkey)));

      if (transactionKey === undefined) {
        continue;
      }

      if (await savePromotionDetail(connection, item, transactionKey)) {
        response.promotiondetail.push({
          routekey: item.routekey,
          visitkey: item.visitkey,
          itemcode: item.itemcode
        });
      }
    }

    for (const item of asRecords<CustomerInvoiceUploadItem>(payload.customerinvoice)) {
      if (await saveCustomerInvoice(connection, item)) {
        response.customerinvoice.push({
          transactionkey: item.transactionkey
        });
      }
    }

    for (const item of asRecords<BatchExpiryDetailUploadItem>(payload.batchexpirydetail)) {
      if (await saveBatchExpiryDetail(connection, item)) {
        response.batchexpirydetail.push({
          routekey: item.routekey,
          visitkey: item.visitkey,
          batchdetailkey: item.batchdetailkey
        });
      }
    }

    for (const item of asRecords<SalesOrderHeaderUploadItem>(payload.salesorderheader)) {
      const transactionKey = await saveSalesOrderHeader(connection, item);
      orderTransactionKeys.set(String(Number(item.transactionkey)), transactionKey);

      if (transactionKey > 0) {
        response.salesorderheader.push({
          routekey: item.routekey,
          visitkey: item.visitkey
        });
      }
    }

    for (const item of asRecords<SalesOrderDetailUploadItem>(payload.salesorderdetail)) {
      const transactionKey = orderTransactionKeys.get(String(Number(item.transactionkey)));

      if (transactionKey === undefined) {
        continue;
      }

      if (await saveSalesOrderDetail(connection, item, transactionKey)) {
        response.salesorderdetail.push({
          routekey: item.routekey,
          visitkey: item.visitkey,
          itemcode: item.itemcode
        });
      }
    }

    for (const item of asRecords<OrderRxdDetailUploadItem>(payload.orderrxddetail)) {
      const transactionKey = orderTransactionKeys.get(String(Number(item.transactionkey)));

      if (transactionKey === undefined) {
        continue;
      }

      if (await saveOrderRxdDetail(connection, item, transactionKey)) {
        response.orderrxddetail.push({
          routekey: item.routekey,
          visitkey: item.visitkey,
          itemcode: item.itemcode
        });
      }
    }

    for (const item of asRecords<PromotionDetailUploadItem>(payload.promotiondetail)) {
      if (String(item.itemtransactiontype) !== '4') {
        continue;
      }

      const transactionKey = orderTransactionKeys.get(String(Number(item.transactionkey)));

      if (transactionKey === undefined) {
        continue;
      }

      if (await savePromotionDetail(connection, item, transactionKey)) {
        response.promotiondetail.push({
          routekey: item.routekey,
          visitkey: item.visitkey,
          itemcode: item.itemcode
        });
      }
    }

    for (const item of asRecords<ArHeaderUploadItem>(payload.arheader)) {
      const transactionKey = await saveArHeader(connection, item);
      arTransactionKeys.set(String(Number(item.transactionkey)), transactionKey);

      if (transactionKey > 0) {
        response.arheader.push({
          routekey: item.routekey,
          visitkey: item.visitkey
        });
      }
    }

    for (const item of asRecords<ArDetailUploadItem>(payload.ardetail)) {
      const transactionKey = arTransactionKeys.get(String(Number(item.transactionkey)));

      if (transactionKey === undefined) {
        continue;
      }

      if (await saveArDetail(connection, item, transactionKey)) {
        response.ardetail.push({
          routekey: item.routekey,
          visitkey: item.visitkey,
          transactionkey: transactionKey
        });
      }
    }

    for (const item of asRecords<CashCheckDetailUploadItem>(payload.cashcheckdetail)) {
      if (await saveCashCheckDetail(connection, item)) {
        response.cashcheckdetail.push({
          routekey: item.routekey,
          visitkey: item.visitkey
        });
      }
    }

    for (const item of asRecords<InventoryTransactionHeaderUploadItem>(
      payload.inventorytransactionheader
    )) {
      const detailKey = await saveInventoryTransactionHeader(connection, item);
      inventoryDetailKeys.set(String(Number(item.detailkey)), detailKey);

      if (detailKey > 0) {
        response.inventorytransactionheader.push({
          routekey: item.routekey,
          detailkey: item.detailkey,
          inventorykey: item.inventorykey
        });
      }
    }

    for (const item of asRecords<InventoryTransactionDetailUploadItem>(
      payload.inventorytransactiondetail
    )) {
      const detailKey = inventoryDetailKeys.get(String(Number(item.detailkey)));

      if (detailKey === undefined) {
        continue;
      }

      if (await saveInventoryTransactionDetail(connection, item, detailKey)) {
        response.inventorytransactiondetail.push({
          routekey: item.routekey,
          detailkey: item.detailkey,
          itemcode: item.itemcode
        });
      }
    }

    for (const item of asRecords<InventorySummaryDetailUploadItem>(payload.inventorysummarydetail)) {
      if (await saveInventorySummaryDetail(connection, item)) {
        response.inventorysummarydetail.push({
          routekey: item.routekey,
          itemcode: item.itemcode,
          inventorykey: item.inventorykey
        });
      }
    }

    for (const item of asRecords<NonServicedCustomerUploadItem>(payload.nonservicedcustomer)) {
      if (await saveNonServicedCustomer(connection, item)) {
        response.nonservicedcustomer.push({
          routekey: item.routekey,
          customercode: item.customercode
        });
      }
    }

    for (const item of asRecords<CustomerInventoryDetailUploadItem>(
      payload.customerinventorydetail
    )) {
      if (await saveCustomerInventoryDetail(connection, item)) {
        response.customerinventorydetail.push({
          routekey: item.routekey,
          visitkey: item.visitkey,
          itemcode: item.itemcode
        });
      }
    }

    for (const item of asRecords<NoSalesHeaderUploadItem>(payload.nosalesheader)) {
      const transactionKey = await saveNoSalesHeader(connection, item);

      if (transactionKey > 0) {
        response.nosalesheader.push({
          transactionkey: item.transactionkey
        });
      }
    }

    for (const item of asRecords<CustomerDistributionCheckUploadItem>(
      payload.customerdistributioncheck
    )) {
      if (await saveCustomerDistributionCheck(connection, item)) {
        response.customerdistributioncheck.push({
          routekey: item.routekey,
          customercode: item.customercode,
          visitkey: item.visitkey,
          itemcode: item.itemcode
        });
      }
    }

    for (const item of asRecords<CustomerInventoryCheckUploadItem>(payload.customerinventorycheck)) {
      if (await saveCustomerInventoryCheck(connection, item)) {
        response.customerinventorycheck.push({
          routekey: item.routekey,
          visitkey: item.visitkey,
          itemcode: item.itemcode
        });
      }
    }

    for (const item of asRecords<RouteGoalUploadItem>(payload.routegoal)) {
      const primaryKey = await saveRouteGoal(connection, item);

      if (primaryKey > 0) {
        response.routegoal.push({
          primary_key: item.primary_key
        });
      }
    }

    for (const item of asRecords<CustomerFocBalanceUploadItem>(payload.customer_foc_balance)) {
      if (await saveCustomerFocBalance(connection, item)) {
        response.customer_foc_balance.push({
          customercode: item.itemcode,
          itemcode: item.originalqty
        });
      }
    }

    for (const item of asRecords<EndDayDetailUploadItem>(payload.enddaydetail)) {
      if (await saveEndDayDetailUpload(connection, item)) {
        response.enddaydetail.push({
          routekey: item.routekey
        });
      }
    }

    for (const item of asRecords<SurveyAuditDetailUploadItem>(payload.surveyauditdetail)) {
      if (await saveSurveyAuditDetail(connection, item)) {
        response.surveyauditdetail.push({
          routekey: item.routekey,
          visitkey: item.visitkey,
          surveydefkey: item.surveydefkey
        });
      }
    }

    for (const item of asRecords<PosEquipmentChangeDetailUploadItem>(
      payload.posequipmentchangedetail
    )) {
      if (await savePosEquipmentChangeDetail(connection, item)) {
        response.posequipmentchangedetail.push({
          routekey: item.routekey,
          visitkey: item.visitkey,
          itemcode: item.itemcode
        });
      }
    }

    for (const item of asRecords<PosMasterUploadItem>(payload.posmaster)) {
      const itemCode = await savePosMaster(connection, item);

      if (itemCode > 0) {
        response.posmaster.push({
          itemcode: item.itemcode
        });
      }
    }

    for (const item of asRecords<CustomerImageUploadItem>(payload.customerimages)) {
      if (await saveCustomerImage(connection, item)) {
        response.customerimages.push({
          routekey: item.imagename
        });
      }
    }

    for (const item of asRecords<AccessOverrideLogUploadItem>(payload.t_access_override_log)) {
      if (await saveAccessOverrideLog(connection, item)) {
        response.t_access_override_log.push({
          routekey: item.routekey,
          visitkey: item.visitkey,
          featureid: item.featureid
        });
      }
    }

    await runSendDataPostProcessing(connection, {
      userid: payload.userid,
      routecode: payload.routecode,
      routekey: payload.routekey,
      routeclosed: payload.routeclosed
    });

    return pruneEmptySendDataResponse(response);
  });
}

export async function customerSequence(
  request: LegacyTransactionRequest,
  _reply: LegacyTransactionReply
): Promise<CustomerSequenceResponse> {
  const items = parseCustomerSequenceItems(request);

  await withTransaction(async (connection) => {
    for (const item of items) {
      await saveCustomerSequence(connection, item);
    }
  });

  return {
    code: 200,
    message: 'Load Data !'
  };
}

export async function uploadInvoiceTransactionDetails(
  request: LegacyTransactionRequest
): Promise<InvoiceTransactionDetailResponse> {
  const items = parseLegacyRequestArrayField(
    request,
    'invoicedetail'
  ) as InvoiceTransactionDetailItem[];

  return withTransaction(async (connection) => {
    const invoicedetail: InvoiceTransactionDetailResponse['invoicedetail'] = [];

    for (const item of items) {
      if (await saveInvoiceTransactionDetail(connection, item)) {
        invoicedetail.push({
          routekey: item.routekey,
          visitkey: item.visitkey,
          itemcode: item.itemcode
        });
      }
    }

    return { invoicedetail };
  });
}

export async function uploadArTransactionDetails(
  request: LegacyTransactionRequest
): Promise<ArTransactionDetailResponse> {
  const items = parseLegacyRequestArrayField(request, 'ardetail') as ArTransactionDetailItem[];

  return withTransaction(async (connection) => {
    const ardetail: ArTransactionDetailResponse['ardetail'] = [];

    for (const item of items) {
      if (await saveArTransactionDetail(connection, item)) {
        ardetail.push({
          routekey: item.routekey,
          visitkey: item.visitkey,
          transactionkey: item.transactionkey
        });
      }
    }

    return { ardetail };
  });
}

function parseSendDataPayload(request: LegacyTransactionRequest): SendDataPayload {
  const rawValues = readLegacyBodyValues(request.body);
  const payload = createEmptySendDataPayload();

  for (const field of SEND_DATA_ARRAY_FIELDS) {
    payload[field] = parseLegacyArrayField(field, rawValues[field]);
  }

  payload.routekey = readScalar(rawValues.routekey);
  payload.routecode = readScalar(rawValues.routecode);
  payload.routeclosed = readScalar(rawValues.routeclosed);
  payload.userid = readScalar(rawValues.userid);

  return payload;
}

function parseLegacyRequestArrayField(
  request: LegacyTransactionRequest,
  field: string
): Record<string, unknown>[] {
  const params = {
    ...readLegacyBodyValues(request.body),
    ...((request.query as Record<string, unknown> | undefined) ?? {})
  };
  const value = params[field];

  if (value === undefined || value === null || value === '') {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(isPlainObject);
  }

  try {
    const parsed = JSON.parse(String(value));
    return normalizeLegacyRecords(parsed);
  } catch {
    throw new ApiError(400, `Invalid ${field} payload`);
  }
}

function readLegacyBodyValues(body: unknown): Record<string, unknown> {
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
        throw new ApiError(400, 'Invalid sync/senddata JSON payload');
      }
    }

    return Object.fromEntries(new URLSearchParams(trimmedBody));
  }

  return isPlainObject(body) ? body : {};
}

function parseCustomerSequenceItems(
  request: LegacyTransactionRequest
): CustomerSequenceRequestItem[] {
  const rawBody = request.body;

  if (rawBody === undefined || rawBody === null || rawBody === '') {
    return [];
  }

  if (Array.isArray(rawBody)) {
    return rawBody;
  }

  try {
    const parsed = JSON.parse(String(rawBody));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    throw new ApiError(400, 'Invalid custseq payload');
  }
}

function createEmptySendDataPayload(): SendDataPayload {
  const payload = {
    routekey: null,
    routecode: null,
    routeclosed: null,
    userid: null
  } as SendDataPayload;

  for (const field of SEND_DATA_ARRAY_FIELDS) {
    payload[field] = [];
  }

  return payload;
}

function createEmptySendDataResponse(): MutableSendDataResponse {
  const response = {} as MutableSendDataResponse;

  for (const field of SEND_DATA_ARRAY_FIELDS) {
    response[field] = [];
  }

  return response;
}

function parseLegacyArrayField(field: SendDataArrayField, value: unknown): unknown[] {
  if (value === undefined || value === null || value === '') {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return normalizeLegacyRecords(parsed);
  } catch {
    throw new ApiError(400, `Invalid ${field} payload`);
  }
}

function pruneEmptySendDataResponse(response: MutableSendDataResponse): SendDataResponse {
  return Object.fromEntries(
    Object.entries(response).filter(([, items]) => Array.isArray(items) && items.length > 0)
  ) as SendDataResponse;
}

function normalizeLegacyRecords(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter(isPlainObject);
  }

  if (isPlainObject(value)) {
    return Object.values(value).filter(isPlainObject);
  }

  return [];
}

function readScalar(value: unknown): string | number | null {
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  return null;
}

function asRecords<T>(items: unknown[]): T[] {
  return items.filter(isPlainObject) as T[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
