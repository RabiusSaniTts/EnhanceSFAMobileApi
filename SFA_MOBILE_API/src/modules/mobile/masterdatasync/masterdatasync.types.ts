export interface MasterDataSyncParams {
  routeid: string;
  userid: string;
  deviceid: string;
  mdate: string;
  table: string;
}

export interface SyncCountItem {
  tablename: string;
  tablecount: number | string;
}

export type MasterDataSyncResponseSections = Partial<Record<string, unknown[]>>;

export type MasterDataSyncResponse = Record<string, unknown[]> & {
  synccount: SyncCountItem[];
};
