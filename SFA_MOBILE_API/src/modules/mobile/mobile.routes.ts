import type { FastifyInstance } from 'fastify';
import { masterDataSyncAction } from './masterdatasync/masterdatasync.controller';
import {
  companyIdByDevice,
  salesmanLogin,
  salesmanVersionCheck,
  updateSyncDate
} from './auth/auth.controller';
import {
  arTransactionDetailAction,
  customerSequenceAction,
  invoiceTransactionDetailAction,
  sendDataAction,
  uploadImageAction
} from './transactions/transactions.controller';
import {
  checkLoad,
  customerMaster,
  endDay,
  getCustomerBalance,
  getCustomerInvoice,
  getCustomerItemGroup,
  getDelivery,
  getOrderStatus,
  getVisualData,
  getWarehouseStock,
  getWhStock,
  importInventoryCount,
  logout,
  transactionData,
  wsSendData
} from './ws/ws.controller';

export async function registerMobileRoutes(app: FastifyInstance): Promise<void> {
  app.route({
    method: 'POST',
    url: '/api/index/companyidbydevice/deviceid/:deviceid',
    handler: companyIdByDevice
  });

  app.route({
    method: 'POST',
    url: '/api/index/salesmanlogin/username/:username/password/:password/deviceid/:deviceid',
    handler: salesmanLogin
  });

  app.route({
    method: 'POST',
    url: '/api/index/salesmanverchk/routecode/:routecode/verno/:verno',
    handler: salesmanVersionCheck
  });

  app.route({
    method: 'POST',
    url: '/api/index/getsyncdata1/routeid/:routeid/userid/:userid/deviceid/:deviceid/mdate/:mdate/table/:table',
    handler: masterDataSyncAction
  });

  app.route({
    method: 'POST',
    url: '/api/index/updatesyncdate/routeid/:routeid',
    handler: updateSyncDate
  });

  app.route({
    method: 'POST',
    url: '/api/index/updatesyncdate/userid/:userid/deviceid/:deviceid/routecode/:routecode/routekey/:routekey/routeclosed/:routeclosed',
    handler: updateSyncDate
  });

  app.route({ method: 'POST', url: '/api/sync/senddata', handler: sendDataAction });
  app.route({ method: 'POST', url: '/api/sync/custseq', handler: customerSequenceAction });

  app.route({
    method: 'POST',
    url: '/api/sync/invtxndetail',
    handler: invoiceTransactionDetailAction
  });

  app.route({
    method: 'POST',
    url: '/api/sync/artxndetail',
    handler: arTransactionDetailAction
  });

  app.route({
    method: ['POST'],
    url: '/api/image/upload',
    handler: uploadImageAction
  });

  app.route({
    method: 'POST',
    url: '/api/ws/checkload/routeid/:routeid/userid/:userid',
    handler: checkLoad
  });
  app.route({ method: 'POST', url: '/api/ws/checkload', handler: checkLoad });
  app.route({ method: 'GET', url: '/api/ws/senddata', handler: wsSendData });
  app.route({ method: 'GET', url: '/api/ws/endday', handler: endDay });
  app.route({ method: 'GET', url: '/api/ws/logout', handler: logout });
  app.route({ method: 'POST', url: '/api/ws/getcustinv', handler: getCustomerInvoice });
  app.route({
    method: 'GET',
    url: '/api/ws/getcustomerbalance',
    handler: getCustomerBalance
  });
  app.route({
    method: 'POST',
    url: '/api/ws/getcustomeritemgrp',
    handler: getCustomerItemGroup
  });
  app.route({ method: 'GET', url: '/api/ws/getdelivery', handler: getDelivery });
  app.route({
    method: 'POST',
    url: '/api/ws/getcustomeritemgrp/routeid/:routeid/userid/:userid',
    handler: getCustomerItemGroup
  });
  app.route({
    method: 'POST',
    url: '/api/ws/getorderstatus/routeid/:routeid/userid/:userid',
    handler: getOrderStatus
  });
  app.route({ method: 'POST', url: '/api/ws/getorderstatus', handler: getOrderStatus });
  app.route({
    method: 'POST',
    url: '/api/ws/getvisualdata/routeid/:routeid/userid/:userid',
    handler: getVisualData
  });
  app.route({ method: 'POST', url: '/api/ws/getvisualdata', handler: getVisualData });
  app.route({
    method: 'POST',
    url: '/api/ws/getwarehousestock/routeid/:routeid/userid/:userid',
    handler: getWarehouseStock
  });
  app.route({
    method: 'POST',
    url: '/api/ws/getwarehousestock',
    handler: getWarehouseStock
  });
  app.route({ method: 'GET', url: '/api/ws/getwhstock', handler: getWhStock });

  app.route({
    method: 'POST',
    url: '/api/customer/customermaster/routecode/:routecode/customercode/:customercode',
    handler: customerMaster
  });
  app.route({
    method: 'POST',
    url: '/api/customer/customermaster',
    handler: customerMaster
  });

  app.route({
    method: 'GET',
    url: '/api/transaction/trandata/routekey/:routekey',
    handler: transactionData
  });
  app.route({
    method: 'GET',
    url: '/api/transaction/trandata',
    handler: transactionData
  });
  app.route({
    method: 'GET',
    url: '/api/transaction/importinventorycount/routecode/:routecode',
    handler: importInventoryCount
  });
  app.route({
    method: 'GET',
    url: '/api/transaction/importinventorycount',
    handler: importInventoryCount
  });
}
