import type { PoolConnection, ResultSetHeader } from 'mysql2/promise';
import type {
  CustomerDistributionCheckUploadItem,
  CustomerFocBalanceUploadItem,
  CustomerInventoryCheckUploadItem,
  CustomerInventoryDetailUploadItem,
  CustomerMasterUploadItem,
  EndDayDetailUploadItem,
  NonServicedCustomerUploadItem,
  NoSalesHeaderUploadItem,
  RouteGoalUploadItem
} from '../transactions.types';
import type {
  CountRow
} from './shared.repository';
import { nullable, required } from './shared.repository';

const CUSTOMER_MASTER_INSERT_COLUMNS = [
  'customercode',
  'type',
  'headofficecode',
  'routecode',
  'streetcode',
  'districtcode',
  'locationcode',
  'customersequence',
  'customername',
  'customeraddress1',
  'customeraddress2',
  'customerphone',
  'balance',
  'customercategory',
  'pricingkey',
  'promotionkey',
  'authorizeditemgrpkey',
  'messagekey1',
  'messagekey2',
  'invoicepaymentterms',
  'invoiceretailoption',
  'invoicepriceoverride',
  'invoiceretailoverride',
  'invoiceformatoption',
  'invoiceextensionopt',
  'invoicedsdpromptopt',
  'invoicecopies',
  'salesinputoprion',
  'returnsinputoption',
  'invoiceinputstyle',
  'onhandspromptopt',
  'inventoryselectopt',
  'invencontaineropt',
  'queuedreportoption',
  'surveykey',
  'contactname',
  'customertype',
  'callfrequency',
  'routenumber',
  'arbcustomernameshort',
  'arbcustomername',
  'arbcustomeraddress1',
  'arbcustomeraddress2',
  'hhccustomernameshort',
  'hhccustomername',
  'hhccustomeraddress1',
  'hhccustomeraddress2',
  'allowbeyondlimit',
  'tclimit',
  'activecustomer',
  'creditlimitdays',
  'created',
  'cdat',
  'modified',
  'mdat',
  'forcehand',
  'renteddisplay',
  'installedchiller',
  'monthlydepreciation',
  'typeofgiveaway',
  'giveawayflag',
  'lastvisiteddate',
  'memo1',
  'memo2',
  'tcsubtype',
  'rentperc',
  'customeraddress3',
  'customercity',
  'customerstate',
  'customerzip',
  'authorizeditemlistctl',
  'invoicepriceprint',
  'messagekey3',
  'messagekey4',
  'messagekey5',
  'messagekey6',
  'orderformat',
  'enableupcprint',
  'enabledelayprint',
  'printsequence',
  'enablepriceeditinvs',
  'enablesellprevious',
  'enablesuggestsales',
  'enableautofillreturns',
  'enableautofilldamaged',
  'enablesigcapture',
  'enablereturnstrxn',
  'enableexchangetrxn',
  'enabledamagedreturns',
  'enablearcollection',
  'enablesurveyaudit',
  'enabledelivinstruct',
  'enableinvoicecomment',
  'invoicedetailentry',
  'orderdetailentry',
  'forcestockcapture',
  'enablepromotrxn',
  'alternatecode',
  'creditlimit',
  'allowcashoncreditexceed',
  'arbcustomeraddress3',
  'templateindicator',
  'templatename',
  'arbcontactname',
  'printlanguageflag',
  'quantumno',
  'lostplacementdelivs',
  'newplacementdelivs',
  'currencycode',
  'histmaxdeliveries',
  'arcustomertype',
  'custtaxkey1',
  'custtaxkey2',
  'custtaxkey3',
  'customertaxid',
  'customertaxidoptions',
  'outletsubtype',
  'volume',
  'enablegovtaxnote',
  'forwardcoverfactor',
  'enablepromoeditinvs',
  'enableaddlpromoinvs',
  'badcreditcustomer',
  'enableduplicateprinting',
  'numoutstandinginv',
  'enablefocprinting',
  'promooptions',
  'groupcode',
  'forceposcheck',
  'ancustomercode',
  'printoutletitemcode',
  'reportprintcontrol',
  'invoicelimiter',
  'exclusiveopmode',
  'returnpromotionkey',
  'invoiceformat',
  'liquorlicprint',
  'enablepromoeditords',
  'enableaddlpromoords',
  'enableaddlpromoinvoices',
  'enableposequipment',
  'enablesalestrxn',
  'enableadvancepayment',
  'printcheckdetails',
  'tcspecialdiscount',
  'spldiscountdays',
  'arabiccustomercity',
  'threshholdlimit',
  'discountkey',
  'enforcepromotion',
  'gpcustcode',
  'cashonlypromo',
  'roundnetamount',
  'partialcollection',
  'transactiontype',
  'enabledraftcopy',
  'enablebuybackfree',
  'enablecpd',
  'enablepaymentsel',
  'gpsdata',
  'fixedlatitude',
  'fixedlongitude',
  'rentkey',
  'startdate',
  'enddate',
  'definitionvalue',
  'runningvalue',
  'rentcontrol',
  'disablebalanceupdate',
  'enablecreditlimit',
  'autosettlecollection',
  'enableinvoicecopy',
  'pobox',
  'shoptelephonenumber',
  'shopfaxnumber',
  'ownername',
  'ownerlandlinenumber',
  'ownermobilenumber',
  'contactpersonlandlinenumber',
  'contactpersonmobilenumber',
  'contactpersonemail',
  'purchasemanagername',
  'purchasemanagerlandlinenumber',
  'purchasemanagermobilenumber',
  'purchasemanageremail',
  'warehousemanagername',
  'warehousemanagerlandlinenumber',
  'warehousemanagermobilenumber',
  'warehousemanageremail',
  'expirylimit',
  'exprunningvalue',
  'distributionkey',
  'gpssavecount',
  'graceperiod',
  'reportcustcode',
  'enablerental',
  'enableautofillsales',
  'enablebatchselection'
] as const;

