# Migration Notes

This application is the new Node.js TypeScript API shell for the SFA mobile migration.

Initial focus:

1. Login and device setup.
2. Mobile sync through `index/getsyncdata1`.
3. Transaction upload through `sync/senddata`.
4. End day and logout.

The current skeleton registers the old mobile API paths as placeholders. Each endpoint must be migrated one at a time by comparing:

- Current Zend controller behavior.
- Current PhoneGap caller behavior.
- Current stored procedure result shape.
- New direct MySQL table query result shape.
