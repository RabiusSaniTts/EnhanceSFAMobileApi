export type StartDayQuery = {
  startday?: string;
};

export type StartDayRequestItem = {
  routecode: string | number;
  salesmancode: string | number;
  routestartodometer: string | number;
  deviceid: string;
  ver: string;
  startdate: string;
};

export type StartDaySuccessResponseItem = {
  status: 0;
  routekey: number;
  routestartdate: string | null;
  routestarttime: string | null;
  routestartodometer: string | number | null;
};

export type StartDayStatusResponseItem = {
  status: 1 | 2 | 3;
};

export type StartDayResponseItem = StartDaySuccessResponseItem | StartDayStatusResponseItem;

export type StartDayResponse = {
  startday: StartDayResponseItem[];
};

export type EndDayQuery = {
  endday?: string;
};

export type EndDayRequestItem = {
  routekey: string | number;
  routeenddate: string;
  routeendtime: string;
  routeendodometer: string | number;
  totaldocuments: string | number;
  totalcash: string | number;
  totalchecks: string | number;
  totalorderamount: string | number;
  totalinvoiceamount: string | number;
  totalchargesales: string | number;
  totalcashsales: string | number;
  totalacctsreceivable: string | number;
  totalexpenses: string | number;
  inventoryvariance: string | number;
  cashvariance: string | number;
};

export type EndDayResponseItem = {
  routekey: number;
  routeenddate: string | null;
  routeendtime: string | null;
};

export type EndDayResponse = {
  endday: EndDayResponseItem[];
};

export type LogoutQuery = {
  logout?: string;
};

export type LogoutRequestItem = {
  routekey: string | number;
  routecode: string | number;
  status?: string | number;
};

export type RouteHierarchy = {
  subareacode: string | number | null;
  supervisorcode: string | number | null;
  areacode: string | number | null;
  areamanagercode: string | number | null;
  depotcode: string | number | null;
  branchmanagercode: string | number | null;
  cmpycode: string | number | null;
  nationalsalesmanagercode: string | number | null;
  amountdecimaldigits: string | number | null;
  tourid: string | null;
};

export type CreatedStartDay = {
  routekey: number;
  routestartdate: string | null;
  routestarttime: string | null;
  routestartodometer: string | number | null;
};
