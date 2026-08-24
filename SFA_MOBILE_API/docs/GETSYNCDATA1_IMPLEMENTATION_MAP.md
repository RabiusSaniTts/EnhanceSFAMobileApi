# getsyncdata1 Implementation Map

This document maps the current Zend API endpoint to the future Node.js TypeScript implementation.

Endpoint:

```text
/api/index/getsyncdata1/routeid/{routeid}/userid/{userid}/deviceid/{deviceid}/mdate/{mdate}/table/{table}
```

Current main mobile caller:

```text
SFA_ENHANCE_HHT/src/com/phonegap/sfa/WizzitIndent.java
```

Current Zend source:

```text
application/modules/api/controllers/mobileApi/IndexController.php
getsyncdata1Action()
```

## Naming Decision

The public mobile endpoint must remain:

```text
/api/index/getsyncdata1/routeid/{routeid}/userid/{userid}/deviceid/{deviceid}/mdate/{mdate}/table/{table}
```

The new Node.js TypeScript internal handler is:

```ts
masterDataSyncAction()
```

Reason:

- The PhoneGap app currently calls `getsyncdata1`.
- We must not change the mobile app URL.
- The old PHP `getsyncdataAction` was removed from the mobile API folder to avoid confusion.
- In the new Node API, `masterDataSyncAction` handles the current `getsyncdata1` route.

Route mapping should be:

```ts
app.route({
  method: ['GET', 'POST'],
  url: '/api/index/getsyncdata1/routeid/:routeid/userid/:userid/deviceid/:deviceid/mdate/:mdate/table/:table',
  handler: masterDataSyncAction
});
```

## 1. Migration Rule

The Node API must keep the same endpoint path and JSON keys, but must not call stored procedures.

```text
Mobile contract stays same.
Stored procedures are replaced by TypeScript services and direct MySQL queries.
JSON response keys must stay exactly as current PHP response keys.
```

## 2. Request Parameters

The PHP action builds three parameter arrays:

```text
param_array:
1 = userid
2 = deviceid
3 = routeid
4 = mdate

param_array1:
1 = userid
2 = userid
3 = deviceid

param_array2:
1 = userid
2 = deviceid
3 = routeid
```

Node route params should be:

```ts
routeid: string
userid: string
deviceid: string
mdate: string
table: string
```

Important: current PHP receives `table`, but `getsyncdata1Action()` does not use it. The mobile Java call still sends `/table/4`, so Node must keep the path segment.

## 3. Current Stored Procedures Called

Order matters because the final JSON is built in this sequence:

1. `sp_ws_syncicsdata_setting(?,?,?,?)`
2. `sp_ws_syncicsdata_itemmust(?,?,?,?)`
3. `sp_ws_syncicsdata_items(?,?,?,?)`
4. `sp_ws_syncicsdata_inventory(?,?,?,?)`
5. `sp_ws_syncicsdata_customers(?,?,?,?)`
6. `sp_ws_syncicsdata_schemes(?,?,?,?)`
7. `sp_ws_syncicsdata_survey(?,?,?,?)`
8. `sp_ws_syncicsdata_reasons(?,?,?,?)`
9. `sp_ws_syncicsdata_others(?,?,?,?)`
10. `sp_ws_syncicsdata_orders(?,?,?,?)`
11. `sp_ws_syncicsdata_itemmust(?,?,?,?)` again
12. `sp_ws_tablet_deletemaster(?,?,?)`
13. `sp_ws_syncicsdata_customeritemgrp(?,?,?)`

## 4. Final JSON Response Keys

The current response is one large object:

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

## 5. Procedure-To-Response Map

