# Multi-stage production Dockerfile for VetCare Pro SaaS
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies needed for Vite & esbuild)
RUN npm ci

# Copy source files
COPY . .

# Run production build
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled frontend and bundled server from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "dist/server.cjs"]
