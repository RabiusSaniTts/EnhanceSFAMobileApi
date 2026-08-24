# Current API Module Documentation

Project: `EnhanceSFAMobileApi`

Scope: `application/modules/api`

Purpose: This document records the current PHP Zend API module behavior before converting it to Node.js. The current API module is mainly a thin HTTP layer over MySQL stored procedures.

## Module Structure

Active files reviewed:

- `application/modules/api/Bootstrap.php`
- `application/modules/api/library/Controller/Action/Abstract.php`
- `application/modules/api/controllers/IndexController.php`
- `application/modules/api/controllers/SyncController.php`
- `application/modules/api/controllers/WsController.php`
- `application/modules/api/controllers/ImportController.php`
- `application/modules/api/controllers/ExportController.php`
- `application/modules/api/controllers/CronController.php`
- `application/modules/api/controllers/CustomerController.php`
- `application/modules/api/controllers/TransactionController.php`
- `application/modules/api/controllers/ImageController.php`
- `application/modules/api/controllers/service.php`

Backup or old import controller copies exist and were not treated as active:

- `ImportController -bk02012016.php`
- `ImportController112233.php`
- `ImportController_.php`
- `ImportController_03-10-2017.php`
- `ImportController_21-09-2017.php`
- `ImportController_30-12-2017.php`

## API Base Behavior

`Api_Library_Controller_Action_Abstract` extends `Custom_Controller_Action_Abstract`.

For every API request, it:

- Initializes the custom view helper.
- Calls the parent controller init.
- Disables layout rendering.
- Disables view rendering.

Most endpoints directly output one of:

- JSON via `echo json_encode(...)`
- XML via manual `echo`
- plain text status
- file upload status

## Database Pattern

Almost all API database work goes through:

`SFA_Comman->executequery('CALL procedure_name(...)', $param_array, '')`

or:

`SFA_Comman->executeimportquery(...)`

Important implementation detail:

- Procedure parameters are built as 1-based PHP arrays: `$param_array[1]`, `$param_array[2]`, etc.
- `SFA_Comman` converts those arrays into a MySQL `CALL sp(...)` string.
- Multi-result stored procedures return arrays such as `$resultdata[0]`, `$resultdata[1]`, etc.
- Node.js migration must preserve parameter order exactly.

## Stored Procedure Coverage

Cross-check file:

`database_structure/sfa_migration_table_structure.sql`

Found:

- `124` unique `CALL ...` references in active API files.
- Most stored procedures exist in the SQL dump.

Missing or suspicious procedure references:

- `sp_delete_tour` from `CronController.php`
- `post_suggested_qty` from `CronController.php`
- `sp_ws_getcustormaster` from `CustomerController.php`
- `ws_sp_creditnote` from `ExportController.php`

Probably inactive, commented, or debug references:

- `failed`
- `sp_import_data_from_oracle`
- `sp_int_export_getroutecodes`
- `sp_ws_import_getdata_from_rp_sppricingcopy`

These missing names should be confirmed before implementing the Node.js version.

## Controller Summary

### IndexController.php

Purpose:

Mobile login and down-sync data.

Actions:

- `loginAction`
- `indexAction`
- `salesmanloginAction`
- `salesmanverchkAction`
- `companyidbydeviceAction`
- `getsyncdataAction`
- `getsyncdata1Action`
- `updatesyncdateAction`

Main procedures:

- `sp_ws_salesman_login`
- `sp_ws_version_check`
- `sp_ws_companyid_device`
- `sp_ws_app_version`
- `sp_ws_syncicsdata_setting`
- `sp_ws_syncicsdata_itemmust`
- `sp_ws_syncicsdata_items`
- `sp_ws_syncicsdata_inventory`
- `sp_ws_syncicsdata_customers`
- `sp_ws_syncicsdata_schemes`
- `sp_ws_syncicsdata_survey`
- `sp_ws_syncicsdata_reasons`
- `sp_ws_syncicsdata_others`
- `sp_ws_syncicsdata_orders`
- `sp_ws_tablet_deletemaster`
- `sp_ws_syncicsdata_customeritemgrp`
- `sp_ws_updatesyncdate`
- `sp_ws_instertion_tbl_synclog`

Migration notes:

- `getsyncdataAction` returns different datasets depending on `table`.
- `getsyncdata1Action` returns a large full sync response plus `synccount`.
- Response key names must be preserved exactly, for example `ControlPanel`, `ItemMaster`, `CustomerMaster`, `salesorderheader`.

### SyncController.php

Purpose:

Main tablet/mobile upload sync controller.

Actions:

- `senddata1Action`
- `senddataAction`
- `invtxndetailAction`
- `artxndetailAction`
- `custseqAction`

Main upload payload groups handled by `senddataAction`:

