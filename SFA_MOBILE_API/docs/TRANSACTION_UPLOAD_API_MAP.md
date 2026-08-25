# Transaction Upload API Map

This document maps the current PhoneGap mobile transaction upload flow to the legacy Zend API and stored procedures. The purpose is to prepare the next Node.js migration module without changing the mobile app URLs.

## Current Mobile Flow

After login and master data sync, the mobile app writes offline transactions into local SQLite tables. When the user sends data, the app collects those local rows into JavaScript objects and posts them to the legacy API.

Main active transaction upload endpoint:

```text
POST /api/sync/senddata
```

Node status: request parsing, route/customer visit status, customer master, sales, orders, collections, inventory, customer/service, route targets, FOC balance, end-day upload detail, audit/extra groups, and route-close post-processing are implemented.

Day start endpoint:

```text
GET /api/ws/senddata?startday=[{...}]
```

Day end endpoint:

```text
GET /api/ws/endday?endday=[{...}]
```

Logout endpoint:

```text
GET /api/ws/logout?logout=[{...}]
```

Route sequence customer status endpoint used by Java:

```text
POST /api/sync/custseq
```

Image upload endpoint:

```text
POST /api/image/upload
```

## Mobile App Call Sites

| Mobile file | Endpoint | Purpose |
| --- | --- | --- |
| `SFA_ENHANCE_HHT/assets/www/js/sync.js` | `sync/senddata` | Main upload of invoice, order, AR, inventory, customer activity, survey, route, and end-day related transaction arrays. |
| `SFA_ENHANCE_HHT/assets/www/js/common.js` | `ws/senddata?startday=[...]` | Starts route day and creates/returns route key, start date, start time, and start odometer. |
| `SFA_ENHANCE_HHT/assets/www/startofday/startofday.html` | `ws/senddata?startday=[...]` | Start-day screen also calls the same start-day API. |
| `SFA_ENHANCE_HHT/assets/www/settlement/managesettlement.html` | `ws/endday?endday=[...]` | Sends settlement/end-day totals. |
| `SFA_ENHANCE_HHT/assets/www/utilities/utilities.html` | `ws/logout?logout=[...]` | Clears route login key/logout state. |
| `SFA_ENHANCE_HHT/src/com/phonegap/sfa/WizzitIndent.java` | `sync/custseq` | Sends route sequence customer status from native Java flow. |
| `SFA_ENHANCE_HHT/assets/www/js/sync.js` and upload utility screens | `image/upload` | Uploads captured images separately from transaction JSON. |

There are backup/original files with the same calls. For migration, the active files above should be treated as the primary source, then backup files can be used only for comparison.

## Main Payload: `sync/senddata`

The mobile app posts many optional fields in one request. Each field is usually a JSON array serialized as a form value.

Important request fields:

| Request field | Business meaning |
| --- | --- |
| `invoiceheader` | Invoice header transactions. |
| `invoicedetail` | Invoice item/detail rows. |
| `invoicerxddetail` | Invoice return/expiry/detail extension rows. |
| `promotiondetail` | Promotion rows applied during sales. |
| `customerinvoice` | Customer invoice balance/payment linkage. |
| `salesorderheader` | Sales order header transactions. |
| `salesorderdetail` | Sales order item/detail rows. |
| `orderrxddetail` | Sales order return/expiry/detail extension rows. |
| `batchexpirydetail` | Batch/expiry detail rows. |
| `arheader` | Accounts receivable collection header. |
| `ardetail` | Accounts receivable collection details. |
| `cashcheckdetail` | Cash/check collection details. |
| `inventorytransactionheader` | Inventory movement/count header. |
| `inventorytransactiondetail` | Inventory movement/count detail. |
| `inventorysummarydetail` | Inventory summary detail. |
| `nonservicedcustomer` | No-sale or not-serviced customer records. |
| `surveyauditdetail` | Survey audit answers. |
| `posequipmentchangedetail` | POS equipment changes. |
| `posmaster` | POS master changes. |
| `sigcapturedata` | Signature capture data. |
| `customermaster` | New/updated customer data from device. |
| `customeroperationscontrol` | Customer operation/control status. |
| `customervisitlog` | Visit log tracking. |
| `routemaster` | Route master updates from device. |
| `customerinventorydetail` | Customer inventory details. |
| `customerinventorycheck` | Customer inventory check rows. |
| `customerdistributioncheck` | Distribution check rows. |
| `routesequencecustomerstatus` | Customer sequence/status updates for route. |
| `routegoal` | Route goal updates. |
| `nosalesheader` | No-sale header rows. |
| `customer_foc_balance` | Customer FOC balance updates. |
| `enddaydetail` | End-day detail rows included in main upload. |
| `t_access_override_log` | Access override audit log. |
| `customerimages` | Customer image metadata. |
| `routekey` | Current route key. |
| `routecode` | Current route code. |
| `routeclosed` | Route close flag. |
| `userid` | Salesman/user id. |