| Procedure | Result set index | JSON key | Main source tables |
|---|---:|---|---|
| `sp_ws_syncicsdata_setting` | 0 | `ControlPanel` | `controlpanel` |
| `sp_ws_syncicsdata_setting` | 1 | `Setup` | `setup` |
| `sp_ws_syncicsdata_setting` | 2 | `companydetail` | `company` |
| `sp_ws_syncicsdata_setting` | 3 | `SalesmanMaster` | `routemaster`, `salesman`, `subareamaster`, `supervisor` |
| `sp_ws_syncicsdata_setting` | 4 | `RouteMaster` | `routemaster`, `currencymaster`, temp route list |
| `sp_ws_syncicsdata_setting` | 5 | `startendday` | `startendday` |
| `sp_ws_syncicsdata_setting` | 6 | `synctime` | `CURRENT_DATE()` |
| `sp_ws_syncicsdata_setting` | 7 | `CurrencyMaster` | `currencymaster` |
| `sp_ws_syncicsdata_itemmust` | 0 | `itemmustheader` | `itemmustheader`, `customermaster` |
| `sp_ws_syncicsdata_itemmust` | 1 | `itemmustdetail` | `itemmustdetail`, `customermaster` |
| `sp_ws_syncicsdata_itemmust` | 2 | `itemnrp` | `itemmaster`, `divisionmaster`, `routeitemmapping`, `routemaster` |
| `sp_ws_syncicsdata_itemmust` | 3 | `custnrp` | `customermaster`, `routesequence` |
| `sp_ws_syncicsdata_items` | 0 | `itemgroup` | `itemgroup`, `itemmaster`, `routeitemmapping`, `routemaster` |
| `sp_ws_syncicsdata_items` | 1 | `ItemMaster` | `itemmaster`, `routeitemmapping`, `routemaster` |
| `sp_ws_syncicsdata_items` | 2 | `itempackagemaster` | `itempackagemaster` |
| `sp_ws_syncicsdata_items` | 3 | `routegoal` | `routegoal` |
| `sp_ws_syncicsdata_items` | 4 | `avgsalesqty` | `averagesalesqty` |
| `sp_ws_syncicsdata_items` | 5 | `outletitemcodes` | `outletitemcodes`, `customermaster` |
| `sp_ws_syncicsdata_items` | 6 | `taxmaster` | `tbltaxmaster` |
| `sp_ws_syncicsdata_inventory` | 0 | `startingloaddetail` | `startingloaddetail` |
| `sp_ws_syncicsdata_inventory` | 1 | `inventorysummarydetail` | `inventorysummarydetail`, `startendday` |
| `sp_ws_syncicsdata_customers` | 0 | `CustomerMaster` | `customermaster`, `routesequence`, `setup`, `customerdiscountcap`, temp route customer list |
| `sp_ws_syncicsdata_customers` | 1 | `salescalender` | `salescalender` |
| `sp_ws_syncicsdata_customers` | 2 | `routesequence` | `routesequence`, temp route customer list |
| `sp_ws_syncicsdata_customers` | 3 | `customerinvoice` | `customerinvoice`, `salesman`, `controlpanel`, temp route customer list |
| `sp_ws_syncicsdata_schemes` | 0 | `discountkeyheader` | `discountkeyheader` |
| `sp_ws_syncicsdata_schemes` | 1 | `discountkeydetail` | `discountkeydetail` |
| `sp_ws_syncicsdata_schemes` | 2 | `distributionkeydetails` | `distributionkeydetails` |
| `sp_ws_syncicsdata_schemes` | 3 | `productgroupheader` | `productgroupheader`, promo temp group list |
| `sp_ws_syncicsdata_schemes` | 4 | `productgroupdetail` | `productgroupdetail`, promo temp group list |
| `sp_ws_syncicsdata_schemes` | 5 | `promokeyheader` | `promokeyheader`, route customer promotion keys |
| `sp_ws_syncicsdata_schemes` | 6 | `promokeydetail` | `promokeydetail`, `promokeyheader` |
| `sp_ws_syncicsdata_schemes` | 7 | `promoplanheader` | `promoplanheader`, `promokeydetail` |
| `sp_ws_syncicsdata_schemes` | 8 | `promoplandetail` | `promoplandetail`, `promoplanheader`, `promokeydetail` |
| `sp_ws_syncicsdata_schemes` | 9 | `promotionassignmentadvanced` | `promotionassignmentadvanced`, promotion joins |
| `sp_ws_syncicsdata_schemes` | 10 | `customerpricing1` | `customerpricingplanheader1`, `customerpricing1`, `pricingplanheader1`, route customer pricing keys |
| `sp_ws_syncicsdata_schemes` | 11 | `pricingdetail1` | `pricingdetail1`, pricing joins, `routeitemmapping` |
| `sp_ws_syncicsdata_survey` | 0 | `POSmaster` | `posmaster` |
| `sp_ws_syncicsdata_survey` | 1 | `customerposinventory` | `customerposinventory` |
| `sp_ws_syncicsdata_survey` | 2 | `customerposlimit` | `customerposlimit` |
| `sp_ws_syncicsdata_survey` | 3 | `posinstructions` | `posinstructions` |
| `sp_ws_syncicsdata_survey` | 4 | `customersurveyplan` | `customersurveyplan` |
| `sp_ws_syncicsdata_survey` | 5 | `customersurveykeyplan` | `customersurveykeyplan` |
| `sp_ws_syncicsdata_survey` | 6 | `customersurveykey` | `customersurveykey` |
| `sp_ws_syncicsdata_survey` | 7 | `customersurveydefinition` | `customersurveydefinition` |
| `sp_ws_syncicsdata_survey` | 8 | `customersurveydefassign` | `customersurveydefassign` |
| `sp_ws_syncicsdata_survey` | 9 | `lookupindexdetail` | `lookupindexdetail` |
| `sp_ws_syncicsdata_reasons` | 0 | `nonservreasons` | `nonservreasons` |
| `sp_ws_syncicsdata_reasons` | 1 | `expreasons` | `expreasons` |
| `sp_ws_syncicsdata_reasons` | 2 | `expiryreturnreasons` | `expiryreturnreasons` |
| `sp_ws_syncicsdata_reasons` | 3 | `retitmreasons` | `retitmreasons` |
| `sp_ws_syncicsdata_reasons` | 4 | `freegoodreasons` | `freegoodreasons` |
| `sp_ws_syncicsdata_reasons` | 5 | `voidreasons` | `voidreasons` |
| `sp_ws_syncicsdata_reasons` | 6 | `routebook` | `routebook` |
| `sp_ws_syncicsdata_reasons` | 7 | `salestrend` | `salestrend` |
| `sp_ws_syncicsdata_reasons` | 8 | `tempcustinventory` | `tempcustomerinventory` |
| `sp_ws_syncicsdata_others` | 0 | `customermessages` | `customermessages` |
| `sp_ws_syncicsdata_others` | 1 | `salesmanmessages` | `salesmanmessages` |
| `sp_ws_syncicsdata_others` | 2 | `vanmaster` | `vanmaster` |
| `sp_ws_syncicsdata_others` | 3 | `bankmaster` | `bankmaster` |
| `sp_ws_syncicsdata_others` | 4 | `cashdesc` | `cashdesc` |
| `sp_ws_syncicsdata_others` | 5 | `inventorylocation` | `inventorylocation` |
| `sp_ws_syncicsdata_orders` | 0 | `salesorderheader` | `deliveryheader` |
| `sp_ws_syncicsdata_orders` | 1 | `salesorderdetail` | `deliveryheader`, `deliverydetail` |
| `sp_ws_syncicsdata_orders` | 2 | `suggestedsalesinvoice` | `suggestedsalesinvoice` |
| `sp_ws_syncicsdata_orders` | 3 | `inventorytransactiondetail` | `inventorytransactiondetail`, latest closed `startendday.routekey` |
| `sp_ws_syncicsdata_orders` | 4 | `customer_foc_balance` | `customer_foc_balance`, route customer list |
| `sp_ws_syncicsdata_orders` | 5 | `customer_foc_detail` | `customer_foc_detail`, route customer list |
| `sp_ws_syncicsdata_orders` | 6 | `journeyplancreditlimit` | `journeyplancreditlimit` |
| `sp_ws_syncicsdata_orders` | 7 | `batchexpirydetail` | `batchexpirydetail`, latest closed `routekey` |
| `sp_ws_syncicsdata_orders` | 8 | `customer_foc` | `customer_foc`, route customer list |
| `sp_ws_tablet_deletemaster` | 0 | `deletemaster` | `tbl_syncservice`, `logmaster`, `show_pk()` |
| `sp_ws_syncicsdata_customeritemgrp` | 0 | `customeritemgrp` | `customeritemgrp`, `customermaster`, `routesequence` |
| `sp_ws_syncicsdata_customeritemgrp` | 1 | `customeritemmap` | `customeritemmapping`, `customeritemgrp`, `customermaster`, `routesequence` |

