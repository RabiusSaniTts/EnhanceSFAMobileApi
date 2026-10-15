/**
 * @author MD.Rabius Sani Raju
 * @date 2026-10-15
 */

import type { FastifyInstance } from 'fastify';

const LEGACY_UPLOAD_BODY_LIMIT = 50 * 1024 * 1024;

export function registerLegacyBodyParsers(app: FastifyInstance): void {
  app.addContentTypeParser(
    'application/x-www-form-urlencoded',
    { parseAs: 'string', bodyLimit: LEGACY_UPLOAD_BODY_LIMIT },
    (_request, body, done) => {
      done(null, body);
    }
  );

  app.addContentTypeParser(
    'text/plain',
    { parseAs: 'string', bodyLimit: LEGACY_UPLOAD_BODY_LIMIT },
    (_request, body, done) => {
      done(null, body);
    }
  );
}