const CUSTOMER_MASTER_UPDATE_COLUMNS = [
  'streetcode',
  'districtcode',
  'locationcode',
  'customersequence',
  'customername',
  'customeraddress1',
  'customeraddress2',
  'customerphone',
  'balance',
  'contactname',
  'modified',
  'mdat',
  'customeraddress3',
  'customercity',
  'customerstate',
  'customerzip',
  'fixedlatitude',
  'fixedlongitude'
] as const;

const CUSTOMER_MASTER_NUMERIC_DEFAULT_COLUMNS = new Set<string>([
  'customercode',
  'type',
  'headofficecode',
  'routecode',
  'streetcode',
  'districtcode',
  'locationcode',
  'customersequence'
]);

export async function saveCustomerMaster(
  connection: PoolConnection,
  item: CustomerMasterUploadItem
): Promise<boolean> {
  const params = mapCustomerMasterParams(item);
  const [rows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS count
      FROM customermaster
      WHERE customercode = :customercode
    `,
    params
  );

  if (Number(rows[0]?.count ?? 0) === 0) {
    const insertAssignments = CUSTOMER_MASTER_INSERT_COLUMNS
      .map((column) => `\`${column}\` = :${column}`)
      .join(', ');

    await connection.execute(`INSERT INTO customermaster SET ${insertAssignments}`, params);
    return Number(item.customercode) > 0;
  }

  const updateAssignments = CUSTOMER_MASTER_UPDATE_COLUMNS
    .map((column) => `\`${column}\` = :${column}`)
    .join(', ');

  await connection.execute(
    `
      UPDATE customermaster
      SET ${updateAssignments}
      WHERE customercode = :customercode
    `,
    params
  );

  return Number(item.customercode) > 0;
}

