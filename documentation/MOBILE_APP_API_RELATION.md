# Mobile App API Relation

This file explains which PHP Zend APIs are used by the PhoneGap mobile app in `SFA_ENHANCE_HHT`.

The goal is simple: when we rebuild the mobile API in Node.js, this document shows which endpoint belongs to which mobile feature.

## Quick Summary

Mobile app base API:

```text
https://routeprouat.enhance-group.com/api/
```

Main mobile API controllers:

- `IndexController.php` - login, device setup, download sync
- `WsController.php` - start day, end day, stock, balance, order status
- `SyncController.php` - upload mobile transaction data
- `TransactionController.php` - transaction verification and inventory count
- `CustomerController.php` - customer master lookup
- `ImageController.php` - image upload

Main PhoneGap API URL files:

- `SFA_ENHANCE_HHT/assets/www/js/common.js`
- `SFA_ENHANCE_HHT/assets/www/js/sync.js`
- `SFA_ENHANCE_HHT/assets/www/sync.html`
- `SFA_ENHANCE_HHT/assets/www/index.html`

## 1. Login And Device Setup

These APIs run when the salesman opens the app, checks device/company setup, logs in, or validates app version.

### `index/companyidbydevice`

Endpoint:

```text
index/companyidbydevice/deviceid/{deviceid}
```

PHP:

```text
IndexController::companyidbydeviceAction
```

Mobile callers:

- `SFA_ENHANCE_HHT/assets/www/index.html`
- `SFA_ENHANCE_HHT/assets/www/utilities/utilities.html`

Purpose:

Gets company and app configuration for the mobile device. It also checks app version information.

Stored procedures:

- `sp_ws_companyid_device`
- `sp_ws_app_version`

### `index/salesmanlogin`

Endpoint:

```text
index/salesmanlogin/username/{username}/password/{password}/deviceid/{deviceid}
```

PHP:

```text
IndexController::salesmanloginAction
```

Mobile caller:

- `SFA_ENHANCE_HHT/assets/www/index.html`

Purpose:

Authenticates the salesman/route user from the mobile device.

Stored procedure:

- `sp_ws_salesman_login`

### `index/salesmanverchk`

Endpoint:

```text
index/salesmanverchk/routecode/{routecode}/verno/{version}
```

PHP:

```text
IndexController::salesmanverchkAction
```

Mobile caller:

- `SFA_ENHANCE_HHT/assets/www/startofday/startofday.html`

Purpose:

Checks whether the current mobile app version is allowed for the route.

Stored procedure:

- `sp_ws_version_check`

## 2. Download Sync From Server To Mobile

This API downloads master data and setup data to the mobile device.

The old `index/getsyncdata` table-by-table PHP action was removed from `IndexController.php` to avoid confusion. Current main sync uses `index/getsyncdata1` through the native Cordova Java plugin.

### `index/getsyncdata1`

Endpoint:

```text
index/getsyncdata1/routeid/{routeid}/userid/-1/deviceid/0/mdate/2024-05-25/table/4
```

PHP:

```text
IndexController::getsyncdata1Action
```

Mobile callers:

- `SFA_ENHANCE_HHT/src/com/phonegap/sfa/WizzitIndent.java`
- Called from `SFA_ENHANCE_HHT/assets/www/sync.html` using `plugins.WizzitIndent.sync(...)`

Purpose:

Native Cordova/Wizzit plugin sync flow. It downloads selected sync data, especially table `4`.

### `index/updatesyncdate`

Endpoint:

```text
index/updatesyncdate/userid/{userid}/deviceid/{deviceid}/routecode/{routecode}/routekey/{routekey}/routeclosed/{routeclosed}
```

PHP:

```text
IndexController::updatesyncdateAction
```

Mobile caller:

- `SFA_ENHANCE_HHT/assets/www/sync.html`

Purpose:

Updates server sync date/log after the mobile download sync finishes.

Stored procedures:

- `sp_ws_updatesyncdate`
- `sp_ws_instertion_tbl_synclog`

## 3. Start Day, End Day, Logout

