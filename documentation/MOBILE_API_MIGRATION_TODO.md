# Mobile API Migration Todo List

This document is the step-by-step migration checklist for moving the current Zend PHP mobile API to Node.js with TypeScript.

Main rule:

```text
Do not change the PhoneGap mobile app.
Keep old endpoint paths.
Keep old request/response shape.
Use TypeScript for the new Node API code.
Do not call MySQL stored procedures from Node.js.
```

Existing fixed stack:

- Current PHP: `7.0.33`
- Current MySQL: `8.0.21`
- Current mobile app: `SFA_ENHANCE_HHT`
- Current mobile users: `2000+`
- New API language: `TypeScript`

## 1. Confirmed Mobile Workflow

The migration should follow the real mobile app workflow.

```text
1. Open mobile app
2. Device/company check
3. Salesman login
4. Version check
5. Start day/load check
6. Download sync
7. Work transactions during route
8. Transaction verification/settlement
9. Upload/send data
10. End day
11. Logout
```

This order is correct because it matches how the mobile app depends on data.

For example, we cannot safely migrate `sync/senddata` first if login, route key, start day, and sync data are not stable.

## 2. Migration Safety Rules

Before migrating each API:

- Read current Zend controller function.
- Read mobile caller file.
- Read stored procedures or table behavior currently used.
- Map procedure result sets to direct table queries.
- Keep the same top-level JSON keys.
- Keep empty arrays when no rows exist.
- Keep old misspelled keys if mobile expects them.
- Capture old Zend response for comparison.
- Build Node endpoint with same path.
- Compare old Zend response vs new Node response.
- Test with real route/user/device values.

Do not optimize by changing the mobile contract.

## 3. Phase 0 - Preparation

### Todo

- [ ] Create Node.js TypeScript project skeleton.
- [ ] Add `tsconfig.json` for strict TypeScript.
- [ ] Choose framework: recommended `Fastify` with TypeScript.
- [ ] Add MySQL connection pool using `mysql2`.
- [ ] Add environment config.
- [ ] Add build/dev scripts for TypeScript.
- [ ] Add request logging with request id.
- [ ] Add shared error handler.
- [ ] Add legacy parameter parser for Zend-style path params.
- [ ] Add response mapper utilities for null/date/number compatibility.
- [ ] Add `/health` endpoint.

### Acceptance

- [ ] Node API starts locally.
- [ ] TypeScript compile/build passes.
- [ ] MySQL connection works.
- [ ] Logs show request id and response time.
- [ ] No mobile endpoint is changed yet.

## 4. Phase 1 - Login And Device Setup

This phase makes sure the mobile app can open and login through Node API.

### APIs To Migrate

```text
/api/index/companyidbydevice/deviceid/{deviceid}
/api/index/salesmanlogin/username/{username}/password/{password}/deviceid/{deviceid}
/api/index/salesmanverchk/routecode/{routecode}/verno/{version}
```

### Current PHP Source

```text
application/modules/api/controllers/mobileApi/IndexController.php
```

### Mobile Caller Files

```text
SFA_ENHANCE_HHT/assets/www/index.html
SFA_ENHANCE_HHT/assets/www/startofday/startofday.html
SFA_ENHANCE_HHT/assets/www/utilities/utilities.html
```

### Todo

- [ ] Map `companyidbydeviceAction`.
- [ ] Replace `sp_ws_companyid_device` with direct table query.
- [ ] Replace `sp_ws_app_version` with direct table query.
- [ ] Match old response exactly.
- [ ] Map `salesmanloginAction`.
- [ ] Replace `sp_ws_salesman_login` with direct table query/business logic.
- [ ] Match login success/failure response exactly.
- [ ] Map `salesmanverchkAction`.
- [ ] Replace `sp_ws_version_check` with direct table query.
- [ ] Test device check from mobile login screen.
- [ ] Test valid login.
- [ ] Test invalid login.
- [ ] Test old app version.
- [ ] Test valid app version.

### Acceptance

- [ ] Mobile app can open.
- [ ] Mobile app can check company/device.
- [ ] Salesman can login.
- [ ] Mobile app can pass version check.
- [ ] No mobile app code changed.

## 5. Phase 2 - Start Day And Load Check

This phase makes sure a route can begin correctly before sync/work.

### APIs To Migrate

```text
/api/ws/checkload/routeid/{routeid}/userid/{userid}
/api/transaction/importinventorycount/routecode/{routecode}
/api/ws/senddata?startday=[...]
```

### Current PHP Source

```text
application/modules/api/controllers/mobileApi/WsController.php
application/modules/api/controllers/mobileApi/TransactionController.php
```

