# Build stage
FROM node:20 AS builder

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@8.15.7 --activate
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN npx prisma generate
RUN pnpm run build

# Production stage
FROM node:20-bullseye

# Install pnpm in production image
RUN corepack enable && corepack prepare pnpm@8.15.7 --activate

# Install system dependencies for Puppeteer and Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
	ca-certificates \
	fonts-liberation \
	libappindicator3-1 \
	libasound2 \
	libatk-bridge2.0-0 \
	libatk1.0-0 \
	libc6 \
	libcairo2 \
	libcups2 \
	libdbus-1-3 \
	libdrm2 \
	libexpat1 \
	libfontconfig1 \
	libgbm1 \
	libgcc1 \
	libglib2.0-0 \
	libgtk-3-0 \
	libnspr4 \
	libnss3 \
	libpango-1.0-0 \
	libpangocairo-1.0-0 \
	libstdc++6 \
	libx11-6 \
	libx11-xcb1 \
	libxcb1 \
	libxcomposite1 \
	libxcursor1 \
	libxdamage1 \
	libxext6 \
	libxfixes3 \
	libxi6 \
	libxrandr2 \
	libxrender1 \
	libxshmfence1 \
	libxss1 \
	libxtst6 \
	lsb-release \
	wget \
	xdg-utils \
	chromium \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/*

# Configure Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Set language to prevent locale issues
ENV LANG C.UTF-8

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

EXPOSE 80
# CMD ["pnpm", "start:prod"]


COPY start.sh ./start.sh
RUN chmod +x ./start.sh

CMD ["./start.sh"]