export async function saveNonServicedCustomer(
  connection: PoolConnection,
  item: NonServicedCustomerUploadItem
): Promise<boolean> {
  const params = {
    routeKey: required(item.routekey),
    customerCode: required(item.customercode),
    reasonCode: required(item.reasoncode)
  };
  const [rows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS count
      FROM nonservicedcustomer
      WHERE routekey = :routeKey
      AND customercode = :customerCode
    `,
    params
  );

  if (Number(rows[0]?.count ?? 0) === 0) {
    await connection.execute(
      `
        INSERT INTO nonservicedcustomer SET
          routekey = :routeKey,
          customercode = :customerCode,
          reasoncode = :reasonCode
      `,
      params
    );
  }

  return Number(item.routekey) > 0;
}

export async function saveNoSalesHeader(
  connection: PoolConnection,
  item: NoSalesHeaderUploadItem
): Promise<number> {
  const [insertResult] = await connection.execute<ResultSetHeader>(
    `
      INSERT INTO nosalesheader SET
        routekey = :routeKey, visitkey = :visitKey, documentnumber = :documentNumber,
        invoicenumber = :invoiceNumber, routecode = :routeCode, salesmancode = :salesmanCode,
        transactiondate = :transactionDate, transactiontime = :transactionTime,
        nosalereasoncode = :noSaleReasonCode, voidflag = :voidFlag,
        transmitindicator = :transmitIndicator, customercode = :customerCode,
        hhcdocumentnumber = :hhcDocumentNumber, hhcinvoicenumber = :hhcInvoiceNumber,
        data = :data
    `,
    mapNoSalesHeaderParams(item)
  );

  return insertResult.insertId;
}

export async function saveCustomerInventoryDetail(
  connection: PoolConnection,
  item: CustomerInventoryDetailUploadItem
): Promise<boolean> {
  const params = mapCustomerInventoryParams(item, 'expirydate');
  const [rows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS count
      FROM customerinventorydetail
      WHERE routekey = :routeKey
      AND visitkey = :visitKey
      AND itemcode = :itemCode
      AND expirydate = :expiryDate
    `,
    params
  );

  if (Number(rows[0]?.count ?? 0) === 0) {
    await connection.execute(
      `
        INSERT INTO customerinventorydetail SET
          routekey = :routeKey, visitkey = :visitKey, itemcode = :itemCode,
          weighted = :weighted, qtyloc1case = :qtyLoc1Case,
          catchweightqtyloc1 = :catchWeightQtyLoc1, qtyloc1each = :qtyLoc1Each,
          qtyloc2case = :qtyLoc2Case, catchweightqtyloc2 = :catchWeightQtyLoc2,
          qtyloc2each = :qtyLoc2Each, qtyloc3case = :qtyLoc3Case,
          catchweightqtyloc3 = :catchWeightQtyLoc3, qtyloc3each = :qtyLoc3Each,
          shelfstockcase = :shelfStockCase,
          shelfstockcatchweightqty = :shelfStockCatchWeightQty,
          shelfstockeach = :shelfStockEach, oldestcode = :oldestCode,
          expirydate = :expiryDate
      `,
      params
    );
  } else {
    await connection.execute(
      `
        UPDATE customerinventorydetail
        SET qtyloc1each = :qtyLoc1Each
        WHERE routekey = :routeKey
        AND visitkey = :visitKey
        AND itemcode = :itemCode
      `,
      params
    );
  }

  return true;
}

export async function saveCustomerInventoryCheck(
  connection: PoolConnection,
  item: CustomerInventoryCheckUploadItem
): Promise<boolean> {
  const params = mapCustomerInventoryParams(item, 'expiry_date');
  const [rows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS count
      FROM customerinventorycheck
      WHERE routekey = :routeKey
      AND visitkey = :visitKey
      AND itemcode = :itemCode
      AND expiry_date = :expiryDate
    `,
    params
  );

  if (Number(rows[0]?.count ?? 0) === 0) {
    await connection.execute(
      `
        INSERT INTO customerinventorycheck SET
          routekey = :routeKey, visitkey = :visitKey, itemcode = :itemCode,
          weighted = :weighted, qtyloc1case = :qtyLoc1Case,
          catchweightqtyloc1 = :catchWeightQtyLoc1, qtyloc1each = :qtyLoc1Each,
          qtyloc2case = :qtyLoc2Case, catchweightqtyloc2 = :catchWeightQtyLoc2,
          qtyloc2each = :qtyLoc2Each, qtyloc3case = :qtyLoc3Case,
          catchweightqtyloc3 = :catchWeightQtyLoc3, qtyloc3each = :qtyLoc3Each,
          shelfstockcase = :shelfStockCase,
          shelfstockcatchweightqty = :shelfStockCatchWeightQty,
          shelfstockeach = :shelfStockEach, oldestcode = :oldestCode,
          expiry_date = :expiryDate
      `,
      params
    );
  }

  return Number(item.routekey) > 0;
}

export async function saveCustomerDistributionCheck(
  connection: PoolConnection,
  item: CustomerDistributionCheckUploadItem
): Promise<boolean> {
  const params = {
    routeKey: required(item.routekey),
    customerCode: required(item.customercode),
    visitKey: required(item.visitkey),
    itemCode: required(item.itemcode),
    qty: nullable(item.qty),
    distributionKey: nullable(item.distributionkey)
  };
  const [rows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS count
      FROM customerdistributioncheck
      WHERE customercode = :customerCode
      AND routekey = :routeKey
      AND visitkey = :visitKey
      AND itemcode = :itemCode
    `,
    params
  );

  if (Number(rows[0]?.count ?? 0) === 0) {
    await connection.execute(
      `
        INSERT INTO customerdistributioncheck SET
          routekey = :routeKey,
          customercode = :customerCode,
          visitkey = :visitKey,
          qty = :qty,
          distributionkey = :distributionKey,
          itemcode = :itemCode
      `,
      params
    );
  } else {
    await connection.execute(
      `
        UPDATE customerdistributioncheck
        SET qty = :qty,
          distributionkey = :distributionKey
        WHERE customercode = :customerCode
        AND routekey = :routeKey
        AND visitkey = :visitKey
        AND itemcode = :itemCode
      `,
      params
    );
  }

  return Number(item.itemcode) > 0;
}

