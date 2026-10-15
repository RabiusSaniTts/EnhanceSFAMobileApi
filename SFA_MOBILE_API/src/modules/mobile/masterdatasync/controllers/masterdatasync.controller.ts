import type { FastifyReply, FastifyRequest } from 'fastify';
import { withTransaction } from '../../../../shared/db/transaction';
import { getSettingSyncSections } from '../models/setting.model';
import { getMasterDataSyncSections } from '../models/masterData.model';
import { getTransactionDataSyncSections } from '../models/transactionData.model';

const GET_SYNC_DATA_TABLE_NAMES = [
  'ControlPanel', 'Setup', 'companydetail', 'SalesmanMaster', 'RouteMaster',
  'startendday', 'synctime', 'CurrencyMaster', 'itemmustheader', 'itemmustdetail',
  'itemgroup', 'ItemMaster', 'itempackagemaster', 'routegoal', 'avgsalesqty',
  'outletitemcodes', 'taxmaster', 'startingloaddetail', 'inventorysummarydetail',
  'CustomerMaster', 'salescalender', 'routesequence', 'customerinvoice',
  'discountkeyheader', 'discountkeydetail', 'distributionkeydetails',
  'productgroupheader', 'productgroupdetail', 'promokeyheader', 'promokeydetail',
  'promoplanheader', 'promoplandetail', 'promotionassignmentadvanced',
  'customerpricing1', 'pricingdetail1', 'POSmaster', 'customerposinventory',
  'customerposlimit', 'posinstructions', 'customersurveyplan',
  'customersurveykeyplan', 'customersurveykey', 'customersurveydefinition',
  'customersurveydefassign', 'lookupindexdetail', 'nonservreasons', 'expreasons',
  'expiryreturnreasons', 'retitmreasons', 'freegoodreasons', 'voidreasons',
  'routebook', 'salestrend', 'tempcustinventory', 'customermessages',
  'salesmanmessages', 'vanmaster', 'bankmaster', 'cashdesc', 'inventorylocation',
  'salesorderheader', 'salesorderdetail', 'suggestedsalesinvoice',
  'inventorytransactiondetail', 'customer_foc_balance', 'customer_foc_detail',
  'journeyplancreditlimit', 'batchexpirydetail', 'customer_foc', 'itemnrp',
  'custnrp', 'deletemaster', 'customeritemgrp', 'customeritemmap'
] as const;

export async function masterDataSyncAction(
  request: FastifyRequest<{ Params: Record<string, string | undefined> }>,
  reply: FastifyReply
) {
  const params = request.params;
  const result = await withTransaction(async (connection) => {
    const routeId = Number(params.routeid);
    const userId = Number(params.userid);
    const settingSections = await getSettingSyncSections(connection, { routeId });
    const masterDataSections = await getMasterDataSyncSections(connection, { routeId });
    const transactionDataSections = await getTransactionDataSyncSections(connection, {
      routeId,
      userId,
      deviceId: params.deviceid
    });

    const { ControlPanel, Setup, companydetail, SalesmanMaster, RouteMaster, startendday, synctime, CurrencyMaster } = settingSections;
    const { itemmustheader, itemmustdetail, itemgroup, ItemMaster, itempackagemaster, routegoal, avgsalesqty, outletitemcodes, taxmaster, itemnrp, custnrp, customeritemgrp, customeritemmap, CustomerMaster, salescalender, routesequence, customerinvoice, discountkeyheader, discountkeydetail, distributionkeydetails, productgroupheader, productgroupdetail, promokeyheader, promokeydetail, promoplanheader, promoplandetail, promotionassignmentadvanced, customerpricing1, pricingdetail1, POSmaster, customerposinventory, customerposlimit, posinstructions, customersurveyplan, customersurveykeyplan, customersurveykey, customersurveydefinition, customersurveydefassign, lookupindexdetail, nonservreasons, expreasons, expiryreturnreasons, retitmreasons, freegoodreasons, voidreasons, routebook, salestrend, tempcustinventory, customermessages, salesmanmessages, vanmaster, bankmaster, cashdesc, inventorylocation } = masterDataSections;
    const { startingloaddetail, inventorysummarydetail, salesorderheader, salesorderdetail, suggestedsalesinvoice, inventorytransactiondetail, customer_foc_balance, customer_foc_detail, journeyplancreditlimit, batchexpirydetail, customer_foc, deletemaster } = transactionDataSections;

    return buildMasterDataSyncResponse({
      ControlPanel, Setup, companydetail, SalesmanMaster, RouteMaster, startendday,
      synctime, CurrencyMaster, itemmustheader, itemmustdetail, itemgroup,
      ItemMaster, itempackagemaster, routegoal, avgsalesqty, outletitemcodes,
      taxmaster, startingloaddetail, inventorysummarydetail, CustomerMaster,
      salescalender, routesequence, customerinvoice, discountkeyheader,
      discountkeydetail, distributionkeydetails, productgroupheader,
      productgroupdetail, promokeyheader, promokeydetail, promoplanheader,
      promoplandetail, promotionassignmentadvanced, customerpricing1,
      pricingdetail1, POSmaster, customerposinventory, customerposlimit,
      posinstructions, customersurveyplan, customersurveykeyplan,
      customersurveykey, customersurveydefinition, customersurveydefassign,
      lookupindexdetail, nonservreasons, expreasons, expiryreturnreasons,
      retitmreasons, freegoodreasons, voidreasons, routebook, salestrend,
      tempcustinventory, customermessages, salesmanmessages, vanmaster,
      bankmaster, cashdesc, inventorylocation, salesorderheader, salesorderdetail,
      suggestedsalesinvoice, inventorytransactiondetail, customer_foc_balance,
      customer_foc_detail, journeyplancreditlimit, batchexpirydetail,
      customer_foc, itemnrp, custnrp, deletemaster, customeritemgrp,
      customeritemmap
    });
  });

  await reply.send(result);
}

function buildMasterDataSyncResponse(sections: Record<string, any>) {
  const response: Record<string, any> = {};

  for (const tableName of GET_SYNC_DATA_TABLE_NAMES) {
    response[tableName] = sections[tableName] ?? [];
  }

  applyZendValueFormatting(response);
  response.synccount = buildSyncCount(response);
  return response;
}

function buildSyncCount(response: Record<string, any>) {
  const syncCount = GET_SYNC_DATA_TABLE_NAMES.map((tableName) => ({
    tablename: tableName,
    tablecount: toZendTableCount(response[tableName]?.length ?? 0)
  }));
  const customerFocIndex = syncCount.findIndex((item) => item.tablename === 'customer_foc');

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

function applyZendValueFormatting(response: Record<string, any>): void {
  formatDecimalFields(response.CustomerMaster, [
    'creditlimit',
    'tcspecialdiscount',
    'minsaleslimit',
    'maxsaleslimit'
  ]);
  formatDecimalFields(response.RouteMaster, ['minsaleslimit', 'maxsaleslimit']);
}

function formatDecimalFields(rows: any[], fields: string[]): void {
  for (const row of rows ?? []) {
    for (const field of fields) {
      row[field] = toFixedDecimalString(row[field]);
    }
  }
}

function toFixedDecimalString(value: any) {
  if (value === null || value === undefined || value === '') {
    return value;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue.toFixed(4) : value;
}

function toZendTableCount(count: number) {
  return count === 0 ? '' : count;
}
