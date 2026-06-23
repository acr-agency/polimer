'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Article {
  id: number;
  slug: string;
  title: string;
  date: string;
  category?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadArticles() {
    try {
      const res = await fetch('/api/admin/blog');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setArticles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArticles();
  }, []);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  async function handleDelete(slug: string) {
    if (!confirm('Удалить статью? Это действие необратимо.')) return;

    try {
      const res = await fetch(`/api/admin/blog/${slug}`, { method: 'DELETE' });
      if (res.ok) {
        setArticles(prev => prev.filter(a => a.slug !== slug));
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a2e',
      color: '#fff',
      fontFamily: 'Arial, sans-serif',
    }}>
      <header style={{
        background: '#16213e',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #0f3460',
      }}>
        <h1 style={{ fontSize: '20px', margin: 0 }}>Админ-панель — Блог</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/admin/blog/new" style={{
            padding: '8px 16px',
            background: '#e94560',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '14px',
          }}>
            + Новая статья
          </Link>
          <button onClick={handleLogout} style={{
            padding: '8px 16px',
            background: 'transparent',
            color: '#ff6b6b',
            border: '1px solid #ff6b6b',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}>
            Выйти
          </button>
        </div>
      </header>

      <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Загрузка...</p>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: '#888', marginBottom: '20px' }}>Статей пока нет</p>
            <Link href="/admin/blog/new" style={{
              padding: '12px 24px',
              background: '#e94560',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '6px',
            }}>
              Создать первую статью
            </Link>
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: '#16213e',
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #0f3460' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#888', fontWeight: 'normal', fontSize: '13px' }}>ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#888', fontWeight: 'normal', fontSize: '13px' }}>Название</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#888', fontWeight: 'normal', fontSize: '13px' }}>Категория</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#888', fontWeight: 'normal', fontSize: '13px' }}>Дата</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', color: '#888', fontWeight: 'normal', fontSize: '13px' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article, i) => (
                <tr key={article.slug} style={{
                  borderBottom: i < articles.length - 1 ? '1px solid #0f3460' : 'none',
                }}>
                  <td style={{ padding: '12px 16px', color: '#666', fontSize: '14px' }}>{article.id}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{article.title}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#aaa' }}>{article.category || '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#aaa' }}>{article.date}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <Link
                      href={`/admin/blog/edit/${article.slug}`}
                      style={{
                        padding: '6px 12px',
                        background: '#0f3460',
                        color: '#fff',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '13px',
                        marginRight: '8px',
                      }}
                    >
                      ✏️ Редактировать
                    </Link>
                    <button
                      onClick={() => handleDelete(article.slug)}
                      style={{
                        padding: '6px 12px',
                        background: 'transparent',
                        color: '#ff6b6b',
                        border: '1px solid #ff6b6b',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      🗑️ Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}