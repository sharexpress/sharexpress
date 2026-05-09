# frontend/Dockerfile
# Build-only image - output static files to volume

FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --prefer-offline --no-audit

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ============================================================
# Final stage - just keep the build output
# ============================================================
FROM node:20-alpine

WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/dist /app/dist

# Copy package.json for reference
COPY package.json .

# This container is used just for the build output
# The /app/dist volume is mounted on the host/nginx server
# No CMD needed - this is a build artifact container

LABEL description="ShareXpress Frontend Build - Output to dist volume"