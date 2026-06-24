import fs from 'fs';
import path from 'path';
import { BlogArticle } from '@/types/blog';

// Админка использует data/blog (персистентно для Docker)
const BLOG_DIR = path.join(process.cwd(), 'data/blog');
const SRC_BLOG_DIR = path.join(process.cwd(), 'src/data/blog');
const INDEX_PATH = path.join(BLOG_DIR, 'index.json');

// Транслитерация кириллицы в латиницу
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

function transliterate(text: string): string {
  return text.split('').map(char => CYRILLIC_MAP[char] || char).join('');
}

// При первом запуске — копируем существующие статьи из src/data/blog в data/blog
export function ensureDataDir(): void {
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });

    // Seed: копируем существующие статьи из src/data/blog
    if (fs.existsSync(SRC_BLOG_DIR)) {
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

    if (!fs.existsSync(INDEX_PATH)) {
      fs.writeFileSync(INDEX_PATH, '[]', 'utf-8');
    }
  }
}

// Синхронизировать src/data/blog с data/blog (чтобы сайт видел новые и изменённые статьи)
function syncToSrcBlog(): void {
  if (!fs.existsSync(SRC_BLOG_DIR)) {
    fs.mkdirSync(SRC_BLOG_DIR, { recursive: true });
  }

  const index = getIndex();

  // Всегда копируем/перезаписываем статьи из data/blog в src/data/blog
  for (const entry of index) {
    const src = path.join(BLOG_DIR, `${entry.slug}.json`);
    const dest = path.join(SRC_BLOG_DIR, `${entry.slug}.json`);
    if (fs.existsSync(src)) {
      fs.writeFileSync(dest, fs.readFileSync(src));
    }
  }

  // Синхронизируем index.json
  const srcIndexPath = path.join(SRC_BLOG_DIR, 'index.json');
  fs.writeFileSync(srcIndexPath, JSON.stringify(index, null, 2), 'utf-8');
}

export interface IndexEntry {
  slug: string;
}

export function getIndex(): IndexEntry[] {
  try {
    const data = fs.readFileSync(INDEX_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveIndex(index: IndexEntry[]): void {
  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2), 'utf-8');
}

export function getArticle(slug: string): BlogArticle | null {
  try {
    const filePath = path.join(BLOG_DIR, `${slug}.json`);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function getAllArticles(): BlogArticle[] {
  const index = getIndex();
  return index
    .map(entry => getArticle(entry.slug))
    .filter((a): a is BlogArticle => a !== null);
}

export function getPublishedArticles(): BlogArticle[] {
  return getAllArticles().filter(a => a.published !== false);
}

export function saveArticle(article: BlogArticle): void {
  const filePath = path.join(BLOG_DIR, `${article.slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(article, null, 2), 'utf-8');

  // Update index
  const index = getIndex();
  const exists = index.find(e => e.slug === article.slug);
  if (!exists) {
    index.push({ slug: article.slug });
    saveIndex(index);
  }

  // Синхронизируем с src/data/blog для сайта
  syncToSrcBlog();
}

export function deleteArticle(slug: string): boolean {
  const filePath = path.join(BLOG_DIR, `${slug}.json`);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Удаляем из src/data/blog
    const srcPath = path.join(SRC_BLOG_DIR, `${slug}.json`);
    if (fs.existsSync(srcPath)) {
      fs.unlinkSync(srcPath);
    }

    // Remove from index
    const index = getIndex().filter(e => e.slug !== slug);
    saveIndex(index);

    // Синхронизируем src/data/blog/index.json
    const srcIndexPath = path.join(SRC_BLOG_DIR, 'index.json');
    fs.writeFileSync(srcIndexPath, JSON.stringify(index, null, 2), 'utf-8');

    return true;
  } catch {
    return false;
  }
}

export function generateSlug(title: string): string {
  // Транслитерируем кириллицу, затем приводим к латинскому slug
  return transliterate(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getNextId(): number {
  const articles = getAllArticles();
  if (articles.length === 0) return 1;
  return Math.max(...articles.map(a => a.id)) + 1;
}