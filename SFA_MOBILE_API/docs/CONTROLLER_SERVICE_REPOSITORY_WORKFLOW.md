# Controller Service Repository Workflow

This document explains how request handling works inside `SFA_MOBILE_API`.

The project uses this main workflow:

```text
Route -> Controller -> Service -> Repository -> Database -> Response
```

This is a layered architecture. Each layer has one clear job.

## Layer Responsibilities

## Route Layer

Main file:

```text
src/modules/mobile/mobile.routes.ts
```

The route layer connects a mobile API URL to a controller function.

Example:

```ts
app.route({
  method: 'POST',
  url: '/api/sync/senddata',
  handler: sendDataAction
});
```

Meaning:

```text
When mobile calls POST /api/sync/senddata,
Fastify will execute sendDataAction().
```

Route layer responsibilities:

- define URL
- define HTTP method
- connect URL to controller
- preserve legacy Zend/mobile endpoint paths

Route layer should not contain business logic or SQL.

## Controller Layer

Controller files:

```text
src/modules/mobile/auth/auth.controller.ts
src/modules/mobile/masterdatasync/masterdatasync.controller.ts
src/modules/mobile/transactions/transactions.controller.ts
src/modules/mobile/ws/ws.controller.ts
```

The controller is the API entry point.

Example:

```ts
export async function sendDataAction(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const result = await sendData(request, reply);
  await reply.type('text/plain').send(JSON.stringify(result));
}
```

Controller responsibilities:

- receive `FastifyRequest`
- receive `FastifyReply`
- read path params, query params, or body when needed
- call the service
- send the final response
- set response content type when legacy mobile expects it

Controller should stay thin.

Controller should not:

- write SQL
- contain large business workflows
- know table insert order
- duplicate stored procedure logic

## Service Layer

Service files:

```text
src/modules/mobile/auth/auth.service.ts
src/modules/mobile/masterdatasync/masterdatasync.service.ts
src/modules/mobile/transactions/transactions.service.ts
src/modules/mobile/ws/ws.service.ts
```

The service layer is the business workflow layer.

It decides what needs to happen and in which order.

Example from transaction upload:

```text
sendData()
  -> parse mobile payload
  -> start DB transaction
  -> save customer visit data
  -> save invoice header
  -> save invoice detail
  -> save order data
  -> save AR collection data
  -> save inventory data
  -> run route close post-processing
  -> return acknowledgement response
```

Service responsibilities:

- parse legacy mobile payloads
- validate or normalize important values
- call repositories in correct business order
- manage transaction boundaries through `withTransaction`
- build service-level response objects
- preserve Zend-compatible behavior

Service should not directly expose Fastify details except where legacy request parsing requires the original request object.

Service should avoid writing SQL directly. SQL belongs in repositories.

## Repository Layer

Repository files are inside each module's `repository` folder.

Examples:

```text
src/modules/mobile/auth/repository/auth.repository.ts
src/modules/mobile/masterdatasync/repository/setting.repository.ts
src/modules/mobile/masterdatasync/repository/masterData.repository.ts
src/modules/mobile/masterdatasync/repository/transactionData.repository.ts
src/modules/mobile/transactions/repository/sales.repository.ts
src/modules/mobile/transactions/repository/inventory.repository.ts
src/modules/mobile/transactions/repository/collections.repository.ts
src/modules/mobile/ws/repository/startEndDay.repository.ts
```

Repository responsibilities:

- execute SQL
- read from MySQL
- insert/update/delete records
- map JavaScript values into SQL parameters
- avoid passing `undefined` to mysql2
- return database result data to service

Repository should not:

- know Fastify request or reply objects
- decide HTTP response format
- contain mobile URL logic

## Mapper Layer

Mapper files:

```text
auth.mapper.ts
masterdatasync.mapper.ts
```

Mapper responsibilities:

- convert database/service result into mobile-compatible response
- keep Zend response shape
- centralize response formatting where useful

Not every module needs a mapper file. Use mapper files when response conversion becomes repeated or large.

## Type Placement

This project now keeps most small request, response, and database row types beside the functions that use them. This avoids jumping between files for simple route params or one-query result shapes.

Remaining shared transaction type files:

```text
transactions/types/shared.types.ts
transactions/types/routeActivity.types.ts
transactions/types/sales.types.ts
transactions/types/senddata.types.ts
```

Type responsibilities:

- document important request params
- document large upload payload objects
- document response structures
- help TypeScript catch mistakes before runtime

Example:

```ts
FastifyRequest<{ Params: SalesmanLoginParams }>
```

This means the controller expects route params matching `SalesmanLoginParams`. For small params, define that interface in the controller file. For large reusable upload shapes, use the remaining transaction type files.

## Common Utility Layer

Shared helper file:

```text
src/shared/utils/commonUtils.ts
```

Use this file for small reusable helpers that are not owned by one business module.

Current common helpers include:

- `GenericRow`
- `buildInClause()`
- `tableExists()`
- `getLatestClosedRouteKey()`
- `isPlainObject()`
- `stringValue()`
- `readScalar()`
- `normalizeLegacyRecords()`
- `asRecords()`
- `sanitizeFileName()`
- legacy date, number, null, and path-param helpers

Use common utilities when the behavior is generic and reused by more than one area.

Keep helpers local when they are business-specific, such as:

