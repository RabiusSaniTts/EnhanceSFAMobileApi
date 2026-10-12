# Node.js TypeScript Modular Architecture For Mobile API Migration

This document explains the recommended Node.js TypeScript architecture for migrating the current PHP Zend mobile API.

The migration goal is:

- Keep the existing PhoneGap mobile app unchanged.
- Keep the same old API paths.
- Keep the same JSON response shape.
- Use TypeScript for all new Node API code.
- Stop using MySQL stored procedures in the new Node API.
- Replace stored procedure behavior with clear TypeScript service and repository logic.

Existing fixed constraints:

- Existing PHP version: `7.0.33`
- Existing MySQL version: `8.0.21`
- Existing mobile app: `SFA_ENHANCE_HHT`
- Existing mobile users: `2000+`
- Existing mobile API contract must not change.
- New Node API language: `TypeScript`

## 1. Main Architecture Idea

The outside API must look like Zend.

The inside code should be modern Node.js with TypeScript.

```text
Mobile App
  -> Same old API URL
  -> Node route
  -> Controller
  -> Service
  -> Repository
  -> MySQL tables
  -> Mapper
  -> Same old JSON response
```

Example old mobile endpoint:

```text
/api/index/getsyncdata1/routeid/{routeid}/userid/-1/deviceid/0/mdate/2024-05-25/table/4
```

The Node API should keep this path exactly.

Internally, the code should be split into small modules.

## 2. Recommended Folder Structure

```text
src/
  app.ts
  server.ts

  config/
    env.ts
    database.ts

  shared/
    db/
      mysqlPool.ts
      transaction.ts

    middleware/
      errorHandler.ts
      requestLogger.ts
      legacyParamParser.ts

    utils/
      nullMapper.ts
      dateMapper.ts
      numberMapper.ts
      responseTimer.ts

  modules/
    mobile/
      index/
        index.routes.ts
        index.controller.ts
        index.service.ts
        index.repository.ts
        index.mapper.ts

      sync/
        sync.routes.ts
        sync.controller.ts
        sync.service.ts
        sync.repository.ts
        sync.mapper.ts

      ws/
        ws.routes.ts
        ws.controller.ts
        ws.service.ts
        ws.repository.ts
        ws.mapper.ts

      transaction/
        transaction.routes.ts
        transaction.controller.ts
        transaction.service.ts
        transaction.repository.ts
        transaction.mapper.ts

      customer/
        customer.routes.ts
        customer.controller.ts
        customer.service.ts
        customer.repository.ts
        customer.mapper.ts

      image/
        image.routes.ts
        image.controller.ts
        image.service.ts
        image.repository.ts
        image.mapper.ts
```

## 3. Layer Responsibilities

Each layer must have one clear job.

### Routes

Route files define the URL paths.

They must keep the old Zend-compatible API paths.

Example:

```js
fastify.route({
  method: ['GET', 'POST'],
  url: '/api/index/getsyncdata1/routeid/:routeid/userid/:userid/deviceid/:deviceid/mdate/:mdate/table/:table',
  handler: indexController.getSyncData1,
});
```

Route files should not contain business logic.

### Controllers

Controller files read request parameters and call services.

Controller responsibilities:

- Read path params.
- Read query params.
- Read body payload.
- Normalize old Zend-style request input.
- Call service.
- Return response.

Example:

```js
async function getSyncData1(request, reply) {
  const params = {
    routeid: request.params.routeid,
    userid: request.params.userid,
    deviceid: request.params.deviceid,
    mdate: request.params.mdate,
    table: request.params.table,
  };

  const response = await indexService.getSyncData1(params);
  return reply.send(response);
}
```

Controllers should not contain SQL.

### Services

Service files contain business flow.

Service responsibilities:

- Decide which data needs to load.
- Call repositories.
- Use transactions for write APIs.
- Apply business rules.
- Call mappers before returning data.

Example:

