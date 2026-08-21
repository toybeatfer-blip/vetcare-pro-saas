# Production Dockerfile for VetCare Pro SaaS (Debian Slim for maximum compatibility with esbuild and Node.js)
FROM node:20-slim AS builder

WORKDIR /app

# Ensure build tools are installed during compile stage
ENV NODE_ENV=development

# Copy package manifests
COPY package*.json ./

# Install all build dependencies
RUN npm install

# Copy application source files
COPY . .

# Build frontend and compile Node server
RUN npm run build

# Production runtime stage
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package manifests and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Expose server port
EXPOSE 3000

# Launch server
CMD ["node", "dist/server.cjs"]
