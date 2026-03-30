FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

FROM node:18-alpine

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app /app

# Install runtime dependencies
RUN npm ci --only=production

# Create necessary directories
RUN mkdir -p /app/logs /app/data /app/configs
RUN chown -R nodejs:nodejs /app

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if(r.statusCode !== 200) throw new Error()})"

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    LOG_LEVEL=info \
    CONFIG_DIR=/app/configs \
    DATA_DIR=/app/data \
    LOG_DIR=/app/logs

# Mount volumes
VOLUME ["/app/configs", "/app/data", "/app/logs"]

# Start command
CMD ["node", "index.js"]

# Labels
LABEL maintainer="support@shopify-inventory-automation.com" \
      version="1.0.0" \
      description="Shopify Inventory Automation Skill for OpenClaw" \
      license="COMMERCIAL"