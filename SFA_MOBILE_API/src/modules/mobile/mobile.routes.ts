import type { FastifyInstance } from 'fastify';
import { authRoutes } from './auth/auth.routes';
import { wsRoutes } from './ws/ws.routes';
import { transactionsRoutes } from './transactions/transactions.routes';

export async function registerMobileRoutes(app: FastifyInstance): Promise<void> {
  await app.register(authRoutes);
  await app.register(transactionsRoutes);
  await app.register(wsRoutes);
}