## Legacy PHP Mapping

### `SyncController::senddataAction`

Legacy file:

```text
application/modules/api/controllers/mobileApi/SyncController.php
```

| Request field | Legacy stored procedure |
| --- | --- |
| `customeroperationscontrol` | `sp_ws_getdata_from_customeroperationcontrol` |
| `customervisitlog` | `sp_ws_getdata_from_customervisitlog` |
| `customermaster` | `sp_ws_get_from_customermaster` |
| `routemaster` | `sp_ws_getdata_from_routemaster` |
| `invoiceheader` | `sp_ws_getdata_invoiceheader` |
| `invoicedetail` | `sp_ws_getdata_from_tablet` |
| `invoicerxddetail` | `sp_ws_getdata_from_invoicerxddetail` |
| `salesorderheader` | `sp_ws_getdata_from_salesorderheader` |
| `salesorderdetail` | `sp_ws_getdata_from_salesorderdetail` |
| `orderrxddetail` | `sp_ws_getdata_from_orderrxddetail` |
| `promotiondetail` | `sp_ws_getdata_from_promotiondetail` |
| `batchexpirydetail` | `sp_ws_getdata_from_batchdetail` |
| `arheader` | `sp_ws_getdata_from_arheader` |
| `ardetail` | `sp_ws_getdata_from_ardetail` |
| `cashcheckdetail` | `sp_ws_getdata_from_cashcheckdetail` |
| `customerinvoice` | `sp_ws_getdata_from_customerinvoice` |
| `inventorytransactionheader` | `sp_ws_getdata_from_inventorytransactionheader` |
| `inventorytransactiondetail` | `sp_ws_getdata_from_inventorytransactiondetail` |
| `inventorysummarydetail` | `sp_ws_getdata_from_inventorysummarydetail` |
| `nonservicedcustomer` | `sp_ws_getdata_from_nonservicedcustomer` |
| `surveyauditdetail` | `sp_ws_getdata_from_surveyauditdetail` |
| `posequipmentchangedetail` | `sp_ws_getdata_from_posequipmentchangedetail` |
| `posmaster` | `sp_ws_getdata_from_posmaster` |
| `sigcapturedata` | `sp_ws_getdata_from_sigcaptchdata` |
| `customerinventorydetail` | `sp_ws_get_from_customerinventorydetail` |
| `routesequencecustomerstatus` | `sp_ws_get_from_routesequencecustomerstatus` |
| `nosalesheader` | `sp_ws_get_from_nosalesheader` |
| `routegoal` | `sp_ws_get_from_rotuegoal` |
| `customer_foc_balance` | `sp_ws_getfrom_customer_foc_balance` |
| `enddaydetail` | `sp_ws_getfrom_table_enddaydetail` |
| `customerimages` | `sp_add_merchandize_index_addcustomerimages` |
| `t_access_override_log` | `sp_ws_getdata_from_t_access_override_log` |
| `customerdistributioncheck` | `sp_ws_get_from_customerdistributioncheck` |
| `customerinventorycheck` | `sp_ws_get_from_customerinventorycheck` |

