import fs from 'fs';
import path from 'path';
import { BlogArticle, BlogCardData } from '@/types/blog';

// Читаем напрямую из data/blog (Docker volume) — сохраняется между перезапусками
const BLOG_DIR = path.join(process.cwd(), 'data/blog');
const INDEX_PATH = path.join(BLOG_DIR, 'index.json');

let initialized = false;

function readJson<T>(filePath: string): T | null {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// При первом обращении синхронизируем volume с seed-данными из образа
function ensureDataDir(): void {
  if (initialized) return;
  initialized = true;

  const SRC_BLOG_DIR = path.join(process.cwd(), 'src/data/blog');

  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
  }

  // Если в volume нет index.json — копируем seed-данные из src/data/blog
  if (!fs.existsSync(INDEX_PATH) && fs.existsSync(SRC_BLOG_DIR)) {
    try {
      const files = fs.readdirSync(SRC_BLOG_DIR);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const src = path.join(SRC_BLOG_DIR, file);
          const dest = path.join(BLOG_DIR, file);
          if (!fs.existsSync(dest)) {
            fs.copyFileSync(src, dest);
          }
        }
      }
    } catch (e) {
      console.error('Error seeding blog data:', e);
    }
  }

  // Если index всё ещё нет — создаём пустой
  if (!fs.existsSync(INDEX_PATH)) {
    fs.writeFileSync(INDEX_PATH, '[]', 'utf-8');
  }
}

// Получить все статьи (для списка)
export function getAllBlogArticles(): BlogArticle[] {
  ensureDataDir();
  try {
    const index = readJson<{ slug: string }[]>(INDEX_PATH);
    if (!index) return [];

    const articles: BlogArticle[] = [];
    for (const item of index) {
      const article = readJson<BlogArticle>(path.join(BLOG_DIR, `${item.slug}.json`));
      if (article) {
        articles.push(article);
      }
    }
    return articles;
  } catch (error) {
    console.error('Error loading blog index:', error);
    return [];
  }
}

// Получить данные для карточек блога (только опубликованные)
export function getBlogCards(): BlogCardData[] {
  const articles = getAllBlogArticles();

  return articles
    .filter(a => a.published !== false)
    .map(({ id, slug, title, img, date, excerpt }) => ({
      id,
      slug,
      title,
      img,
      date,
      excerpt
    }));
}

// Получить статью по slug
export function getBlogArticleBySlug(slug: string): BlogArticle | undefined {
  const article = readJson<BlogArticle>(path.join(BLOG_DIR, `${slug}.json`));
  if (article && article.published === false) {
    return undefined;
  }
  return article || undefined;
}

// Проверить существует ли статья
export function blogArticleExists(slug: string): boolean {
  return fs.existsSync(path.join(BLOG_DIR, `${slug}.json`));
}

// Получить похожие статьи
export function getRelatedArticles(slug: string, limit: number = 3): BlogCardData[] {
  const current = getBlogArticleBySlug(slug);
  if (!current) return [];

  const allArticles = getBlogCards();

  return allArticles
    .filter(article => article.slug !== slug)
    .slice(0, limit);
}

// Получить последние статьи
export function getLatestArticles(limit: number = 6): BlogCardData[] {
  const articles = getBlogCards();

  return articles
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

// Поиск по статьям
export function searchBlogArticles(query: string): BlogCardData[] {
  const articles = getBlogCards();
  const searchTerm = query.toLowerCase();

  return articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm) ||
    article.excerpt.toLowerCase().includes(searchTerm)
  );
}