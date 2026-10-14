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