After processing the arrays, legacy code also checks route close and post-processing logic:

| Legacy behavior | Stored procedure |
| --- | --- |
| Check whether route is closed | `sp_check_isroute_closed` |
| Recalculate suggested sales after route filter | `recallpostsuggestedsalesinvoiceafterroutefilter` |
| Recalculate average sales quantity | `sp_cron_average_sales_quantity` |

### Other Legacy Sync Actions

| Legacy action | Endpoint | Stored procedure | Purpose |
| --- | --- | --- | --- |
| `SyncController::custseqAction` | `POST /api/sync/custseq` | `sp_ws_get_from_routesequencecustomerstatus` | Uploads route sequence customer status from Java. Implemented in Node with direct SQL. |
| `SyncController::invtxndetailAction` | `/api/sync/invtxndetail` | `sp_ws_upload_inv_detl` | Uploads missing invoice detail lines in a specialized path. Implemented in Node with direct SQL. |
| `SyncController::artxndetailAction` | `/api/sync/artxndetail` | `sp_ws_upload_ar_detl` | Uploads missing AR detail lines in a specialized path. Implemented in Node with direct SQL. |

### `WsController`

Legacy file:

```text
application/modules/api/controllers/mobileApi/WsController.php
```

| Legacy action | Endpoint | Stored procedure | Purpose |
| --- | --- | --- | --- |
| `senddataAction` | `GET /api/ws/senddata?startday=[...]` | `sp_ws_stratendday` | Starts route day and returns route key/start details. Implemented in Node with direct SQL. |
| `enddayAction` | `GET /api/ws/endday?endday=[...]` | `sp_ws_from_tablet_endday` | Saves route settlement/end-day totals. Implemented in Node with direct SQL. |
| `logoutAction` | `GET /api/ws/logout?logout=[...]` | `sp_ws_delete_routekey` | Legacy logout route. Implemented in Node with the same no-write lookup behavior. |
| `checkloadAction` | `/api/ws/checkload` | `sp_ws_tablet_check_load` | Checks route load status. Implemented in Node with direct SQL. |
| `routetrack11Action` | `/api/ws/routetrack1` | `sp_ws_getdata_from_routetrack` | Legacy route GPS tracking. Current Java points to a separate microservice. |
| `routetrack21Action` | `/api/ws/routetrack2` | `sp_ws_getdata_from_deviceroutetrack` | Legacy device route GPS tracking. Current Java points to a separate microservice. |

## Supporting Read APIs Used Near Transactions

These are not the main upload APIs, but the mobile app calls them during selling, ordering, settlement, or customer screens.

