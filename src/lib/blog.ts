import { BlogArticle, BlogCardData } from '@/types/blog';
import {
  getAllArticles as dbGetAll,
  getArticleBySlug as dbGetBySlug,
  getBlogCards as dbGetCards,
  getLatestArticles as dbGetLatest,
  getPublishedArticles as dbGetPublished,
} from './blog-db';

// Получить все статьи (для списка)
export async function getAllBlogArticles(): Promise<BlogArticle[]> {
  return dbGetAll();
}

// Получить данные для карточек блога (только опубликованные)
export async function getBlogCards(): Promise<BlogCardData[]> {
  return dbGetCards();
}

// Получить статью по slug
export async function getBlogArticleBySlug(slug: string): Promise<BlogArticle | undefined> {
  const article = await dbGetBySlug(slug);
  if (article && article.published === false) {
    return undefined;
  }
  return article || undefined;
}

// Проверить существует ли статья
export async function blogArticleExists(slug: string): Promise<boolean> {
  const article = await dbGetBySlug(slug);
  return article !== null;
}

// Получить похожие статьи
export async function getRelatedArticles(slug: string, limit: number = 3): Promise<BlogCardData[]> {
  const allArticles = await dbGetCards();
  return allArticles
    .filter(article => article.slug !== slug)
    .slice(0, limit);
}

// Получить последние статьи
export async function getLatestArticles(limit: number = 6): Promise<BlogCardData[]> {
  return dbGetLatest(limit);
}

// Поиск по статьям
export async function searchBlogArticles(query: string): Promise<BlogCardData[]> {
  const articles = await dbGetCards();
  const searchTerm = query.toLowerCase();
  return articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm) ||
    article.excerpt.toLowerCase().includes(searchTerm)
  );
}