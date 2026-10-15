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

/**
 * Registers legacy WS, customer, and transaction lookup endpoints used by the
 * mobile application. Duplicate path forms support existing mobile callers.
 *
 * @param app Fastify application receiving the route registrations.
 * @returns Resolves after every WS route is registered.
 */
export async function wsRoutes(app: FastifyInstance): Promise<void> {
  // Route-load validation supports both path parameters and legacy payloads.
  app.route({ method: 'POST', url: '/api/ws/checkload/routeid/:routeid/userid/:userid', handler: checkLoad });
  app.route({ method: 'POST', url: '/api/ws/checkload', handler: checkLoad });
  // Route-day lifecycle endpoints use GET because the PhoneGap app sends JSON in query values.
  app.route({ method: 'GET', url: '/api/ws/senddata', handler: wsSendData });
  app.route({ method: 'GET', url: '/api/ws/endday', handler: endDay });
  app.route({ method: 'GET', url: '/api/ws/logout', handler: logout });
  // Customer inventory, balance, delivery, and item-group lookups.
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getcustinv', handler: getCustomerInvoice });
  app.route({ method: 'GET', url: '/api/ws/getcustomerbalance', handler: getCustomerBalance });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getcustomeritemgrp', handler: getCustomerItemGroup });
  app.route({ method: 'GET', url: '/api/ws/getdelivery', handler: getDelivery });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getcustomeritemgrp/routeid/:routeid/userid/:userid', handler: getCustomerItemGroup });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getcustomeritemgrp/routeid/:routeid', handler: getCustomerItemGroup });
  // Operational lookup routes retain every URL shape used by mobile screens.
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
  // Customer-master lookup endpoints support path and body/query parameters.
  app.route({ method: 'POST', url: '/api/customer/customermaster/routecode/:routecode/customercode/:customercode', handler: customerMaster });
  app.route({ method: 'POST', url: '/api/customer/customermaster', handler: customerMaster });
  // Transaction reconciliation and inventory-import count endpoints.
  app.route({ method: 'GET', url: '/api/transaction/trandata/routekey/:routekey', handler: transactionData });
  app.route({ method: 'GET', url: '/api/transaction/trandata', handler: transactionData });
  app.route({ method: 'GET', url: '/api/transaction/importinventorycount/routecode/:routecode', handler: importInventoryCount });
  app.route({ method: 'GET', url: '/api/transaction/importinventorycount', handler: importInventoryCount });
}
