import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/admin-auth';
import { getArticle, saveArticle, deleteArticle, ensureDataDir } from '@/lib/admin-blog';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  ensureDataDir();
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { slug } = await params;
    const article = getArticle(slug);

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch {
    return NextResponse.json(
      { error: 'Failed to load article' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  ensureDataDir();
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { slug } = await params;
    const existing = getArticle(slug);

    if (!existing) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, slug: newSlug, excerpt, category, tags, readingTime, content, img, hero, date, published } = body;

    const updatedArticle = {
      ...existing,
      title: title || existing.title,
      slug: newSlug || existing.slug,
      img: img !== undefined ? img : existing.img,
      hero: hero !== undefined ? hero : existing.hero,
      date: date || existing.date,
      excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
      category: category !== undefined ? category : existing.category,
      tags: tags !== undefined ? tags : existing.tags,
      readingTime: readingTime || existing.readingTime,
      content: content || existing.content,
      published: published !== undefined ? published : existing.published,
    };

    // If slug changed, delete old file
    if (newSlug && newSlug !== slug) {
      deleteArticle(slug);
    }

    saveArticle(updatedArticle);

    return NextResponse.json({ success: true, slug: updatedArticle.slug });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  ensureDataDir();
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { slug } = await params;
    const deleted = deleteArticle(slug);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}