export async function saveRouteGoal(
  connection: PoolConnection,
  item: RouteGoalUploadItem
): Promise<number> {
  const [insertResult] = await connection.execute<ResultSetHeader>(
    `
      INSERT INTO routegoal SET
        routecode = :routeCode,
        salesmancode = :salesmanCode,
        packagenumber = :packageNumber,
        todaysgoal = :todaysGoal,
        todaysachieve = :todaysAchieve,
        quotadesckey1 = :quotaDescKey1,
        quotagoal1 = :quotaGoal1,
        quotaachieve1 = :quotaAchieve1,
        quotareset1 = :quotaReset1,
        quotadesckey2 = :quotaDescKey2,
        quotagoal2 = :quotaGoal2,
        quotaachieve2 = :quotaAchieve2,
        quotareset2 = :quotaReset2,
        quotadesckey3 = :quotaDescKey3,
        quotagoal3 = :quotaGoal3,
        quotaachieve3 = :quotaAchieve3,
        quotareset3 = :quotaReset3,
        created = :created,
        cdat = :createdDate,
        modified = :modified,
        mdat = :modifiedDate,
        mmonth = :month,
        fromdate = :fromDate,
        todate = :toDate,
        quantity = :quantity,
        achievequantity = :achieveQuantity
    `,
    mapRouteGoalParams(item)
  );

  return insertResult.insertId;
}

export async function saveCustomerFocBalance(
  connection: PoolConnection,
  item: CustomerFocBalanceUploadItem
): Promise<boolean> {
  const params = mapCustomerFocBalanceParams(item);
  const [rows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS count
      FROM customer_foc_balance
      WHERE customercode = :customerCode
      AND itemcode = :itemCode
    `,
    params
  );

  if (Number(rows[0]?.count ?? 0) === 0) {
    await connection.execute(
      `
        INSERT INTO customer_foc_balance SET
          customercode = :customerCode,
          itemcode = :itemCode,
          originalqty = :originalQty,
          balanceqty = :balanceQty,
          contractid = :contractId,
          startdate = :startDate
      `,
      params
    );
  } else {
    await connection.execute(
      `
        UPDATE customer_foc_balance SET
          customercode = :customerCode,
          itemcode = :itemCode,
          originalqty = :originalQty,
          balanceqty = :balanceQty,
          contractid = :contractId,
          startdate = :startDate
        WHERE customercode = :customerCode
        AND itemcode = :itemCode
      `,
      params
    );
  }

  return Number(item.customercode) > 0;
}

export async function saveEndDayDetailUpload(
  connection: PoolConnection,
  item: EndDayDetailUploadItem
): Promise<boolean> {
  const params = {
    routeKey: required(item.routekey),
    detailTypeCode: required(item.detailtypecode),
    listTypeCode: required(item.listtypecode),
    amount: nullable(item.amount),
    currencyCode: nullable(item.currencycode)
  };

  await connection.execute(
    `
      INSERT INTO enddaydetail SET
        routekey = :routeKey,
        detailtypecode = :detailTypeCode,
        listtypecode = :listTypeCode,
        amount = :amount,
        currencycode = :currencyCode
    `,
    params
  );

  const [rows] = await connection.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS count
      FROM ardetail
      WHERE routekey = :routeKey
    `,
    params
  );

  return Number(rows[0]?.count ?? 0) > 0;
}

