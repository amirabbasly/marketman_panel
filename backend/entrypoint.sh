#!/usr/bin/env bash
set -e

mkdir -p /app/uploads/profiles
echo ">>> Generating Prisma client..."
npx prisma generate

echo ">>> Waiting for PostgreSQL and pushing schema..."
until npx prisma db push --accept-data-loss; do
  echo "PostgreSQL not ready, retrying in 2s..."
  sleep 2
done

echo ">>> Seeding default manager..."
node seed.js

echo ">>> Starting Express server..."
exec node src/index.js