### Mobile Caller Files

```text
SFA_ENHANCE_HHT/assets/www/sync.html
SFA_ENHANCE_HHT/assets/www/startofday/startofday.html
SFA_ENHANCE_HHT/assets/www/startofday/checkinventorycount.html
SFA_ENHANCE_HHT/assets/www/inventory/checkinventorycount.html
SFA_ENHANCE_HHT/assets/www/inventory/loadselection.html
```

### Todo

- [ ] Map `WsController::checkloadAction`.
- [ ] Replace `sp_ws_tablet_check_load`.
- [ ] Map `TransactionController::importinventorycountAction`.
- [ ] Replace `sp_ws_importinventory_counts`.
- [ ] Map `WsController::senddataAction`.
- [ ] Replace `sp_ws_stratendday`.
- [ ] Parse old `startday=[...]` request format.
- [ ] Preserve old response status values.
- [ ] Test route with load.
- [ ] Test route without load.
- [ ] Test start day success.
- [ ] Test duplicate/open route behavior.

### Acceptance

- [ ] Mobile app can check load.
- [ ] Mobile app can import inventory count.
- [ ] Mobile app can begin day.
- [ ] Route key/start day behavior matches old Zend API.

## 6. Phase 3 - Download Sync

This is the most important read API.

### Main Active Sync API

```text
/api/index/getsyncdata1/routeid/{routeid}/userid/{userid}/deviceid/{deviceid}/mdate/{mdate}/table/{table}
```

### Current PHP Source

```text
application/modules/api/controllers/mobileApi/IndexController.php
```

### Mobile Flow

```text
SFA_ENHANCE_HHT/assets/www/sync.html
  -> syncMsg()
  -> getcustomeritmdata()
  -> plugins.WizzitIndent.sync(...)
  -> SFA_ENHANCE_HHT/src/com/phonegap/sfa/WizzitIndent.java
  -> /api/index/getsyncdata1
  -> Java parses JSON
  -> Java inserts/updates SQLite
```

### Todo

- [ ] Read `getsyncdata1Action` completely.
- [ ] List every response key returned by `getsyncdata1Action`.
- [ ] Read `WizzitIndent.java` and list every JSON key it reads.
- [ ] Map each stored procedure call to direct table queries.
- [ ] Implement repository method for settings data.
- [ ] Implement repository method for item must data.
- [ ] Implement repository method for item data.
- [ ] Implement repository method for inventory data.
- [ ] Implement repository method for customer data.
- [ ] Implement repository method for scheme/pricing/promo data.
- [ ] Implement repository method for survey/POS data.
- [ ] Implement repository method for reason data.
- [ ] Implement repository method for other master data.
- [ ] Implement repository method for order data.
- [ ] Implement repository method for delete master data.
- [ ] Implement repository method for customer item group/mapping data.
- [ ] Build mapper for exact old JSON structure.
- [ ] Build `synccount`.
- [ ] Add per-section timing logs.
- [ ] Compare old Zend response vs Node response.
- [ ] Test small route.
- [ ] Test large route.
- [ ] Test route with no rows in some sections.
- [ ] Test bad route/device/user inputs.

### Expected Critical Response Keys

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

### Acceptance

- [ ] Mobile sync button calls Node endpoint.
- [ ] `WizzitIndent.java` can parse response without error.
- [ ] Local SQLite tables are populated.
- [ ] Mobile navigates to `home/home.html` after sync.
- [ ] Response keys and row counts match Zend baseline.
- [ ] Sync performance is equal or better than Zend baseline.

## 7. Phase 4 - Update Sync Date

### API To Migrate

```text
/api/index/updatesyncdate/userid/{userid}/deviceid/{deviceid}/routecode/{routecode}/routekey/{routekey}/routeclosed/{routeclosed}
```

### Current PHP Source

```text
application/modules/api/controllers/mobileApi/IndexController.php
```

### Mobile Caller File

```text
SFA_ENHANCE_HHT/assets/www/sync.html
```

### Todo

- [ ] Map `updatesyncdateAction`.
- [ ] Replace `sp_ws_updatesyncdate`.
- [ ] Replace `sp_ws_instertion_tbl_synclog`.
- [ ] Preserve old response format.
- [ ] Confirm sync completion navigates correctly.

### Acceptance

- [ ] Mobile app marks sync complete.
- [ ] Sync log is written.
- [ ] Route/date/device sync state matches old Zend behavior.

## 8. Phase 5 - Route Work APIs

These APIs support customer, order, stock, balance, delivery status, and merchandising screens.

### APIs To Migrate

