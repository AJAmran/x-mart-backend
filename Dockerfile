# ── Build stage: compile TypeScript ──────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies from the lockfile first so this layer is cached until a
# dependency actually changes.
COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build


# ── Runtime stage ────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

# wget is what the compose healthcheck calls.
RUN apk add --no-cache wget

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

# The catalog fixture ships with the image so `seed:catalog` works without a
# bind mount.
COPY src/seed/fixtures ./src/seed/fixtures

# Run as an unprivileged user. The node image already provides one.
USER node

EXPOSE 5000

# Reports the database connection too, so a container that is up but cannot
# reach Mongo is correctly treated as unhealthy.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5000/api/v1/health || exit 1

CMD ["node", "dist/server.js"]