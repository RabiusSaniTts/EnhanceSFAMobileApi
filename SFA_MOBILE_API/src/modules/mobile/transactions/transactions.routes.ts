/**
 * @author MD.Rabius Sani Raju
 * @date 2026-10-15
 */

import type { FastifyInstance } from 'fastify';
import {
  arTransactionDetailAction,
  customerSequenceAction,
  invoiceTransactionDetailAction,
  sendDataAction,
  uploadImageAction
} from './controllers/transactions.controller';

/**
 * Registers mobile upload and image endpoints. These paths and methods are
 * compatibility contracts with the existing PhoneGap application.
 */
export async function transactionRoutes(app: FastifyInstance): Promise<void> {
  // Uploads the complete pending transaction bundle in one database transaction.
  app.route({ method: 'POST', url: '/api/sync/senddata', handler: sendDataAction });
  // Uploads route/customer sequence changes independently of the main bundle.
  app.route({ method: 'POST', url: '/api/sync/custseq', handler: customerSequenceAction });
  // Supports retrying invoice and AR detail uploads independently.
  app.route({ method: 'POST', url: '/api/sync/invtxndetail', handler: invoiceTransactionDetailAction });
  app.route({ method: 'POST', url: '/api/sync/artxndetail', handler: arTransactionDetailAction });
  // Stores customer images sent as multipart/form-data.
  app.route({ method: ['POST'], url: '/api/image/upload', handler: uploadImageAction });
}
