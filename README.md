### Hexlet tests and linter status:
[![Actions Status](https://github.com/DimRux/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/DimRux/ai-for-developers-project-386/actions)

---

## Quick Start

### Prerequisites

- Node.js 22+
- npm (workspace mode)

### Development

```bash
# Install dependencies
npm install

# Run database migrations and seed
cd back
npm run prisma:migrate
npm run db:seed
cd ..

# Start both backend and frontend
npm run dev
# → Backend: http://localhost:3000/api/v1
# → Frontend: http://localhost:5173
```

Or run individually:

```bash
npm run back:dev    # NestJS watch mode on port 3000
npm run front:dev   # Vite on port 5173, proxies /api → localhost:3000
```

### Mock Mode (no backend)

```bash
npm run front:mock  # Prism mock API (port 4010) + Vite dev server
```

### Docker

```bash
docker compose up --build
# → Backend: http://localhost:3000/api/v1
# → Frontend: http://localhost:8080 (nginx)
```

### Smoke Tests

```bash
cd back
node dist/main.js &
sleep 2
bash scripts/smoke.sh
# 17 checks covering all 9 API operations
```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend + frontend concurrently |
| `npm run back:dev` | Backend in watch mode |
| `npm run front:dev` | Frontend dev server |
| `npm run front:mock` | Frontend with Prism mock (no backend needed) |
| `npm run back:build` | Build backend |
| `npm run front:build` | Build frontend |
| `npm run sync:contract` | Regenerate types from TypeSpec for both workspaces |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed Owner + demo EventTypes |
| `npm run db:reset` | Reset database |

### Project Structure

```
booking-calendar/
├── spec/                  # API contract (TypeSpec → OpenAPI)
├── front/                 # React SPA (Vite + Tailwind + shadcn/ui)
│   └── src/
│       ├── app/           # Providers, routes, global styles
│       ├── pages/         # Route components
│       ├── widgets/       # Composite UI blocks
│       ├── features/      # User interactions
│       ├── entities/      # Domain models
│       └── shared/        # API client, config, UI primitives
├── back/                  # NestJS REST API
│   ├── prisma/            # Schema, migrations, seed
│   └── src/
│       ├── owner/         # Owner profile (read-only)
│       ├── event-types/   # Admin + public controllers
│       ├── bookings/      # Admin + public controllers
│       ├── slots/         # Slot generation engine
│       ├── common/        # Errors, filters, DTOs
│       └── shared/        # Generated API types
├── docker-compose.yml     # Full stack
└── package.json           # Workspace root scripts
```
