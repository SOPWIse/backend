#!/bin/sh
set -e

# Run migrations
npx prisma migrate deploy

# Start the application
exec pnpm start:prod