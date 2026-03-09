FROM node:22-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_LOCAL_API_ENDPOINT
ENV NEXT_PUBLIC_LOCAL_API_ENDPOINT=$NEXT_PUBLIC_LOCAL_API_ENDPOINT
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm ci --no-audit --no-fund --include=dev

COPY . .
RUN npm run build


# ---------- Runner ----------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
