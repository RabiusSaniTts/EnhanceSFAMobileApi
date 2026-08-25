import type { RowDataPacket } from 'mysql2/promise';
import type { CreatedStartDay, EndDayResponseItem, RouteHierarchy } from '../transactions.types';

export type CurrentDateRow = RowDataPacket & { currentDate: string };
export type RouteVersionRow = RowDataPacket & { versionNo: string | null; versionStatus: string | number | null };
export type RouteClosedRow = RowDataPacket & { routeclosed: number | null };
export type RouteHierarchyRow = RowDataPacket & RouteHierarchy;
export type CreatedStartDayRow = RowDataPacket & CreatedStartDay;
export type EndDayResponseRow = RowDataPacket & EndDayResponseItem;
export type RouteCodeRow = RowDataPacket & { routecode: string | number | null };
export type OpenRouteKeyRow = RowDataPacket & { routekey: number | null };
export type CountRow = RowDataPacket & { count: number };
export type GeneratedDocumentNumberRow = RowDataPacket & { documentNumber: string | number };
export type TransactionKeyRow = RowDataPacket & { transactionkey: number };
export type NumericValueRow = RowDataPacket & { value: number | null };
export type RouteKeySalesmanRow = RowDataPacket & {
  routekey: number | null;
  salesmancode: number | string | null;
};

export function required(value: unknown): string | number {
  const result = nullable(value);

  if (result === null) {
    return 0;
  }

  return result;
}

export function nullable(value: unknown): string | number | null {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return value === '' ? null : value;
  }

  return null;
}
