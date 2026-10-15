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
src/modules/mobile/auth/controllers/auth.controller.ts
src/modules/mobile/masterdatasync/controllers/masterdatasync.controller.ts
src/modules/mobile/transactions/controllers/transactions.controller.ts
src/modules/mobile/ws/controllers/ws.controller.ts
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
- run the module workflow or call the relevant model
- send the final response
- set response content type when legacy mobile expects it

Auth and lookup controllers stay thin. The transaction controller also owns upload orchestration because this project uses strict MVC without a service layer.

Controller should not:

- write SQL
- contain large business workflows
- know table insert order
- duplicate stored procedure logic

## Transaction Workflow

The transaction controller is the business workflow layer.

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

Transaction controller responsibilities:

- parse legacy mobile payloads
- validate or normalize important values
- call models in correct business order
- manage transaction boundaries through `withTransaction`
- build Zend-compatible response objects
- preserve Zend-compatible behavior

The controller does not contain SQL. SQL belongs in models.

## Model Layer

Model files are inside each module's `models` folder.

Examples:

```text
src/modules/mobile/auth/models/auth.model.ts
src/modules/mobile/masterdatasync/models/setting.model.ts
src/modules/mobile/masterdatasync/models/masterData.model.ts
src/modules/mobile/masterdatasync/models/transactionData.model.ts
src/modules/mobile/transactions/models/sales.model.ts
src/modules/mobile/transactions/models/inventory.model.ts
src/modules/mobile/transactions/models/collections.model.ts
src/modules/mobile/ws/models/startEndDay.model.ts
```

Model responsibilities:

- execute SQL
- read from MySQL
- insert/update/delete records
- map JavaScript values into SQL parameters
- avoid passing `undefined` to mysql2
- return database result data to the controller

Models should not:

- know Fastify request or reply objects
- decide HTTP response format
- contain mobile URL logic

## Response Mapping

Auth, WS, and master sync use strict MVC and do not have separate mapper files. Their controllers preserve the Zend response shape and formatting directly.

## Type Placement

The strict MVC mobile modules do not use separate `.types.ts` files. Legacy upload rows use flexible records because payload values vary between PhoneGap versions.

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
- `required()` and `nullable()`
- `toFixedDecimalString()`
- `parseLegacyBodyValues()` and `parseLegacyRecordArray()`
- `readOptionalRequestParam()` and `readRequiredRequestParam()`
- legacy date, number, null, and path-param helpers

Use common utilities when the behavior is generic and reused by more than one area.

Keep helpers local when they are business-specific, such as:

- `toRouteTransactionSequence()`
- `toZendTableCount()`
- table-specific response formatting

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
  -> models/auth.model.ts
  -> mobile response
```

The auth module follows strict MVC and keeps its small authentication workflow in `controllers/auth.controller.ts`. Other modules may retain services where their business workflows are large.

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

The auth service formats the small response expected by mobile directly. A separate auth mapper is unnecessary because the transformation is used only once.

## Full Example: Master Data Sync

Endpoint:

```text
GET /api/index/getsyncdata1/routeid/:routeid/userid/:userid/deviceid/:deviceid/mdate/:mdate/table/:table
```

Flow:

```text
mobile.routes.ts
  -> masterDataSyncAction()
  -> models/setting.model.ts
  -> models/masterData.model.ts
  -> models/transactionData.model.ts
  -> controller response builder
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
  -> controllers/transactions.controller.ts sendData()
  -> transactions model files
  -> MySQL transaction
  -> acknowledgement response
```

Important models:

```text
routeActivity.model.ts
sales.model.ts
orders.model.ts
collections.model.ts
inventory.model.ts
customerService.model.ts
auditExtra.model.ts
routeClose.model.ts
```

Why controller workflow order matters:

- invoice detail needs the saved invoice header key
- order detail needs the saved order header key
- AR detail needs the saved AR header key
- inventory detail needs the saved inventory header/detail key
- route close post-processing should run after upload data is saved

The controller stores key mappings while processing:

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
  -> controllers/transactions.controller.ts customerSequence()
  -> routeActivity.model.ts saveCustomerSequence()
  -> response
```

Purpose:

The native Java mobile flow sends route sequence customer status separately.

The controller parses the request array and saves each item.

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
  -> controllers/ws.controller.ts
  -> models/startEndDay.model.ts
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
