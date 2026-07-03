# Полимерные технологии — 73полимер.рф

Next.js-приложение для сайта производителя полимерпесчаных изделий (люки, плитка, бордюры, водоотводы).

**Стек:** Next.js 16 (standalone), React 19, TypeScript, MySQL, Docker, Nginx.

---

## 📋 Содержание

- [Требования к VPS](#требования-к-vps)
- [Быстрый старт (локальная разработка)](#быстрый-старт-локальная-разработка)
- [Развёртывание на VPS](#развёртывание-на-vps)
  - [1. Подготовка сервера](#1-подготовка-сервера)
  - [2. Клонирование репозитория](#2-клонирование-репозитория)
  - [3. Настройка переменных окружения](#3-настройка-переменных-окружения)
  - [4. Настройка базы данных MySQL](#4-настройка-базы-данных-mysql)
  - [5. Сборка Docker-образа и запуск](#5-сборка-docker-образа-и-запуск)
  - [6. Настройка Nginx и SSL](#6-настройка-nginx-и-ssl)
  - [7. Настройка поддоменов для городов](#7-настройка-поддоменов-для-городов)
- [Обновление проекта](#обновление-проекта)
- [Скрипты и утилиты](#скрипты-и-утилиты)
- [Архитектура проекта](#архитектура-проекта)
- [Устранение неполадок](#устранение-неполадок)

---

## Требования к VPS

| Компонент | Минимально | Рекомендуется |
|-----------|-----------|---------------|
| ОС | Ubuntu 22.04 / Debian 12 | Ubuntu 24.04 |
| CPU | 1 vCPU | 2 vCPU |
| RAM | 1 ГБ | 2 ГБ |
| Диск | 20 ГБ SSD | 40 ГБ SSD |
| Docker | 24+ | 27+ |
| Nginx | 1.24+ | 1.26+ |
| MySQL | 8.0+ | 8.4+ |
| Node.js | 20 LTS | 22 LTS |

**Домены:**
- Основной: `73полимер.рф` (IDN, punycode: `xn--73-olclohlho.xn--p1ai`)
- Поддомены городов: `волгоград.73полимер.рф`, `саратов.73полимер.рф`, и т.д.

---

## Быстрый старт (локальная разработка)

```bash
# 1. Установите зависимости
npm ci

# 2. Скопируйте .env.local в .env (если нужно)
cp .env.local .env

# 3. Запустите dev-сервер
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

---

## Развёртывание на VPS

### 1. Подготовка сервера

#### 1.1. Установка Docker

```bash
# Обновление пакетов
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Выйдите и зайдите заново (или выполните: newgrp docker)
# Проверка:
docker --version
```

#### 1.2. Установка Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

#### 1.3. Установка MySQL (если не используете внешнюю БД)

```bash
sudo apt install -y mysql-server
sudo systemctl enable mysql
sudo systemctl start mysql

# Безопасная настройка
sudo mysql_secure_installation

# Создание базы и пользователя
sudo mysql -u root -p
```

```sql
CREATE DATABASE polimer_products CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'polimer'@'%' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON polimer_products.* TO 'polimer'@'%';
FLUSH PRIVILEGES;
EXIT;
```

> **Важно:** Если MySQL работает на том же сервере, что и Docker-контейнер, используйте `DB_HOST=host.docker.internal` или IP-адрес сервера (например, `172.17.0.1` для стандартной Docker-сети). Либо запускайте MySQL в отдельном Docker-контейнере.

#### 1.4. Установка Certbot (для SSL)

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

### 2. Клонирование репозитория

```bash
# Создайте директорию проекта
sudo mkdir -p /var/www/73полимер.рф
sudo chown $USER:$USER /var/www/73полимер.рф

# Клонируйте репозиторий
cd /var/www/73полимер.рф
git clone https://github.com/acr-agency/polimer.git .
```

---

### 3. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```bash
nano .env
```

```env
# Яндекс.Метрика (основной счётчик)
ROOT_METRIKA_ID=107705030

# Bitrix24 — вебхук для CRM
BITRIX24_WEBHOOK_URL=https://resurstreyd.bitrix24.ru/rest/77/sb96a9c7b04gwb32/

# SMTP (Яндекс.Почта) — отправка форм
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_USER=ForAnalyticss@yandex.ru
SMTP_PASS=mrsezovxgogmbqfz

# Email для получения заявок с сайта
FORM_TO_EMAIL=73polimer@mail.ru
FORM_COPY_EMAIL=ForAnalyticss@yandex.ru

# База данных MySQL
DB_HOST=172.17.0.1          # IP Docker-хоста (или localhost, если MySQL не в контейнере)
DB_USER=polimer
DB_PASSWORD=your_strong_password
DB_NAME=polimer_products
```

> **Внимание:** Файл `.env` содержит чувствительные данные. Убедитесь, что он добавлен в `.gitignore` и не попадает в репозиторий. На сервере выставьте права: `chmod 600 .env`.

---

### 4. Настройка базы данных MySQL

Импортируйте схему базы данных:

```bash
mysql -u polimer -p polimer_products < src/migration/bd.sql
```

Схема создаёт следующие таблицы:
- `categories` — категории товаров
- `products` — товары
- `product_variants` — варианты товаров (модификации)
- `variant_colors` — цвета вариантов
- `product_images` — изображения
- `product_tabs` — табы с контентом

---

### 5. Сборка Docker-образа и запуск

#### 5.1. Сборка образа

```bash
cd /var/www/73полимер.рф
docker build -t polimer .
```

**Что делает Dockerfile:**
1. **deps** — устанавливает зависимости (`npm ci`)
2. **builder** — собирает production-билд в standalone-режиме
3. **runner** — минимальный образ с собранным приложением, запуск от не-root пользователя

#### 5.2. Запуск контейнера

```bash
docker run -d \
  --restart unless-stopped \
  -p 127.0.0.1:3004:3000 \
  --name polimer \
  polimer
```

**Параметры:**
- `-d` — запуск в фоне
- `--restart unless-stopped` — автоматический перезапуск
- `-p 127.0.0.1:3004:3000` — проброс порта 3000 контейнера на порт 3004 локального интерфейса (недоступен извне)
- `--name polimer` — имя контейнера

#### 5.3. Проверка

```bash
# Логи контейнера
docker logs polimer

# Статус
docker ps

# Проверка локально
curl -I http://127.0.0.1:3004
```

---

### 6. Настройка Nginx и SSL

#### 6.1. Базовая конфигурация Nginx

Создайте файл `/etc/nginx/sites-available/73полимер.рф`:

```nginx
upstream polimer_backend {
    server 127.0.0.1:3004;
    keepalive 64;
}

# Основной домен (IDN)
server {
    listen 80;
    server_name 73полимер.рф xn--73-olclohlho.xn--p1ai;

    # Редирект на HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name 73полимер.рф xn--73-olclohlho.xn--p1ai;

    ssl_certificate /etc/letsencrypt/live/xn--73-olclohlho.xn--p1ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/xn--73-olclohlho.xn--p1ai/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Лимиты
    client_max_body_size 10M;

    # Прокси на Next.js
    location / {
        proxy_pass http://polimer_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

#### 6.2. Получение SSL-сертификата

```bash
# Для punycode-домена (рекомендуется)
sudo certbot --nginx -d xn--73-olclohlho.xn--p1ai

# Для IDN-домена (если certbot поддерживает)
sudo certbot --nginx -d 73полимер.рф
```

> **Важно:** Certbot может не поддерживать IDN-домены напрямую. В таком случае получайте сертификат на punycode-версию (`xn--73-olclohlho.xn--p1ai`). IDN-домен будет работать через этот сертификат, т.к. браузер преобразует его в punycode.

#### 6.3. Активация конфигурации

```bash
sudo ln -s /etc/nginx/sites-available/73полимер.рф /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### 7. Настройка поддоменов для городов

Проект использует поддомены вида `город.73полимер.рф` для региональных страниц. Для каждого города нужно настроить:

#### 7.1. DNS-записи

Добавьте A-записи для каждого поддомена, указывающие на IP вашего сервера:

```
волгоград.73полимер.рф.  IN  A   ваш.IP.адрес.сервера
саратов.73полимер.рф.    IN  A   ваш.IP.адрес.сервера
саранск.73полимер.рф.    IN  A   ваш.IP.адрес.сервера
... (все города из src/config/cities.ts)
```

**Альтернатива:** используйте wildcard-запись `*.73полимер.рф`, если DNS-провайдер поддерживает IDN:

```
*.xn--73-olclohlho.xn--p1ai.  IN  A  ваш.IP.адрес.сервера
```

#### 7.2. Wildcard-сертификат SSL

```bash
sudo certbot --nginx -d xn--73-olclohlho.xn--p1ai -d *.xn--73-olclohlho.xn--p1ai
```

#### 7.3. Nginx для поддоменов

Добавьте в конфигурацию Nginx обработку всех поддоменов:

```nginx
# Wildcard-сервер для поддоменов городов
server {
    listen 443 ssl http2;
    server_name *.xn--73-olclohlho.xn--p1ai;

    ssl_certificate /etc/letsencrypt/live/xn--73-olclohlho.xn--p1ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/xn--73-olclohlho.xn--p1ai/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 10M;

    location / {
        proxy_pass http://polimer_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# Редирект HTTP -> HTTPS для поддоменов
server {
    listen 80;
    server_name *.xn--73-olclohlho.xn--p1ai;
    return 301 https://$host$request_uri;
}
```

#### 7.4. Как работает мультисайтовость

1. **middleware.ts** — определяет город по первому сегменту пути (например, `/volgograd/products`) или по заголовку `x-city`
2. **getCityByHost.ts** — определяет город по поддомену (например, `волгоград.73полимер.рф`)
3. **getSiteContext.ts** — собирает контекст сайта: город, SEO-данные, Metrika ID, базовый URL
4. **cities.ts** — генерирует SEO-тексты для каждого города

---

## Обновление проекта

### Скрипт обновления

```bash
#!/bin/bash
# update.sh — скрипт для обновления проекта

cd /var/www/73полимер.рф

# 1. Сохраняем текущий .env (если нужно)
# cp .env .env.backup

# 2. Получаем последние изменения
git pull origin master

# 3. Останавливаем и удаляем старый контейнер
docker stop polimer 2>/dev/null || true
docker rm polimer 2>/dev/null || true

# 4. Собираем новый образ
docker build -t polimer .

# 5. Запускаем новый контейнер
docker run -d \
  --restart unless-stopped \
  -p 127.0.0.1:3004:3000 \
  --name polimer \
  polimer

# 6. Очищаем старые образы (опционально)
docker image prune -f
```

Сделайте скрипт исполняемым:

```bash
chmod +x update.sh
```

### Ручное обновление (пошагово)

```bash
cd /var/www/73полимер.рф
git pull origin master
docker rm -f polimer
docker build -t polimer .
docker run -d --restart unless-stopped -p 127.0.0.1:3004:3000 --name polimer polimer
```

---

## Скрипты и утилиты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev-сервера (порт 3000) |
| `npm run build` | Production-сборка |
| `npm run start` | Запуск production-сервера (порт 3000, хост 0.0.0.0) |
| `npm run lint` | Проверка кода ESLint |
| `npm run export-csv` | Экспорт товаров в CSV для Bitrix24 |
| `npm run migrate-db` | Миграция данных в MySQL |

---

## Архитектура проекта

```
polimer/
├── .env                    # Переменные окружения (НЕ КОММИТИТЬ!)
├── .env.local              # Локальные переменные (для разработки)
├── Dockerfile              # Многоступенчатая сборка Docker
├── next.config.ts          # Next.js конфиг (standalone output)
├── middleware.ts           # Middleware для городов
├── src/
│   ├── app/                # Next.js App Router (страницы, API-роуты)
│   ├── components/         # React-компоненты
│   │   ├── shared/         # Шапка, подвал, общие компоненты
│   │   ├── section/        # Секции страниц
│   │   └── ui/             # UI-компоненты (формы, модалки, etc.)
│   ├── config/             # Конфиги (города)
│   ├── data/               # Статические данные (категории, товары, блог)
│   ├── hooks/              # React-хуки
│   ├── lib/                # Бизнес-логика (Bitrix24, SEO, БД)
│   ├── migration/          # SQL-схема и скрипты миграции
│   ├── scripts/            # CLI-скрипты (экспорт, миграция)
│   ├── types/              # TypeScript-типы
│   └── utils/              # Утилиты
└── public/                 # Статические файлы (изображения, иконки, шрифты)
```

### Ключевые особенности

- **Standalone-сборка** — Next.js собирает минимальный production-бандл, который не требует `node_modules` для запуска
- **Мультисайтовость** — один инстанс приложения обслуживает все города через поддомены
- **Docker** — контейнеризация для изолированного запуска
- **Bitrix24 CRM** — заявки с сайта автоматически создают контакты и сделки
- **SMTP (Яндекс)** — отправка email-уведомлений о заявках

---

## Устранение неполадок

### Контейнер не запускается

```bash
# Проверьте логи
docker logs polimer

# Проверьте, не занят ли порт
sudo lsof -i :3004

# Пересоберите образ с нуля (без кэша)
docker build --no-cache -t polimer .
```

### Ошибка подключения к MySQL

```bash
# Проверьте, что MySQL доступен из контейнера
docker exec -it polimer -- ping -c 3 172.17.0.1

# Проверьте настройки .env
# DB_HOST должен быть IP Docker-хоста (обычно 172.17.0.1)
# Или используйте host.docker.internal (требует Docker Desktop)
```

### Ошибка 502 Bad Gateway (Nginx)

```bash
# Проверьте, запущен ли контейнер
docker ps | grep polimer

# Проверьте, отвечает ли Next.js на порту 3004
curl -I http://127.0.0.1:3004

# Проверьте логи Nginx
sudo tail -f /var/log/nginx/error.log
```

### SSL-сертификат истёк

```bash
# Обновление сертификата
sudo certbot renew

# Принудительное обновление
sudo certbot renew --force-renewal
```

### Проблемы с IDN-доменами

Если поддомены с кириллицей не работают:

1. Убедитесь, что DNS-записи созданы для punycode-версий
2. Проверьте, что Nginx обрабатывает `server_name *.xn--73-olclohlho.xn--p1ai`
3. Проверьте middleware: `getCityByHost.ts` преобразует punycode в unicode

```bash
# Проверка преобразования punycode
node -e "console.log(new URL('https://xn--80ad7bbf5a.xn--73-olclohlho.xn--p1ai').hostname)"
```

### Очистка Docker (освобождение места)

```bash
# Удалить остановленные контейнеры
docker container prune

# Удалить неиспользуемые образы
docker image prune -a

# Полная очистка
docker system prune -a --volumes
```
docker compose down          # остановить
docker compose build         # пересобрать образ
docker compose up -d         # запустить (volume на месте — данные не потеряны)

---

## Поддержка

По вопросам развёртывания и эксплуатации обращайтесь к команде разработки.