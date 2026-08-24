# SFA Mobile API

Node.js TypeScript API for migrating the current Zend Framework mobile API.

## Rules

- Keep the PhoneGap mobile app unchanged.
- Keep existing endpoint paths and response shapes.
- Do not call MySQL stored procedures.
- Replace procedure behavior with TypeScript services and repositories.

## Commands

```bash
npm install
npm run dev
npm run build
npm start
```

## First Endpoint

```text
GET /health
```