## 6. Important Stored Procedure Side Effects

These side effects must be handled deliberately in Node. Some are questionable, but they are part of current behavior.

### `sp_ws_syncicsdata_setting`

This procedure is not only read-only.

It currently:

- Finds latest closed `routekey` from `startendday`.
- Reads `routeitemgrpcode` from `routemaster`.
- Creates a physical table named `temp_openstock_{routeid}` from `inventorytransactiondetail`.
- Inserts missing open-stock items into `routeitemmapping`.
- Updates `routemaster.inventoryreportcontrol`.
- Updates `routemaster.enablestockicon`.
- Creates `temp_route`.
- Calls `sp_update_sequence_numbers(var_routeid)`.
- Drops `temp_openstock_{routeid}` at the end.

Node implementation recommendation:

- Avoid physical route-specific temp tables.
- Use CTEs/subqueries for open stock.
- Keep side-effect updates in a transaction.
- Replace `sp_update_sequence_numbers` with direct SQL, not a stored procedure call.
- Current Node implementation updates route sequence fields and vehicle odometer in `src/modules/mobile/masterdatasync/repository/setting.repository.ts`.

### `sp_ws_syncicsdata_customers`

This procedure creates route customer temp data based on:

- `setup.journeyplanflag`
- `setup.routesequenceplanflag`
- current day of week
- current sales calendar week
- `routesequence`

