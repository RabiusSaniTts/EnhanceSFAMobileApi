import { withTransaction } from '../../../shared/db/transaction';
import { buildMasterDataSyncResponse } from './masterdatasync.mapper';
import { getSettingSyncSections } from './repository/setting.repository';
import { getItemSyncSections } from './repository/items.repository';
import { getInventorySyncSections } from './repository/inventory.repository';
import { getCustomerSyncSections } from './repository/customers.repository';
import { getPromotionPricingSyncSections } from './repository/promotionPricing.repository';
import { getSurveySyncSections } from './repository/survey.repository';
import { getReasonSyncSections } from './repository/reasons.repository';
import { getOtherSyncSections } from './repository/others.repository';
import { getOrderSyncSections } from './repository/orders.repository';
import { getDeleteMasterSyncSections } from './repository/deleteMaster.repository';
import { getCustomerItemGroupSyncSections } from './repository/customerItemGroup.repository';
import type {
  MasterDataSyncParams,
  MasterDataSyncResponse
} from './masterdatasync.types';

export async function getMasterDataSync(
  params: MasterDataSyncParams
): Promise<MasterDataSyncResponse> {
  return withTransaction(async (connection) => {
    const routeId = Number(params.routeid);
    const userId = Number(params.userid);
    const settingSections = await getSettingSyncSections(connection, {
      routeId
    });
    const itemSections = await getItemSyncSections(connection, { routeId });
    const inventorySections = await getInventorySyncSections(connection, { routeId });
    const customerSections = await getCustomerSyncSections(connection, { routeId });
    const promotionPricingSections = await getPromotionPricingSyncSections(
      connection,
      { routeId }
    );
    const surveySections = await getSurveySyncSections(connection);
    const reasonSections = await getReasonSyncSections(connection, { routeId });
    const otherSections = await getOtherSyncSections(connection);
    const orderSections = await getOrderSyncSections(connection, { routeId });
    const deleteMasterSections = await getDeleteMasterSyncSections(connection, {
      userId,
      deviceId: params.deviceid
    });
    const customerItemGroupSections = await getCustomerItemGroupSyncSections(
      connection,
      { routeId }
    );

    return buildMasterDataSyncResponse({
      ...settingSections,
      ...itemSections,
      ...inventorySections,
      ...customerSections,
      ...promotionPricingSections,
      ...surveySections,
      ...reasonSections,
      ...otherSections,
      ...orderSections,
      ...deleteMasterSections,
      ...customerItemGroupSections
    });
  });
}
