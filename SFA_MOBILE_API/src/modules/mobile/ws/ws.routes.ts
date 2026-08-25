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
} from './ws.controller';

export async function wsRoutes(app: FastifyInstance): Promise<void> {
  app.route({ method: ['GET', 'POST'], url: '/api/ws/checkload', handler: checkLoad });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/senddata', handler: wsSendData });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/endday', handler: endDay });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/logout', handler: logout });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getcustinv', handler: getCustomerInvoice });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getcustomerbalance', handler: getCustomerBalance });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getcustomeritemgrp', handler: getCustomerItemGroup });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getdelivery', handler: getDelivery });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getorderstatus', handler: getOrderStatus });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getvisualdata', handler: getVisualData });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getwarehousestock', handler: getWarehouseStock });
  app.route({ method: ['GET', 'POST'], url: '/api/ws/getwhstock', handler: getWhStock });
  app.route({
    method: ['GET', 'POST'],
    url: '/api/customer/customermaster/routecode/:routecode/customercode/:customercode',
    handler: customerMaster
  });
  app.route({ method: ['GET', 'POST'], url: '/api/customer/customermaster', handler: customerMaster });
  app.route({
    method: ['GET', 'POST'],
    url: '/api/transaction/trandata/routekey/:routekey',
    handler: transactionData
  });
  app.route({ method: ['GET', 'POST'], url: '/api/transaction/trandata', handler: transactionData });
  app.route({
    method: ['GET', 'POST'],
    url: '/api/transaction/importinventorycount/routecode/:routecode',
    handler: importInventoryCount
  });
  app.route({
    method: ['GET', 'POST'],
    url: '/api/transaction/importinventorycount',
    handler: importInventoryCount
  });
}
