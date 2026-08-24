import type { FastifyInstance } from 'fastify';
import { indexRoutes } from './index/index.routes';
import { syncRoutes } from './sync/sync.routes';
import { wsRoutes } from './ws/ws.routes';
import { transactionRoutes } from './transaction/transaction.routes';
import { customerRoutes } from './customer/customer.routes';
import { imageRoutes } from './image/image.routes';

export async function registerMobileRoutes(app: FastifyInstance): Promise<void> {
  await app.register(indexRoutes);
  await app.register(syncRoutes);
  await app.register(wsRoutes);
  await app.register(transactionRoutes);
  await app.register(customerRoutes);
  await app.register(imageRoutes);
}
