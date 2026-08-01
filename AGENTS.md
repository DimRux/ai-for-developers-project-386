# AGENTS.md

## Project Overview

Booking Calendar (cal.com-like) — npm workspaces monorepo with `spec/`, `front/`, and `back/` (backend not yet implemented).

## Workspace Layout

| Workspace | Purpose | Tech |
|-----------|---------|------|
| `spec/` | API contract | TypeSpec → OpenAPI 3.1 (`spec/generated/openapi.yaml`) |
| `front/` | SPA | React 19, Vite 8, TypeScript 6, Tailwind CSS 4, shadcn/ui (base-nova) |
| `back/` | Backend | **Not yet created** — listed in root `package.json` but missing |

## Key Commands (from repo root)

```bash
# Contract → Frontend types pipeline (must run in order)
npm run sync:contract          # compile TypeSpec → generate openapi-typescript types

# Or step by step:
npm run spec:compile           # tsp compile . → generated/openapi.yaml
npm run front:api:gen          # openapi-typescript → src/shared/api/types.ts

# Frontend
npm run front:dev              # Vite dev server (port 5173)
npm run front:mock             # Prism mock API (port 4010) + Vite dev server concurrently
npm run front:lint             # eslint .
npm run front:build            # tsc -b && vite build

# Spec
npm run spec:compile           # tsp compile . → OpenAPI 3.1
npm run spec:watch             # tsp compile . --watch
npm run spec:format            # tsp format "**/*.tsp"
```

## Contract-to-Types Flow

1. Edit `spec/main.tsp` (TypeSpec source of truth)
2. Run `npm run sync:contract` — compiles TypeSpec to OpenAPI, then generates `front/src/shared/api/types.ts`
3. Frontend imports types from `@/shared/api/types.ts`

**Important**: The generated `types.ts` is committed to git. Always run `sync:contract` after editing `main.tsp`.

## Frontend Architecture

Feature-Sliced Design structure under `front/src/`:

- `app/` — providers (React Query), routes, global styles
- `pages/` — route-level components: home, event-type, booking-confirmation, admin (dashboard, event-types), not-found
- `widgets/` — composite UI blocks: booking-form, bookings-table, event-type-card, event-types-list, slots-calendar
- `features/` — user interactions: create-booking, create-event-type, filter-bookings
- `entities/` — domain models: booking, event-type, owner, slot
- `shared/` — API client (axios, baseURL `/api/v1`), config, UI primitives (shadcn), lib utilities

Path alias: `@/` → `front/src/`

## Dev Server Setup

- Vite proxies `/api` to `VITE_API_PROXY_TARGET` (strip `/api/v1` prefix)
- `.env.development`: proxy target is `http://localhost:4010` (Prism mock)
- `.env.example`: proxy target is `http://localhost:3000` (real backend, when available)
- Use `npm run front:mock` for full mock development (Prism + Vite)

## Linting & Formatting

- ESLint 9 with typescript-eslint + prettier plugin
- Prettier: semi, single quotes, trailing comma es5, printWidth 100, tabWidth 2
- Unused vars: `@typescript-eslint/no-unused-vars` warns on `_`-prefixed names
- Oxlint config exists (`.oxlintrc.json`) for react/typescript rules — used by the template but ESLint is the active linter

## TypeSpec Notes

- API base path: `/api/v1`
- No authentication (`securitySchemes` absent by design)
- Global slot availability: bookings block slots across all event types
- `spec/DOMAIN.md` contains full domain model and invariants — read it for business logic context
- Redocly lint warning about `security-defined` is expected and should be ignored

## CI

- Only `hexlet-check.yml` — runs Hexlet project tests on push to any branch
- **Do not edit or delete** `.github/workflows/hexlet-check.yml`
- Tests run automatically once all tasks are completed in the Hexlet interface