These APIs manage the route lifecycle on the mobile device.

### `ws/senddata`

Endpoint:

```text
ws/senddata?startday=[...]
```

PHP:

```text
WsController::senddataAction
```

Mobile callers:

- `SFA_ENHANCE_HHT/assets/www/js/common.js`
- `SFA_ENHANCE_HHT/assets/www/startofday/startofday.html`

Purpose:

Starts the route/day on the server using mobile start-day data.

Stored procedure:

- `sp_ws_stratendday`

### `ws/endday`

Endpoint:

```text
ws/endday?endday=[...]
```

PHP:

```text
WsController::enddayAction
```

Mobile caller:

- `SFA_ENHANCE_HHT/assets/www/settlement/managesettlement.html`

Purpose:

Sends route end-day/settlement closing data from mobile to server.

Stored procedure:

- `sp_ws_from_tablet_endday`

### `ws/logout`

Endpoint:

```text
ws/logout?logout=[...]
```

PHP:

```text
WsController::logoutAction
```

Mobile callers:

- `SFA_ENHANCE_HHT/assets/www/utilities/utilities.html`
- `SFA_ENHANCE_HHT/assets/www/utilities/miscellaneous.html`
- `SFA_ENHANCE_HHT/assets/www/startofday/startofday.html`

Purpose:

Clears/deletes route key or session state on the server during logout/reset.

Stored procedure:

- `sp_ws_delete_routekey`

### `ws/checkload`

Endpoint:

```text
ws/checkload/routeid/{routeid}/userid/{userid}
```

PHP:

```text
WsController::checkloadAction
```

Mobile caller:

- `SFA_ENHANCE_HHT/assets/www/sync.html`

Purpose:

Checks if route load/start load data is available before mobile sync or route start.

Stored procedure:

- `sp_ws_tablet_check_load`

## 4. Upload Sync From Mobile To Server

These APIs upload transactions created on the mobile device.

### `sync/senddata`

Endpoint:

```text
sync/senddata
```

PHP:

```text
SyncController::senddataAction
```

Mobile callers:

- `SFA_ENHANCE_HHT/assets/www/js/sync.js`
- `SFA_ENHANCE_HHT/assets/www/js/common.js`
- `SFA_ENHANCE_HHT/assets/www/js/upload.js`
- `SFA_ENHANCE_HHT/assets/www/utilities/uploaddata.html`
- `SFA_ENHANCE_HHT/assets/www/settlement/settlementaudit.html`

Purpose:

This is the main upload API. It uploads most mobile transaction data to the server.

Data uploaded includes:

- invoices
- sales orders
- AR collections
- cash/check details
- inventory transactions
- customer master changes
- customer operation controls
- customer visit logs
- route master changes
- surveys
- POS data
- route sequence status
- route goals
- no-sale records
- end-day details
- image metadata
- access override logs
- customer inventory checks

Stored procedures:

This action calls many `sp_ws_getdata_from_*`, `sp_ws_get_from_*`, and upload stored procedures. During Node migration, this API needs special care because it is the largest mobile upload endpoint.

### `sync/invtxndetail`

Endpoint:

```text
sync/invtxndetail
```

PHP:

```text
SyncController::invtxndetailAction
```

Mobile callers:

- `SFA_ENHANCE_HHT/assets/www/js/common.js`
- `SFA_ENHANCE_HHT/assets/www/settlement/settlementaudit.html`

Purpose:

Uploads inventory transaction detail separately, mainly in settlement/audit flow.

Stored procedure:

- `sp_ws_upload_inv_detl`

### `sync/artxndetail`

Endpoint:

```text
sync/artxndetail
```

PHP:

```text
SyncController::artxndetailAction
```

Mobile callers:

- `SFA_ENHANCE_HHT/assets/www/js/common.js`
- `SFA_ENHANCE_HHT/assets/www/settlement/settlementaudit.html`

Purpose:

Uploads AR transaction detail separately, mainly in settlement/audit flow.

Stored procedure:

- `sp_ws_upload_ar_detl`

