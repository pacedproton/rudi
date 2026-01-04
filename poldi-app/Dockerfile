# Multi-stage Dockerfile for Lern-Rudi SvelteKit App
# Stage 1: Build the SvelteKit app
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the static site
# Note: Environment variables prefixed with VITE_ are embedded at build time
ARG VITE_OPENAI_API_KEY
ENV VITE_OPENAI_API_KEY=$VITE_OPENAI_API_KEY

RUN npm run build

# Stage 2: Serve with Caddy
FROM caddy:2-alpine

# Copy built static files from builder
COPY --from=builder /app/build /srv

# Copy Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Caddy runs automatically with the Caddyfile
