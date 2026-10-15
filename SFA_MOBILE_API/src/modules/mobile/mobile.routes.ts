import type { FastifyInstance } from 'fastify';
import { authRoutes } from './auth/auth.routes';
import { masterDataSyncRoutes } from './masterdatasync/masterdatasync.routes';
import { transactionRoutes } from './transactions/transactions.routes';
import { wsRoutes } from './ws/ws.routes';

export async function registerMobileRoutes(app: FastifyInstance): Promise<void> {
  await authRoutes(app);
  await masterDataSyncRoutes(app);
  await transactionRoutes(app);
  await wsRoutes(app);
}
