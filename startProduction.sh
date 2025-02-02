#!/bin/sh
set -e

echo "Generating Prisma client..."
npx prisma generate

echo "Applying database migrations..."
npx prisma migrate deploy

echo "Starting the application..."
exec pnpm start:prod