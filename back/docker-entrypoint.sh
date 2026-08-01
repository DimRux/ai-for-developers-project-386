#!/bin/sh
set -e

echo "Running migrations..."
npx prisma migrate deploy

echo "Seeding database..."
npx ts-node --project tsconfig.json prisma/seed.ts 2>/dev/null || true

echo "Starting server..."
exec "$@"
