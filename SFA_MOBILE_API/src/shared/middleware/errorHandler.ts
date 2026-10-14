import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ApiError } from './errors';
import { isPlainObject } from '../utils/commonUtils';

export async function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  request.log.error(
    {
      err: error,
      method: request.method,
      url: request.url,
      route: request.routeOptions?.url,
      params: isPlainObject(request.params) ? request.params : {},
      queryKeys: isPlainObject(request.query) ? Object.keys(request.query) : []
    },
    'request failed'
  );

  if (error instanceof ApiError) {
    await reply.status(error.statusCode).send({
      status: false,
      message: error.message
    });
    return;
  }

  await reply.status(500).send({
    status: false,
    message: 'Internal server error'
  });
}
