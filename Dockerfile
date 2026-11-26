# --- STAGE 1: Build ---
FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lock* ./
RUN if [ -f bun.lock ]; then bun install --frozen-lockfile; else bun install; fi

COPY . .
RUN bun run build

# --- STAGE 2: Production ---
FROM oven/bun:1

WORKDIR /app

COPY --from=builder /app/package.json /app/bun.lock* ./
COPY --from=builder /app/dist ./dist

RUN if [ -f bun.lock ]; then bun install --frozen-lockfile --production; else bun install --production; fi

EXPOSE 3000

CMD ["bun", "dist/main.js"]