### `sync/custseq`

Endpoint:

```text
sync/custseq
```

PHP:

```text
SyncController::custseqAction
```

Mobile caller:

- `SFA_ENHANCE_HHT/src/com/phonegap/sfa/WizzitIndent.java`

Purpose:

Uploads/updates customer route sequence status from the native plugin flow.

Stored procedure:

- `sp_ws_get_from_routesequencecustomerstatus`

## 5. Customer, Order, Stock, And Balance APIs

These APIs support customer screens, order entry, route status, and merchandising.

### `customer/customermaster`

Endpoint:

```text
customer/customermaster/routecode/{routecode}/customercode/{customercode}
```

PHP:

```text
CustomerController::customermasterAction
```

Mobile callers:

- `SFA_ENHANCE_HHT/assets/www/customer/customerselection.html`
- `SFA_ENHANCE_HHT/assets/www/customer_opt/customerselection.html`

Purpose:

Gets a selected customer master record/details.

Stored procedure:

- `sp_ws_getcustormaster`

### `ws/getcustomerbalance`

Endpoint:

```text
ws/getcustomerbalance?customerbalance=[...]
```

PHP:

```text
WsController::getcustomerbalanceAction
```

Mobile callers:

- `SFA_ENHANCE_HHT/assets/www/customer/customer_info.html`
- `SFA_ENHANCE_HHT/assets/www/customer/customer_details.html`
- `SFA_ENHANCE_HHT/assets/www/customer_opt/cust_opt.html`

Purpose:

Gets customer balance/outstanding amount for customer and order screens.

Stored procedure:

- `sp_ws_getcustomer_balance`

### `ws/getwarehousestock`

Endpoint:

```text
ws/getwarehousestock/routeid/{routeid}
ws/getwarehousestock/routeid/{routeid}/userid/{userid}
```

PHP:

```text
WsController::getwarehousestockAction
```

Mobile callers:

- `SFA_ENHANCE_HHT/assets/www/customer_opt/add_order_item.html`
- `SFA_ENHANCE_HHT/assets/www/inventory/loadrequest.html`

Purpose:

Gets warehouse stock for order entry and load request screens.

Stored procedure:

- `sp_ws_tablet_get_warehousestock`

### `ws/getwhstock`

Endpoint:

```text
ws/getwhstock?whstock=[...]
```

PHP:

```text
WsController::getwhstockAction
```

Mobile caller:

- `SFA_ENHANCE_HHT/assets/www/customer_opt/orderRequest.html`

Purpose:

Gets warehouse stock during order request flow.

Stored procedure:

- `sp_ws_getdata_whstock`

### `ws/getcustinv`

Endpoint:

```text
ws/getcustinv
```

PHP:

```text
WsController::getcustinvAction
```

Mobile caller:

- `SFA_ENHANCE_HHT/assets/www/customer_opt/inventory_check.html`

Purpose:

Uploads or updates temporary customer inventory check data.

Stored procedure:

- `sp_ws_get_from_tempcustomerinventory`

### `ws/getdelivery`

Endpoint:

```text
ws/getdelivery?delivery=[...]
```

PHP:

```text
WsController::getdeliveryAction
```

Mobile caller:

- `SFA_ENHANCE_HHT/assets/www/js/TrackOrders.js`

Purpose:

Gets delivery/order tracking data.

Stored procedure:

- `sp_ws_getdata_delivery`

### `ws/getorderstatus`

Endpoint:

```text
ws/getorderstatus/routeid/{routeid}
```

PHP:

```text
WsController::getorderstatusAction
```

Mobile callers:

- `SFA_ENHANCE_HHT/assets/www/home/orderstatus.html`
- `SFA_ENHANCE_HHT/assets/www/customer_opt/orderstatus.html`

Purpose:

Gets delivery/order status by route.

Stored procedure:

- `sp_ws_tablet_get_deliveryorderstatus`

### `ws/getcustomeritemgrp`

Endpoint:

```text
ws/getcustomeritemgrp/routeid/{routeid}
```

PHP:

