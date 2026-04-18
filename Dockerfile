# ============================================================
# Stage 1: Dependencies
# ============================================================
FROM node:22-alpine AS deps

WORKDIR /app

# Install system dependencies needed for native modules
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Install dependencies based on lockfile present
RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile; \
  else echo "No lockfile found." && exit 1; \
  fi


# ============================================================
# Stage 2: Builder
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy full source
COPY . .

# Set production env for build optimizations
ENV NODE_ENV=production
ENV NITRO_PRESET=node-server

# Run Nuxt build
RUN npm run build


# ============================================================
# Stage 3: Production Runner
# ============================================================
FROM node:22-alpine AS runner

WORKDIR /app

# Install dumb-init for proper signal handling in containers
RUN apk add --no-cache dumb-init

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nuxt

# Copy only the built output from builder
COPY --from=builder --chown=nuxt:nodejs /app/.output ./output

# Switch to non-root user
USER nuxt

# Expose the default Nuxt port
EXPOSE 3000

# Set runtime environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

# Use dumb-init to handle PID 1 responsibilities and signals
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "output/server/index.mjs"]