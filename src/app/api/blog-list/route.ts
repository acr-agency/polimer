import { NextResponse } from 'next/server';
import { getLatestArticles } from '@/lib/blog';

export async function GET() {
  try {
    const articles = await getLatestArticles(10);
    return NextResponse.json(articles);
  } catch {
    return NextResponse.json([]);
  }
}