/**
 * @author MD.Rabius Sani Raju
 * @date 2026-10-15
 */

import { appendFile, mkdir } from 'fs/promises';
import path from 'path';
import type { FastifyRequest } from 'fastify';
import { env } from '../../config/env';
import { isPlainObject } from '../utils/commonUtils';

type FileLogLevel = 'info' | 'error';

interface FileLogDetails {
  event: 'request.completed' | 'request.failed';
  level: FileLogLevel;
  statusCode: number;
  responseTime?: number;
  responsePayload?: unknown;
  error?: Error;
}

/**
 * Writes one JSON record to the configured date/route/module log file.
 * Logging failures are reported through Pino and never fail the API request.
 */
export async function writeRequestFileLog(
  request: FastifyRequest,
  details: FileLogDetails
): Promise<void> {
  if (!env.FILE_LOG_ENABLED) {
    return;
  }

  try {
    const moduleName = resolveModuleName(request.routeOptions?.url ?? request.url);
    const routeCode = resolveRouteCode(request);
    const currentDate = formatLocalDate(new Date());
    const logDirectory = path.resolve(
      env.FILE_LOG_PATH,
      currentDate,
      routeCode,
      moduleName
    );
    const logFilePath = path.join(logDirectory, path.basename(env.FILE_LOG_NAME));
    const responseDetails = formatResponsePayload(details.responsePayload);
    const logRecord = {
      timestamp: new Date().toISOString(),
      level: details.level,
      event: details.event,
      requestId: request.id,
      module: moduleName,
      routeCode,
      method: request.method,
      route: request.routeOptions?.url ?? 'unknown-route',
      statusCode: details.statusCode,
      responseTime: details.responseTime,
      queryKeys: isPlainObject(request.query) ? Object.keys(request.query) : [],
      bodyKeys: isPlainObject(request.body) ? Object.keys(request.body) : [],
      ...responseDetails,
      error: details.error
        ? {
            name: details.error.name,
            message: details.error.message
          }
        : undefined
    };

    await mkdir(logDirectory, { recursive: true });
    await appendFile(logFilePath, `${JSON.stringify(logRecord)}\n`, 'utf8');
  } catch (error) {
    request.log.warn({ err: error }, 'file log write failed');
  }
}

/** Serializes, redacts, and size-limits the response before file logging. */
function formatResponsePayload(payload: unknown): Record<string, unknown> {
  if (!env.FILE_LOG_RESPONSE_ENABLED || payload === undefined) {
    return {};
  }

  const redactedPayload = redactSensitiveValues(normalizeResponsePayload(payload));
  const serializedPayload =
    typeof redactedPayload === 'string' ? redactedPayload : JSON.stringify(redactedPayload);
  const responseTruncated = serializedPayload.length > env.FILE_LOG_MAX_RESPONSE_LENGTH;

  return {
    response: responseTruncated
      ? serializedPayload.slice(0, env.FILE_LOG_MAX_RESPONSE_LENGTH)
      : redactedPayload,
    responseTruncated
  };
}

/** Converts Fastify string or Buffer output into a loggable value. */
function normalizeResponsePayload(payload: unknown): unknown {
  const value = Buffer.isBuffer(payload) ? payload.toString('utf8') : payload;

  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  if (trimmedValue.startsWith('{') || trimmedValue.startsWith('[')) {
    try {
      return JSON.parse(trimmedValue);
    } catch {
      return value;
    }
  }

  return value;
}

/** Redacts credential and token fields recursively. */
function redactSensitiveValues(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactSensitiveValues);
  }

  if (!isPlainObject(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [
      key,
      isSensitiveField(key) ? '[REDACTED]' : redactSensitiveValues(nestedValue)
    ])
  );
}

/** Identifies values that must never be persisted in logs. */
function isSensitiveField(field: string): boolean {
  const normalizedField = field.toLowerCase().replace(/[^a-z0-9]/g, '');
  return ['password', 'userpassword', 'dbpassword', 'token', 'accesstoken', 'refreshtoken'].includes(
    normalizedField
  );
}

/** Maps endpoint families to stable directory names. */
function resolveModuleName(route: string): string {
  if (route.includes('/getsyncdata1')) {
    return 'masterdatasync';
  }

  if (route.startsWith('/api/sync') || route.startsWith('/api/image')) {
    return 'transactions';
  }

  if (
    route.startsWith('/api/ws') ||
    route.startsWith('/api/customer') ||
    route.startsWith('/api/transaction')
  ) {
    return 'ws';
  }

  if (route.startsWith('/api/index')) {
    return 'auth';
  }

  return 'system';
}

/** Finds routecode/routeid in legacy path, query, body, or encoded JSON values. */
function resolveRouteCode(request: FastifyRequest): string {
  const sources = [request.params, request.query, request.body];

  for (const source of sources) {
    const value = findRouteCode(source, 0);

    if (value !== null) {
      return sanitizePathSegment(value);
    }
  }

  return 'unknown-route';
}

/** Recursively searches legacy values while limiting depth and JSON parsing work. */
function findRouteCode(value: unknown, depth: number): string | null {
  if (depth > 3 || value === null || value === undefined) {
    return null;
  }

  if (isPlainObject(value)) {
    const directValue = value.routecode ?? value.routeCode ?? value.routeid ?? value.routeId;

    if (typeof directValue === 'string' || typeof directValue === 'number') {
      return String(directValue);
    }

    for (const nestedValue of Object.values(value)) {
      const routeCode = findRouteCode(nestedValue, depth + 1);

      if (routeCode !== null) {
        return routeCode;
      }
    }
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const routeCode = findRouteCode(item, depth + 1);

      if (routeCode !== null) {
        return routeCode;
      }
    }
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();

    if (trimmedValue.startsWith('{') || trimmedValue.startsWith('[')) {
      try {
        return findRouteCode(JSON.parse(trimmedValue), depth + 1);
      } catch {
        return null;
      }
    }
  }

  return null;
}

/** Prevents request values from creating unintended directories. */
function sanitizePathSegment(value: string): string {
  const sanitizedValue = value.trim().replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 64);
  return sanitizedValue || 'unknown-route';
}

/** Formats the server-local date used as the first log directory. */
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
