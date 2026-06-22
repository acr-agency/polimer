const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  ShadingType,
  convertInchesToTwip,
} = require("docx");

// ─── Helper functions ───────────────────────────────────────────

const FONT = "Segoe UI";
const CODE_FONT = "Consolas";

function heading(text, level) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 360 : 240, after: 120 },
  });
}

function para(text, options = {}) {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        font: FONT,
        size: 22,
        ...options,
      }),
    ],
    spacing: { after: 120, before: options.before || 0 },
  });
}

function codeBlock(lines) {
  const text = Array.isArray(lines) ? lines.join("\n") : lines;
  return new Paragraph({
    children: [
      new TextRun({
        text,
        font: CODE_FONT,
        size: 18,
        color: "1E1E1E",
      }),
    ],
    spacing: { after: 80, before: 80 },
    shading: { type: ShadingType.CLEAR, fill: "F5F5F5" },
    indent: { left: convertInchesToTwip(0.3) },
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        font: FONT,
        size: 22,
      }),
    ],
    bullet: { level },
    spacing: { after: 60 },
  });
}

function bulletBold(text, level = 0) {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        font: FONT,
        size: 22,
        bold: true,
      }),
    ],
    bullet: { level },
    spacing: { after: 60 },
  });
}

function numbered(items) {
  return items.map(
    (item, i) =>
      new Paragraph({
        children: [
          new TextRun({
            text: `${i + 1}. ${item}`,
            font: FONT,
            size: 22,
          }),
        ],
        spacing: { after: 60 },
      })
  );
}

function note(text) {
  return new Paragraph({
    children: [
      new TextRun({
        text: `Примечание: ${text}`,
        font: FONT,
        size: 20,
        italics: true,
        color: "CC6600",
      }),
    ],
    spacing: { after: 120, before: 120 },
    shading: { type: ShadingType.CLEAR, fill: "FFF3E0" },
    indent: { left: convertInchesToTwip(0.2) },
  });
}

function makeTable(headers, rows) {
  return new Table({
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(
          (h) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: h, font: FONT, size: 20, bold: true, color: "FFFFFF" })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: { type: ShadingType.CLEAR, fill: "2B579A" },
            })
        ),
      }),
      ...rows.map(
        (row) =>
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: cell, font: FONT, size: 20 })],
                    }),
                  ],
                })
            ),
          })
      ),
    ],
  });
}

// ─── DOCUMENT 1: Full deployment guide ──────────────────────────

