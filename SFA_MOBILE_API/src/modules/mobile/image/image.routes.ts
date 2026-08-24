import type { FastifyInstance } from 'fastify';
import { uploadImage } from './image.controller';

export async function imageRoutes(app: FastifyInstance): Promise<void> {
  app.route({
    method: ['POST'],
    url: '/api/image/upload',
    handler: uploadImage
  });
}
