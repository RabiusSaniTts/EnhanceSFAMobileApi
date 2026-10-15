# Debugging Guide

This guide explains how to debug the Node.js mobile API without changing the PhoneGap mobile app.

## 1. Start The API

Development mode:

```powershell
cd C:\NodeJS\EnhanceSFAMobileApi\SFA_MOBILE_API
npm run dev
```

Production build mode:

```powershell
cd C:\NodeJS\EnhanceSFAMobileApi\SFA_MOBILE_API
npm run build
npm start
```

## 2. Enable Useful Logs

Use these `.env` values while debugging:

```env
LOG_LEVEL=debug
DEBUG_PAYLOAD=false
```

Keep `DEBUG_PAYLOAD=false` for normal debugging because mobile upload payloads can be very large.

Temporarily use this only when you need to inspect parsed body keys:

```env
DEBUG_PAYLOAD=true
```

Do not leave payload debugging enabled in production.

## 3. Read The Log

Every request logs:

- HTTP method
- full URL
- matched Fastify route
- route params
- query key names
- status code
- response time

Failed requests also log:

- error message
- stack trace
- route params
- query key names

The mobile response may still show:

```json
{"status":false,"message":"Internal server error"}
```

That is intentional. The real technical reason is in the server log.

## 4. Trace Any API

Use this flow:

```text
mobile screen
-> mobile JS or Java file
-> exact API URL
-> src/modules/mobile/mobile.routes.ts
-> controller
-> service
-> repository
-> database table
-> response back to mobile
```

Example:

```text
startofday/startofday.html
-> /api/ws/senddata?startday=[]
-> mobile.routes.ts
-> ws/controllers/ws.controller.ts
-> ws/models/startEndDay.model.ts
-> startendday, routesequence
```

## 5. Debug Common Problems

### Route Not Found

Mobile shows:

```json
{"message":"Route GET:/api/... not found","error":"Not Found","statusCode":404}
```

Check:

1. Exact URL in mobile log.
2. HTTP method: `GET` or `POST`.
3. Matching route in `mobile.routes.ts`.
4. Legacy path compatibility, especially missing optional params like `userid`.

### Internal Server Error

Check server log for:

- `Unknown column`
- `Bind parameters must not contain undefined`
- `Duplicate entry`
- SQL syntax error
- missing table

Fix usually belongs in repository mapping or SQL.

### Acknowledgement Not Received

This usually means the API returned a response, but not in the shape expected by the old mobile JavaScript.

Check:

1. Mobile console `Response Text`.
2. Zend response for the same operation.
3. Node response shape.
4. Whether mobile expects `status`, `routekey`, `data`, or plain text.

### Sync Data Missing

Compare Zend and Node JSON:

1. Array name exists.
2. Array row count is close or expected.
3. Required field names match exactly.
4. Numeric/string style matches old Zend when mobile SQLite insert is strict.

## 6. Debug Upload Data

For `/api/sync/senddata`, find which array mobile uploaded:

- `salesinvoice`
- `salesorder`
- `inventorytransactionheader`
- `inventorytransactiondetail`
- `customeroperations`
- `routeactivity`
- `arcollection`
- other transaction arrays

Then trace:

```text
transactions.controller.ts
-> transactions.service.ts
-> transactions/repository/*.repository.ts
```

If the log says a bind value is `undefined`, map that field to `null` or the old Zend default value.

## 7. Required Checks After Fix

Run:

```powershell
npm run typecheck
npm run build
```

Then test the same mobile screen again.

