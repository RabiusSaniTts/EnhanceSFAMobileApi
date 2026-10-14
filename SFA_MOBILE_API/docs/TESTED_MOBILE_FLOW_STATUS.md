# Tested Mobile Flow Status

## Last Confirmed Status

The user confirmed that after recent Node API refactors, the mobile app was tested and everything was working correctly.

## Confirmed Working Areas

| Flow | Status | Notes |
| --- | --- | --- |
| Device/company check | Working | `/api/index/companyidbydevice/...` |
| Salesman login | Working | `/api/index/salesmanlogin/...` |
| Salesman version check | Working | `/api/index/salesmanverchk/...` |
| Check load | Working | `/api/ws/checkload/...` |
| Master sync | Working | `/api/index/getsyncdata1/...` |
| Update sync date | Working | `/api/index/updatesyncdate/...` |
| Start day | Working | `/api/ws/senddata?startday=[...]` |
| Transaction upload | Working | `/api/sync/senddata` |
| Import inventory count | Working | `/api/transaction/importinventorycount/...` |
| Transaction data count | Working | `/api/transaction/trandata/...` |
| End day | Working | `/api/ws/endday?endday=[...]` |

## Recent Response Time Samples

These are Node server log response times from mobile testing.

| Endpoint | Observed Time |
| --- | ---: |
| `/api/index/companyidbydevice/...` | ~17 ms |
| `/api/index/salesmanlogin/...` | ~36 ms |
| `/api/ws/checkload/...` | ~3 ms |
| `/api/ws/senddata?startday=...` | ~21 ms |
| `/api/ws/endday?endday=...` | ~20-43 ms |
| `/api/index/updatesyncdate/...` | ~95 ms |
| `/api/transaction/importinventorycount/...` | ~97-122 ms |
| `/api/sync/senddata` | ~81-1148 ms |
| `/api/transaction/trandata/...` | ~1089-2594 ms |
| `/api/index/getsyncdata1/.../table/4` | ~4949 ms |

## Performance Watch List

Focus later optimization on:

```text
/api/index/getsyncdata1
/api/transaction/trandata
```

Smaller auth/start/end APIs are already fast enough based on current testing.

## Testing Rule

Whenever any response shape, SQL query, or parser changes, retest the matching mobile screen.

Important full flow:

```text
fresh login
-> sync
-> start day
-> create transactions
-> upload
-> transaction count
-> settlement/end day
```

