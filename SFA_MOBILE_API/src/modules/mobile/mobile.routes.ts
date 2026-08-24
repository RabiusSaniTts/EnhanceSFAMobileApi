import type { FastifyInstance } from 'fastify';
import { authRoutes } from './auth/auth.routes';
import { syncRoutes } from './sync/sync.routes';
import { wsRoutes } from './ws/ws.routes';
import { transactionRoutes } from './transaction/transaction.routes';
import { customerRoutes } from './customer/customer.routes';
import { imageRoutes } from './image/image.routes';

export async function registerMobileRoutes(app: FastifyInstance): Promise<void> {
  await app.register(authRoutes);
  await app.register(syncRoutes);
  await app.register(wsRoutes);
  await app.register(transactionRoutes);
  await app.register(customerRoutes);
  await app.register(imageRoutes);
}
