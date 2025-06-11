FROM node:18-alpine AS base

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies without running scripts and ignore npm audit
RUN npm ci --ignore-scripts

# Copy source code for development
COPY . .

# Development stage ends here

# Build stage
FROM base AS builder

# Set production environment
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only, without running scripts
RUN npm ci --only=production --ignore-scripts

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/services ./services

# Create uploads and logs directories
RUN mkdir -p uploads logs

# Set production environment
ENV NODE_ENV=production

# Expose the ports the apps run on
EXPOSE 7822 7823 7824

# Create startup script
COPY <<'EOF' /app/start.sh
#!/bin/sh
node services/tax-email-service.js &
TAX_SERVICE_PID=$!
npm start &
MAIN_APP_PID=$!
trap "kill $TAX_SERVICE_PID $MAIN_APP_PID" SIGTERM SIGINT
wait
EOF

# Make the startup script executable
RUN chmod +x /app/start.sh

# Start both services using the startup script
CMD ["/bin/sh", "/app/start.sh"] 