/**
 * @author MD.Rabius Sani Raju
 * @date 2026-10-15
 */

import path from 'path';
import type { FastifyRequest } from 'fastify';
import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { ApiError } from '../middleware/errors';

/** A mysql2 result row whose selected columns are intentionally dynamic. */
export type GenericRow = RowDataPacket & Record<string, unknown>;

/** Internal result shape used when reading a route key from MySQL. */
type RouteKeyRow = RowDataPacket & { routekey: string | number | null };

/** Converts a Date to the legacy MySQL datetime format and preserves existing strings. */
export function toLegacyDateString(value: Date | string | null | undefined): string {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return value.toISOString().slice(0, 19).replace('T', ' ');
}

/** Parses alternating key/value segments from a Zend-style URL path. */
export function parseLegacyPathParams(path: string): Record<string, string> {
  const parts = path.split('/').filter(Boolean);
  const params: Record<string, string> = {};

  for (let index = 0; index < parts.length - 1; index += 2) {
    params[parts[index]] = decodeURIComponent(parts[index + 1]);
  }

  return params;
}

/** Converts an empty string to SQL-friendly null and leaves other values unchanged. */
export function emptyStringToNull(value: unknown): unknown {
  return value === '' ? null : value;
}

/** Converts nullish values to the empty string expected by legacy responses. */
export function nullToEmptyString(value: unknown): unknown {
  return value === null || value === undefined ? '' : value;
}

/** Converts a legacy numeric value to a number, defaulting missing or invalid values to zero. */
export function toLegacyNumber(value: unknown): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? 0 : numberValue;
}

/** Formats finite numeric values with four decimals while preserving empty or invalid values. */
export function toFixedDecimalString(value: unknown): unknown {
  if (value === null || value === undefined || value === '') {
    return value;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue.toFixed(4) : value;
}

/** Narrows an unknown value to a non-null object that is not an array. */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Converts a value to a trimmed string and maps nullish values to an empty string. */
export function stringValue(value: unknown): string {
  return value === undefined || value === null ? '' : String(value).trim();
}

/** Returns string or number scalar values and maps every other value to null. */
export function readScalar(value: unknown): string | number | null {
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  return null;
}

/** Produces a mysql2 bind value and uses zero when the legacy field is missing. */
export function required(value: unknown): string | number {
  return nullable(value) ?? 0;
}

/** Produces a mysql2 bind value, converting empty or unsupported values to null. */
export function nullable(value: unknown): string | number | null {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return value === '' ? null : value;
  }

  return null;
}

/**
 * Normalizes a legacy collection into an array containing only plain objects.
 *
 * The PhoneGap app may represent uploaded rows as either a normal JSON array or
 * an object whose property values are rows, for example `{ "0": {...}, "1": {...} }`.
 * Primitive values, null, and nested arrays are excluded from the result.
 *
 * @param value A decoded JSON value that may contain legacy records.
 * @returns Plain-object records, or an empty array for unsupported input.
 */
export function normalizeLegacyRecords(value: unknown): Record<string, unknown>[] {
  // A normal JSON array is the preferred upload shape; retain only row objects.
  if (Array.isArray(value)) {
    return value.filter(isPlainObject);
  }

  // Some mobile versions serialize indexed rows as an object instead of an array.
  if (isPlainObject(value)) {
    // Object.values removes the numeric/index keys and returns the actual row values.
    return Object.values(value).filter(isPlainObject);
  }

  // Scalars, null, and unsupported structures contain no usable upload records.
  return [];
}

/**
 * Converts a legacy HTTP request body into a field/value object.
 *
 * Supported body formats:
 * - an already parsed plain object;
 * - a JSON object string such as `{"routekey":"123"}`;
 * - URL-encoded form data such as `routekey=123&userid=1818`.
 *
 * Empty, nullish, array, and unsupported body values return an empty object.
 * A string beginning with `{` is treated as JSON; malformed JSON is a client
 * error rather than silently falling back to form parsing.
 *
 * @param body The raw or parsed Fastify request body.
 * @param invalidJsonMessage Endpoint-specific message returned for malformed JSON.
 * @returns Parsed body fields as a plain object.
 * @throws ApiError with status 400 when a JSON object string cannot be parsed.
 */
export function parseLegacyBodyValues(
  body: unknown,
  invalidJsonMessage: string
): Record<string, unknown> {
  // No body means the caller has no body fields to merge with path/query params.
  if (body === undefined || body === null || body === '') {
    return {};
  }

  // Fastify may already have decoded JSON into an object before this helper runs.
  if (typeof body !== 'string') {
    // Arrays and other non-object values are not valid key/value request bodies.
    return isPlainObject(body) ? body : {};
  }

  // trimmedBody removes transport whitespace before format detection and parsing.
  const trimmedBody = body.trim();

  // A whitespace-only body is equivalent to no supplied body.
  if (trimmedBody === '') {
    return {};
  }

  // Legacy form posts do not begin with `{`; URLSearchParams decodes their fields.
  if (!trimmedBody.startsWith('{')) {
    // Object.fromEntries creates the same field/value object used for decoded JSON.
    return Object.fromEntries(new URLSearchParams(trimmedBody));
  }

  try {
    // parsed is unknown until its runtime shape is checked below.
    const parsed = JSON.parse(trimmedBody);
    // Only JSON objects can provide named request fields; other JSON values are ignored.
    return isPlainObject(parsed) ? parsed : {};
  } catch {
    // The caller supplies an endpoint-specific message while the status remains consistent.
    throw new ApiError(400, invalidJsonMessage);
  }
}

