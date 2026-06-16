
// Базовая структура для карточки блога в списке
export interface BlogCardData {
  id: number;
  slug: string;
  title: string;
  hero?: string;
  img: string;
  date: string;
  excerpt: string; // короткое описание для превью
}

// Элемент контента блога
export type BlogContentItem = 
  | { type: 'heading'; text: string; level?: 1 | 2 | 3 }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'warning'; text: string; author?: string };

// Полная структура статьи
export interface BlogArticle extends BlogCardData {
  content: BlogContentItem[];
  category?: string;
  tags?: string[];
  readingTime?: number; // в минутах
  updatedAt?: string;
}