import { query } from './db';
import { BlogArticle, BlogCardData, BlogContentItem } from '@/types/blog';

let dbAvailable = true;

async function safeQuery(text: string, params?: any[]) {
  if (!dbAvailable) return { rows: [], rowCount: 0 };
  try {
    return await query(text, params);
  } catch (err: any) {
    if (err.code === '28P01' || err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      console.warn('⚠️  Database not available, returning empty results');
      dbAvailable = false;
      return { rows: [], rowCount: 0 };
    }
    throw err;
  }
}

// Транслитерация
const CYRILLIC_MAP: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
  'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  'А': 'a', 'Б': 'b', 'В': 'v', 'Г': 'g', 'Д': 'd', 'Е': 'e', 'Ё': 'e',
  'Ж': 'zh', 'З': 'z', 'И': 'i', 'Й': 'y', 'К': 'k', 'Л': 'l', 'М': 'm',
  'Н': 'n', 'О': 'o', 'П': 'p', 'Р': 'r', 'С': 's', 'Т': 't', 'У': 'u',
  'Ф': 'f', 'Х': 'kh', 'Ц': 'ts', 'Ч': 'ch', 'Ш': 'sh', 'Щ': 'shch',
  'Ъ': '', 'Ы': 'y', 'Ь': '', 'Э': 'e', 'Ю': 'yu', 'Я': 'ya',
};

export function transliterate(text: string): string {
  return text.split('').map(char => CYRILLIC_MAP[char] || char).join('');
}

export function generateSlug(title: string): string {
  return transliterate(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function rowToArticle(row: any): BlogArticle {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    img: row.img || '',
    hero: row.hero || '',
    date: row.date,
    excerpt: row.excerpt || '',
    category: row.category || '',
    tags: row.tags || [],
    readingTime: row.reading_time || 5,
    content: row.content || [],
    published: row.published !== false,
    updatedAt: row.updated_at || undefined,
  };
}

function rowToCard(row: any): BlogCardData {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    img: row.img || '',
    hero: row.hero || '',
    date: row.date,
    excerpt: row.excerpt || '',
  };
}

// ----- MIGRATION -----
export async function migrate() {
  // Сбрасываем флаг и пробуем — вдруг БД уже поднялась
  dbAvailable = true;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS blog_articles (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(500) NOT NULL,
        img VARCHAR(500) DEFAULT '',
        hero VARCHAR(500) DEFAULT '',
        date VARCHAR(50) NOT NULL,
        excerpt TEXT DEFAULT '',
        category VARCHAR(255) DEFAULT '',
        tags TEXT[] DEFAULT '{}',
        reading_time INTEGER DEFAULT 5,
        content JSONB DEFAULT '[]'::jsonb,
        published BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Migration complete: blog_articles table ready');
  } catch (err: any) {
    if (err.code === '28P01' || err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      console.warn('⚠️  Database not available, skipping migration');
      dbAvailable = false;
    } else {
      throw err;
    }
  }
}

// ----- SEED (перенос из JSON) -----
export async function seedFromJson(articles: BlogArticle[]) {
  for (const article of articles) {
    await safeQuery(
      `INSERT INTO blog_articles (slug, title, img, hero, date, excerpt, category, tags, reading_time, content, published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11)
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         img = EXCLUDED.img,
         hero = EXCLUDED.hero,
         date = EXCLUDED.date,
         excerpt = EXCLUDED.excerpt,
         category = EXCLUDED.category,
         tags = EXCLUDED.tags,
         reading_time = EXCLUDED.reading_time,
         content = EXCLUDED.content,
         published = EXCLUDED.published,
         updated_at = NOW()`,
      [
        article.slug,
        article.title,
        article.img || '',
        article.hero || '',
        article.date,
        article.excerpt || '',
        article.category || '',
        article.tags || [],
        article.readingTime || 5,
        JSON.stringify(article.content || []),
        article.published !== false,
      ]
    );
  }
  console.log(`✅ Seeded ${articles.length} articles`);
}

// ----- CRUD -----
export async function getAllArticles(): Promise<BlogArticle[]> {
  const result = await safeQuery('SELECT * FROM blog_articles ORDER BY id DESC');
  return result.rows.map(rowToArticle);
}