Node implementation recommendation:

- Build a reusable helper: `getRouteCustomerCodes(routeId)`.
- Use that helper across customers, orders, FOC, promotion, and customer item group queries.

### `sp_ws_syncicsdata_schemes` / Promotion Pricing

This procedure creates temporary promo and pricing key sets.

Node implementation recommendation:

- Build reusable CTEs:
  - route customer promotion keys
  - route product group ids
  - route pricing keys
  - route item codes

Current Node status:

- Implemented in `src/modules/mobile/masterdatasync/repository/promotionPricing.repository.ts`.
- Replaces `sp_ws_syncicsdata_schemes` with direct MySQL queries.
- Populates:
  - `discountkeyheader`
  - `discountkeydetail`
  - `distributionkeydetails`
  - `productgroupheader`
  - `productgroupdetail`
  - `promokeyheader`
  - `promokeydetail`
  - `promoplanheader`
  - `promoplandetail`
  - `promotionassignmentadvanced`
  - `customerpricing1`
  - `pricingdetail1`
- Public mobile response keys are unchanged.
- Local `.env` database `sfa_migration` currently has `promotionassignment`, but does not have `promotionassignmentadvanced`; Node returns `[]` for `promotionassignmentadvanced` when that source table is missing so the full mobile sync response does not fail in this local environment.

### `sp_ws_syncicsdata_survey`

This procedure returns POS and customer survey reference data. It also returns visual header/detail result sets, but current PHP `getsyncdata1Action()` ignores those visual result sets, so the Node mobile sync response ignores them too.

