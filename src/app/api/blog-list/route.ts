import { NextRequest, NextResponse } from 'next/server';
import { getBlogCards } from '@/lib/blog-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const allArticles = await getBlogCards();
    const total = allArticles.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const items = allArticles.slice(start, start + limit);

    return NextResponse.json({
      items,
      total,
      page,
      totalPages,
    });
  } catch {
    return NextResponse.json({ items: [], total: 0, page: 1, totalPages: 0 });
  }
}