```text
/api/customer/customermaster/routecode/{routecode}/customercode/{customercode}
/api/ws/getcustomerbalance?customerbalance=[...]
/api/ws/getwarehousestock/routeid/{routeid}
/api/ws/getwarehousestock/routeid/{routeid}/userid/{userid}
/api/ws/getwhstock?whstock=[...]
/api/ws/getcustinv
/api/ws/getdelivery?delivery=[...]
/api/ws/getorderstatus/routeid/{routeid}
/api/ws/getcustomeritemgrp/routeid/{routeid}
/api/ws/getvisualdata/routeid/{routeid}
```

### Current PHP Source

```text
application/modules/api/controllers/mobileApi/CustomerController.php
application/modules/api/controllers/mobileApi/WsController.php
```

### Todo

- [ ] Migrate customer master lookup.
- [ ] Migrate customer balance.
- [ ] Migrate warehouse stock.
- [ ] Migrate order request stock.
- [ ] Migrate customer inventory check.
- [ ] Migrate delivery tracking data.
- [ ] Migrate order status.
- [ ] Migrate customer item group.
- [ ] Migrate visual merchandising data.
- [ ] Test each related mobile screen.

### Acceptance

- [ ] Customer selection works.
- [ ] Customer balance loads.
- [ ] Order item stock loads.
- [ ] Order status loads.
- [ ] Customer inventory check works.
- [ ] Merchandising screen loads visual data.

## 9. Phase 6 - Transaction Verification And Settlement

### API To Migrate

```text
/api/transaction/trandata/routekey/{routekey}
```

### Current PHP Source

```text
application/modules/api/controllers/mobileApi/TransactionController.php
```

### Mobile Caller Files

```text
SFA_ENHANCE_HHT/assets/www/utilities/verification.html
SFA_ENHANCE_HHT/assets/www/utilities/import_verification.html
SFA_ENHANCE_HHT/assets/www/settlement/settlementaudit.html
SFA_ENHANCE_HHT/assets/www/settlement/managesettlement.html
```

### Todo

- [ ] Map `trandataAction`.
- [ ] Replace `sp_ws_transactiondata`.
- [ ] Preserve response structure.
- [ ] Test utility verification.
- [ ] Test settlement audit.
- [ ] Test manage settlement flow.

### Acceptance

- [ ] Transaction verification screen loads.
- [ ] Settlement audit data matches Zend response.
- [ ] No missing transaction sections.

## 10. Phase 7 - Image Upload

### APIs To Migrate

```text
/api/image/upload
/api/sync/senddata
```

Image upload has two parts:

- Actual image file upload through `image/upload`.
- Customer image metadata upload through `sync/senddata`.

### Current PHP Source

```text
application/modules/api/controllers/mobileApi/ImageController.php
application/modules/api/controllers/mobileApi/SyncController.php
```

### Mobile Caller Files

```text
SFA_ENHANCE_HHT/assets/www/js/sync.js
SFA_ENHANCE_HHT/assets/www/utilities/uploaddata.html
```

### Todo

- [ ] Map image upload path/storage behavior.
- [ ] Preserve accepted field names and file upload format.
- [ ] Preserve image response format.
- [ ] Map customer image metadata upload inside `sync/senddata`.
- [ ] Test one image upload.
- [ ] Test multiple images.
- [ ] Test failed upload behavior.

### Acceptance

- [ ] Mobile image upload succeeds.
- [ ] Uploaded file path/name matches old behavior where required.
- [ ] Customer image metadata syncs.

## 11. Phase 8 - Main Upload / Send Data

This is the highest-risk write API.

### API To Migrate

```text
/api/sync/senddata
```

### Current PHP Source

```text
application/modules/api/controllers/mobileApi/SyncController.php
```

### Mobile Caller Files

```text
SFA_ENHANCE_HHT/assets/www/js/sync.js
SFA_ENHANCE_HHT/assets/www/js/common.js
SFA_ENHANCE_HHT/assets/www/js/upload.js
SFA_ENHANCE_HHT/assets/www/utilities/uploaddata.html
SFA_ENHANCE_HHT/assets/www/settlement/settlementaudit.html
```

### Payload Sections To Map

```text
customervisitlog
customeroperationscontrol
customermaster
routemaster
invoiceheader
invoicedetail
invoicerxddetail
promotiondetail
salesorderheader
salesorderdetail
orderrxddetail
batchexpirydetail
arheader
ardetail
cashcheckdetail
inventorytransactionheader
inventorytransactiondetail
inventorysummarydetail
nonservicedcustomer
surveyauditdetail
posequipmentchangedetail
posmaster
sigcapturedata
customerinventorydetail
routesequencecustomerstatus
routegoal
nosalesheader
customer_foc_balance
enddaydetail
t_access_override_log
customerinventorycheck
customerimages
```

