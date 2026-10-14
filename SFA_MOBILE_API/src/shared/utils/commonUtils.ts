import path from 'path';
import type { PoolConnection, RowDataPacket } from 'mysql2/promise';

export type GenericRow = RowDataPacket & Record<string, unknown>;

type RouteKeyRow = RowDataPacket & { routekey: string | number | null };

export function toLegacyDateString(value: Date | string | null | undefined): string {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return value.toISOString().slice(0, 19).replace('T', ' ');
}

export function parseLegacyPathParams(path: string): Record<string, string> {
  const parts = path.split('/').filter(Boolean);
  const params: Record<string, string> = {};

  for (let index = 0; index < parts.length - 1; index += 2) {
    params[parts[index]] = decodeURIComponent(parts[index + 1]);
  }

  return params;
}

export function emptyStringToNull(value: unknown): unknown {
  return value === '' ? null : value;
}

export function nullToEmptyString(value: unknown): unknown {
  return value === null || value === undefined ? '' : value;
}

export function toLegacyNumber(value: unknown): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? 0 : numberValue;
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function stringValue(value: unknown): string {
  return value === undefined || value === null ? '' : String(value).trim();
}

export function readScalar(value: unknown): string | number | null {
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  return null;
}

export function normalizeLegacyRecords(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter(isPlainObject);
  }

  if (isPlainObject(value)) {
    return Object.values(value).filter(isPlainObject);
  }

  return [];
}

export function asRecords<T>(items: unknown[]): T[] {
  return items.filter(isPlainObject) as T[];
}

export function sanitizeFileName(fileName: string): string {
  return path.basename(fileName).replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim();
}

export function buildInClause(values: unknown[]): string {
  return values.map(() => '?').join(', ');
}

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
