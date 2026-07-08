import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/admin-auth';
import { migrate, seedFromJson } from '@/lib/blog-db';
import { BlogArticle } from '@/types/blog';
import fs from 'fs';
import path from 'path';

export async function POST() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    // 1. Создаём таблицу
    await migrate();

    // 2. Читаем JSON-файлы
    const blogDir = path.join(process.cwd(), 'data/blog');
    const indexFile = path.join(blogDir, 'index.json');

    if (!fs.existsSync(indexFile)) {
      return NextResponse.json({
        success: true,
        message: 'Таблица создана, JSON-файлы не найдены (data/blog/index.json)',
      });
    }

    const index: { slug: string }[] = JSON.parse(fs.readFileSync(indexFile, 'utf-8'));

    const articles: BlogArticle[] = [];
    for (const entry of index) {
      const articlePath = path.join(blogDir, `${entry.slug}.json`);
      if (fs.existsSync(articlePath)) {
        const data = JSON.parse(fs.readFileSync(articlePath, 'utf-8'));
        articles.push({
          ...data,
          id: data.id || 0,
          published: data.published !== false,
        });
      }
    }

    if (articles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'В JSON-файлах не найдено статей для импорта',
      });
    }

    // 3. Переносим в БД
    await seedFromJson(articles);

    return NextResponse.json({
      success: true,
      message: `Импортировано ${articles.length} статей из JSON в PostgreSQL`,
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: `Migration failed: ${error.message}` },
      { status: 500 }
    );
  }
}