### Todo

- [ ] Read full `SyncController::senddataAction`.
- [ ] List every payload section.
- [ ] List every stored procedure currently called.
- [ ] Map each procedure to direct table operations.
- [ ] Define processing order.
- [ ] Identify parent-child key dependencies.
- [ ] Implement request parser for old JSON/string payloads.
- [ ] Implement DB transaction wrapper.
- [ ] Implement each payload processor separately.
- [ ] Add idempotency checks where old logic avoids duplicates.
- [ ] Add per-section timing logs.
- [ ] Add per-section row count logs.
- [ ] Preserve old success response format.
- [ ] Preserve old failure behavior as much as possible.
- [ ] Test with one simple invoice.
- [ ] Test with order + AR + cash/check.
- [ ] Test with inventory transaction.
- [ ] Test with customer change.
- [ ] Test with route close/end-day detail.
- [ ] Test retry behavior after failure.

### Recommended Processing Order

```text
1. Customer and route changes
2. Visit/customer activity
3. Invoice/order headers
4. Invoice/order details
5. AR/cash/check
6. Inventory transaction header
7. Inventory transaction detail
8. Survey/POS
9. Customer inventory/route sequence
10. End-day detail
11. Images metadata
12. Sync log/route close checks
```

### Acceptance

- [ ] Mobile Send Data completes.
- [ ] Server rows match old Zend behavior.
- [ ] Mobile local rows can be marked synced.
- [ ] Retry does not duplicate critical rows.
- [ ] Transaction rollback works for failed critical writes.
- [ ] Performance is acceptable for production load.

## 12. Phase 9 - End Day

### API To Migrate

```text
/api/ws/endday?endday=[...]
```

### Current PHP Source

```text
application/modules/api/controllers/mobileApi/WsController.php
```

### Mobile Caller File

```text
SFA_ENHANCE_HHT/assets/www/settlement/managesettlement.html
```

### Todo

- [ ] Map `enddayAction`.
- [ ] Replace `sp_ws_from_tablet_endday`.
- [ ] Parse old `endday=[...]` request format.
- [ ] Preserve response behavior.
- [ ] Test settlement complete.
- [ ] Test settlement report navigation.

### Acceptance

- [ ] End day succeeds.
- [ ] Route close state matches old behavior.
- [ ] Settlement report flow works.

## 13. Phase 10 - Logout

### API To Migrate

```text
/api/ws/logout?logout=[...]
```

### Current PHP Source

```text
application/modules/api/controllers/mobileApi/WsController.php
```

### Mobile Caller Files

```text
SFA_ENHANCE_HHT/assets/www/utilities/utilities.html
SFA_ENHANCE_HHT/assets/www/utilities/miscellaneous.html
SFA_ENHANCE_HHT/assets/www/startofday/startofday.html
```

### Todo

- [ ] Map `logoutAction`.
- [ ] Replace `sp_ws_delete_routekey`.
- [ ] Parse old `logout=[...]` request format.
- [ ] Preserve response behavior.
- [ ] Test logout before route start.
- [ ] Test logout after sync.
- [ ] Test logout after end day.

### Acceptance

- [ ] Mobile clears session/local storage as before.
- [ ] User returns to login screen.
- [ ] Server route key/session state matches old behavior.

## 14. Final End-To-End Test

Run this full mobile workflow against Node API:

```text
1. Open app
2. Company/device check
3. Login
4. Version check
5. Check load
6. Start day
7. Download sync using getsyncdata1
8. Open customer
9. Create transaction/order/invoice
10. Verify transaction data
11. Upload image if needed
12. Send data
13. Settlement/end day
14. Logout
15. Login again and confirm state
```

### Final Acceptance

- [ ] Full workflow works without changing mobile app.
- [ ] Old Zend and new Node response contracts match.
- [ ] No missing JSON keys.
- [ ] No broken SQLite sync inserts.
- [ ] No duplicate transaction rows after retry.
- [ ] Logs identify route/user/device/request id.
- [ ] Performance is equal or better than Zend.

## 15. Migration Order Recommendation

Recommended build order:

```text
1. Node skeleton
2. Login/device setup APIs
3. Start day/load check APIs
4. getsyncdata1 download sync
5. updatesyncdate
6. Customer/order/stock support APIs
7. Transaction verification
8. Image upload
9. sync/senddata
10. endday
11. logout
12. Full end-to-end test
```

Do not migrate `sync/senddata` first. It is too risky before the route lifecycle and sync contract are stable.
