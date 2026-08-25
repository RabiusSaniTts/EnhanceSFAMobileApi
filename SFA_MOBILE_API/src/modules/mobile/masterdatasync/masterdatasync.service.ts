import { withTransaction } from "../../../shared/db/transaction";
import { buildMasterDataSyncResponse } from "./masterdatasync.mapper";
import { getSettingSyncSections } from "./repository/setting.repository";
import { getMasterDataSyncSections } from "./repository/masterData.repository";
import { getTransactionDataSyncSections } from "./repository/transactionData.repository";
import type {
  MasterDataSyncParams,
  MasterDataSyncResponse,
} from "./masterdatasync.types";

export async function getMasterDataSync(
  params: MasterDataSyncParams,
): Promise<MasterDataSyncResponse> {
  return withTransaction(async (connection) => {
    const routeId = Number(params.routeid);
    const userId = Number(params.userid);
    const settingSections = await getSettingSyncSections(connection, {
      routeId,
    });
    const masterDataSections = await getMasterDataSyncSections(connection, {
      routeId,
    });
    const transactionDataSections = await getTransactionDataSyncSections(connection, {
      routeId,
      userId,
      deviceId: params.deviceid,
    });
    const { ControlPanel, Setup, companydetail, SalesmanMaster, RouteMaster, startendday, synctime, CurrencyMaster } = settingSections;

    const { itemmustheader, itemmustdetail, itemgroup, ItemMaster, itempackagemaster, routegoal, avgsalesqty, outletitemcodes, taxmaster, itemnrp, custnrp, customeritemgrp, customeritemmap } = masterDataSections;

    const { startingloaddetail, inventorysummarydetail } = transactionDataSections;

    const { CustomerMaster, salescalender, routesequence, customerinvoice } = masterDataSections;

    const { discountkeyheader, discountkeydetail, distributionkeydetails, productgroupheader, productgroupdetail, promokeyheader, promokeydetail, promoplanheader, promoplandetail, promotionassignmentadvanced, customerpricing1, pricingdetail1 } = masterDataSections;

    const { POSmaster, customerposinventory, customerposlimit, posinstructions, customersurveyplan, customersurveykeyplan, customersurveykey, customersurveydefinition, customersurveydefassign, lookupindexdetail } = masterDataSections;

    const { nonservreasons, expreasons, expiryreturnreasons, retitmreasons, freegoodreasons, voidreasons, routebook, salestrend, tempcustinventory } = masterDataSections;

    const { customermessages, salesmanmessages, vanmaster, bankmaster, cashdesc, inventorylocation } = masterDataSections;

    const { salesorderheader, salesorderdetail, suggestedsalesinvoice, inventorytransactiondetail, customer_foc_balance, customer_foc_detail, journeyplancreditlimit, batchexpirydetail, customer_foc } = transactionDataSections;

    const { deletemaster } = transactionDataSections;

    return buildMasterDataSyncResponse({
      ControlPanel,
      Setup,
      companydetail,
      SalesmanMaster,
      RouteMaster,
      startendday,
      synctime,
      CurrencyMaster,
      itemmustheader,
      itemmustdetail,
      itemgroup,
      ItemMaster,
      itempackagemaster,
      routegoal,
      avgsalesqty,
      outletitemcodes,
      taxmaster,
      startingloaddetail,
      inventorysummarydetail,
      CustomerMaster,
      salescalender,
      routesequence,
      customerinvoice,
      discountkeyheader,
      discountkeydetail,
      distributionkeydetails,
      productgroupheader,
      productgroupdetail,
      promokeyheader,
      promokeydetail,
      promoplanheader,
      promoplandetail,
      promotionassignmentadvanced,
      customerpricing1,
      pricingdetail1,
      POSmaster,
      customerposinventory,
      customerposlimit,
      posinstructions,
      customersurveyplan,
      customersurveykeyplan,
      customersurveykey,
      customersurveydefinition,
      customersurveydefassign,
      lookupindexdetail,
      nonservreasons,
      expreasons,
      expiryreturnreasons,
      retitmreasons,
      freegoodreasons,
      voidreasons,
      routebook,
      salestrend,
      tempcustinventory,
      customermessages,
      salesmanmessages,
      vanmaster,
      bankmaster,
      cashdesc,
      inventorylocation,
      salesorderheader,
      salesorderdetail,
      suggestedsalesinvoice,
      inventorytransactiondetail,
      customer_foc_balance,
      customer_foc_detail,
      journeyplancreditlimit,
      batchexpirydetail,
      customer_foc,
      itemnrp,
      custnrp,
      deletemaster,
      customeritemgrp,
      customeritemmap,
    });
  });
}
