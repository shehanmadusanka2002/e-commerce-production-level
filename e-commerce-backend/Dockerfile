# Production Dockerfile for NestJS
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client and build the app
RUN npx prisma generate
RUN npm run build

# --- Production Image ---
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose the port (Render will provide this)
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]
