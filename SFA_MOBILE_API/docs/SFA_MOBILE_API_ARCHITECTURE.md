# SFA Mobile API Architecture

## Purpose

`SFA_MOBILE_API` is the Node.js TypeScript replacement for the legacy Zend Framework mobile API used by the PhoneGap SFA mobile application.

The main goal is to keep the existing mobile app working without changing its API calls, while replacing Zend controller logic and MySQL stored procedure behavior with maintainable Node.js services and direct SQL.

This application is built for a production sales-force system where mobile users perform:

- device validation
- salesman login
- master data sync
- start day and end day
- sales, orders, collections, inventory, surveys, and customer activity upload
- transaction lookup and back-office lookup calls

## Technology Stack

- Runtime: Node.js
- Language: TypeScript
- HTTP framework: Fastify
- Database driver: mysql2
- Database: MySQL
- Validation/types: TypeScript types and selected runtime parsing helpers
- Logging: Fastify/Pino

The project uses TypeScript because this migration is business-critical. Types make API contracts, database result shapes, and upload payloads easier to understand and safer to maintain.

## High-Level Request Flow

Every API request follows this general flow:

```text
Mobile App
  -> Fastify route
  -> Controller
  -> Service
  -> Repository
  -> MySQL
  -> Mapper/response builder
  -> Zend-compatible response
  -> Mobile App
```

Example for master sync:

```text
/api/index/getsyncdata1/routeid/:routeid/userid/:userid/deviceid/:deviceid/mdate/:mdate/table/:table
  -> mobile.routes.ts
  -> masterdatasync.controller.ts
  -> masterdatasync.service.ts
  -> setting.repository.ts
  -> masterData.repository.ts
  -> transactionData.repository.ts
  -> masterdatasync.mapper.ts
  -> JSON response consumed by mobile SQLite sync
```

Example for transaction upload:

```text
/api/sync/senddata
  -> mobile.routes.ts
  -> transactions.controller.ts
  -> transactions.service.ts
  -> repository files by business area
  -> MySQL transaction
  -> acknowledgement response
```

## Application Bootstrap

Main setup is in:

```text
src/app.ts
```

Responsibilities:

- creates the Fastify app
- enables request logging
- registers the global error handler
- registers legacy body parsers
- enables CORS
- enables multipart upload support
- registers health routes
- registers all mobile API routes

Important production detail:

```ts
bodyLimit: 50 * 1024 * 1024
```

This is required because the old mobile app can upload large transaction payloads.

## Route Layer

Main mobile route file:

```text
src/modules/mobile/mobile.routes.ts
```

This file keeps all mobile-facing endpoints in one place.

It intentionally preserves legacy URL structures such as:

- `/api/index/companyidbydevice/deviceid/:deviceid`
- `/api/index/salesmanlogin/username/:username/password/:password/deviceid/:deviceid`
- `/api/index/salesmanverchk/routecode/:routecode/verno/:verno`
- `/api/index/getsyncdata1/...`
- `/api/sync/senddata`
- `/api/ws/senddata`
- `/api/ws/endday`
- `/api/customer/customermaster`
- `/api/transaction/trandata`

Some routes allow both `GET` and `POST` because the legacy mobile app is not fully consistent. Where the mobile app is confirmed to call only one method, the route can be stricter. Compatibility with the deployed mobile app is more important than ideal REST design.

## Module Structure

Current mobile module:

```text
src/modules/mobile
```

Main submodules:

```text
auth
masterdatasync
transactions
ws
```

Each module has a clear responsibility.

## Auth Module

Path:

```text
src/modules/mobile/auth
```

Purpose:

- device to company lookup
- salesman login
- salesman version check
- sync date update

Typical flow:

```text
auth.controller.ts
  -> auth.service.ts
  -> repository/auth.repository.ts
  -> auth.mapper.ts
```

This module supports old `/api/index/...` endpoints that were previously handled by Zend `IndexController`.

## Master Data Sync Module

Path:

```text
src/modules/mobile/masterdatasync
```

Purpose:

Handles the main mobile data download API:

```text
/api/index/getsyncdata1/...
```

Compatibility route also exists for:

```text
/api/index/getsyncdata/...
```

Internally both are handled by the same Node flow because the current mobile app sync behavior is based on the `getsyncdata1` result format.

Important files:

```text
masterdatasync.controller.ts
masterdatasync.service.ts
masterdatasync.mapper.ts
masterdatasync.types.ts
repository/setting.repository.ts
repository/masterData.repository.ts
repository/transactionData.repository.ts
```

### Master Sync Responsibilities

