const cp = require('child_process');
const http = require('http');

const db = process.argv[2];
const baseUrl = process.argv[3] ?? 'http://127.0.0.1:3000';

if (!db) {
  console.error('Usage: node scripts/test-send-inventory-upload.js <sqlite-db-path> [base-url]');
  process.exit(1);
}

function query(sql) {
  const out = cp.execFileSync('sqlite3', ['-json', db, sql], { encoding: 'utf8' });
  return JSON.parse(out || '[]');
}

const inventorytransactionheader = query(`
  select inventorykey,detailkey,routekey,transactiontype,routecode,
    CAST(salesmancode AS VARCHAR) salesmancode,transactiondate,transactiontime,
    documentnumber,odometerreading,transferlocationcode,referencenumber,
    requestdate,securitycode,transmitindicator,voidflag,
    CAST(hhcdocumentnumber AS VARCHAR) hhcdocumentnumber,loadnumber,
    refdocumentnumber,currencycode,actualtransactiondate,inventorynumber,data,isurgent
  from inventorytransactionheader
  where issync=0 and istemp='false' and detailkey in (1)
`);

const inventorytransactiondetail = query(`
  select routekey,detailkey,transactiontypecode,itemcode,quantity,weighted,
    itemprice,batchdetailkey,itemcaseprice,currencycode,reasoncode,expirydate
  from inventorytransactiondetail
  where issync=0 and istemp='false' and routekey in (368920) and detailkey in (1)
`);

const inventorysummarydetail = query(`
  select inventorykey,itemcode,routekey,weighted,beginstockqty,loadqty,loadaddqty,
    loadcutqty,loadreqqty,saleqty,returnqty,damagedaddqty,damagedcutqty,endstockqty,
    unloadqty,damagedunloadqty,freesampleqty,truckdamagedunloadqty,stdsalesprice,
    stdreturnprice,cashsalesqty,cashsalesvalue,tcsalesqty,tcsalesvalue,gcsalesqty,
    gcsalesvalue,cashdamagedqty,cashdamagedvalue,tcdamagedqty,tcdamagedvalue,
    gcdamagedqty,gcdamagedvalue,cashreturnqty,cashreturnvalue,tcreturnqty,
    tcreturnvalue,gcreturnqty,gcreturnvalue,promoqty,cashsalesitemexcisetax,
    cashsalesitemgsttax,cashreturnitemexcisetax,cashreturnitemgsttax,
    cashdamageditemexcisetax,cashdamageditemgsttax,cashfgitemexcisetax,
    cashfgitemgsttax,cashpromoitemexcisetax,cashpromoitemgsttax,
    tcsalesitemexcisetax,tcsalesitemgsttax,tcreturnitemexcisetax,
    tcreturnitemgsttax,tcdamageditemexcisetax,tcdamageditemgsttax,
    tcfgitemexcisetax,tcfgitemgsttax,tcpromoitemexcisetax,tcpromoitemgsttax,
    gcsalesitemexcisetax,gcsalesitemgsttax,gcreturnitemexcisetax,
    gcreturnitemgsttax,gcdamageditemexcisetax,gcdamageditemgsttax,
    gcfgitemexcisetax,gcfgitemgsttax,gcpromoitemexcisetax,gcpromoitemgsttax,
    batchdetailkey,stdsalescaseprice,stdreturncaseprice,expiryqty,
    stdgoodreturncaseprice,stdgoodreturnprice,currencycode,returnfreeqty,damageqty,
    expdmgfreeqty,expunloadqty,dmgunloadqty,expdmgfreeunloadqty,rentqty,mdat,
    freshunloadqty,emptycontainerqty,emptycontainerunloadqty
  from inventorysummarydetail
  where issync=0 and istemp='false' and routekey in (368920)
`);

const body = new URLSearchParams({
  inventorytransactionheader: JSON.stringify(inventorytransactionheader),
  inventorytransactiondetail: JSON.stringify(inventorytransactiondetail),
  inventorysummarydetail: JSON.stringify(inventorysummarydetail),
  routekey: '368920',
  routecode: '1818',
  routeclosed: '0',
  userid: '1818'
}).toString();

console.log(JSON.stringify({
  counts: {
    inventorytransactionheader: inventorytransactionheader.length,
    inventorytransactiondetail: inventorytransactiondetail.length,
    inventorysummarydetail: inventorysummarydetail.length
  },
  firstHeader: inventorytransactionheader[0]
}, null, 2));

const target = new URL('/api/sync/senddata', baseUrl);
const req = http.request({
  hostname: target.hostname,
  port: target.port || 80,
  path: target.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(body)
  }
}, (res) => {
  let data = '';
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`HTTP ${res.statusCode}`);
    console.log(data);
  });
});

req.on('error', (error) => {
  console.error(`REQUEST_ERROR ${error.code} ${error.message}`);
  process.exitCode = 1;
});

req.write(body);
req.end();
