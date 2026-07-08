import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/admin-auth';
import { getArticleBySlug, updateArticle, deleteArticle, migrate } from '@/lib/blog-db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await migrate();
    const { slug } = await params;
    const article = await getArticleBySlug(slug);

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
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await migrate();
    const { slug } = await params;

    const body = await request.json();
    const { title, slug: newSlug, excerpt, category, tags, readingTime, content, img, hero, date, published } = body;

    const updated = await updateArticle(slug, {
      title,
      slug: newSlug,
      excerpt,
      category,
      tags,
      readingTime,
      content,
      img,
      hero,
      date,
      published,
    } as any);

    if (!updated) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, slug: updated.slug });
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
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await migrate();
    const { slug } = await params;
    const deleted = await deleteArticle(slug);

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