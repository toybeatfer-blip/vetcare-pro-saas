# Production Dockerfile for VetCare Pro SaaS
FROM node:20-slim

WORKDIR /app

# Copy package configuration
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source files
COPY . .

# Increase memory limit for Vite compilation on cloud builders
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build client bundle
RUN npm run build

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start application server
CMD ["node", "server.js"]
