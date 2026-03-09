FROM node:22-alpine AS deps

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS builder

WORKDIR /app

ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=4096

# Install build dependencies
RUN apk add --no-cache libc6-compat

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_LOCAL_API_ENDPOINT
ARG NEXT_PUBLIC_GOOGLE_API_KEY
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ARG FLOOR_PLAN_AI_API_KEY

ENV NEXT_PUBLIC_LOCAL_API_ENDPOINT=$NEXT_PUBLIC_LOCAL_API_ENDPOINT
ENV NEXT_PUBLIC_GOOGLE_API_KEY=$NEXT_PUBLIC_GOOGLE_API_KEY
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV FLOOR_PLAN_AI_API_KEY=$FLOOR_PLAN_AI_API_KEY

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-http-header-size=32768"

# Create non-root user
RUN addgroup -g 1001 nodejs
RUN adduser -S nextjs -u 1001

# Copy only standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3001

ENV PORT=3001

CMD ["node", "server.js"]