export async function getArticleBySlug(slug: string): Promise<BlogArticle | null> {
  const result = await safeQuery('SELECT * FROM blog_articles WHERE slug = $1', [slug]);
  if (result.rows.length === 0) return null;
  return rowToArticle(result.rows[0]);
}

export async function getArticleById(id: number): Promise<BlogArticle | null> {
  const result = await safeQuery('SELECT * FROM blog_articles WHERE id = $1', [id]);
  if (result.rows.length === 0) return null;
  return rowToArticle(result.rows[0]);
}

export async function getPublishedArticles(): Promise<BlogArticle[]> {
  const result = await safeQuery(
    'SELECT * FROM blog_articles WHERE published = true ORDER BY id DESC'
  );
  return result.rows.map(rowToArticle);
}

export async function getBlogCards(): Promise<BlogCardData[]> {
  const result = await safeQuery(
    `SELECT id, slug, title, img, hero, date, excerpt
     FROM blog_articles WHERE published = true ORDER BY id DESC`
  );
  return result.rows.map(rowToCard);
}

export async function getLatestArticles(): Promise<BlogCardData[]> {
  const result = await safeQuery(
    `SELECT id, slug, title, img, hero, date, excerpt
     FROM blog_articles WHERE published = true
     ORDER BY to_date(date, 'DD.MM.YYYY') DESC NULLS LAST, id DESC`,
    
  );
  return result.rows.map(rowToCard);
}

export async function createArticle(article: BlogArticle): Promise<BlogArticle> {
  const result = await safeQuery(
    `INSERT INTO blog_articles (slug, title, img, hero, date, excerpt, category, tags, reading_time, content, published)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11)
     RETURNING *`,
    [
      article.slug,
      article.title,
      article.img || '',
      article.hero || '',
      article.date,
      article.excerpt || '',
      article.category || '',
      article.tags || [],
      article.readingTime || 5,
      JSON.stringify(article.content || []),
      article.published !== false,
    ]
  );
  return rowToArticle(result.rows[0]);
}

export async function updateArticle(slug: string, article: Partial<BlogArticle>): Promise<BlogArticle | null> {
  const existing = await getArticleBySlug(slug);
  if (!existing) return null;

  // Безопасное слияние: защищаем обязательные поля от undefined/null
  const merged = {
    slug: article.slug !== undefined ? article.slug : existing.slug,
    title: article.title !== undefined ? article.title : existing.title,
    date: article.date !== undefined ? article.date : existing.date,
    img: article.img !== undefined ? article.img : existing.img,
    hero: article.hero !== undefined ? article.hero : existing.hero,
    excerpt: article.excerpt !== undefined ? article.excerpt : existing.excerpt,
    category: article.category !== undefined ? article.category : existing.category,
    tags: article.tags !== undefined ? article.tags : existing.tags,
    readingTime: article.readingTime !== undefined ? article.readingTime : existing.readingTime,
    content: article.content !== undefined ? article.content : existing.content,
    published: article.published !== undefined ? article.published : existing.published,
  };

  if (!merged.slug || !merged.title) {
    throw new Error('slug and title cannot be empty');
  }

  const result = await safeQuery(
    `UPDATE blog_articles SET
       slug = $1, title = $2, img = $3, hero = $4, date = $5,
       excerpt = $6, category = $7, tags = $8, reading_time = $9,
       content = $10::jsonb, published = $11, updated_at = NOW()
     WHERE slug = $12 RETURNING *`,
    [
      merged.slug,
      merged.title,
      merged.img || '',
      merged.hero || '',
      merged.date,
      merged.excerpt || '',
      merged.category || '',
      merged.tags || [],
      merged.readingTime || 5,
      JSON.stringify(merged.content || []),
      merged.published !== false,
      slug,
    ]
  );
  if (result.rows.length === 0) return null;
  return rowToArticle(result.rows[0]);
}

export async function deleteArticle(slug: string): Promise<boolean> {
  const result = await safeQuery('DELETE FROM blog_articles WHERE slug = $1', [slug]);
  return (result.rowCount ?? 0) > 0;
}

export async function getNextId(): Promise<number> {
  const result = await safeQuery('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM blog_articles');
  return result.rows[0]?.next_id || 1;
}