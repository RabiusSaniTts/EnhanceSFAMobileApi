# Mobile API Endpoint Map

This document maps important PhoneGap mobile calls to the Node.js API modules.

## Auth And Device

| Mobile Purpose | Endpoint | Controller | Service/Repository |
| --- | --- | --- | --- |
| Device company lookup | `/api/index/companyidbydevice/deviceid/:deviceid` | `auth.controller.ts` | `auth.service.ts`, `auth.repository.ts` |
| Salesman login | `/api/index/salesmanlogin/username/:username/password/:password/deviceid/:deviceid` | `auth.controller.ts` | `auth.service.ts`, `auth.repository.ts` |
| Version check | `/api/index/salesmanverchk/routecode/:routecode/verno/:verno` | `auth.controller.ts` | `auth.service.ts`, `auth.repository.ts` |
| Sync date update | `/api/index/updatesyncdate/...` | `auth.controller.ts` | `auth.service.ts`, `auth.repository.ts` |

## Master Data Sync

| Mobile Purpose | Endpoint | Controller | Service/Repository |
| --- | --- | --- | --- |
| Main mobile sync | `/api/index/getsyncdata1/routeid/:routeid/userid/:userid/deviceid/:deviceid/mdate/:mdate/table/:table` | `masterdatasync.controller.ts` | `masterdatasync.service.ts`, `masterData.repository.ts`, `setting.repository.ts`, `transactionData.repository.ts` |
| Compatibility sync | `/api/index/getsyncdata/...` | `masterdatasync.controller.ts` | Same as `getsyncdata1` |

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
| Check active load | `/api/ws/checkload/routeid/:routeid/userid/:userid` | `ws.controller.ts` | `ws.service.ts`, `wsLookup.repository.ts` |
| Start day | `/api/ws/senddata?startday=[]` | `ws.controller.ts` | `ws.service.ts`, `startEndDay.repository.ts` |
| End day | `/api/ws/endday?endday=[]` | `ws.controller.ts` | `ws.service.ts`, `startEndDay.repository.ts` |
| Logout | `/api/ws/logout?logout=[]` | `ws.controller.ts` | `ws.service.ts`, `startEndDay.repository.ts` |
| Customer invoice lookup | `/api/ws/getcustinv` | `ws.controller.ts` | `wsLookup.repository.ts` |
| Customer balance lookup | `/api/ws/getcustomerbalance` | `ws.controller.ts` | `wsLookup.repository.ts` |
| Customer item group lookup | `/api/ws/getcustomeritemgrp`, `/api/ws/getcustomeritemgrp/routeid/:routeid` | `ws.controller.ts` | `wsLookup.repository.ts` |
| Delivery lookup | `/api/ws/getdelivery` | `ws.controller.ts` | `wsLookup.repository.ts` |
| Order status lookup | `/api/ws/getorderstatus`, `/api/ws/getorderstatus/routeid/:routeid` | `ws.controller.ts` | `wsLookup.repository.ts` |
| Visual data lookup | `/api/ws/getvisualdata`, `/api/ws/getvisualdata/routeid/:routeid` | `ws.controller.ts` | `wsLookup.repository.ts` |
| Warehouse stock lookup | `/api/ws/getwarehousestock`, `/api/ws/getwarehousestock/routeid/:routeid` | `ws.controller.ts` | `wsLookup.repository.ts` |
| WH stock lookup | `/api/ws/getwhstock` | `ws.controller.ts` | `wsLookup.repository.ts` |

## Customer And Transaction Lookups

| Mobile Purpose | Endpoint | Controller | Service/Repository |
| --- | --- | --- | --- |
| Customer master by customer | `/api/customer/customermaster/routecode/:routecode/customercode/:customercode` | `ws.controller.ts` | `ws.service.ts`, `transactionLookup.repository.ts` |
| Transaction data | `/api/transaction/trandata/routekey/:routekey` | `ws.controller.ts` | `ws.service.ts`, `transactionLookup.repository.ts` |
| Import inventory count | `/api/transaction/importinventorycount/routecode/:routecode` | `ws.controller.ts` | `ws.service.ts`, `transactionLookup.repository.ts` |

## Accepted Gap

The mobile app still contains calls from `review/printoption.html`:

- `/api/ws/getapheader`
- `/api/ws/getapdetail`
- `/api/ws/getcashdetail`

These are not currently implemented because they were marked as not required during migration review.