function createDeploymentDoc() {
  const children = [];

  children.push(heading("Инструкция по развёртыванию проекта 73полимер.рф на VPS", HeadingLevel.HEADING_1));
  children.push(para("Next.js-приложение для сайта производителя полимерпесчаных изделий.", { italics: true }));
  children.push(para("Стек: Next.js 16 (standalone), React 19, TypeScript, MySQL, Docker, Nginx."));
  children.push(para(""));

  // 1. Requirements
  children.push(heading("1. Требования к VPS", HeadingLevel.HEADING_1));
  children.push(makeTable(
    ["Компонент", "Минимально", "Рекомендуется"],
    [
      ["ОС", "Ubuntu 22.04 / Debian 12", "Ubuntu 24.04"],
      ["CPU", "1 vCPU", "2 vCPU"],
      ["RAM", "1 ГБ", "2 ГБ"],
      ["Диск", "20 ГБ SSD", "40 ГБ SSD"],
      ["Docker", "24+", "27+"],
      ["Nginx", "1.24+", "1.26+"],
      ["MySQL", "8.0+", "8.4+"],
    ]
  ));
  children.push(para(""));
  children.push(para("Домены:"));
  children.push(bullet("Основной: 73полимер.рф (punycode: xn--73-olclohlho.xn--p1ai)"));
  children.push(bullet("Поддомены городов: волгоград.73полимер.рф, саратов.73полимер.рф и другие"));

  // 2
  children.push(heading("2. Подготовка сервера", HeadingLevel.HEADING_1));

  children.push(heading("2.1. Установка Docker", HeadingLevel.HEADING_2));
  children.push(codeBlock("sudo apt update && sudo apt upgrade -y"));
  children.push(codeBlock("curl -fsSL https://get.docker.com -o get-docker.sh"));
  children.push(codeBlock("sudo sh get-docker.sh"));
  children.push(codeBlock("sudo usermod -aG docker $USER"));
  children.push(codeBlock("docker --version"));
  children.push(note("Выйдите и зайдите заново (newgrp docker) после установки"));

  children.push(heading("2.2. Установка Nginx", HeadingLevel.HEADING_2));
  children.push(codeBlock("sudo apt install -y nginx"));
  children.push(codeBlock("sudo systemctl enable nginx"));
  children.push(codeBlock("sudo systemctl start nginx"));

  children.push(heading("2.3. Установка MySQL", HeadingLevel.HEADING_2));
  children.push(codeBlock("sudo apt install -y mysql-server"));
  children.push(codeBlock("sudo systemctl enable mysql"));
  children.push(codeBlock("sudo systemctl start mysql"));
  children.push(codeBlock("sudo mysql_secure_installation"));
  children.push(para("Создание базы и пользователя:"));
  children.push(codeBlock([
    "CREATE DATABASE polimer_products",
    "  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;",
    "CREATE USER 'polimer'@'%' IDENTIFIED BY 'your_strong_password';",
    "GRANT ALL PRIVILEGES ON polimer_products.* TO 'polimer'@'%';",
    "FLUSH PRIVILEGES;",
  ]));
  children.push(note("Если MySQL на том же сервере, что и Docker, используйте DB_HOST=172.17.0.1"));

  children.push(heading("2.4. Установка Certbot (SSL)", HeadingLevel.HEADING_2));
  children.push(codeBlock("sudo apt install -y certbot python3-certbot-nginx"));

  // 3
  children.push(heading("3. Клонирование репозитория", HeadingLevel.HEADING_1));
  children.push(codeBlock("sudo mkdir -p /var/www/73полимер.рф"));
  children.push(codeBlock("sudo chown $USER:$USER /var/www/73полимер.рф"));
  children.push(codeBlock("cd /var/www/73полимер.рф"));
  children.push(codeBlock("git clone https://github.com/acr-agency/polimer.git ."));

  // 4
  children.push(heading("4. Настройка переменных окружения", HeadingLevel.HEADING_1));
  children.push(para("Создайте файл .env в корне проекта:"));
  children.push(codeBlock([
    "ROOT_METRIKA_ID=107705030",
    "BITRIX24_WEBHOOK_URL=https://resurstreyd.bitrix24.ru/rest/77/...",
    "SMTP_HOST=smtp.yandex.ru",
    "SMTP_PORT=465",
    "SMTP_USER=ForAnalyticss@yandex.ru",
    "SMTP_PASS=your_smtp_password",
    "FORM_TO_EMAIL=73polimer@mail.ru",
    "FORM_COPY_EMAIL=ForAnalyticss@yandex.ru",
    "DB_HOST=172.17.0.1",
    "DB_USER=polimer",
    "DB_PASSWORD=your_strong_password",
    "DB_NAME=polimer_products",
  ]));
  children.push(note("Файл .env содержит чувствительные данные. Выставьте chmod 600 .env"));

  // 5
  children.push(heading("5. Настройка базы данных MySQL", HeadingLevel.HEADING_1));
  children.push(codeBlock("mysql -u polimer -p polimer_products < src/migration/bd.sql"));
  children.push(para("Таблицы:"));
  children.push(bullet("categories — категории товаров"));
  children.push(bullet("products — товары"));
  children.push(bullet("product_variants — варианты товаров"));
  children.push(bullet("variant_colors — цвета вариантов"));
  children.push(bullet("product_images — изображения"));
  children.push(bullet("product_tabs — табы с контентом"));

  // 6
  children.push(heading("6. Сборка Docker и запуск", HeadingLevel.HEADING_1));

  children.push(heading("6.1. Сборка образа", HeadingLevel.HEADING_2));
  children.push(codeBlock("cd /var/www/73полимер.рф"));
  children.push(codeBlock("docker build -t polimer ."));
  children.push(para("Этапы: deps (npm ci) -> builder (next build standalone) -> runner (минимальный образ)"));

  children.push(heading("6.2. Запуск контейнера", HeadingLevel.HEADING_2));
  children.push(codeBlock([
    "docker run -d \\",
    "  --restart unless-stopped \\",
    "  -p 127.0.0.1:3004:3000 \\",
    "  --name polimer \\",
    "  polimer",
  ]));
  children.push(heading("6.3. Проверка", HeadingLevel.HEADING_2));
  children.push(codeBlock("docker logs polimer"));
  children.push(codeBlock("docker ps"));
  children.push(codeBlock("curl -I http://127.0.0.1:3004"));

  // 7
  children.push(heading("7. Настройка Nginx и SSL", HeadingLevel.HEADING_1));

  children.push(heading("7.1. Конфигурация Nginx", HeadingLevel.HEADING_2));
  children.push(para("Файл /etc/nginx/sites-available/73полимер.рф:"));
  children.push(codeBlock([
    "upstream polimer_backend {",
    "    server 127.0.0.1:3004;",
    "    keepalive 64;",
    "}",
    "",
    "server {",
    "    listen 80;",
    "    server_name 73полимер.рф xn--73-olclohlho.xn--p1ai;",
    "    return 301 https://$host$request_uri;",
    "}",
    "",
    "server {",
    "    listen 443 ssl http2;",
    "    server_name 73полимер.рф xn--73-olclohlho.xn--p1ai;",
    "    ssl_certificate /etc/letsencrypt/live/xn--73-olclohlho.xn--p1ai/fullchain.pem;",
    "    ssl_certificate_key .../privkey.pem;",
    "    location / {",
    "        proxy_pass http://polimer_backend;",
    "        proxy_set_header Host $host;",
    "        proxy_set_header X-Real-IP $remote_addr;",
    "        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;",
    "        proxy_set_header X-Forwarded-Proto $scheme;",
    "    }",
    "}",
  ]));

  children.push(heading("7.2. SSL-сертификат", HeadingLevel.HEADING_2));
  children.push(codeBlock("sudo certbot --nginx -d xn--73-olclohlho.xn--p1ai"));

  children.push(heading("7.3. Активация", HeadingLevel.HEADING_2));
  children.push(codeBlock("sudo ln -s /etc/nginx/sites-available/73полимер.рф /etc/nginx/sites-enabled/"));
  children.push(codeBlock("sudo nginx -t"));
  children.push(codeBlock("sudo systemctl reload nginx"));

  // 8
  children.push(heading("8. Настройка поддоменов для городов", HeadingLevel.HEADING_1));

  children.push(heading("8.1. DNS", HeadingLevel.HEADING_2));
  children.push(codeBlock("*.xn--73-olclohlho.xn--p1ai.  IN  A  ваш.IP.адрес.сервера"));

  children.push(heading("8.2. Wildcard SSL", HeadingLevel.HEADING_2));
  children.push(codeBlock("sudo certbot --nginx -d xn--73-olclohlho.xn--p1ai -d *.xn--73-olclohlho.xn--p1ai"));

  children.push(heading("8.3. Nginx для поддоменов", HeadingLevel.HEADING_2));
  children.push(codeBlock([
    "server {",
    "    listen 443 ssl http2;",
    "    server_name *.xn--73-olclohlho.xn--p1ai;",
    "    ssl_certificate ...; ssl_certificate_key ...;",
    "    location / { proxy_pass http://polimer_backend; ... }",
    "}",
    "server {",
    "    listen 80;",
    "    server_name *.xn--73-olclohlho.xn--p1ai;",
    "    return 301 https://$host$request_uri;",
    "}",
  ]));

  children.push(heading("8.4. Мультисайтовость", HeadingLevel.HEADING_2));
  children.push(bullet("middleware.ts — город по пути или заголовку x-city"));
  children.push(bullet("getCityByHost.ts — город по поддомену"));
  children.push(bullet("getSiteContext.ts — контекст (город, SEO, Metrika)"));
  children.push(bullet("cities.ts — SEO для каждого города"));

  // 9
  children.push(heading("9. Устранение неполадок", HeadingLevel.HEADING_1));

  children.push(heading("Контейнер не запускается", HeadingLevel.HEADING_2));
  children.push(codeBlock("docker logs polimer"));
  children.push(codeBlock("docker build --no-cache -t polimer ."));

  children.push(heading("Ошибка MySQL", HeadingLevel.HEADING_2));
  children.push(codeBlock("docker exec -it polimer ping -c 3 172.17.0.1"));
  children.push(para("Проверьте DB_HOST в .env"));

  children.push(heading("502 Bad Gateway", HeadingLevel.HEADING_2));
  children.push(codeBlock("curl -I http://127.0.0.1:3004"));
  children.push(codeBlock("sudo tail -f /var/log/nginx/error.log"));

  children.push(heading("SSL истёк", HeadingLevel.HEADING_2));
  children.push(codeBlock("sudo certbot renew"));

  children.push(heading("Проблемы с IDN-доменами", HeadingLevel.HEADING_2));
  children.push(para("Проверьте DNS для punycode-версий."));

  return new Document({
    sections: [{ children }],
  });
}