```js
async function getSyncData1(params) {
  const [
    settings,
    itemMust,
    items,
    inventory,
    customers,
    schemes,
    survey,
    reasons,
    others,
    orders,
    deleteMaster,
    customerItemGroups,
  ] = await Promise.all([
    repository.getSettings(params),
    repository.getItemMust(params),
    repository.getItems(params),
    repository.getInventory(params),
    repository.getCustomers(params),
    repository.getSchemes(params),
    repository.getSurvey(params),
    repository.getReasons(params),
    repository.getOthers(params),
    repository.getOrders(params),
    repository.getDeleteMaster(params),
    repository.getCustomerItemGroups(params),
  ]);

  return mapper.toGetSyncData1Response({
    settings,
    itemMust,
    items,
    inventory,
    customers,
    schemes,
    survey,
    reasons,
    others,
    orders,
    deleteMaster,
    customerItemGroups,
  });
}
```

Services should not know about HTTP request/response objects.

### Repositories

Repository files contain direct MySQL queries.

Repository responsibilities:

- Run `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
- Use only table queries, not stored procedures.
- Return raw DB rows.
- Keep queries parameterized.

Example:

```js
async function getRouteMaster(db, params) {
  const [rows] = await db.execute(
    `
    SELECT
      routecode,
      routename,
      salesmancode,
      vehicleodometer,
      enablegpstracking
    FROM routemaster
    WHERE routecode = ?
    `,
    [params.routeid]
  );

  return rows;
}
```

Repositories should not shape final mobile JSON.

### Mappers

Mapper files convert DB rows into the exact old mobile response shape.

This is very important because `WizzitIndent.java` expects exact JSON keys.

Mapper responsibilities:

- Keep old response keys.
- Convert `null` values like old PHP behavior.
- Format dates like old API.
- Keep number/string behavior compatible.
- Add empty arrays for keys that have no rows.
- Build `synccount`.

Example:

```js
function toGetSyncData1Response(data) {
  const response = {
    ControlPanel: data.settings.controlPanel ?? [],
    Setup: data.settings.setup ?? [],
    companydetail: data.settings.companyDetail ?? [],
    SalesmanMaster: data.settings.salesmanMaster ?? [],
    RouteMaster: data.settings.routeMaster ?? [],
    startendday: data.settings.startEndDay ?? [],
    synctime: data.settings.syncTime ?? [],
    CurrencyMaster: data.settings.currencyMaster ?? [],

    itemmustheader: data.itemMust.header ?? [],
    itemmustdetail: data.itemMust.detail ?? [],

    itemgroup: data.items.itemGroup ?? [],
    ItemMaster: data.items.itemMaster ?? [],
    itempackagemaster: data.items.itemPackageMaster ?? [],

    CustomerMaster: data.customers.customerMaster ?? [],
    salescalender: data.customers.salesCalendar ?? [],
    routesequence: data.customers.routeSequence ?? [],
    customerinvoice: data.customers.customerInvoice ?? [],

    synccount: buildSyncCount(data),
  };

  return replaceNulls(response);
}
```

## 4. Main Mobile API Modules

### `modules/mobile/index`

Purpose:

- Login
- Device/company setup
- App version check
- Download sync
- Sync date update

Zend controller source:

```text
application/modules/api/controllers/mobileApi/IndexController.php
```

Important endpoints:

```text
/api/index/companyidbydevice/deviceid/{deviceid}
/api/index/salesmanlogin/username/{username}/password/{password}/deviceid/{deviceid}
/api/index/salesmanverchk/routecode/{routecode}/verno/{version}
/api/index/getsyncdata1/routeid/{routeid}/userid/{userid}/deviceid/{deviceid}/mdate/{mdate}/table/{table}
/api/index/updatesyncdate/userid/{userid}/deviceid/{deviceid}/routecode/{routecode}/routekey/{routekey}/routeclosed/{routeclosed}
```

First migration focus:

```text
/api/index/getsyncdata1
```

### `modules/mobile/sync`

Purpose:

- Upload mobile transaction data to server.

Zend controller source:

```text
application/modules/api/controllers/mobileApi/SyncController.php
```

Important endpoints:

```text
/api/sync/senddata
/api/sync/invtxndetail
/api/sync/artxndetail
/api/sync/custseq
```

Highest risk endpoint:

```text
/api/sync/senddata
```

Reason:

It receives many payload sections and writes many business tables.

### `modules/mobile/ws`

Purpose:

- Start day
- End day
- Logout
- Load check
- Stock
- Customer balance
- Delivery/order status
- Visual data

Zend controller source:

```text
application/modules/api/controllers/mobileApi/WsController.php
```

Important endpoints:

```text
/api/ws/senddata
/api/ws/endday
/api/ws/logout
/api/ws/checkload
/api/ws/getdelivery
/api/ws/getwhstock
/api/ws/getcustinv
/api/ws/getcustomerbalance
/api/ws/getwarehousestock
/api/ws/getorderstatus
/api/ws/getcustomeritemgrp
/api/ws/getvisualdata
```

### `modules/mobile/transaction`

Purpose:

- Transaction verification
- Inventory count import

Zend controller source:

```text
application/modules/api/controllers/mobileApi/TransactionController.php
```

Important endpoints:

```text
/api/transaction/trandata/routekey/{routekey}
/api/transaction/importinventorycount/routecode/{routecode}
```

### `modules/mobile/customer`

Purpose:

- Customer master lookup

Zend controller source:

```text
application/modules/api/controllers/mobileApi/CustomerController.php
```

Important endpoint:

```text
/api/customer/customermaster/routecode/{routecode}/customercode/{customercode}
```

### `modules/mobile/image`

Purpose:

- Mobile image upload

Zend controller source:

```text
application/modules/api/controllers/mobileApi/ImageController.php
```

Important endpoint:

```text
/api/image/upload
```

## 5. `getsyncdata1` Recommended Internal Flow

Current mobile flow:

```text
sync.html
  -> plugins.WizzitIndent.sync(...)
  -> WizzitIndent.java
  -> /api/index/getsyncdata1
  -> Java parses JSON
  -> Java inserts/updates SQLite
