# Mobile API Endpoint Map

This document maps important PhoneGap mobile calls to the Node.js API modules.

## Auth And Device

| Mobile Purpose | Endpoint | Controller | Model |
| --- | --- | --- | --- |
| Device company lookup | `/api/index/companyidbydevice/deviceid/:deviceid` | `controllers/auth.controller.ts` | `models/auth.model.ts` |
| Salesman login | `/api/index/salesmanlogin/username/:username/password/:password/deviceid/:deviceid` | `controllers/auth.controller.ts` | `models/auth.model.ts` |
| Version check | `/api/index/salesmanverchk/routecode/:routecode/verno/:verno` | `controllers/auth.controller.ts` | `models/auth.model.ts` |
| Sync date update | `/api/index/updatesyncdate/...` | `controllers/auth.controller.ts` | `models/auth.model.ts` |

## Master Data Sync

| Mobile Purpose | Endpoint | Controller | Service/Repository |
| --- | --- | --- | --- |
| Main mobile sync | `/api/index/getsyncdata1/routeid/:routeid/userid/:userid/deviceid/:deviceid/mdate/:mdate/table/:table` | `controllers/masterdatasync.controller.ts` | `models/masterData.model.ts`, `models/setting.model.ts`, `models/transactionData.model.ts` |
| Compatibility sync | `/api/index/getsyncdata/...` | `controllers/masterdatasync.controller.ts` | Same as `getsyncdata1` |

## Upload Transactions

| Mobile Purpose | Endpoint | Controller | Service/Repository |
| --- | --- | --- | --- |
| Main upload | `/api/sync/senddata` | `transactions.controller.ts` | `transactions.service.ts`, transaction repositories |
| Customer sequence upload | `/api/sync/custseq` | `transactions.controller.ts` | `transactions.service.ts`, `routeActivity.repository.ts` |
| Invoice detail upload | `/api/sync/invtxndetail` | `transactions.controller.ts` | `transactions.service.ts`, sales repositories |
| AR detail upload | `/api/sync/artxndetail` | `transactions.controller.ts` | `transactions.service.ts`, collection repositories |
| Image upload | `/api/image/upload` | `transactions.controller.ts` | `transactions.service.ts` |

## WS Legacy APIs

| Mobile Purpose | Endpoint | Controller | Service/Repository |
| --- | --- | --- | --- |
| Check active load | `/api/ws/checkload/routeid/:routeid/userid/:userid` | `controllers/ws.controller.ts` | `models/wsLookup.model.ts` |
| Start day | `/api/ws/senddata?startday=[]` | `controllers/ws.controller.ts` | `models/startEndDay.model.ts` |
| End day | `/api/ws/endday?endday=[]` | `controllers/ws.controller.ts` | `models/startEndDay.model.ts` |
| Logout | `/api/ws/logout?logout=[]` | `controllers/ws.controller.ts` | `models/startEndDay.model.ts` |
| Customer invoice lookup | `/api/ws/getcustinv` | `controllers/ws.controller.ts` | `models/wsLookup.model.ts` |
| Customer balance lookup | `/api/ws/getcustomerbalance` | `controllers/ws.controller.ts` | `models/wsLookup.model.ts` |
| Customer item group lookup | `/api/ws/getcustomeritemgrp`, `/api/ws/getcustomeritemgrp/routeid/:routeid` | `controllers/ws.controller.ts` | `models/wsLookup.model.ts` |
| Delivery lookup | `/api/ws/getdelivery` | `controllers/ws.controller.ts` | `models/wsLookup.model.ts` |
| Order status lookup | `/api/ws/getorderstatus`, `/api/ws/getorderstatus/routeid/:routeid` | `controllers/ws.controller.ts` | `models/wsLookup.model.ts` |
| Visual data lookup | `/api/ws/getvisualdata`, `/api/ws/getvisualdata/routeid/:routeid` | `controllers/ws.controller.ts` | `models/wsLookup.model.ts` |
| Warehouse stock lookup | `/api/ws/getwarehousestock`, `/api/ws/getwarehousestock/routeid/:routeid` | `controllers/ws.controller.ts` | `models/wsLookup.model.ts` |
| WH stock lookup | `/api/ws/getwhstock` | `controllers/ws.controller.ts` | `models/wsLookup.model.ts` |

## Customer And Transaction Lookups

| Mobile Purpose | Endpoint | Controller | Service/Repository |
| --- | --- | --- | --- |
| Customer master by customer | `/api/customer/customermaster/routecode/:routecode/customercode/:customercode` | `controllers/ws.controller.ts` | `models/wsLookup.model.ts` |
| Transaction data | `/api/transaction/trandata/routekey/:routekey` | `controllers/ws.controller.ts` | `models/transactionLookup.model.ts` |
| Import inventory count | `/api/transaction/importinventorycount/routecode/:routecode` | `controllers/ws.controller.ts` | `models/transactionLookup.model.ts` |

## Accepted Gap

The mobile app still contains calls from `review/printoption.html`:

- `/api/ws/getapheader`
- `/api/ws/getapdetail`
- `/api/ws/getcashdetail`

These are not currently implemented because they were marked as not required during migration review.

