import type { FastifyInstance } from 'fastify';
import {
  arTransactionDetailAction,
  customerSequenceAction,
  invoiceTransactionDetailAction,
  sendDataAction,
  uploadImageAction
} from './controllers/transactions.controller';

export async function transactionRoutes(app: FastifyInstance): Promise<void> {
  app.route({ method: 'POST', url: '/api/sync/senddata', handler: sendDataAction });
  app.route({ method: 'POST', url: '/api/sync/custseq', handler: customerSequenceAction });
  app.route({ method: 'POST', url: '/api/sync/invtxndetail', handler: invoiceTransactionDetailAction });
  app.route({ method: 'POST', url: '/api/sync/artxndetail', handler: arTransactionDetailAction });
  app.route({ method: ['POST'], url: '/api/image/upload', handler: uploadImageAction });
}