// ─── DOCUMENT 2: Quick update guide ─────────────────────────────

function createUpdateDoc() {
  const children = [];

  children.push(heading("Инструкция по обновлению проекта 73полимер.рф", HeadingLevel.HEADING_1));
  children.push(para("Документ содержит инструкции для частых операций: обновление кода, данных, конфигурации."));
  children.push(para(""));

  // 1
  children.push(heading("1. Обновление кода (git pull + Docker)", HeadingLevel.HEADING_1));

  children.push(heading("1.1. Скрипт обновления", HeadingLevel.HEADING_2));
  children.push(codeBlock([
    "#!/bin/bash",
    "# update.sh",
    "cd /var/www/73полимер.рф",
    "git pull origin master",
    "docker stop polimer 2>/dev/null; docker rm polimer 2>/dev/null",
    "docker build -t polimer .",
    "docker run -d --restart unless-stopped \\",
    "  -p 127.0.0.1:3004:3000 --name polimer polimer",
    "docker image prune -f",
  ]));

  children.push(heading("1.2. Ручное обновление", HeadingLevel.HEADING_2));
  children.push(numbered([
    "Зайти на сервер по SSH",
    "cd /var/www/73полимер.рф",
    "git pull origin master",
    "docker rm -f polimer",
    "docker build -t polimer .",
    "docker run -d --restart unless-stopped -p 127.0.0.1:3004:3000 --name polimer polimer",
    "Проверить: docker ps, curl -I http://127.0.0.1:3004",
  ]));

  children.push(heading("1.3. Откат изменений", HeadingLevel.HEADING_2));
  children.push(codeBlock([
    "cd /var/www/73полимер.рф",
    "git checkout HEAD~1",
    "docker build -t polimer .",
    "docker run -d --restart unless-stopped -p 127.0.0.1:3004:3000 --name polimer polimer",
    "git checkout master",
  ]));

  // 2
  children.push(heading("2. Обновление данных (MySQL)", HeadingLevel.HEADING_1));

  children.push(heading("2.1. Экспорт товаров в CSV", HeadingLevel.HEADING_2));
  children.push(para("Создаёт CSV-файлы в директории exports/ для импорта в Bitrix24:"));
  children.push(codeBlock("cd /var/www/73полимер.рф && npm run export-csv"));

  children.push(heading("2.2. Миграция данных", HeadingLevel.HEADING_2));
  children.push(codeBlock("npm run migrate-db"));
  children.push(note("Требуется ts-node. Убедитесь, что он установлен."));

  children.push(heading("2.3. Ручное обновление БД", HeadingLevel.HEADING_2));
  children.push(codeBlock([
    "mysql -u polimer -p polimer_products",
    "mysql> SELECT * FROM products WHERE id='...';",
    "mysql> UPDATE products SET price_rub=... WHERE id='...';",
    "mysql> EXIT;",
  ]));

  // 3
  children.push(heading("3. Обновление статических данных (JSON)", HeadingLevel.HEADING_1));
  children.push(para("Статические данные в src/data/:"));
  children.push(bullet("src/data/categories.json — категории"));
  children.push(bullet("src/data/directions.json — направления"));
  children.push(bullet("src/data/products/ — товары"));
  children.push(bullet("src/data/product-info/ — детальная информация"));
  children.push(bullet("src/data/blog/ — статьи"));
  children.push(note("После изменения JSON нужно пересобрать Docker-образ."));

  // 4
  children.push(heading("4. Обновление конфигурации", HeadingLevel.HEADING_1));

  children.push(heading("4.1. Добавление нового города", HeadingLevel.HEADING_2));
  children.push(numbered([
    "Добавить запись в src/config/cities.ts",
    "Добавить ключ в src/types/cities.ts (CityKey)",
    "Добавить A-запись для поддомена в DNS",
    "Закоммитить, запустить деплой",
  ]));

  children.push(heading("4.2. Изменение SMTP / Email", HeadingLevel.HEADING_2));
  children.push(para("Отредактируйте .env на сервере и перезапустите контейнер:"));
  children.push(codeBlock("nano /var/www/73полимер.рф/.env"));
  children.push(codeBlock("docker restart polimer"));

  children.push(heading("4.3. Изменение Bitrix24 вебхука", HeadingLevel.HEADING_2));
  children.push(para("Измените BITRIX24_WEBHOOK_URL в .env:"));
  children.push(codeBlock("docker restart polimer"));

  // 5
  children.push(heading("5. Полезные команды", HeadingLevel.HEADING_1));
  children.push(makeTable(
    ["Команда", "Описание"],
    [
      ["docker ps", "Список контейнеров"],
      ["docker logs polimer", "Логи контейнера"],
      ["docker logs -f polimer", "Логи в реальном времени"],
      ["docker restart polimer", "Перезапуск"],
      ["docker stop polimer; docker rm polimer", "Удаление контейнера"],
      ["docker exec -it polimer sh", "Войти в контейнер"],
      ["docker image prune -a", "Очистка образов"],
      ["sudo nginx -t", "Проверка Nginx"],
      ["sudo systemctl reload nginx", "Перезагрузка Nginx"],
      ["sudo certbot renew", "Обновление SSL"],
    ]
  ));

  return new Document({
    sections: [{ children }],
  });
}

// ─── Generate ───────────────────────────────────────────────────

async function main() {
  const docsDir = path.join(__dirname, "..", "exports");
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

  const deployDoc = createDeploymentDoc();
  const deployBuffer = await Packer.toBuffer(deployDoc);
  const deployPath = path.join(docsDir, "Инструкция_развертывание_VPS.docx");
  fs.writeFileSync(deployPath, deployBuffer);
  console.log("OK: " + deployPath);

  const updateDoc = createUpdateDoc();
  const updateBuffer = await Packer.toBuffer(updateDoc);
  const updatePath = path.join(docsDir, "Инструкция_обновление_кода_и_данных.docx");
  fs.writeFileSync(updatePath, updateBuffer);
  console.log("OK: " + updatePath);
}

main().catch(console.error);