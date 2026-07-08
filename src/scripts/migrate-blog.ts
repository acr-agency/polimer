import { migrate, seedFromJson } from '@/lib/blog-db';
import fs from 'fs';
import path from 'path';
import { BlogArticle } from '@/types/blog';

async function main() {
  console.log('🚀 Starting blog migration...');

  // 1. Создаём таблицу
  await migrate();

  // 2. Читаем JSON-файлы из data/blog
  const blogDir = path.join(process.cwd(), 'data/blog');
  const indexFile = path.join(blogDir, 'index.json');

  if (!fs.existsSync(indexFile)) {
    console.log('⚠️  No blog JSON data found, skipping seed');
    return;
  }

  const index: { slug: string }[] = JSON.parse(fs.readFileSync(indexFile, 'utf-8'));

  const articles: BlogArticle[] = [];
  for (const entry of index) {
    const articlePath = path.join(blogDir, `${entry.slug}.json`);
    if (fs.existsSync(articlePath)) {
      const data = JSON.parse(fs.readFileSync(articlePath, 'utf-8'));
      articles.push({
        ...data,
        published: data.published !== false,
      });
    }
  }

  // 3. Переносим в БД
  await seedFromJson(articles);

  console.log('🎉 Blog migration complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});