The master sync response is built from three repository groups.

Setting data:

```text
setting.repository.ts
```

Examples:

- `ControlPanel`
- `Setup`
- `companydetail`
- `SalesmanMaster`
- `RouteMaster`
- `startendday`
- `synctime`
- `CurrencyMaster`

Business master data:

```text
masterData.repository.ts
```

Examples:

- item data
- customer data
- promotion and pricing data
- survey data
- reason data
- bank/cash/location data
- POS data
- messages

Route transaction download data:

```text
transactionData.repository.ts
```

Examples:

- starting load
- inventory summary
- sales orders
- suggested invoices
- open customer invoices
- batch expiry details
- delete master

### Master Sync Service Pattern

The service fetches grouped sections first:

```ts
const settingSections = await getSettingSyncSections(connection, { routeId });
const masterDataSections = await getMasterDataSyncSections(connection, { routeId });
const transactionDataSections = await getTransactionDataSyncSections(connection, {
  routeId,
  userId,
  deviceId: params.deviceid
});
```

Then it destructures response arrays explicitly before building the final response.

This makes the output contract visible in `masterdatasync.service.ts`, so developers can easily see which arrays are returned to the mobile app.

## Transactions Module

Path:

```text
src/modules/mobile/transactions
```

Purpose:

Handles mobile upload APIs, mainly:

```text
/api/sync/senddata
/api/sync/custseq
/api/sync/invtxndetail
/api/sync/artxndetail
/api/image/upload
```

Important files:

```text
transactions.controller.ts
transactions.service.ts
transactions.types.ts
repository/*
types/*
```

### Transaction Repository Split

Repositories are split by business area:

```text
auditExtra.repository.ts
collections.repository.ts
customerService.repository.ts
inventory.repository.ts
orders.repository.ts
routeActivity.repository.ts
routeClose.repository.ts
sales.repository.ts
shared.repository.ts
transaction.repository.ts
transactionDetail.repository.ts
```

This avoids one very large upload repository and makes maintenance easier.

Example responsibilities:

- `sales.repository.ts`: invoice header/detail, invoice RXD, promotion detail, batch expiry, customer invoice
- `orders.repository.ts`: sales order header/detail, order RXD
- `collections.repository.ts`: AR header/detail, cash/check detail
- `inventory.repository.ts`: inventory transaction header/detail, inventory summary
- `routeActivity.repository.ts`: visit log, route master updates, customer operations, customer sequence
- `customerService.repository.ts`: customer inventory, no sales, non-serviced customer, route goal, FOC balance
- `auditExtra.repository.ts`: survey audit, POS, images, override logs
- `routeClose.repository.ts`: post-upload route close and sequence behavior

### Transaction Upload Flow

The mobile app sends many JSON array fields in one legacy request.

The service:

1. parses legacy body/query format
2. creates an empty acknowledgement response
3. saves each business array in order
4. maps temporary mobile transaction keys to database keys
5. returns only successfully processed acknowledgement arrays
6. runs route close or sequence post-processing

This is important because the mobile app waits for acknowledgement arrays. If the response format changes, the mobile app may show errors such as acknowledgement not received.

## WS Module

Path:

```text
src/modules/mobile/ws
```

Purpose:

Handles legacy `/api/ws/...` endpoints used by start day, end day, logout, load checking, and lookup screens.

Important files:

```text
ws.controller.ts
ws.service.ts
repository/startEndDay.repository.ts
repository/transactionLookup.repository.ts
repository/wsLookup.repository.ts
types/*
```

Main endpoints:

- `/api/ws/checkload`
- `/api/ws/senddata`
- `/api/ws/endday`
- `/api/ws/logout`
- `/api/ws/getcustinv`
- `/api/ws/getcustomerbalance`
- `/api/ws/getcustomeritemgrp`
- `/api/ws/getdelivery`
- `/api/ws/getorderstatus`
- `/api/ws/getvisualdata`
- `/api/ws/getwarehousestock`
- `/api/ws/getwhstock`

The WS module exists because the old mobile app uses these endpoints separately from the main `/api/sync/senddata` upload flow.

## Shared Layer

Path:

```text
src/shared
```

Important folders:

```text
db
middleware
utils
```

### Database

```text
src/shared/db/mysqlPool.ts
src/shared/db/transaction.ts
```

`mysqlPool.ts` creates the MySQL connection pool.

`transaction.ts` provides `withTransaction`, which wraps multi-step operations in a database transaction.

For business-critical uploads, this is important. If one upload group fails, the transaction can roll back instead of leaving partial data.