```

Node internal flow:

```text
index.routes.ts
  -> index.controller.ts
    -> index.service.ts
      -> index.repository.ts
      -> index.mapper.ts
```

Suggested service functions:

```text
getSyncData1()
  -> getSettings()
  -> getItemMust()
  -> getItems()
  -> getInventory()
  -> getCustomers()
  -> getSchemes()
  -> getSurvey()
  -> getReasons()
  -> getOthers()
  -> getOrders()
  -> getDeleteMaster()
  -> getCustomerItemGroups()
  -> buildSyncCount()
```

Expected response keys must remain compatible:

```text
ControlPanel
Setup
companydetail
SalesmanMaster
RouteMaster
startendday
synctime
CurrencyMaster
itemmustheader
itemmustdetail
itemgroup
ItemMaster
itempackagemaster
routegoal
avgsalesqty
outletitemcodes
taxmaster
startingloaddetail
inventorysummarydetail
CustomerMaster
salescalender
routesequence
customerinvoice
discountkeyheader
discountkeydetail
distributionkeydetails
productgroupheader
productgroupdetail
promokeyheader
promokeydetail
promoplanheader
promoplandetail
promotionassignmentadvanced
customerpricing1
pricingdetail1
POSmaster
customerposinventory
customerposlimit
posinstructions
customersurveyplan
customersurveykeyplan
customersurveykey
customersurveydefinition
customersurveydefassign
lookupindexdetail
nonservreasons
expreasons
expiryreturnreasons
retitmreasons
freegoodreasons
voidreasons
routebook
salestrend
tempcustinventory
customermessages
salesmanmessages
vanmaster
bankmaster
cashdesc
inventorylocation
salesorderheader
salesorderdetail
suggestedsalesinvoice
inventorytransactiondetail
customer_foc_balance
customer_foc_detail
journeyplancreditlimit
batchexpirydetail
customer_foc
itemnrp
custnrp
deletemaster
customeritemgrp
customeritemmap
synccount
```

## 6. Upload API Transaction Flow

For write APIs, especially `sync/senddata`, use MySQL transactions.

Recommended flow:

```text
sync.controller.ts
  -> parse mobile payload
  -> normalize JSON strings
  -> sync.service.ts
    -> begin transaction
    -> save customer operation control
    -> save customer visit log
    -> save customer master changes
    -> save route master changes
    -> save invoice header
    -> save invoice detail
    -> save order header
    -> save order detail
    -> save AR header/detail
    -> save cash/check detail
    -> save inventory transactions
    -> save survey/POS data
    -> save route sequence/customer status
    -> save end-day detail
    -> save access override logs
    -> write sync log
    -> commit
  -> return old response shape
