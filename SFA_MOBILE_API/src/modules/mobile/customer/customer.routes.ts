import type { FastifyInstance } from 'fastify';
import { customerMaster } from './customer.controller';

export async function customerRoutes(app: FastifyInstance): Promise<void> {
  app.route({
    method: ['GET', 'POST'],
    url: '/api/customer/customermaster',
    handler: customerMaster
  });
}
