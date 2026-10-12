import type { LegacyUploadItem } from '../../transactions/types/shared.types';

export type LegacyParams = Record<string, unknown>;

export type TempCustomerInventoryItem = LegacyUploadItem;

export type CheckLoadResponse = '0' | '1';

export type DeliveryResponse = {
  deliveryheader: Record<string, unknown>[];
  deliverydetail: Record<string, unknown>[];
};

export type WarehouseStockResponse = {
  warehousestock: Record<string, unknown>[];
};

export type WhStockResponse = {
  whstock: Record<string, unknown>[];
};

export type CustomerBalanceResponse = {
  customerbalance: Record<string, unknown>[];
};

export type CustomerItemGroupResponse = {
  customeritemgrp: Record<string, unknown>[];
  customeritemmap: Record<string, unknown>[];
};

export type OrderStatusResponse = {
  orderstatus: Record<string, unknown>[];
};

export type VisualDataResponse = {
  visualheader: Record<string, unknown>[];
  visualdetail: Record<string, unknown>[];
};

export type CustomerMasterParams = {
  routecode?: string;
  customercode?: string;
};

export type CustomerMasterQuery = {
  routecode?: string;
  customercode?: string;
};

export type CustomerMasterResponse = Record<string, unknown>;

export type TransactionParams = {
  routekey?: string;
  routecode?: string;
};

export type TransactionQuery = {
  routekey?: string;
  routecode?: string;
};

export type TransactionCountRow = {
  TYPE: string;
  CloudCount: string | number;
};

export type ImportInventoryCountRow = {
  TTYPE: string;
  CloudCount: string | number;
};
