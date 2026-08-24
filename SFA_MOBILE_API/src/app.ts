import cors from '@fastify/cors';
import Fastify from 'fastify';
import { errorHandler } from './shared/middleware/errorHandler';
import { registerLegacyBodyParsers } from './shared/middleware/legacyBodyParser';
import { registerRequestLogger } from './shared/middleware/requestLogger';
import { healthRoutes } from './modules/health/health.routes';
import { registerMobileRoutes } from './modules/mobile/mobile.routes';

export async function buildApp() {
  const app = Fastify({
    logger: true,
    disableRequestLogging: true
  });

  app.setErrorHandler(errorHandler);
  registerLegacyBodyParsers(app);
  await app.register(cors, { origin: true });
  await registerRequestLogger(app);

  await app.register(healthRoutes);
  await app.register(registerMobileRoutes);

  return app;
}
