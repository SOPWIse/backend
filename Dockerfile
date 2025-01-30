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

# Install necessary dependencies for Puppeteer and Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
	fonts-liberation \
	libasound2 \
	libatk-bridge2.0-0 \
	libatk1.0-0 \
	libcups2 \
	libdrm2 \
	libgbm1 \
	libgtk-3-0 \
	libnspr4 \
	libnss3 \
	libx11-xcb1 \
	libxcomposite1 \
	libxdamage1 \
	libxrandr2 \
	xdg-utils \
	libu2f-udev \
	libxshmfence1 \
	libglu1-mesa \
	chromium \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/*

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
ENV SECRET=""
ENV BUCKET_NAME=""
ENV ACCESS_KEY=""
ENV SECRET_KEY=""
ENV REGION=""
# Puppeteer setup: Skip Chromium download and use the installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"

EXPOSE 3000
CMD ["pnpm", "start:prod"]