| Endpoint | Legacy stored procedure | Purpose |
| --- | --- | --- |
| `/api/ws/getdelivery?delivery=[...]` | `sp_ws_getdata_delivery` | Gets delivery header/detail search results. Implemented in Node with direct SQL. |
| `/api/ws/getwhstock?whstock=[...]` | `sp_ws_getdata_whstock` | Gets item warehouse stock by route. Implemented in Node with direct SQL. |
| `/api/ws/getcustinv?tempcustomerinventory=[...]` | `sp_ws_get_from_tempcustomerinventory` | Uploads temporary customer inventory rows. Implemented in Node with direct SQL. |
| `/api/ws/getcustomerbalance?customerbalance=[...]` | `sp_ws_getcustomer_balance` | Gets current customer balance. Implemented in Node with direct SQL. |
| `/api/ws/getwarehousestock?userid={userid}&routeid={routeid}` | `sp_ws_tablet_get_warehousestock` | Gets warehouse stock while ordering/loading. Implemented in Node with direct SQL. |
| `/api/ws/getorderstatus?userid={userid}&routeid={routeid}` | `sp_ws_tablet_get_deliveryorderstatus` | Gets delivery/order status. Implemented in Node with direct SQL. |
| `/api/ws/getcustomeritemgrp?userid={userid}&deviceid={deviceid}&routeid={routeid}` | `sp_ws_syncicsdata_customeritemgrp` | Gets customer item group data. Implemented in Node with direct SQL. |
| `/api/ws/getcustomeroutstanding/...` | `sp_ws_syncicsdata_customeroutstanding` | Gets customer outstanding data. |
| `/api/ws/getvisualdata?userid={userid}&routeid={routeid}` | `sp_ws_syncicsdata_visualdata` | Gets visual merchandising data. Implemented in Node with direct SQL. |
| `/api/customer/customermaster/routecode/{routecode}/customercode/{customercode}` | `sp_ws_getcustormaster` | Gets one customer row plus route `usealternatecodes`. Implemented in Node with direct SQL; legacy procedure is missing from the checked SQL dump. |
| `/api/transaction/trandata/routekey/{routekey}` | `sp_ws_transactiondata` | Gets cloud transaction counts for settlement/import verification. Implemented in Node with direct SQL. |
| `/api/transaction/importinventorycount/routecode/{routecode}` | `sp_ws_importinventory_counts` | Gets imported load and inventory count totals. Implemented in Node with direct SQL. |
| `/api/index/updatesyncdate/userid/{userid}/deviceid/{deviceid}/routecode/{routecode}/routekey/{routekey}/routeclosed/{routeclosed}` | `sp_ws_updatesyncdate`, `sp_ws_instertion_tbl_synclog` | Records successful sync timestamp and sync log. Implemented in Node with direct SQL. |

## Current Node Module

Module name:

```text
src/modules/mobile/transactions
```

Current file layout:

```text
ws/ws.routes.ts
ws/ws.controller.ts
ws/ws.service.ts
ws/repository/startEndDay.repository.ts
ws/types/startEndDay.types.ts
transactions/transactions.routes.ts
transactions/transactions.controller.ts
transactions/transactions.types.ts
transactions/senddata.service.ts
transactions/repository/transaction.repository.ts
transactions/repository/shared.repository.ts
transactions/repository/routeActivity.repository.ts
transactions/repository/sales.repository.ts
transactions/repository/orders.repository.ts
transactions/repository/collections.repository.ts
transactions/repository/inventory.repository.ts
transactions/repository/customerService.repository.ts
transactions/repository/auditExtra.repository.ts
transactions/repository/routeClose.repository.ts
transactions/types/shared.types.ts
transactions/types/routeActivity.types.ts
transactions/types/sales.types.ts
transactions/types/orders.types.ts
transactions/types/collections.types.ts
transactions/types/inventory.types.ts
transactions/types/customerService.types.ts
transactions/types/auditExtra.types.ts
transactions/types/senddata.types.ts
```

The public routes remain compatible with the mobile app:

```text
/api/sync/senddata
/api/sync/custseq
/api/ws/senddata
/api/ws/endday
/api/ws/logout
```

Service responsibility split:

| File | Responsibility |
| --- | --- |
| `ws/ws.routes.ts` | Registers `/api/ws/*` URLs including start day, end day, and logout. |
| `ws/ws.controller.ts` | Fastify request/reply bridge for WS endpoints. |
| `ws/ws.service.ts` | Handles `/api/ws/senddata` start day, `/api/ws/endday`, and `/api/ws/logout`. |
| `transactions/transactions.routes.ts` | Registers `/api/sync/senddata` and `/api/sync/custseq`. |
| `transactions/transactions.controller.ts` | Fastify request/reply bridge for sync transaction endpoints. |
| `transactions/senddata.service.ts` | Handles `POST /api/sync/senddata` batch upload and `POST /api/sync/custseq` customer sequence status. |

Type responsibility split:

