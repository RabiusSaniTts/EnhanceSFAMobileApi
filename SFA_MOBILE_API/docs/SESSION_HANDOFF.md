# Session Handoff

## Current Status

The Node.js TypeScript API project is actively replacing the legacy Zend mobile API while keeping the existing PhoneGap mobile app unchanged.

Current confirmed working mobile flow:

```text
device check -> login -> check load -> master sync -> update sync date -> start day -> upload transactions -> transaction lookup -> end day
```

The user confirmed the mobile app was tested after the recent refactor and everything worked correctly.

## Recent Important Changes

- The auth module is the first module converted to modular MVC with a service layer:

```text
auth/controllers/auth.controller.ts
auth/models/auth.model.ts
```

- Auth endpoint paths, request parameters, SQL behavior, and Zend-compatible responses remain unchanged.
- The auth module follows strict MVC: routes call `auth.controller.ts`, and the controller calls `auth.model.ts` directly. It has no service or mapper file.
- The auth module intentionally has no custom field-by-field interfaces or type aliases. Controllers use generic `Record` request params and models use `RowDataPacket` for query rows.
- The WS module also follows strict MVC with no service layer:

```text
ws/controllers/ws.controller.ts
ws/models/startEndDay.model.ts
ws/models/wsLookup.model.ts
ws/models/transactionLookup.model.ts
```

- WS route paths, GET/POST compatibility, request parsing, `text/plain` response behavior, and database transactions remain unchanged.
- The master sync module now follows the same strict MVC structure as auth and WS:

```text
masterdatasync/controllers/masterdatasync.controller.ts
masterdatasync/models/setting.model.ts
masterdatasync/models/masterData.model.ts
masterdatasync/models/transactionData.model.ts
```

- Master sync has no service, mapper, repository directory, or custom interface/type declarations. Its endpoint paths, SQL behavior, explicit response arrays, Zend formatting, and `synccount` contract remain unchanged.
- Master sync `customerinvoice` is implemented from the legacy `sp_ws_syncicsdata_customers` logic instead of returning an empty array.
- Compatibility type cleanup was completed:
  - removed `auth.types.ts`
  - removed `masterdatasync.types.ts`
  - removed `transactions/transactions.types.ts`
  - removed `ws/types/startEndDay.types.ts`
  - removed `ws/types/wsLookup.types.ts`
  - removed all transaction type files
- Transactions now use strict MVC with `controllers/transactions.controller.ts` and business SQL files under `models/`. Upload order, transaction rollback behavior, endpoint responses, and image upload behavior remain unchanged.

- Master sync models were simplified so top-level sync functions directly show each returned array.
- Unused wrapper functions were removed from:
  - `models/masterData.model.ts`
  - `models/transactionData.model.ts`
- Shared technical helpers were centralized into:

```text
src/shared/utils/commonUtils.ts
```

This file now contains helpers such as:

- `GenericRow`
- `buildInClause`
- `tableExists`
- `getLatestClosedRouteKey`
- `isPlainObject`
- `stringValue`
- `readScalar`
- `normalizeLegacyRecords`
- `asRecords`
- `sanitizeFileName`
- legacy date, null, number, and path-param helpers

## Verified Commands

Recent verification passed:

```bash
npm run typecheck
npm run build
```

## Performance Observations

Recent Node response times from mobile testing:

```text
companyidbydevice                 ~17 ms
salesmanlogin                     ~36 ms
checkload                         ~3 ms
startday                          ~21 ms
endday                            ~20-43 ms
updatesyncdate                    ~95 ms
importinventorycount              ~97-122 ms
sync/senddata                     ~81-1148 ms depending payload
transaction/trandata              ~1089-2594 ms
getsyncdata1 table 4              ~4949 ms
```

Main performance focus later:

```text
/api/index/getsyncdata1
/api/transaction/trandata
```

## Current Architecture Decision

This API is compatibility-first, not clean REST-first.

Priority order:

```text
1. Mobile app compatibility
2. Zend response parity
3. Correct database behavior
4. Maintainable TypeScript structure
5. Performance optimization
```

## Next Recommended Tasks

1. Commit the current working checkpoint.
2. Keep testing mobile flows after each change.
3. Start performance review for `getsyncdata1`.
4. Compare Node vs Zend response for full route sync if any data mismatch appears.
5. Prepare production deployment plan later: environment, service manager, logging, rollback, database backup.

## Do Not Forget

- The existing mobile app is the contract.
- Some endpoints intentionally preserve old URL paths.
- Some endpoints support old GET/query-string JSON behavior.
- MySQL bind params must not contain `undefined`.
- Do not remove duplicate-looking routes without checking mobile code.

