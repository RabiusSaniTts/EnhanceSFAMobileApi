import type { FastifyInstance } from 'fastify';
import {
  arTransactionDetail,
  customerSequence,
  invoiceTransactionDetail,
  sendData
} from './sync.controller';

export async function syncRoutes(app: FastifyInstance): Promise<void> {
  app.route({
    method: ['GET', 'POST'],
    url: '/api/sync/senddata',
    handler: sendData
  });

  app.route({
    method: ['GET', 'POST'],
    url: '/api/sync/custseq',
    handler: customerSequence
  });

  app.route({
    method: ['GET', 'POST'],
    url: '/api/sync/invtxndetail',
    handler: invoiceTransactionDetail
  });

  app.route({
    method: ['GET', 'POST'],
    url: '/api/sync/artxndetail',
    handler: arTransactionDetail
  });
}
