import type { RowDataPacket } from 'mysql2/promise';

export type GenericRow = RowDataPacket & Record<string, unknown>;
