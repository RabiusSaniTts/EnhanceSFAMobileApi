import type {
  MasterDataSyncResponse,
  MasterDataSyncResponseSections,
  SyncCountItem
} from './masterdatasync.types';

export const GET_SYNC_DATA_TABLE_NAMES = [
  'ControlPanel',
  'Setup',
  'companydetail',
  'SalesmanMaster',
  'RouteMaster',
  'startendday',
  'synctime',
  'CurrencyMaster',
  'itemmustheader',
  'itemmustdetail',
  'itemgroup',
  'ItemMaster',
  'itempackagemaster',
  'routegoal',
  'avgsalesqty',
  'outletitemcodes',
  'taxmaster',
  'startingloaddetail',
  'inventorysummarydetail',
  'CustomerMaster',
  'salescalender',
  'routesequence',
  'customerinvoice',
  'discountkeyheader',
  'discountkeydetail',
  'distributionkeydetails',
  'productgroupheader',
  'productgroupdetail',
  'promokeyheader',
  'promokeydetail',
  'promoplanheader',
  'promoplandetail',
  'promotionassignmentadvanced',
  'customerpricing1',
  'pricingdetail1',
  'POSmaster',
  'customerposinventory',
  'customerposlimit',
  'posinstructions',
  'customersurveyplan',
  'customersurveykeyplan',
  'customersurveykey',
  'customersurveydefinition',
  'customersurveydefassign',
  'lookupindexdetail',
  'nonservreasons',
  'expreasons',
  'expiryreturnreasons',
  'retitmreasons',
  'freegoodreasons',
  'voidreasons',
  'routebook',
  'salestrend',
  'tempcustinventory',
  'customermessages',
  'salesmanmessages',
  'vanmaster',
  'bankmaster',
  'cashdesc',
  'inventorylocation',
  'salesorderheader',
  'salesorderdetail',
  'suggestedsalesinvoice',
  'inventorytransactiondetail',
  'customer_foc_balance',
  'customer_foc_detail',
  'journeyplancreditlimit',
  'batchexpirydetail',
  'customer_foc',
  'itemnrp',
  'custnrp',
  'deletemaster',
  'customeritemgrp',
  'customeritemmap'
] as const;

export function buildMasterDataSyncResponse(
  sections: MasterDataSyncResponseSections = {}
): MasterDataSyncResponse {
  const response = {} as MasterDataSyncResponse;

  for (const tableName of GET_SYNC_DATA_TABLE_NAMES) {
    response[tableName] = sections[tableName] ?? [];
  }

  applyZendValueFormatting(response);
  response.synccount = buildSyncCount(response);
  return response;
}

export function buildSyncCount(response: Record<string, unknown[]>): SyncCountItem[] {
  const syncCount = GET_SYNC_DATA_TABLE_NAMES.map((tableName) => ({
    tablename: tableName,
    tablecount: toZendTableCount(response[tableName]?.length ?? 0)
  }));

  const customerFocIndex = syncCount.findIndex(
    (item) => item.tablename === 'customer_foc'
  );

  syncCount.splice(
    customerFocIndex + 1,
    0,
    {
      tablename: 'itemmustheader',
      tablecount: toZendTableCount(response.itemmustheader?.length ?? 0)
    },
    {
      tablename: 'itemmustdetail',
      tablecount: toZendTableCount(response.itemmustdetail?.length ?? 0)
    }
  );

  return syncCount;
}

function applyZendValueFormatting(response: Record<string, unknown[]>): void {
  formatDecimalFields(response.CustomerMaster, [
    'creditlimit',
    'tcspecialdiscount',
    'minsaleslimit',
    'maxsaleslimit'
  ]);

  formatDecimalFields(response.RouteMaster, ['minsaleslimit', 'maxsaleslimit']);
}

function formatDecimalFields(rows: unknown[] | undefined, fields: string[]): void {
  for (const row of rows ?? []) {
    if (!isRecord(row)) {
      continue;
    }

    for (const field of fields) {
      row[field] = toFixedDecimalString(row[field]);
    }
  }
}

function toFixedDecimalString(value: unknown): unknown {
  if (value === null || value === undefined || value === '') {
    return value;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue.toFixed(4) : value;
}

function toZendTableCount(count: number): number | string {
  return count === 0 ? '' : count;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
