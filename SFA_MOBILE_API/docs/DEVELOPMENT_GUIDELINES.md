# Development Guidelines

## Project Goal

`SFA_MOBILE_API` replaces the Zend Framework mobile API with Node.js TypeScript while keeping the PhoneGap mobile app unchanged.

The correct behavior is:

```text
The mobile app should not know that Zend was replaced.
```

## Folder Responsibilities

```text
src/modules/mobile/mobile.routes.ts
```

Acts as the central registrar for module-owned route files:

```text
auth/auth.routes.ts
masterdatasync/masterdatasync.routes.ts
transactions/transactions.routes.ts
ws/ws.routes.ts
```

Each module route file registers its legacy endpoint paths and maps them to that module's controller.

```text
src/modules/mobile/auth
```

Device check, salesman login, version check, sync date update.

```text
src/modules/mobile/masterdatasync
```

Main `getsyncdata1` download/sync API.

```text
src/modules/mobile/transactions
```

Main mobile upload APIs such as `sync/senddata`, `sync/custseq`, invoice/AR detail upload, and image upload.

```text
src/modules/mobile/ws
```

Legacy `ws/*` endpoints such as start day, end day, logout, lookup APIs, transaction count APIs.

```text
src/shared/utils/commonUtils.ts
```

Common reusable technical helpers.

## Layer Rules

Routes:

- define URL and method
- call controller handler
- preserve legacy endpoint paths

Controllers:

- receive Fastify request/reply
- parse legacy request formats and orchestrate workflows
- call models in the required business order
- manage transaction boundaries for multi-table workflows
- send response
- set legacy content type if needed

Models:

- own SQL
- own table reads/writes
- map JS values into SQL params
- never depend on Fastify request/reply

The mobile modules use strict MVC and do not have separate service, repository, mapper, or type layers.

## Utility Rules

Use `commonUtils.ts` for reusable technical helpers:

- generic object checks
- generic string/scalar conversions
- generic legacy record normalization
- legacy JSON/form body and array parsing
- required and optional request parameter reading
- required/nullable mysql2 bind normalization
- shared four-decimal string formatting
- generic SQL placeholder helpers
- shared MySQL row type
- table existence checks
- latest closed route key lookup

Keep helpers local when tied to business meaning:

- route sequence calculations
- Zend response table counts
- table-specific response formatting

## Adding A New API

1. Find the mobile app call.
2. Find the old Zend controller/action.
3. Find stored procedure or SQL behavior.
4. Add or update route in `mobile.routes.ts`.
5. Add controller function.
6. Add workflow orchestration in the controller.
7. Add direct SQL in the relevant model.
8. Match Zend response shape.
9. Test with mobile app.
10. Run:

```bash
npm run typecheck
npm run build
```

## Debugging A Mobile Issue

Follow this order:

```text
mobile screen
-> mobile JS/Java caller
-> API URL/method/payload
-> mobile.routes.ts
-> controller
-> model SQL
-> old Zend behavior
-> database state
-> server logs
```

Common mobile errors:

- `Acknowledgement Not Received`: response shape or upload acknowledgement mismatch.
- `Internal server error`: check server logs for SQL bind or query failure.
- Sync completes but data missing: compare Node JSON array names/fields/row counts with Zend.

Detailed debugging instructions are maintained in:

```text
docs/DEBUGGING_GUIDE.md
```

Endpoint ownership is maintained in:

```text
docs/MOBILE_API_ENDPOINT_MAP.md
```

Useful `.env` values for development:

```env
LOG_LEVEL=debug
DEBUG_PAYLOAD=false
```

Use `DEBUG_PAYLOAD=true` only temporarily because mobile upload payloads can be large.

## Production Safety Rules

- Do not expose raw SQL errors to mobile responses.
- Keep detailed errors in logs.
- Use transactions for multi-table writes.
- Handle missing mobile fields safely.
- Preserve old behavior where Zend/stored procedures tolerated missing values.
- Avoid large refactors during active production issue fixes.