```text
WsController::getcustomeritemgrpAction
```

Mobile callers:

- `SFA_ENHANCE_HHT/assets/www/sync.html`
- `SFA_ENHANCE_HHT/assets/www/home/home.html`

Purpose:

Gets customer item group or item mapping data.

Stored procedure:

- `sp_ws_syncicsdata_customeritemgrp`

### `ws/getvisualdata`

Endpoint:

```text
ws/getvisualdata/routeid/{routeid}
```

PHP:

```text
WsController::getvisualdataAction
```

Mobile caller:

- `SFA_ENHANCE_HHT/assets/www/customer_opt/merchandising.html`

Purpose:

Gets visual merchandising data for customer merchandising screens.

Stored procedure:

- `sp_ws_syncicsdata_visualdata`

## 6. Transaction Verification And Inventory Count

### `transaction/trandata`

Endpoint:

```text
transaction/trandata/routekey/{routekey}
```

PHP:

```text
TransactionController::trandataAction
```

Mobile callers:

- `SFA_ENHANCE_HHT/assets/www/utilities/verification.html`
- `SFA_ENHANCE_HHT/assets/www/utilities/import_verification.html`
- `SFA_ENHANCE_HHT/assets/www/settlement/settlementaudit.html`
- `SFA_ENHANCE_HHT/assets/www/settlement/managesettlement.html`

Purpose:

Gets transaction data by route key for verification and settlement audit.

Stored procedure:

- `sp_ws_transactiondata`

### `transaction/importinventorycount`

Endpoint:

```text
transaction/importinventorycount/routecode/{routecode}
```

PHP:

```text
TransactionController::importinventorycountAction
```

Mobile callers:

- `SFA_ENHANCE_HHT/assets/www/startofday/startofday.html`
- `SFA_ENHANCE_HHT/assets/www/startofday/checkinventorycount.html`
- `SFA_ENHANCE_HHT/assets/www/inventory/loadselection.html`
- `SFA_ENHANCE_HHT/assets/www/inventory/checkinventorycount.html`

Purpose:

Gets/imports inventory count data for route start, load selection, and inventory count screens.

Stored procedure:

- `sp_ws_importinventory_counts`

## 7. Image Upload

### `image/upload`

Endpoint:

```text
image/upload
```

PHP:

```text
ImageController::uploadAction
```

Mobile callers:

- `SFA_ENHANCE_HHT/assets/www/js/sync.js`
- `SFA_ENHANCE_HHT/assets/www/utilities/uploaddata.html`

Purpose:

Uploads mobile image files, such as customer images, signatures, or related photos.

## 8. Existing Mobile Controller Functions Not Used By PhoneGap

These functions exist in `mobileApi`, but I did not find active mobile app calls for them:

- `IndexController::loginAction`
- `IndexController::indexAction`
- `SyncController::senddata1Action`
- `WsController::routetrack11Action`
- `WsController::routetrack21Action`
- `WsController::getcustomeroutstandingAction`

Current GPS tracking does not use the old Zend route tracking APIs. It uses this separate microservice:

```text
https://routetrackmicroservice.enhance-group.com/api/v1/routeTrack
```

## 9. Mobile Calls Not Found In Current PHP Mobile Controllers

The mobile app contains references to these API paths, but I did not find matching actions in the current `mobileApi` controllers:

- `index/getversionstatus`
- `ws/getapheader`
- `ws/getapdetail`
- `ws/getcashdetail`
- `ws/getcomment`

Before Node migration, review these paths. They may be old code, backup screen code, missing controller actions, or APIs from another deployed version.

## 10. Node Migration Priority

Recommended order for converting mobile APIs to Node.js:

1. Login and device setup
2. Download sync
3. Start day, end day, logout
4. Upload sync
5. Customer, order, stock, and balance APIs
6. Transaction verification and inventory count
7. Image upload

Highest-risk endpoint:

```text
sync/senddata
```

Reason:

It receives many different mobile payload sections and calls many stored procedures. This endpoint should be migrated carefully with sample mobile payloads and database procedure mapping.
