import type { LegacyUploadItem } from './shared.types';

export const SEND_DATA_ARRAY_FIELDS = [
  'invoicedetail',
  'invoiceheader',
  'invoicerxddetail',
  'promotiondetail',
  'customerinvoice',
  'salesorderheader',
  'salesorderdetail',
  'orderrxddetail',
  'batchexpirydetail',
  'arheader',
  'ardetail',
  'cashcheckdetail',
  'inventorytransactionheader',
  'inventorytransactiondetail',
  'inventorysummarydetail',
  'nonservicedcustomer',
  'surveyauditdetail',
  'posequipmentchangedetail',
  'posmaster',
  'sigcapturedata',
  'customermaster',
  'customeroperationscontrol',
  'routemaster',
  'customerinventorydetail',
  'routesequencecustomerstatus',
  'routegoal',
  'nosalesheader',
  'customer_foc_balance',
  'enddaydetail',
  't_access_override_log',
  'customerinventorycheck',
  'customerimages',
  'customervisitlog',
  'visualsfeedback',
  'promotions_remark',
  'customerdistributioncheck'
] as const;

export type SendDataArrayField = (typeof SEND_DATA_ARRAY_FIELDS)[number];

export type SendDataPayload = Record<SendDataArrayField, unknown[]> & {
  routekey: string | number | null;
  routecode: string | number | null;
  routeclosed: string | number | null;
  userid: string | number | null;
};

export type SendDataResponse = Partial<Record<SendDataArrayField, Record<string, unknown>[]>>;

export type InvoiceTransactionDetailItem = LegacyUploadItem;
export type ArTransactionDetailItem = LegacyUploadItem;

export type InvoiceTransactionDetailResponse = {
  invoicedetail: Array<{
    routekey: string | number | null | undefined;
    visitkey: string | number | null | undefined;
    itemcode: string | number | null | undefined;
  }>;
};

export type ArTransactionDetailResponse = {
  ardetail: Array<{
    routekey: string | number | null | undefined;
    visitkey: string | number | null | undefined;
    transactionkey: string | number | null | undefined;
  }>;
};
