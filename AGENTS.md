# AGENTS.md

## Project Overview

Booking Calendar (cal.com-like) — npm workspaces monorepo with `spec/`, `front/`, and `back/`.

## Workspace Layout

| Workspace | Purpose | Tech |
|-----------|---------|------|
| `spec/` | API contract | TypeSpec → OpenAPI 3.1 (`spec/generated/openapi.yaml`) |
| `front/` | SPA | React 19, Vite 8, TypeScript 6, Tailwind CSS 4, shadcn/ui (base-nova) |
| `back/` | REST API | NestJS 11, Prisma (SQLite), Luxon (timezone-safe slot engine) |

## Key Commands (from repo root)

```bash
# Contract → types pipeline (generates for both front and back)
npm run sync:contract          # compile TypeSpec → generate types for front + back

# Or step by step:
npm run spec:compile           # tsp compile . → generated/openapi.yaml
npm run front:api:gen          # openapi-typescript → front/src/shared/api/types.ts
npm run back:api:gen           # openapi-typescript → back/src/shared/api-types.ts

# Frontend
npm run front:dev              # Vite dev server (port 5173) → proxies to back:3000
npm run front:mock             # Prism mock API (port 4010) + Vite dev server
npm run front:lint             # eslint .
npm run front:build            # tsc -b && vite build

# Backend
npm run back:dev               # NestJS watch mode (port 3000)
npm run back:build             # nest build
npm run back:start             # node dist/main (production)
npm run back:lint              # eslint .

# Database (from back/ workspace)
npm run db:migrate             # prisma migrate dev
npm run db:seed                # seed Owner + demo EventTypes
npm run db:reset               # prisma migrate reset --force

# Development
npm run dev                    # concurrently back:dev + front:dev

# Spec
npm run spec:compile           # tsp compile . → OpenAPI 3.1
npm run spec:watch             # tsp compile . --watch
npm run spec:format            # tsp format "**/*.tsp"
```

## Contract-to-Types Flow

1. Edit `spec/main.tsp` (TypeSpec source of truth)
2. Run `npm run sync:contract` — compiles TypeSpec to OpenAPI, then generates types for both workspaces
3. Frontend imports types from `front/src/shared/api/types.ts`
4. Backend imports types from `back/src/shared/api-types.ts` (convenience aliases: `Booking`, `EventType`, etc.)

**Important**: The generated `types.ts` files are committed to git. Always run `sync:contract` after editing `main.tsp`.

## Frontend Architecture

Feature-Sliced Design structure under `front/src/`:

- `app/` — providers (React Query), routes, global styles
- `pages/` — route-level components: home, event-type, booking-confirmation, admin (dashboard, event-types), not-found
- `widgets/` — composite UI blocks: booking-form, bookings-table, event-type-card, event-types-list, slots-calendar
- `features/` — user interactions: create-booking, create-event-type, filter-bookings
- `entities/` — domain models: booking, event-type, owner, slot
- `shared/` — API client (axios, baseURL `/api/v1`), config, UI primitives (shadcn), lib utilities

Path alias: `@/` → `front/src/`

## Backend Architecture

NestJS modules under `back/src/`:

- `owner/` — read-only controller + service for the single Owner profile
- `event-types/` — admin (create + list) and public (list + get) controllers
- `bookings/` — public (create + get) and admin (list with scope/filter) controllers
- `slots/` — slot generation engine (Luxon timezone math, global occupancy check)
- `prisma/` — global PrismaService module
- `common/` — ApiException (typed error codes), ApiExceptionFilter, ValidationPipe, PaginationQuery DTO
- `shared/api-types.ts` — generated from OpenAPI, re-exported as flat aliases

### Key invariants enforced in backend:

- **Global occupancy**: booking `[start; end)` checked against ALL existing bookings, not just same event type
- **Slot alignment**: `start` must be on the step grid from `workingHours.start` in Owner's timezone
- **Booking window**: only `[now; now + bookingWindowDays)` allowed
- **Atomic transactions**: `prisma.$transaction` for check-and-create in booking creation

### Error codes (from contract):

| Code | HTTP | When |
|------|------|------|
| `SLOT_TAKEN` | 409 | Time overlaps any existing booking |
| `SLOT_OUT_OF_WINDOW` | 400 | Start outside allowed window |
| `SLOT_NOT_ALIGNED` | 400 | Start not on step grid or exceeds working hours |
| `EVENT_TYPE_NOT_FOUND` | 404 | Event type doesn't exist |
| `EVENT_TYPE_ID_CONFLICT` | 409 | Duplicate event type ID |
| `BOOKING_NOT_FOUND` | 404 | Booking doesn't exist |
| `VALIDATION_ERROR` | 400 | Invalid request body |

## Dev Server Setup

- Backend: NestJS on port 3000, serves `/api/v1/*`
- Frontend: Vite on port 5173, proxies `/api` to backend
- `.env.development` (front): `VITE_API_PROXY_TARGET=http://localhost:3000`, `VITE_API_STRIP_PREFIX=false`
- `.env.mock` (front): `VITE_API_PROXY_TARGET=http://localhost:4010`, `VITE_API_STRIP_PREFIX=true` (for Prism)
- `.env.development` (back): `DATABASE_URL=file:./dev.db`, owner config, `SEED_DEMO=true`
- Use `npm run front:mock` for Prism-only development without backend

## Database

- SQLite file: `back/prisma/dev.db` (gitignored)
- Schema: `back/prisma/schema.prisma`
- Seed: `back/prisma/seed.ts` — creates Owner from env vars + 2 demo EventTypes when `SEED_DEMO=true`
- Prisma client generated into root `node_modules/@prisma/client`

## Linting & Formatting

- ESLint 9 with typescript-eslint + prettier plugin (same config in front/ and back/)
- Prettier: semi, single quotes, trailing comma es5, printWidth 100, tabWidth 2
- Unused vars: `@typescript-eslint/no-unused-vars` warns on `_`-prefixed names

## TypeSpec Notes

- API base path: `/api/v1`
- No authentication (`securitySchemes` absent by design)
- Global slot availability: bookings block slots across all event types
- `spec/DOMAIN.md` contains full domain model and invariants — read it for business logic context
- Redocly lint warning about `security-defined` is expected and should be ignored

## Smoke Tests

- `back/scripts/smoke.sh` — 17 curl-based checks covering all 9 API operations
- Run: `cd back && node dist/main.js & sleep 2 && bash scripts/smoke.sh`

## Docker

```bash
docker compose up --build    # backend on :3000, frontend on :8080 (nginx)
```

## CI

- Only `hexlet-check.yml` — runs Hexlet project tests on push to any branch
- **Do not edit or delete** `.github/workflows/hexlet-check.yml`
- Tests run automatically once all tasks are completed in the Hexlet interface
