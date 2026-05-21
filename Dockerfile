# Stage 1 — Build
FROM node:22-slim AS builder

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

# Makes pnpm node_modules flatter so @prisma/client resolution is reliable
RUN echo "shamefully-hoist=true" > .npmrc

RUN pnpm install --frozen-lockfile

# Copy source after dependency install for better Docker caching
COPY . .

# Generate Prisma Client from the schema inside the image
RUN pnpm prisma generate --schema=prisma/schema.prisma

# Build NestJS app
RUN pnpm build


# Stage 2 — Production
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# Copy built app and generated dependencies from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/src/main.js"]