# ---------- DEPENDENCIES ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ---------- BUILD ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Копируем зависимости и код
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Включаем production-сборку
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Сборка с standalone режимом
RUN npm run build

# ---------- PRODUCTION ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Создаем не-root пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Создаём папки для персистентных данных и даём права пользователю
# Это нужно для bind mount — чтобы nextjs мог писать в подмонтированные папки
RUN mkdir -p /app/data/blog /app/data/uploads/blog && \
    chown -R nextjs:nodejs /app/data

# Копируем только собранный standalone билд
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Копируем статику (важно: standalone ее не копирует автоматически)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Копируем public папку, если она нужна
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

# Запускаем через node с ограничением памяти (360MB = ~70% от 512MB лимита)
# --optimize_for_size помогает V8 эффективнее управлять памятью
CMD ["node", "--max-old-space-size=360", "--optimize_for_size", "server.js"]