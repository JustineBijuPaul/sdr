# Multi-stage Dockerfile for South Delhi Real Estate Application
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    bash \
    curl \
    tzdata

# Set timezone
ENV TZ=Asia/Kolkata
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Install PM2 globally
RUN npm install -g pm2@latest tsx@latest

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p /app/logs /app/uploads /app/dist

# Build stage
FROM base AS builder

# Install all dependencies (including dev dependencies)
RUN npm ci

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install system dependencies for production
RUN apk add --no-cache \
    bash \
    curl \
    tzdata \
    mysql-client

# Set timezone
ENV TZ=Asia/Kolkata
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Create app directory
WORKDIR /app

# Install PM2 and TSX globally
RUN npm install -g pm2@latest tsx@latest

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

# Copy necessary files
COPY tsconfig*.json ./
COPY ecosystem.config.cjs ./
COPY start-production.js ./
COPY server ./server
COPY shared ./shared
COPY migrations ./migrations
COPY scripts/init-superadmin.js ./scripts/

# Create necessary directories with correct permissions
RUN mkdir -p /app/logs /app/uploads && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 7822

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:7822/api/health || exit 1

# Start command
CMD ["pm2-runtime", "start", "ecosystem.config.cjs"] 