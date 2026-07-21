import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/admin-auth';
import fs from 'fs';
import path from 'path';

// Сохраняем в data/uploads/blog (Docker volume — сохраняется между перезапусками)
// Раздаём через /uploads/blog/имя_файла (роут src/app/uploads/blog/[filename]/route.ts)
const UPLOAD_DIR = path.join(process.cwd(), 'data/uploads/blog');

// Разрешённые типы файлов
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    // Убедимся, что директория существует
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не передан' },
        { status: 400 }
      );
    }

    // Проверка типа файла
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Неподдерживаемый тип файла. Разрешены: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Проверка размера
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Файл слишком большой. Максимум 5 MB' },
        { status: 400 }
      );
    }

    // Генерируем уникальное имя файла
    const ext = file.name.split('.').pop() || 'webp';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Сохраняем файл
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // URL — прямая ссылка на статику (Next.js раздаёт из public/)
    const url = `/uploads/blog/${fileName}`;

    return NextResponse.json({
      success: true,
      url,
      fileName,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Ошибка загрузки файла' },
      { status: 500 }
    );
  }
}