```

If any critical write fails:

```text
rollback transaction
return old-compatible error response
log request id and failed section
```

## 7. Database Access Rules

The new Node API must not call stored procedures.

Use direct table queries:

```text
SELECT
INSERT
UPDATE
DELETE
```

Rules:

- Use parameterized queries.
- Avoid raw string concatenation.
- Avoid `SELECT *` for sync APIs.
- Select only columns needed by mobile.
- Match old column names expected by mobile.
- Use transactions for multi-table writes.
- Add indexes only after checking current DB and workload.

## 8. Performance Strategy

This app has `2000+` mobile users, so sync performance matters.

Recommended optimizations:

- Use MySQL connection pooling.
- Use gzip/deflate compression.
- Run independent read groups in parallel.
- Add per-section timing logs.
- Cache slow-changing reference data where safe.
- Keep response keys stable even when arrays are empty.
- Avoid unnecessary date/string conversion loops.
- Add indexes for route/user/date filters.
- Measure old Zend response time vs new Node response time.

Important timing log example:

```text
requestId=abc123 route=105 section=settings ms=120 rows=20
requestId=abc123 route=105 section=customers ms=2400 rows=4500
requestId=abc123 route=105 section=orders ms=500 rows=100
requestId=abc123 route=105 totalMs=4100
```

This helps identify the real bottleneck.

## 9. Compatibility Rules

The mobile app must not know that the backend changed.

Compatibility rules:

- Keep same endpoint paths.
- Keep same HTTP methods where possible.
- Keep same response keys.
- Keep empty arrays instead of missing keys.
- Keep old date format.
- Keep old null handling.
- Keep old numeric/string behavior.
- Keep old success/error response structure.
- Keep old upload payload parsing.

Do not rename keys even if they are misspelled.

Example:

```text
salescalender
```

Should stay as `salescalender` if the mobile app expects it.

## 10. Error Handling

Use one shared error handler.

But return mobile-compatible responses.

Internal log can be modern:

```json
{
  "requestId": "abc123",
  "module": "mobile.index",
  "endpoint": "getsyncdata1",
  "routeid": "105",
  "error": "Database timeout"
}
```

Mobile response should remain compatible with old behavior.

## 11. Recommended Migration Order

Use a low-risk to high-risk migration path.

1. Build Node skeleton and health check.
2. Add old-compatible routes.
3. Implement `companyidbydevice`.
4. Implement `salesmanlogin`.
5. Implement `salesmanverchk`.
6. Implement `getsyncdata1`.
7. Compare old Zend response vs new Node response.
8. Implement `updatesyncdate`.
9. Implement `ws/checkload`.
10. Implement start/end day/logout.
11. Implement customer/order/stock/balance APIs.
12. Implement image upload.
13. Implement `sync/senddata` last.

## 12. Testing Strategy

For each migrated endpoint:

1. Capture old Zend response.
2. Call new Node endpoint with same params.
3. Compare JSON keys.
4. Compare row counts.
5. Compare important field names.
6. Run with real route code test data.
7. Confirm mobile screen still works without app change.

For `getsyncdata1`, compare:

```text
all top-level response keys
all table array counts
all required fields used by WizzitIndent.java
synccount values
response time
payload size
```

For `sync/senddata`, compare:

```text
DB rows inserted
DB rows updated
generated transaction keys
route close behavior
sync log behavior
mobile success response
rollback behavior
```

## 13. Recommended Technology Stack

Recommended:

```text
Node.js
TypeScript
Fastify
mysql2
Zod or Joi
Pino logger
dotenv
compression
PM2 or Docker
```

Why Fastify:

- Better performance for large sync responses.
- Good schema validation.
- Clean plugin/module system.
- Lower overhead than older Express-style APIs.

Express is still possible if the team prefers it, but for this project Fastify is a strong fit.

## 14. Core Rule

The architecture can improve internally, but the mobile app contract must remain stable.

```text
Old Zend contract outside.
Clean TypeScript Node modules inside.
No stored procedures.
No mobile app change.
```
