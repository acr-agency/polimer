#!/bin/bash
# Скрипт для создания дампа PostgreSQL
# Использование: bash scripts/db-dump.sh [имя_файла]

set -e

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-polimer}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"

FILENAME="${1:-blog_dump_$(date +%Y%m%d_%H%M%S).sql}"

export PGPASSWORD="$DB_PASSWORD"

echo "📦 Создаю дамп БД $DB_NAME -> $FILENAME ..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --no-owner --no-acl \
  --data-only --table=blog_articles \
  > "$FILENAME"

echo "✅ Дамп сохранён: $FILENAME"
echo "   Размер: $(wc -c < "$FILENAME") байт"
echo ""
echo "📋 Для импорта на VPS:"
echo "   PGPASSWORD=postgres psql -h localhost -U postgres -d polimer -f $FILENAME"