| File | Responsibility |
| --- | --- |
| `transactions/transactions.types.ts` | Barrel export for backward-compatible transaction imports. No direct type definitions should be added here. |
| `ws/types/startEndDay.types.ts` | Start-day, end-day, logout, route hierarchy, and created start-day response types. |
| `transactions/types/shared.types.ts` | Shared Fastify request/reply aliases and generic legacy upload item shape. |
| `transactions/types/routeActivity.types.ts` | Customer operation control, visit log, route master upload, and route sequence status types. |
| `transactions/types/sales.types.ts` | Invoice, invoice detail, invoice RX detail, promotion detail, customer invoice, and batch expiry types. |
| `transactions/types/orders.types.ts` | Sales order header/detail and order RX detail types. |
| `transactions/types/collections.types.ts` | AR header/detail and cash/check collection types. |
| `transactions/types/inventory.types.ts` | Inventory transaction header/detail and inventory summary types. |
| `transactions/types/customerService.types.ts` | Non-service, no-sale, customer inventory, distribution check, route goal, FOC balance, and end-day detail types. |
| `transactions/types/auditExtra.types.ts` | Survey audit, POS equipment, POS master, customer image, and access override types. |
| `transactions/types/senddata.types.ts` | Send-data array field list, parsed payload, and response shape. |

Repository responsibility split:

| File | Responsibility |
| --- | --- |
| `ws/repository/startEndDay.repository.ts` | Start-day, end-day, logout route-key lookup, and route version/date checks. |
| `transactions/repository/transaction.repository.ts` | Barrel export for backward-compatible transaction imports. No SQL implementation should be added here. |
| `transactions/repository/shared.repository.ts` | Shared row types and value helpers used by transaction repositories. |
| `transactions/repository/routeActivity.repository.ts` | Customer operation control, visit log, route master upload, and customer route sequence status. |
| `transactions/repository/sales.repository.ts` | Invoice, invoice detail, invoice RX detail, promotion detail, customer invoice, and batch expiry SQL. |
| `transactions/repository/orders.repository.ts` | Sales order header/detail and order RX detail SQL. |
| `transactions/repository/collections.repository.ts` | AR header/detail and cash/check collection SQL. |
| `transactions/repository/inventory.repository.ts` | Inventory transaction header/detail and inventory summary SQL. |
| `transactions/repository/customerService.repository.ts` | Non-service, no-sale, customer inventory, distribution check, route goal, FOC balance, and end-day detail SQL. |
| `transactions/repository/auditExtra.repository.ts` | Survey audit, POS equipment, POS master, customer image, and access override SQL. |
| `transactions/repository/routeClose.repository.ts` | Sync log, route-close check, suggested sales rebuild, posting cleanup, and average sales rebuild SQL. |

Current refactor status: service, type definitions, and SQL repository implementations are now split by business model.

## Migration Order

1. Implement day start: `/api/ws/senddata?startday=[...]`. Done.
2. Implement day end: `/api/ws/endday?endday=[...]`. Done.
3. Implement logout: `/api/ws/logout?logout=[...]`. Done.
4. Implement `POST /api/sync/custseq` for route sequence customer status. Done.
5. Implement request parsing for `POST /api/sync/senddata` and preserve the same response keys expected by the mobile app. Done.
6. Implement main transaction groups inside `sync/senddata` in this order:
   - route/customer activity: `customeroperationscontrol`, `customervisitlog`, `routemaster`, `routesequencecustomerstatus`. Done.
   - sales: `invoiceheader`, `invoicedetail`, `invoicerxddetail`, `promotiondetail`, `customerinvoice`, `batchexpirydetail`. Done.
   - orders: `salesorderheader`, `salesorderdetail`, `orderrxddetail`. Done.
   - collections: `arheader`, `ardetail`, `cashcheckdetail`. Done.
   - inventory: `inventorytransactionheader`, `inventorytransactiondetail`, `inventorysummarydetail`. Done.
   - customer/service: `nonservicedcustomer`, `nosalesheader`, `customerinventorydetail`, `customerinventorycheck`, `customerdistributioncheck`. Done.
   - route targets: `routegoal`. Done.
   - FOC balance: `customer_foc_balance`. Done. Legacy PHP returns `customercode` from `itemcode` and `itemcode` from `originalqty`; Node preserves that acknowledgment shape for mobile compatibility.
   - end-day upload detail: `enddaydetail`. Done. Legacy acknowledges this from `ardetail` rows for the route after inserting `enddaydetail`; Node preserves that condition.
   - audit/extra: `surveyauditdetail`, `posequipmentchangedetail`, `posmaster`, `customerimages`, `t_access_override_log`. Done.
   - signature capture: `sigcapturedata`. Legacy PHP disables this upload branch, so Node keeps it as an empty response array for compatibility.
