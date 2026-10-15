/**
 * @author MD.Rabius Sani Raju
 * @date 2026-10-15
 */

import type { FastifyInstance, FastifyRequest } from 'fastify';
import { env } from '../../config/env';
import { isPlainObject } from '../utils/commonUtils';

function getRequestContext(request: FastifyRequest) {
  const params = isPlainObject(request.params) ? request.params : {};
  const query = isPlainObject(request.query) ? request.query : {};
  const body = request.body;
  const payloadKeys = env.DEBUG_PAYLOAD && isPlainObject(body) ? Object.keys(body) : undefined;

  return {
    method: request.method,
    url: request.url,
    route: request.routeOptions?.url,
    params,
    queryKeys: Object.keys(query),
    payloadKeys
  };
}

export async function registerRequestLogger(app: FastifyInstance): Promise<void> {
  app.addHook('onRequest', async (request) => {
    request.log.info(
      getRequestContext(request),
      'request started'
    );
  });

  app.addHook('onResponse', async (request, reply) => {
    request.log.info(
      {
        ...getRequestContext(request),
        statusCode: reply.statusCode,
        responseTime: reply.elapsedTime
      },
      'request completed'
    );
  });
}