- `customeroperationscontrol`
- `customervisitlog`
- `customermaster`
- `routemaster`
- `invoiceheader`
- `invoicedetail`
- `invoicerxddetail`
- `salesorderheader`
- `salesorderdetail`
- `orderrxddetail`
- `promotiondetail`
- `batchexpirydetail`
- `arheader`
- `ardetail`
- `cashcheckdetail`
- `customerinvoice`
- `inventorytransactionheader`
- `inventorytransactiondetail`
- `inventorysummarydetail`
- `nonservicedcustomer`
- `surveyauditdetail`
- `posequipmentchangedetail`
- `posmaster`
- `sigcapturedata`
- `customerinventorydetail`
- `routesequencecustomerstatus`
- `nosalesheader`
- `routegoal`
- `customer_foc_balance`
- `enddaydetail`
- `customerimages`
- `t_access_override_log`
- `customerdistributioncheck`
- `customerinventorycheck`

Migration notes:

- This is the highest-risk file.
- Child records depend on parent procedure return values stored in local maps:
  - invoice detail uses invoice header `lastid`
  - sales order detail uses sales order header `lastid`
  - AR detail uses AR header `lastid`
  - inventory detail uses inventory header `lastid`
- Node.js must process these sections in the same order.
- The custom `jsonDecode()` uses `eval`; Node.js should use safe JSON parsing only.
- `sigcapturedata` upload is currently disabled by `if(1==0)`.
- `invtxndetailAction`, `artxndetailAction`, and `custseqAction` reference `$path` without defining it.

### WsController.php

Purpose:

Start/end day, GPS, stock and small lookup APIs.

Actions:

- `senddataAction`
- `enddayAction`
- `logoutAction`
- `checkloadAction`
- `routetrack11Action`
- `routetrack21Action`
- `getdeliveryAction`
- `getwhstockAction`
- `getcustinvAction`
- `getcustomerbalanceAction`
- `getwarehousestockAction`
- `getorderstatusAction`
- `getcustomeritemgrpAction`
- `getcustomeroutstandingAction`
- `getvisualdataAction`

Main procedures:

- `sp_ws_stratendday`
- `sp_ws_from_tablet_endday`
- `sp_ws_delete_routekey`
- `sp_ws_tablet_check_load`
- `sp_ws_getdata_from_routetrack`
- `sp_ws_getdata_from_deviceroutetrack`
- `sp_ws_getdata_delivery`
- `sp_ws_getdata_whstock`
- `sp_ws_get_from_tempcustomerinventory`
- `sp_ws_getcustomer_balance`
- `sp_ws_tablet_get_warehousestock`
- `sp_ws_tablet_get_deliveryorderstatus`
- `sp_ws_syncicsdata_customeritemgrp`
- `sp_ws_syncicsdata_customeroutstanding`
- `sp_ws_syncicsdata_visualdata`

Migration notes:

- `enddayAction` and `logoutAction` do not echo a response in the current code.
- `routetrack11Action` and `routetrack21Action` echo `$result[0]`, not a normal JSON object.
- Some helper callbacks such as `getdelivery`, `getwhstock`, `customerbalance` are referenced by `array_walk_recursive`; their definitions are not in this file.

### ImportController.php

Purpose:

RoutePro/Oracle integration imports and exports.

Actions:

- CSV/batch imports: `rpchain`, `rporderstatus`, `rpcustomer`, `rpglmatrix`, `rpitem`, `rpoutstanding`, `rproute`, `rpsman`, `rpsppricing`, `rpstartload`, `rptarget`, `rpwhglmatrix`, `rpwhstock`
- JSON imports: `rpitemgroup`, `updateimporttables`, Oracle import actions
- Export/status actions: `getsalesorderfromroutepro`, `getsalesinvoicefromroutepro`, `getreceiptfromroutepro`, `getloadrequestfromroutepro`, status update actions

Main procedures:

- `sp_ws_import_getdata_from_importtables`
- `sp_import_item_from_oracle`
- `sp_import_customer_from_oracle`
- `sp_import_customer_outstanding_oracle`
- `sp_import_route_salesman_oracle`
- `sp_import_warehousestock_oracle`
- `sp_import_salesmanstock_oracle`
- `sp_import_pricing_key_oracle`
- `sp_import_sales_order_status_oracle`
- `sp_import_divisionmaster_oracle`
- `sp_get_salesorder`
- `sp_get_salesInvoice`
- `sp_get_receipts`
- `sp_get_loadrequest`
- `sp_get_creditnote`
- `sp_update_order_posted_status`
- `sp_update_invoice_posted_status`
- `sp_update_receipt_posted_status`

Migration notes:

- Hardcoded paths point to `C:/wamp/www/sfa/enhance_live/...`.
- CSV imports write files and execute Windows batch files.
- Several JSON import actions loop over `count($params)` but read `$params['field']` instead of `$params[$i]['field']`, meaning they effectively process one object.
- Date input `TransactionDate` is expected in `Ymd` format and converted to `Y-m-d`.
- Some response formatting mutates dates, zero values, and decimal precision before JSON output.

