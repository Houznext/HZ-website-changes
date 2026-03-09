# ---------- Build stage ----------
    FROM node:22-alpine AS builder

    WORKDIR /app
    
    # Install deps
    COPY package*.json ./
    RUN npm ci --legacy-peer-deps
    
    # Copy source
    COPY . .
    # COPY certs/rds-ca.pem /app/certs/rds-ca.pem
    
    # Build NestJS
    RUN npm run build
    
    # ---------- Runtime stage ----------
    FROM node:22-alpine
    
    WORKDIR /app
    
    ENV NODE_ENV=production
    
    # Copy only required files
    COPY --from=builder /app/package*.json ./
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/dist ./dist
    
    # Expose backend port
    EXPOSE 4400
    
    # Start app
    CMD ["node", "dist/src/server.js"]