Current Node status:

- Implemented in `src/modules/mobile/masterdatasync/repository/survey.repository.ts`.
- Replaces `sp_ws_syncicsdata_survey` with direct MySQL queries.
- Preserves the current procedure behavior where `var_checkmdate` is forced to `0`, meaning these tables are full-sync datasets in this endpoint.
- Populates:
  - `POSmaster`
  - `customerposinventory`
  - `customerposlimit`
  - `posinstructions`
  - `customersurveyplan`
  - `customersurveykeyplan`
  - `customersurveykey`
  - `customersurveydefinition`
  - `customersurveydefassign`
  - `lookupindexdetail`
- Visual result sets from `visualheader` and `visualdetail` are intentionally not included because the current mobile API response does not expose them.

### `sp_ws_syncicsdata_reasons`

This procedure returns reason/reference tables plus route-specific route book, sales trend, and temporary customer inventory data.

Current Node status:

- Implemented in `src/modules/mobile/masterdatasync/repository/reasons.repository.ts`.
- Replaces `sp_ws_syncicsdata_reasons` with direct MySQL queries.
- Uses separate named functions per dataset for maintainability.
- Populates:
  - `nonservreasons`
  - `expreasons`
  - `expiryreturnreasons`
  - `retitmreasons`
  - `freegoodreasons`
  - `voidreasons`
  - `routebook`
  - `salestrend`
  - `tempcustinventory`
- `routebook`, `salestrend`, and `tempcustinventory` are filtered by `routeid`, matching the stored procedure.
- The current PHP code has a `synccount` quirk where `voidreasons` count is built from result set index `6`; Node uses actual response key counts through the shared `synccount` builder.

### `sp_ws_syncicsdata_others`

This procedure returns message and miscellaneous reference/master tables used by the mobile SQLite refresh.

Current Node status:

- Implemented in `src/modules/mobile/masterdatasync/repository/others.repository.ts`.
- Replaces `sp_ws_syncicsdata_others` with direct MySQL queries.
- Uses separate named functions per dataset for maintainability.
- Preserves the current procedure behavior where `var_checkmdate` is forced to `0`, meaning these tables are full-sync datasets in this endpoint.
- Populates:
  - `customermessages`
  - `salesmanmessages`
  - `vanmaster`
  - `bankmaster`
  - `cashdesc`
  - `inventorylocation`

### `sp_ws_syncicsdata_orders`

This procedure returns pending deliveries/orders, suggested sales, open stock, FOC, journey-plan credit limits, and batch expiry data.

Current Node status:

- Implemented in `src/modules/mobile/masterdatasync/repository/orders.repository.ts`.
- Replaces `sp_ws_syncicsdata_orders` with direct MySQL queries.
- Uses separate named functions per dataset for maintainability.
- Replaces physical temp tables:
  - `temp_openstock_{routeid}` is replaced by a direct `inventorytransactiondetail` query using the latest closed `routekey`.
  - `temp_seqcustomers_{routeid}` is replaced by `routesequence` subqueries.
- Populates:
  - `salesorderheader`
  - `salesorderdetail`
  - `suggestedsalesinvoice`
  - `inventorytransactiondetail`
  - `customer_foc_balance`
  - `customer_foc_detail`
  - `journeyplancreditlimit`
  - `batchexpirydetail`
  - `customer_foc`
- Preserves PHP `SELECT *` behavior for the order/FOC datasets where the stored procedure used `SELECT *`.
- `salesorderheader` and `salesorderdetail` are sourced from `deliveryheader` and `deliverydetail`, matching the stored procedure.

### `sp_ws_syncicsdata_itemmust`

This procedure is called twice by current PHP `getsyncdata1Action()`. The second call overwrites `itemmustheader` and `itemmustdetail`, then also populates `itemnrp` and `custnrp`.

Current Node status:

