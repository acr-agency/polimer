import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/admin-auth';
import { getAllArticles, saveArticle, getNextId, generateSlug, ensureDataDir } from '@/lib/admin-blog';
import { BlogArticle } from '@/types/blog';

export async function GET() {
  ensureDataDir();
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const articles = getAllArticles();
    return NextResponse.json(articles);
  } catch {
    return NextResponse.json(
      { error: 'Failed to load articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  ensureDataDir();
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { title, slug, excerpt, category, tags, readingTime, content, img, hero } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const articleSlug = slug || generateSlug(title);
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;

    const article: BlogArticle = {
      id: getNextId(),
      slug: articleSlug,
      title,
      img: img || '',
      hero: hero || '',
      date: dateStr,
      excerpt: excerpt || '',
      category: category || '',
      tags: tags || [],
      readingTime: readingTime || 5,
      content,
    };

    saveArticle(article);

    return NextResponse.json({ success: true, slug: articleSlug });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}