7. Implement route-close post-processing after all upload arrays are saved. Done. Node inserts `synclog`, checks closed route status, rebuilds suggested sales, runs data-posting cleanup, and rebuilds average sales quantity with direct SQL.
8. Compare every Node write query with the legacy stored procedure body before enabling production users. In progress; see validation matrix below.

## `sync/senddata` Validation Matrix

| Payload key | Legacy procedure/process | Node status | Notes |
| --- | --- | --- | --- |
| `customeroperationscontrol` | `sp_ws_getdata_from_customeroperationcontrol` | Implemented | Insert-if-missing by `routekey + visitkey`. |
| `customervisitlog` | `sp_ws_getdata_from_customervisitlog` | Implemented | Upsert by `routekey + logkey`. |
| `routemaster` | `sp_ws_getdata_from_routemaster` | Implemented | Updates mobile sequence/balance fields. |
| `routesequencecustomerstatus` | `sp_ws_get_from_routesequencecustomerstatus` | Implemented | Shared with `POST /api/sync/custseq`. |
| `invoiceheader` | `sp_ws_getdata_invoiceheader` | Implemented | Maps mobile transaction key to server transaction key. |
| `invoicedetail` | `sp_ws_getdata_from_tablet` | Implemented | Uses mapped invoice transaction key. |
| `invoicerxddetail` | `sp_ws_getdata_from_invoicerxddetail` | Implemented | Uses mapped invoice transaction key. |
| `promotiondetail` | `sp_ws_getdata_from_promotiondetail` | Implemented | Split by `itemtransactiontype`; invoice rows and order rows handled separately. |
| `customerinvoice` | `sp_ws_getdata_from_customerinvoice` | Implemented | Insert/update by invoice number behavior. |
| `batchexpirydetail` | `sp_ws_getdata_from_batchdetail` | Implemented | Respects `controlpanel.flagid = 1` status. |
| `salesorderheader` | `sp_ws_getdata_from_salesorderheader` | Implemented | Maps mobile transaction key to server transaction key. |
| `salesorderdetail` | `sp_ws_getdata_from_salesorderdetail` | Implemented | Uses mapped order transaction key. |
| `orderrxddetail` | `sp_ws_getdata_from_orderrxddetail` | Implemented | Uses mapped order transaction key. |
| `arheader` | `sp_ws_getdata_from_arheader` | Implemented | Maps mobile transaction key to server transaction key. |
| `ardetail` | `sp_ws_getdata_from_ardetail` | Implemented | Uses mapped AR transaction key. |
| `cashcheckdetail` | `sp_ws_getdata_from_cashcheckdetail` | Implemented | Truncates long check numbers like legacy safeguards. |
| `inventorytransactionheader` | `sp_ws_getdata_from_inventorytransactionheader` | Implemented | Maps mobile `detailkey` to server `detailkey`. |
| `inventorytransactiondetail` | `sp_ws_getdata_from_inventorytransactiondetail` | Implemented | Uses mapped inventory header detail key. |
| `inventorysummarydetail` | `sp_ws_getdata_from_inventorysummarydetail` | Implemented | Rebuilds van stock/value formulas directly. |
| `nonservicedcustomer` | `sp_ws_getdata_from_nonservicedcustomer` | Implemented | Insert-if-missing by `routekey + customercode`. |
| `nosalesheader` | `sp_ws_get_from_nosalesheader` | Implemented | Insert-only like legacy. |
| `customerinventorydetail` | `sp_ws_get_from_customerinventorydetail` | Implemented | Duplicate update preserves legacy `qtyloc1each` only behavior. |
| `customerinventorycheck` | `sp_ws_get_from_customerinventorycheck` | Implemented | Insert-only on duplicate, like legacy. |
| `customerdistributioncheck` | `sp_ws_get_from_customerdistributioncheck` | Implemented | Insert/update by `customercode + routekey + visitkey + itemcode`. |
| `routegoal` | `sp_ws_get_from_rotuegoal` | Implemented | Insert-only; `yyear` accepted by legacy but not inserted. |
| `customer_foc_balance` | `sp_ws_getfrom_customer_foc_balance` | Implemented | Preserves legacy odd response mapping for mobile sync flags. |
| `enddaydetail` | `sp_ws_getfrom_table_enddaydetail` | Implemented | Preserves legacy acknowledgment condition from `ardetail`. |
| `surveyauditdetail` | `sp_ws_getdata_from_surveyauditdetail` | Implemented | Insert/update by `routekey + visitkey + surveydefkey`. |
| `posequipmentchangedetail` | `sp_ws_getdata_from_posequipmentchangedetail` | Implemented with safety fix | Legacy duplicate update has no `WHERE`; Node updates matching `routekey + visitkey + itemcode` only. |
| `posmaster` | `sp_ws_getdata_from_posmaster` | Implemented | Follows stored procedure signature, not PHP's extra unused parameters. |
| `customerimages` | `sp_add_merchandize_index_addcustomerimages` | Implemented | Insert-if-missing by `imagename + routekey + customercode`. |
| `t_access_override_log` | `sp_ws_getdata_from_t_access_override_log` | Implemented | Insert-only like legacy. |
| `sigcapturedata` | Legacy branch disabled in PHP | Intentionally empty | PHP has `if(1==0)`, so Node keeps empty array for compatibility. |
| `customermaster` | `sp_ws_get_from_customermaster` | Implemented | Insert/update by `customercode`; preserves `promotionkey = 0` to `NULL` behavior and `{ customercode }` acknowledgment. |
| `visualsfeedback` | Mobile local table only | Intentionally not persisted | Mobile JS sends it and expects response rows to mark local `issync=1`, but no legacy PHP receiver, stored procedure, schema table, or current DB table was found. Node keeps the response array empty to avoid false success/data loss. |
| `promotions_remark` | Mobile local table only | Intentionally not persisted | Mobile JS sends it and expects response rows to mark local `issync=1`, but no legacy PHP receiver, stored procedure, schema table, or current DB table was found. Node keeps the response array empty to avoid false success/data loss. |
| post-processing | `sp_ws_instertion_tbl_synclog`, `sp_check_isroute_closed`, `recallpostsuggestedsalesinvoiceafterroutefilter`, `sp_cron_average_sales_quantity` | Implemented | Direct SQL replacement includes `synclog`, closed-route check, suggested-sales rebuild, data-posting cleanup, and average-sales rebuild. |

## Remaining `sync/senddata` Work

1. Run a real mobile flow test: login, master data sync, create transaction, send data, end day, logout.
2. Capture one production-like payload sample and compare response acknowledgments with legacy PHP.
3. If the business needs visual feedback or promotion remarks on the server, add confirmed server tables/process first, then enable persistence and acknowledgments for `visualsfeedback` and `promotions_remark`.

## Senior API Notes

`sync/senddata` is high risk because it is a batch write endpoint. Some mobile uploads may contain only one array, while full sync can contain many arrays together. Node must accept both styles.

For performance, use one database transaction per request, bulk inserts where safe, and idempotent duplicate handling based on the same keys used by the stored procedures. Do not change response key names because the mobile JavaScript updates local sync flags from those names.

Before coding this module, we should inspect real request payload examples from logs or a test device. That will confirm which optional arrays are active in the current production mobile workflow.
