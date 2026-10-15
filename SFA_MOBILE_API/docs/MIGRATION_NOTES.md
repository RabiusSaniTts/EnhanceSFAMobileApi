# Migration Notes

This application is the new Node.js TypeScript API for the SFA mobile migration.

Initial focus:

1. Login and device setup.
2. Mobile sync through `index/getsyncdata1`.
3. Transaction upload through `sync/senddata`.
4. End day and logout.

The primary mobile API flow has been migrated and tested from the PhoneGap app. Future endpoint changes must still be handled by comparing:

- Current Zend controller behavior.
- Current PhoneGap caller behavior.
- Current stored procedure result shape.
- New direct MySQL table query result shape.

Current developer references:

- `docs/DEBUGGING_GUIDE.md`
- `docs/MOBILE_API_ENDPOINT_MAP.md`
- `docs/DEVELOPMENT_GUIDELINES.md`
- `docs/SESSION_HANDOFF.md`

## 2026-10-15 Development Checkpoint

- Added maintenance documentation directly in auth, WS, transactions, and master-data sync TypeScript files.
- Removed one-use WS `process*` wrappers and moved their workflows into exported route handlers.
- Merged transaction implementation/action pairs so each transaction endpoint has one controller function.
- Preserved all mobile endpoint paths, HTTP methods, request parsing, database transaction behavior, and Zend-compatible response formats.
- Confirmed the configured MySQL connection pool limit is 10 connections; queued requests wait for a released connection.
- Verified the checkpoint with `npm run typecheck` and `npm run build`.
