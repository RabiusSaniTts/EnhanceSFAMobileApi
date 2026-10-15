/**
 * @author MD.Rabius Sani Raju
 * @date 2026-10-15
 */

import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ApiError } from './errors';
import { isPlainObject } from '../utils/commonUtils';
import { writeRequestFileLog } from './fileLogger';

export async function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const statusCode = error instanceof ApiError ? error.statusCode : 500;

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

  await writeRequestFileLog(request, {
    event: 'request.failed',
    level: 'error',
    statusCode,
    error
  });

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