/**
 * Converts a legacy query/form field into an array of record objects.
 *
 * The value may already be an array or may be a JSON string such as
 * `[{"routecode":"1818"}]`. Non-object array members are removed. When
 * `allowObjectValues` is true, object-indexed payloads such as
 * `{"0": {...}, "1": {...}}` are also converted into arrays; this mode is
 * required by some transaction-upload versions of the mobile app.
 *
 * Missing and unsupported values return an empty array. Malformed JSON throws
 * a controlled client error so the global error handler returns a stable response.
 *
 * @param value A decoded array or JSON-encoded legacy collection.
 * @param invalidPayloadMessage Endpoint/field-specific malformed-payload message.
 * @param allowObjectValues Whether object property values may be treated as rows.
 * @returns An array containing only plain-object records.
 * @throws ApiError with status 400 when a string contains malformed JSON.
 */
export function parseLegacyRecordArray(
  value: unknown,
  invalidPayloadMessage: string,
  allowObjectValues = false
): Record<string, unknown>[] {
  // Missing fields represent an empty upload section, not a malformed request.
  if (value === undefined || value === null || value === '') {
    return [];
  }

  // Fastify or another parser may already have converted the field into an array.
  if (Array.isArray(value)) {
    // Only plain objects are valid rows for model/database processing.
    return value.filter(isPlainObject);
  }

  // JSON decoding below applies only to strings; unsupported values contain no rows.
  if (typeof value !== 'string') {
    return [];
  }

  try {
    // parsed may be a normal array or an object-indexed legacy collection.
    const parsed = JSON.parse(value);

    // Transaction uploads enable object-value normalization; WS calls require arrays.
    return allowObjectValues
      ? normalizeLegacyRecords(parsed)
      : Array.isArray(parsed)
        ? parsed.filter(isPlainObject)
        : [];
  } catch {
    // Invalid JSON must be reported as a controlled client error, not a server error.
    throw new ApiError(400, invalidPayloadMessage);
  }
}

/**
 * Reads an optional scalar request field from every format supported by the
 * legacy mobile API.
 *
 * Lookup precedence is path parameters first, query parameters second, and the
 * parsed request body last. The first non-nullish source wins. This preserves
 * explicit URL values when the same field also appears in a legacy body.
 * Returned values are converted to strings because legacy controller parameters
 * were string-based. Empty strings and nullish values become `undefined`.
 *
 * @param request The active Fastify request.
 * @param field Field name to find in path, query, or body values.
 * @param invalidJsonMessage Message used if JSON body parsing fails.
 * @returns The field as a string, or undefined when no usable value exists.
 * @throws ApiError with status 400 when the request contains malformed JSON.
 */
export function readOptionalRequestParam(
  request: FastifyRequest,
  field: string,
  invalidJsonMessage: string
): string | undefined {
  // params contains values captured from named segments in the matched route URL.
  const params = (request.params as Record<string, unknown> | undefined) ?? {};

  // query contains decoded values supplied after `?` in the request URL.
  const query = (request.query as Record<string, unknown> | undefined) ?? {};

  // value uses nullish fallback so path values take priority over query and body values.
  const value =
    params[field] ??
    query[field] ??
    parseLegacyBodyValues(request.body, invalidJsonMessage)[field];

  // Missing and empty legacy values remain optional; usable values become strings.
  return value === undefined || value === null || value === ''
    ? undefined
    : String(value);
}

/**
 * Reads a required legacy request field using path, query, and body precedence.
 *
 * This delegates parsing and string conversion to `readOptionalRequestParam()`.
 * Use it for endpoint values that must exist before controller or model logic can
 * execute, such as route code, route key, user ID, or device ID.
 *
 * @param request The active Fastify request.
 * @param field Required field name.
 * @param invalidJsonMessage Message used if JSON body parsing fails.
 * @returns The required field as a string.
 * @throws ApiError with status 400 when the field is missing or JSON is malformed.
 */
export function readRequiredRequestParam(
  request: FastifyRequest,
  field: string,
  invalidJsonMessage: string
): string {
  // value is already normalized to a string or undefined by the optional reader.
  const value = readOptionalRequestParam(request, field, invalidJsonMessage);

  // Required endpoint parameters fail early before any business or SQL logic runs.
  if (value === undefined) {
    throw new ApiError(400, `Missing ${field}`);
  }

  // The successful return is always a string, matching legacy Zend parameter behavior.
  return value;
}

/** Filters unknown array entries to plain records and exposes the caller's row type. */
export function asRecords<T>(items: unknown[]): T[] {
  return items.filter(isPlainObject) as T[];
}

/** Removes path traversal and Windows-invalid characters from an uploaded filename. */
export function sanitizeFileName(fileName: string): string {
  return path.basename(fileName).replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim();
}

/** Creates positional SQL placeholders for a parameterized IN clause. */
export function buildInClause(values: unknown[]): string {
  return values.map(() => '?').join(', ');
}

/** Checks whether a table exists in the active MySQL database. */
export async function tableExists(
  connection: PoolConnection,
  tableName: string
): Promise<boolean> {
  const [rows] = await connection.execute<GenericRow[]>(
    `
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = :tableName
      LIMIT 1
    `,
    { tableName }
  );

  return rows.length > 0;
}

/** Returns the latest closed route key for a route, or zero when none is available. */
export async function getLatestClosedRouteKey(
  connection: PoolConnection,
  routeCode: string | number
): Promise<number> {
  if (!(await tableExists(connection, 'startendday'))) {
    return 0;
  }

  const [rows] = await connection.execute<RouteKeyRow[]>(
    `
      SELECT COALESCE(MAX(routekey), 0) AS routekey
      FROM startendday
      WHERE routeclosed = 1
      AND routecode = :routeCode
    `,
    { routeCode }
  );

  return Number(rows[0]?.routekey ?? 0);
}
