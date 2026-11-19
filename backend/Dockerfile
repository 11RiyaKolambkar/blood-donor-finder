# =============================================================================
# PulseNet Backend — Multi-stage Dockerfile
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Builder — compiles TypeScript to JavaScript
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (cached layer unless package files change)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and compile
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Runner — lean production image
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner

LABEL org.opencontainers.image.title="PulseNet Backend"
LABEL org.opencontainers.image.description="PulseNet emergency healthcare platform API"
LABEL org.opencontainers.image.vendor="PulseNet"

WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S pulsenet -u 1001 -G nodejs

# Ensure the app owns its own files
RUN chown -R pulsenet:nodejs /app

USER pulsenet

EXPOSE 5000

# Graceful shutdown: node handles SIGTERM sent by Docker
CMD ["node", "dist/server.js"]