- `mapInvoiceHeaderParams()`
- `mapSalesOrderDetailParams()`
- `toRouteTransactionSequence()`
- `toZendTableCount()`
- end-day-only defaulting logic

Simple rule:

```text
Reusable technical helper -> commonUtils.ts
Business/table/API behavior -> keep local
```

## Full Example: Salesman Login

Endpoint:

```text
POST /api/index/salesmanlogin/username/:username/password/:password/deviceid/:deviceid
```

Flow:

```text
mobile.routes.ts
  -> salesmanLogin()
  -> auth.service.ts loginSalesman()
  -> auth.repository.ts
  -> auth.mapper.ts
  -> mobile response
```

Controller:

```ts
const result = await loginSalesman(
  request.params.username,
  request.params.password.trim(),
  request.params.deviceid
);
await reply.send(result);
```

The controller only passes request values to the service.

The service handles login logic.

The repository checks database records.

The mapper formats the response expected by mobile.

## Full Example: Master Data Sync

Endpoint:

```text
GET /api/index/getsyncdata1/routeid/:routeid/userid/:userid/deviceid/:deviceid/mdate/:mdate/table/:table
```

Flow:

```text
mobile.routes.ts
  -> masterDataSyncAction()
  -> masterdatasync.service.ts getMasterDataSync()
  -> setting.repository.ts
  -> masterData.repository.ts
  -> transactionData.repository.ts
  -> masterdatasync.mapper.ts
  -> mobile SQLite sync response
```

Service workflow:

```text
get routeId/userId/deviceId
  -> fetch setting sections
  -> fetch master data sections
  -> fetch transaction download sections
  -> destructure all response arrays
  -> build final getsyncdata1 response
```

This keeps the main sync output visible and maintainable.

## Full Example: Main Transaction Upload

Endpoint:

```text
POST /api/sync/senddata
```

Flow:

```text
mobile.routes.ts
  -> sendDataAction()
  -> transactions.service.ts sendData()
  -> transactions repository files
  -> MySQL transaction
  -> acknowledgement response
```

Important repositories:

```text
routeActivity.repository.ts
sales.repository.ts
orders.repository.ts
collections.repository.ts
inventory.repository.ts
customerService.repository.ts
auditExtra.repository.ts
routeClose.repository.ts
```

Why service order matters:

- invoice detail needs the saved invoice header key
- order detail needs the saved order header key
- AR detail needs the saved AR header key
- inventory detail needs the saved inventory header/detail key
- route close post-processing should run after upload data is saved

The service stores key mappings while processing:

```text
mobile transaction key -> database transaction key
```

This is required because the mobile SQLite database creates temporary keys before upload.

## Full Example: Customer Sequence

Endpoint:

```text
POST /api/sync/custseq
```

Flow:

```text
mobile.routes.ts
  -> customerSequenceAction()
  -> transactions.service.ts customerSequence()
  -> routeActivity.repository.ts saveCustomerSequence()
  -> response
```

Purpose:

The native Java mobile flow sends route sequence customer status separately.

Service parses the request array and saves each item.

Response remains Zend-style:

```json
{
  "code": 200,
  "message": "Load Data !"
}
```

## Full Example: End Day

Endpoint:

```text
GET /api/ws/endday?endday=[{...}]
```

Flow:

```text
mobile.routes.ts
  -> endDay()
  -> ws.service.ts
  -> startEndDay.repository.ts
  -> response
```

Purpose:

Settlement screen sends route end totals.

Important detail:

The mobile app may omit some fields depending on screen calculation timing. Node should follow Zend/stored procedure behavior and use safe defaults where appropriate.

Example fields:

```text
totalacctsreceivable
totalexpenses
inventoryvariance
```

If mobile does not send them, repository mapping should avoid `undefined` SQL bind values.

## How To Debug An API Issue

Use this order:

```text
1. Find mobile screen or JS file.
2. Find exact API URL and method.
3. Check mobile.routes.ts.
4. Check controller function.
5. Check service function.
6. Check repository SQL.
7. Compare Zend controller/stored procedure behavior.
8. Check Node server logs.
9. Test same payload.
10. Run npm run typecheck and npm run build.
```

Example:

```text
Mobile alert: Acknowledgement Not Received
  -> check upload.js/sync.js response handling
  -> check /api/sync/senddata route
  -> check sendDataAction()
  -> check sendData()
  -> check repository that failed in logs
  -> verify response acknowledgement array exists
```

## How To Add New Logic

Recommended approach:

```text
1. Add or update route in mobile.routes.ts.
2. Add small controller function or reuse existing one.
3. Add service function for workflow.
4. Add repository function for SQL.
5. Add request/response types.
6. Add mapper only if response formatting is complex.
7. Keep Zend/mobile response shape.
8. Test with real mobile request.
```

## What Each Layer Should Not Do

Route should not:

- parse business payloads
- run SQL
- build complex responses

Controller should not:

- contain business workflow
- contain SQL
- know insert order

Service should not:

- contain large SQL blocks
- know HTTP route paths
- send Fastify response directly unless compatibility requires it

Repository should not:

- know mobile URL paths
- use Fastify request/reply
- build HTTP responses

## Simple Mental Model

Use this mental model:

```text
Route = which API URL?
Controller = receive request and send response
Service = business process
Repository = database work
Mapper = response shape
Types = contract/documentation
```

For this project, the service layer is the most important place to understand business flow.

The repository layer is the most important place to debug database errors.

The controller layer is the most important place to check response format and content type.
