import type { FastifyInstance } from 'fastify';
import {
  checkLoad,
  endDay,
  getCustomerBalance,
  getCustomerInvoice,
  getCustomerItemGroup,
  getDelivery,
  getOrderStatus,
  getVisualData,
  getWarehouseStock,
  getWhStock,
  logout,
  wsSendData
} from './ws.controller';

export async function wsRoutes(app: FastifyInstance): Promise<void> {
  app.route({ method: ['GET', 'POST'], url: '/api/ws/checkload', handler: checkLoad });
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
  app.route({ method: ['GET', 'POST'], url: '/api/ws/senddata', handler: wsSendData });
}
