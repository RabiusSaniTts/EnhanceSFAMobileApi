import type { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({
    status: true,
    service: 'SFA_MOBILE_API'
  }));
}
