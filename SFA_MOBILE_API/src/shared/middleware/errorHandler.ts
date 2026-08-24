import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ApiError } from './errors';

export async function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  request.log.error({ error }, 'request failed');

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
