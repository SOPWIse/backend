# Build stage
FROM node:21 AS builder

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN npx prisma generate
RUN pnpm run build

# Production stage
FROM node:20-slim 

# Install pnpm in production image
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client in production
RUN npx prisma generate

# Install production dependencies only
RUN pnpm install --prod

# Environment variables
ENV DATABASE_URL=""
ENV SECRET=""
ENV BUCKET_NAME=""
ENV ACCESS_KEY=""
ENV SECRET_KEY=""
ENV REGION=""

EXPOSE 3000
CMD ["pnpm", "start:prod"]