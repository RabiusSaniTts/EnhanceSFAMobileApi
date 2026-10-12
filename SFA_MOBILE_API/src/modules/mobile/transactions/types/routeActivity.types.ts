export type CustomerSequenceRequestItem = {
  routekey: string | number;
  seqweeknumber: string | number;
  seqweekday: string | number;
  routecode: string | number;
  customercode: string | number;
  sequencenumber: string | number;
  schelduledflag: string | number;
  servicedflag: string | number;
  scannedflag: string | number;
};

export type CustomerSequenceResponse = {
  code: 200;
  message: 'Load Data !';
};

export type CustomerOperationControlItem = {
  visitkey: string | number;
  routekey: string | number;
  customercode: string | number;
  routecode: string | number;
  salesmancode: string | number;
  odometerreading: string | number;
  visitstartdate: string;
  visitstarttime: string;
  visitenddate: string;
  visitendtime: string;
  totaltransactions: string | number;
  addedcustomer: string | number;
  voidflag: string | number;
  scannerindicator: string | number;
  reasoncode: string | number;
  latitude: string | number;
  longitude: string | number;
  radius: string | number;
  log_id: string | number;
};

export type CustomerVisitLogItem = {
  log_id: string | number;
  routekey: string | number;
  routecode: string | number;
  salesmancode: string | number;
  customercode: string | number;
  log_startdate: string;
  log_starttime: string;
  log_enddate: string;
  log_endtime: string;
};

export type RouteMasterUploadItem = {
  routecode: string | number;
  mdat: string;
  hhcordseq: string | number;
  hhcinvseq: string | number;
  hhccshseq: string | number;
  hhcivtseq: string | number;
  bodocseq: string | number;
  cashbalance: string | number;
  creditlimit: string | number;
  routebalance: string | number;
  hhcarseq: string | number;
  hhcloadseq: string | number;
  hhcappversion: string | number;
  hhcinvretseq: string | number;
};