- Implemented in `src/modules/mobile/masterdatasync/repository/items.repository.ts`.
- Exposed through the single exported repository function `getItemSyncSections()`.
- Replaces `sp_ws_syncicsdata_itemmust` with direct MySQL queries.
- Node calls the logic once and returns the final effective four keys.
- Uses separate named functions per dataset for maintainability.
- Populates:
  - `itemmustheader`
  - `itemmustdetail`
  - `itemnrp`
  - `custnrp`
- Preserves PHP `SELECT *` behavior for `itemmustheader` and `itemmustdetail`, including `itemmustdetail.max_quantity` required by the mobile insert.
- The stored procedure also returns `nrp_rule`, but current PHP `getsyncdata1Action()` ignores that result set, so Node does not expose it in this endpoint.

### `sp_ws_tablet_deletemaster`

This procedure returns delete logs so the mobile app can remove stale SQLite rows after back-office deletes.

Current Node status:

- Implemented in `src/modules/mobile/masterdatasync/repository/deleteMaster.repository.ts`.
- Replaces `sp_ws_tablet_deletemaster` with direct MySQL queries.
- Does not call the MySQL `show_pk()` function.
- Resolves `fieldname` directly from `information_schema.columns`, matching `show_pk()` behavior of returning the first primary key column.
- Populates:
  - `deletemaster`
- Preserves the stored procedure allow-list of deleted table names.
- Uses `tbl_syncservice.syncdate` by `userid` and `deviceid`, matching the stored procedure.

### `sp_ws_syncicsdata_customeritemgrp`

This procedure returns customer-specific item group headers and item mappings for route customers.

Current Node status:

- Implemented in `src/modules/mobile/masterdatasync/repository/customerItemGroup.repository.ts`.
- Replaces `sp_ws_syncicsdata_customeritemgrp` with direct MySQL queries.
- Uses separate named functions for group headers and mappings.
- Populates:
  - `customeritemgrp`
  - `customeritemmap`
- Filters by route customers through `customermaster.itemmapkey` and `routesequence`, matching the stored procedure.
- Uses explicit column selection to avoid duplicate column names from the legacy `SELECT groupcode, group.*` pattern.

### `sp_ws_syncicsdata_orders`

This procedure creates:

- open stock temp table from latest closed `routekey`
- route sequence customer temp table

Node implementation recommendation:

- Use CTEs instead of physical temp tables.
- Do not create tables like `temp_openstock_{routeid}` in Node.

### `sp_ws_tablet_deletemaster`

This procedure uses `show_pk(tablename)`.

Node implementation recommendation:

- Replace `show_pk()` with a TypeScript map of table name to primary key field.
- Keep the existing allowed deleted table list exactly.

## 7. Known Current PHP Issues To Preserve Or Fix Carefully

These are existing quirks in the PHP code:

- `synctime` data is read from `resultdata[6]`, but `synccount` count uses `count($resultdata[7])`.
- The first `itemmustheader` assignment checks `count($resultdata[1])` but returns `resultdata[0]`.
- `sp_ws_syncicsdata_itemmust` is called twice. The second call overwrites `itemmustheader` and `itemmustdetail`, then adds `itemnrp` and `custnrp`.
- `sp_ws_syncicsdata_survey` returns visual result sets at indexes 10 and 11, but `getsyncdata1Action()` ignores them.
- `sp_ws_syncicsdata_setting` returns `TTS_MONTH_TARGET` after `CurrencyMaster`, but `getsyncdata1Action()` ignores that result set.
- Many procedures force `var_checkmdate = 0`, so incremental sync by `mdate` is effectively disabled in these procedures.
- PHP runs `array_walk_recursive($result, 'replacenul')`; Node must reproduce whatever `replacenul` does for null/string compatibility.

Recommendation:

- In the first Node implementation, preserve output keys and practical mobile behavior.
- Log these quirks as compatibility decisions.
- Do not remove or rename response keys.

