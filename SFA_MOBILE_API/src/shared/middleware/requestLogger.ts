/**
 * @author MD.Rabius Sani Raju
 * @date 2026-10-15
 */

import type { FastifyInstance, FastifyRequest } from 'fastify';
import { env } from '../../config/env';
import { isPlainObject } from '../utils/commonUtils';
import { writeRequestFileLog } from './fileLogger';

const responsePayloads = new WeakMap<FastifyRequest, unknown>();

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

  // Capture the serialized response for optional file logging after completion.
  app.addHook('onSend', async (request, _reply, payload) => {
    if (env.FILE_LOG_ENABLED && env.FILE_LOG_RESPONSE_ENABLED) {
      responsePayloads.set(request, payload);
    }

    return payload;
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

    await writeRequestFileLog(request, {
      event: 'request.completed',
      level: 'info',
      statusCode: reply.statusCode,
      responseTime: reply.elapsedTime,
      responsePayload: responsePayloads.get(request)
    });

    responsePayloads.delete(request);
  });
}
