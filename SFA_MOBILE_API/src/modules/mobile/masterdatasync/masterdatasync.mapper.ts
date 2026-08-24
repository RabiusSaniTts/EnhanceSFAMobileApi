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

  response.synccount = buildSyncCount(response);
  return response;
}

export function buildSyncCount(response: Record<string, unknown[]>): SyncCountItem[] {
  return GET_SYNC_DATA_TABLE_NAMES.map((tableName) => ({
    tablename: tableName,
    tablecount: response[tableName]?.length ?? 0
  }));
}
