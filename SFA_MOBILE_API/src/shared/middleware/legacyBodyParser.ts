import type { FastifyInstance } from 'fastify';

export function registerLegacyBodyParsers(app: FastifyInstance): void {
  app.addContentTypeParser(
    'application/x-www-form-urlencoded',
    { parseAs: 'string' },
    (_request, body, done) => {
      done(null, body);
    }
  );

  app.addContentTypeParser('text/plain', { parseAs: 'string' }, (_request, body, done) => {
    done(null, body);
  });
}
