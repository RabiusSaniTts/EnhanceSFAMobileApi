/**
 * @author MD.Rabius Sani Raju
 * @date 2026-10-15
 */

import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  DEBUG_PAYLOAD: z.coerce.boolean().default(false),
  FILE_LOG_ENABLED: z.string().default('false').transform((value) => value.toLowerCase() === 'true'),
  FILE_LOG_PATH: z.string().default('./logs'),
  FILE_LOG_NAME: z.string().min(1).default('api-log.txt'),
  FILE_LOG_RESPONSE_ENABLED: z.string().default('false').transform((value) => value.toLowerCase() === 'true'),
  FILE_LOG_MAX_RESPONSE_LENGTH: z.coerce.number().int().positive().default(1048576),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default('0.0.0.0'),
  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().default('sfa'),
  DB_CONNECTION_LIMIT: z.coerce.number().int().positive().default(10)
});

export const env = envSchema.parse(process.env);
