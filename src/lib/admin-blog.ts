import fs from 'fs';
import path from 'path';
import { BlogArticle } from '@/types/blog';

// Для админки используем data/blog в корне проекта (персистентно для Docker)
const BLOG_DIR = path.join(process.cwd(), 'data/blog');
const SRC_BLOG_DIR = path.join(process.cwd(), 'src/data/blog');
const INDEX_PATH = path.join(BLOG_DIR, 'index.json');

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
    
    // Если index.json не появился — создаём пустой
    if (!fs.existsSync(INDEX_PATH)) {
      fs.writeFileSync(INDEX_PATH, '[]', 'utf-8');
    }
  }
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
}

export function deleteArticle(slug: string): boolean {
  const filePath = path.join(BLOG_DIR, `${slug}.json`);
  
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Remove from index
    const index = getIndex().filter(e => e.slug !== slug);
    saveIndex(index);
    return true;
  } catch {
    return false;
  }
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^а-яa-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getNextId(): number {
  const articles = getAllArticles();
  if (articles.length === 0) return 1;
  return Math.max(...articles.map(a => a.id)) + 1;
}