### ExportController.php

Purpose:

Export invoice/order/AR data and update exported status.

Actions:

- `getinvoiceheaderAction`
- `getsalesorderdetailAction`
- `getardetailAction`
- `getcreditnoteAction`
- `updatearheaderAction`
- `updatesalesorderdetailAction`

Main procedures:

- `sp_ws_export_getinvoiceheader`
- `ws_sp_exportsalesorderdetail`
- `ws_sp_exportarheader`
- `ws_sp_creditnote`
- `ws_sp_updatearheader`
- `ws_sp_updatesalesorderheader`

Migration notes:

- `getinvoiceheaderAction` returns XML.
- Other read endpoints return JSON.
- Update endpoints read raw request body and pass it as a single procedure parameter.
- `ws_sp_creditnote` was not found in the SQL dump.

### CronController.php

Purpose:

Operational cron/admin jobs.

Actions:

- `averagesalesqtyAction`
- `importsyncAction`
- `importloadAction`
- `exportstockAction`
- `importspecitemAction`
- `terminateAction`
- `loadreqAction`
- `syncdivdataAction`
- `sendalertAction`
- `posttargetAction`

Main procedures and classes:

- `sp_cron_average_sales_quantity`
- `int_exp_get_routekey_rpt`
- `sp_delete_tour`
- `sp_get_changed_password`
- `post_suggested_qty`
- `post_target_achievement`
- `SFA_DataSyncImport`
- `SFA_DataSyncExport`
- `SFA_syncData`
- `SFA_upSyncOrder`

Migration notes:

- These should become protected Node jobs or worker tasks, not public mobile routes.
- Uses Oracle connection helpers from `SFA_Comman`.
- Sends email using PHP `mail`.
- Uses unquoted PHP constants like `sucess`, `on_route`, `error`, `exported`; Node should return explicit strings.
- `sp_delete_tour` and `post_suggested_qty` were not found in the SQL dump.

### CustomerController.php

Purpose:

Customer master lookup.

Action:

- `customermasterAction`

Procedure:

- `sp_ws_getcustormaster`

Migration notes:

- This procedure was not found in the SQL dump.
- Name may be misspelled as `getcustor...`; must confirm before conversion.

### TransactionController.php

Purpose:

Small transaction lookup/import count APIs.

Actions:

- `trandataAction`
- `importinventorycountAction`

Procedures:

- `sp_ws_transactiondata`
- `sp_ws_importinventory_counts`

Migration notes:

- Straightforward to migrate.
- Both return first result set as JSON.

### ImageController.php

Purpose:

Customer image upload.

Action:

- `uploadAction`

Migration notes:

- Uses `$_FILES['file']`.
- Upload path is hardcoded to `C:/wamp/www/sfa/enhance_live/public/customerimage/`.
- Node version should use configurable storage path.
- Must validate filename, extension, size, and MIME type.

### service.php

Purpose:

Contains direct JSON import action methods for `rp_*` tables.

Actions/functions:

- `rp_chainAction`
- `rp_customerAction`
- `rp_glmatrixAction`
- `rp_itemAction`
- `rp_itemgroupAction`
- `rp_outstandingAction`
- `rp_routeAction`
- `rp_smanAction`
- `rp_sppricingAction`
- `rp_startloadAction`
- `rp_whglmatrixAction`
- `rp_whstockAction`
- `t_UserMasterAction`

Migration notes:

- This file does not define a controller class like the others.
- Need confirm whether it is reachable in production.
- Each function loops JSON rows and calls a matching `sp_ws_import_getdata_from_*` procedure.

## Node.js Migration Recommendation

Phase 1 should be API parity, not business rewrite.

Recommended approach:

1. Create a Node.js API with routes matching current Zend controller/action URLs.
2. Create a MySQL stored procedure helper that supports:
   - ordered parameters
   - multi-result-set responses
   - legacy null/empty conversion
3. Convert controllers in this order:
   - `TransactionController`
   - `CustomerController` after missing SP confirmation
   - `WsController`
   - `IndexController`
   - `ExportController`
   - `SyncController`
   - `ImportController`
   - `CronController` as protected jobs
4. Build request/response parity tests before changing mobile clients.
5. Keep stored procedures unchanged for the first version.

## High-Risk Areas

- `SyncController::senddataAction` parameter order and parent-child insert ID mapping.
- Missing procedure definitions listed above.
- Hardcoded Windows paths.
- Raw SQL string construction inside legacy `SFA_Comman`.
- Direct file writes and batch execution in `ImportController`.
- Oracle sync logic used by cron jobs.
- Inconsistent response formats: JSON, XML, plain text, empty body.

