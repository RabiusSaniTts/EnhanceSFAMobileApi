import type { FastifyInstance } from 'fastify';
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
} from './controllers/ws.controller';

export async function wsRoutes(app: FastifyInstance): Promise<void> {
  app.route({ method: 'POST', url: '/api/ws/checkload/routeid/:routeid/userid/:userid', handler: checkLoad });
  app.route({ method: 'POST', url: '/api/ws/checkload', handler: checkLoad });
  app.route({ method: 'GET', url: '/api/ws/senddata', handler: wsSendData });
  app.route({ method: 'GET', url: '/api/ws/endday', handler: endDay });
  app.route({ method: 'GET', url: '/api/ws/logout', handler: logout });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getcustinv', handler: getCustomerInvoice });
  app.route({ method: 'GET', url: '/api/ws/getcustomerbalance', handler: getCustomerBalance });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getcustomeritemgrp', handler: getCustomerItemGroup });
  app.route({ method: 'GET', url: '/api/ws/getdelivery', handler: getDelivery });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getcustomeritemgrp/routeid/:routeid/userid/:userid', handler: getCustomerItemGroup });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getcustomeritemgrp/routeid/:routeid', handler: getCustomerItemGroup });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getorderstatus/routeid/:routeid/userid/:userid', handler: getOrderStatus });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getorderstatus/routeid/:routeid', handler: getOrderStatus });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getorderstatus', handler: getOrderStatus });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getvisualdata/routeid/:routeid/userid/:userid', handler: getVisualData });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getvisualdata/routeid/:routeid', handler: getVisualData });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getvisualdata', handler: getVisualData });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getwarehousestock/routeid/:routeid/userid/:userid', handler: getWarehouseStock });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getwarehousestock/routeid/:routeid', handler: getWarehouseStock });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getwarehousestock', handler: getWarehouseStock });
  app.route({ method: 'GET', url: '/api/ws/getwhstock', handler: getWhStock });
  app.route({ method: 'POST', url: '/api/customer/customermaster/routecode/:routecode/customercode/:customercode', handler: customerMaster });
  app.route({ method: 'POST', url: '/api/customer/customermaster', handler: customerMaster });
  app.route({ method: 'GET', url: '/api/transaction/trandata/routekey/:routekey', handler: transactionData });
  app.route({ method: 'GET', url: '/api/transaction/trandata', handler: transactionData });
  app.route({ method: 'GET', url: '/api/transaction/importinventorycount/routecode/:routecode', handler: importInventoryCount });
  app.route({ method: 'GET', url: '/api/transaction/importinventorycount', handler: importInventoryCount });
}