### Middleware

```text
errorHandler.ts
errors.ts
legacyBodyParser.ts
requestLogger.ts
```

Responsibilities:

- convert thrown errors into API responses
- preserve useful logs for production troubleshooting
- parse old mobile app request formats
- support large upload bodies

### Utilities

```text
dateMapper.ts
legacyParamParser.ts
nullMapper.ts
numberMapper.ts
```

These helpers normalize legacy mobile values before they reach SQL.

Important rule:

MySQL bind parameters must not contain `undefined`.

Use `null`, `0`, or required value mapping depending on the legacy stored procedure behavior.

## Database Strategy

The legacy Zend API depended heavily on MySQL stored procedures.

The Node API is designed to replace stored procedure behavior with direct SQL inside repositories.

Architecture rule:

```text
Controller does not write SQL.
Service does not write SQL unless there is a very strong reason.
Repository owns SQL.
```

This keeps business orchestration separate from database implementation.

## Zend Compatibility Strategy

The mobile app is already deployed and must continue to work.

Therefore Node must preserve:

- same endpoint paths
- same required path parameters
- same accepted legacy query/body formats
- same response array names
- same acknowledgement style
- same default behavior where Zend or stored procedures tolerated missing fields

This project is not designing a new clean REST API first. It is building a compatible replacement API first.

After production stability, a cleaner internal or future API can be introduced separately.

## TypeScript Database Row Types

Repository files use mysql2 types such as:

```ts
RowDataPacket
```

Example:

```ts
type GenericRow = RowDataPacket & Record<string, unknown>;
```

Meaning:

- `RowDataPacket` means one MySQL result row
- `Record<string, unknown>` means dynamic column names are allowed
- `GenericRow[]` means an array of MySQL rows with unknown column structure

For known query results, use specific row types:

```ts
type ScalarRow = RowDataPacket & {
  value: string | number | null;
};
```

This documents the SQL result and helps TypeScript catch mistakes.

These types do not change runtime data. They only help developers and the compiler understand the shape of query results.

## Error Handling

The global error handler converts application errors into consistent API responses.

Production logs use structured error logging so stack traces and MySQL errors can be inspected.

For mobile compatibility, do not expose detailed internal SQL errors to the mobile response. Detailed error data belongs in server logs.

## Request Body Handling

The old PhoneGap app can send data in legacy formats:

- JSON string fields
- URL encoded form fields
- query string JSON arrays
- GET requests with encoded arrays
- POST requests with legacy body format

`legacyBodyParser.ts` exists to keep these formats working.

This is a compatibility layer and should be handled carefully. Changing it can affect many upload screens.

## Response Mapping

Response shape matters more than modern API style.

For master sync, the response object must contain the array names expected by mobile SQLite insert logic.

For upload APIs, acknowledgement arrays must match the mobile app's success checking logic.

Do not rename response keys unless the mobile app is also changed.

## Development Commands

From:

```text
SFA_MOBILE_API
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build TypeScript:

```bash
npm run build
```

Run compiled server:

```bash
npm start
```

Type check only:

```bash
npm run typecheck
```

## How To Add Or Change An API

Recommended steps:

1. Find the mobile app call first.
2. Confirm the old Zend controller action.
3. Confirm stored procedure behavior or old SQL behavior.
4. Add or update route in `mobile.routes.ts`.
5. Keep controller thin.
6. Put orchestration in service.
7. Put SQL in repository.
8. Add or update TypeScript request/response types.
9. Match Zend response format.
10. Test with the real mobile screen.
11. Run `npm run typecheck`.
12. Run `npm run build`.

## Important Production Principles

- Do not change mobile app response contracts unless the mobile app is also changed.
- Do not remove legacy endpoints just because they look duplicate.
- Avoid `undefined` in SQL parameters.
- Prefer explicit default values when Zend/stored procedures tolerated missing mobile fields.
- Use transactions for multi-table writes.
- Keep SQL in repository files.
- Keep controllers small.
- Keep service files readable as business workflow.
- Compare Node output with Zend output when debugging sync issues.
- Treat master sync performance as production-critical because it affects every mobile user.

## Architecture Summary

`SFA_MOBILE_API` is a compatibility-first Node.js API.

It uses Fastify for HTTP, TypeScript for maintainability, mysql2 for database access, repositories for direct SQL, services for business workflow, and controllers for request/response handling.

The most important design rule is simple:

```text
The mobile app should not know that Zend was replaced.
```

If the mobile app can login, sync, start day, upload transactions, end day, and logout exactly as before, then the migration architecture is doing its job.
