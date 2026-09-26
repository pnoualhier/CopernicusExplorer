# Dockerfile pour Copernicus Explorer
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/src/types ./src/types
COPY --from=builder /app/public ./public
COPY --from=builder /app/tsconfig.json ./

EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]
