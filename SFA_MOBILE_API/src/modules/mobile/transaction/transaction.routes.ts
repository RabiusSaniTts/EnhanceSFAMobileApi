import type { FastifyInstance } from 'fastify';
import { importInventoryCount, transactionData } from './transaction.controller';

export async function transactionRoutes(app: FastifyInstance): Promise<void> {
  app.route({
    method: ['GET', 'POST'],
    url: '/api/transaction/trandata',
    handler: transactionData
  });

  app.route({
    method: ['GET', 'POST'],
    url: '/api/transaction/importinventorycount',
    handler: importInventoryCount
  });
}
