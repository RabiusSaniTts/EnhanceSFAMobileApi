export interface CompanyIdByDeviceParams {
  deviceid: string;
}

export interface CompanyIdByDeviceResponseItem {
  status: string;
  url: string | null;
  ver: string | null;
}

export interface AppVersionRow {
  url: string | null;
  verno: string | null;
}

export interface SalesmanLoginParams {
  username: string;
  password: string;
  deviceid: string;
}

export interface SalesmanLoginFailureResponseItem {
  STATUS: 1 | 2 | 3;
}

export interface SalesmanLoginSuccessResponseItem {
  STATUS: 0;
  routecode: number | string | null;
  cdat: string | null;
  salesmancode: number | string;
  salesmanname1: string | null;
  salesmanname2: string | null;
  arbsalesmanname1: string | null;
  messagekey: number | string | null;
  pricingkey: number | string | null;
  created: string | null;
  modified: string | null;
  mdat: string | null;
  memo1: string | null;
  memo2: string | null;
  alternatesalesmancode: string | null;
  type: number | string | null;
  activestatus: number | string | null;
  parentcompany: number | string | null;
  ansalesmancode: string | null;
  username: string | null;
  userpassword: string | null;
  useencription: 0 | 1;
}

export type SalesmanLoginResponseItem =
  | SalesmanLoginFailureResponseItem
  | SalesmanLoginSuccessResponseItem;

export interface SalesmanVersionCheckParams {
  routecode: string;
  verno: string;
}

export interface RouteVersionRow {
  VER_NO: string | null;
  VER_STS: string | null;
}

export interface SalesmanVersionCheckResponseItem {
  STATUS: 0 | 1;
}

export interface UpdateSyncDateParams {
  routeid?: string;
  userid?: string;
  deviceid?: string;
  routecode?: string;
  routekey?: string;
  routeclosed?: string;
}

export interface UpdateSyncDateQuery {
  routeid?: string;
  userid?: string;
  deviceid?: string;
  routecode?: string;
  routekey?: string;
  routeclosed?: string;
}

export interface UpdateSyncDateResponse {
  status: 'success';
}
