# Project Instructions For Codex And Developers

## Project Context

This repository contains a legacy Zend Framework SFA API, a PhoneGap mobile app, and the new Node.js TypeScript API project:

```text
SFA_MOBILE_API
```

The Node.js API is a compatibility-first migration. The mobile app should continue working without code changes.

## Non-Negotiable Rules

- Preserve Zend/mobile API response contracts.
- Do not rename response keys used by the mobile app.
- Do not remove legacy endpoint paths unless confirmed unused by mobile code and approved.
- Do not change the mobile app unless the task explicitly asks for it.
- Keep SQL inside repository files.
- Keep controllers thin.
- Put business workflow in services.
- Use `commonUtils.ts` for reusable technical helpers.
- Keep business/table-specific helpers local to the relevant module.
- Never pass `undefined` into mysql2 bind parameters. Use `null`, `0`, or a required value based on legacy behavior.

## Required Verification

After TypeScript code changes in `SFA_MOBILE_API`, run:

```bash
npm run typecheck
npm run build
```

For mobile compatibility changes, test the real mobile flow where possible:

- device check
- salesman login
- master sync
- start day
- transaction upload
- transaction lookup
- end day
- logout

## Architecture Pattern

The project uses:

```text
Route -> Controller -> Service -> Repository -> Database -> Response
```

Main pattern:

```text
Layered Architecture + Repository Pattern
```

Supporting patterns:

- Mapper pattern
- Type/DTO contract pattern
- Legacy compatibility adapter style

## Important Files

```text
SFA_MOBILE_API/src/modules/mobile/mobile.routes.ts
SFA_MOBILE_API/src/modules/mobile/auth
SFA_MOBILE_API/src/modules/mobile/masterdatasync
SFA_MOBILE_API/src/modules/mobile/transactions
SFA_MOBILE_API/src/modules/mobile/ws
SFA_MOBILE_API/src/shared/utils/commonUtils.ts
SFA_MOBILE_API/src/shared/db/transaction.ts
```

## Documentation To Read First

```text
SFA_MOBILE_API/docs/SFA_MOBILE_API_ARCHITECTURE.md
SFA_MOBILE_API/docs/CONTROLLER_SERVICE_REPOSITORY_WORKFLOW.md
SFA_MOBILE_API/docs/GETSYNCDATA1_IMPLEMENTATION_MAP.md
SFA_MOBILE_API/docs/TRANSACTION_UPLOAD_API_MAP.md
SFA_MOBILE_API/docs/SESSION_HANDOFF.md
SFA_MOBILE_API/docs/TESTED_MOBILE_FLOW_STATUS.md
```

## Git Guidance

- Commit stable working checkpoints.
- Keep unrelated changes out of the same commit.
- Do not revert other developers' work without explicit approval.
- Good commit style:

```text
refactor: simplify sync repositories and centralize shared utilities
fix: preserve zend response for mobile end day
docs: add mobile api migration handoff notes
```

