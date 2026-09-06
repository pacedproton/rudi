# Multi-stage Dockerfile for Lern-Rudi SvelteKit App (adapter-node)
# Stage 1: Build the SvelteKit app
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app (env vars will be read at runtime, not build time)
RUN npm run build

# Stage 2: Run with Node.js
FROM node:22-alpine AS runner

WORKDIR /app

# Copy built app from builder
COPY --from=builder /app/build build/
COPY --from=builder /app/package.json .

# Install only production dependencies
RUN npm install --omit=dev

# Create data directory for YAML storage
RUN mkdir -p /app/data

# Copy data files if they exist
COPY --from=builder /app/data ./data/

# Expose port
EXPOSE 3000

# Set environment variables (can be overridden at runtime)
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Start the server
CMD ["node", "build"]
