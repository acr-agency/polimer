import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/admin-auth';
import { migrate, getAllArticles, createArticle, generateSlug } from '@/lib/blog-db';
import { BlogArticle } from '@/types/blog';

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await migrate();
    const articles = await getAllArticles();
    return NextResponse.json(articles);
  } catch {
    return NextResponse.json(
      { error: 'Failed to load articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await migrate();
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
      id: 0,
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
      published: true,
    };

    const created = await createArticle(article);

    return NextResponse.json({ success: true, slug: created.slug });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}