## 8. Recommended Node Module Structure

```text
src/modules/mobile/auth/
  auth.routes.ts
  auth.controller.ts
  auth.service.ts
  auth.mapper.ts
  auth.types.ts
  repository/
    auth.repository.ts

src/modules/mobile/masterdatasync/
  masterdatasync.controller.ts
  masterdatasync.service.ts
  masterdatasync.mapper.ts
  masterdatasync.types.ts
  repository/
    setting.repository.ts
    items.repository.ts
    inventory.repository.ts
    customers.repository.ts
    promotionPricing.repository.ts
    survey.repository.ts
    reasons.repository.ts
    others.repository.ts
    orders.repository.ts
    deleteMaster.repository.ts
    customerItemGroup.repository.ts
```

Item master data and item-must/NRP data are intentionally handled together in:

```text
src/modules/mobile/masterdatasync/repository/items.repository.ts
```

That repository exposes one public function:

```ts
getItemSyncSections()
```

It returns all item-related mobile response sections:

```text
itemgroup
ItemMaster
itempackagemaster
routegoal
avgsalesqty
outletitemcodes
taxmaster
itemmustheader
itemmustdetail
itemnrp
custnrp
```

## 9. Suggested Implementation Order

Do not implement all result sets at once. Build and compare section by section.

1. Create `getsyncdata1` response shell with all keys returning empty arrays.
2. Add `synccount` builder.
3. Implement `setting` group:
   - `ControlPanel`
   - `Setup`
   - `companydetail`
   - `SalesmanMaster`
   - `RouteMaster`
   - `startendday`
   - `synctime`
   - `CurrencyMaster`
4. Implement item master and item-must group in `items.repository.ts`:
   - `itemgroup`
   - `ItemMaster`
   - `itempackagemaster`
   - `routegoal`
   - `avgsalesqty`
   - `outletitemcodes`
   - `taxmaster`
   - `itemmustheader`
   - `itemmustdetail`
   - `itemnrp`
   - `custnrp`
5. Implement inventory group:
   - `startingloaddetail`
   - `inventorysummarydetail`
6. Implement customer route set helper.
7. Implement customer group:
   - `CustomerMaster`
   - `salescalender`
   - `routesequence`
   - `customerinvoice`
8. Implement promotion/pricing group.
9. Implement survey/reasons/others reference data.
10. Implement orders/open stock/FOC group.
11. Implement `deletemaster`.
12. Implement `customeritemgrp` and `customeritemmap`.
13. Compare full JSON against Zend for a real route.

## 10. Performance Plan

This API will be heavy for 2000+ users, so implementation must be careful.

Recommended rules:

- Use one MySQL pool.
- Run independent read groups in controlled parallel batches, not unlimited parallelism.
- Avoid physical temp tables.
- Prefer CTEs and derived tables.
- Add indexes only after comparing execution plans.
- Stream or compress large responses if needed, but keep JSON shape unchanged.
- Add timing logs per section:
  - settings
  - items
  - inventory
  - customers
  - promotion/pricing
  - survey
  - reasons
  - others
  - orders
  - delete master

## 11. Acceptance Criteria

For a real route/user/device:

- Mobile endpoint path works without mobile app changes.
- JSON has every key listed in this document.
- Missing datasets return `[]`, not `null`.
- `synccount` contains matching table names and counts.
- Node output can be compared against Zend output for the same route.
- `WizzitIndent.java` can parse and insert the response into SQLite.
- No stored procedures are called by Node.

## 12. Next Action Before Coding

Before coding `getsyncdata1`, capture one real Zend response for a known route:

```text
/api/index/getsyncdata1/routeid/{realRoute}/userid/-1/deviceid/0/mdate/2024-05-25/table/4
```

Then implement the Node response shell and compare:

```text
same keys
same arrays
same empty-array behavior
same null replacement behavior
same date/number/string shape where mobile depends on it
```