function mapNoSalesHeaderParams(item: NoSalesHeaderUploadItem) {
  return {
    routeKey: required(item.routekey),
    visitKey: required(item.visitkey),
    documentNumber: required(item.documentnumber),
    invoiceNumber: required(item.invoicenumber),
    routeCode: required(item.routecode),
    salesmanCode: required(item.salesmancode),
    transactionDate: required(item.transactiondate),
    transactionTime: nullable(item.transactiontime),
    noSaleReasonCode: required(item.nosalereasoncode),
    voidFlag: required(item.voidflag),
    transmitIndicator: nullable(item.transmitindicator),
    customerCode: nullable(item.customercode),
    hhcDocumentNumber: nullable(item.hhcdocumentnumber),
    hhcInvoiceNumber: nullable(item.hhcinvoicenumber),
    data: nullable(item.data)
  };
}

function mapCustomerInventoryParams(
  item: CustomerInventoryDetailUploadItem | CustomerInventoryCheckUploadItem,
  expiryField: 'expirydate' | 'expiry_date'
) {
  return {
    routeKey: required(item.routekey),
    visitKey: required(item.visitkey),
    itemCode: required(item.itemcode),
    weighted: nullable(item.weighted),
    qtyLoc1Case: nullable(item.qtyloc1case),
    catchWeightQtyLoc1: nullable(item.catchweightqtyloc1),
    qtyLoc1Each: nullable(item.qtyloc1each),
    qtyLoc2Case: nullable(item.qtyloc2case),
    catchWeightQtyLoc2: nullable(item.catchweightqtyloc2),
    qtyLoc2Each: nullable(item.qtyloc2each),
    qtyLoc3Case: nullable(item.qtyloc3case),
    catchWeightQtyLoc3: nullable(item.catchweightqtyloc3),
    qtyLoc3Each: nullable(item.qtyloc3each),
    shelfStockCase: nullable(item.shelfstockcase),
    shelfStockCatchWeightQty: nullable(item.shelfstockcatchweightqty),
    shelfStockEach: nullable(item.shelfstockeach),
    oldestCode: nullable(item.oldestcode),
    expiryDate: nullable(item[expiryField])
  };
}

function mapRouteGoalParams(item: RouteGoalUploadItem) {
  return {
    routeCode: nullable(item.routecode),
    salesmanCode: nullable(item.salesmancode),
    packageNumber: nullable(item.packagenumber),
    todaysGoal: nullable(item.todaysgoal),
    todaysAchieve: nullable(item.todaysachieve),
    quotaDescKey1: nullable(item.quotadesckey1),
    quotaGoal1: nullable(item.quotagoal1),
    quotaAchieve1: nullable(item.quotaachieve1),
    quotaReset1: nullable(item.quotareset1),
    quotaDescKey2: nullable(item.quotadesckey2),
    quotaGoal2: nullable(item.quotagoal2),
    quotaAchieve2: nullable(item.quotaachieve2),
    quotaReset2: nullable(item.quotareset2),
    quotaDescKey3: nullable(item.quotadesckey3),
    quotaGoal3: nullable(item.quotagoal3),
    quotaAchieve3: nullable(item.quotaachieve3),
    quotaReset3: nullable(item.quotareset3),
    created: nullable(item.created),
    createdDate: nullable(item.cdat),
    modified: nullable(item.modified),
    modifiedDate: nullable(item.mdat),
    month: nullable(item.mmonth),
    fromDate: required(item.fromdate),
    toDate: required(item.todate),
    quantity: required(item.quantity),
    achieveQuantity: required(item.achievequantity)
  };
}

function mapCustomerFocBalanceParams(item: CustomerFocBalanceUploadItem) {
  return {
    customerCode: required(item.customercode),
    itemCode: required(item.itemcode),
    originalQty: nullable(item.originalqty),
    balanceQty: nullable(item.balanceqty),
    contractId: nullable(item.contractid),
    startDate: nullable(item.startdate)
  };
}

function mapCustomerMasterParams(item: CustomerMasterUploadItem): Record<string, string | number | null> {
  return Object.fromEntries(
    CUSTOMER_MASTER_INSERT_COLUMNS.map((column) => [
      column,
      column === 'promotionkey' && Number(item[column] ?? 0) === 0
        ? null
        : CUSTOMER_MASTER_NUMERIC_DEFAULT_COLUMNS.has(column)
          ? required(item[column])
          : nullable(item[column])
    ])
  );
}
