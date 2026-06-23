'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BlogContentItem } from '@/types/blog';
import ImageUpload from '@/components/admin/ImageUpload';

interface ArticleData {
  id?: number;
  slug: string;
  title: string;
  img: string;
  hero: string;
  date: string;
  excerpt: string;
  category: string;
  tags: string[];
  readingTime: number;
  content: BlogContentItem[];
}

const emptyArticle: ArticleData = {
  slug: '',
  title: '',
  img: '',
  hero: '',
  date: '',
  excerpt: '',
  category: '',
  tags: [],
  readingTime: 5,
  content: [],
};

function getDefaultContentItem(type: BlogContentItem['type']): BlogContentItem {
  switch (type) {
    case 'heading': return { type: 'heading', text: '', level: 2 };
    case 'paragraph': return { type: 'paragraph', text: '' };
    case 'list': return { type: 'list', items: [''], ordered: false };
    case 'image': return { type: 'image', src: '', alt: '', caption: '' };
    case 'quote': return { type: 'quote', text: '', author: '' };
    case 'warning': return { type: 'warning', text: '' };
    default: return { type: 'paragraph', text: '' };
  }
}

export default function ArticleEditor({ editSlug }: { editSlug?: string }) {
  const router = useRouter();
  const params = useParams();
  const slug = editSlug || (params?.slug as string);
  const isEditing = !!slug;

  const [article, setArticle] = useState<ArticleData>(emptyArticle);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (slug) {
      fetch(`/api/admin/blog/${slug}`)
        .then(res => {
          if (res.status === 401) {
            router.push('/admin/login');
            return null;
          }
          return res.json();
        })
        .then(data => {
          if (data) {
            setArticle({
              slug: data.slug || '',
              title: data.title || '',
              img: data.img || '',
              hero: data.hero || '',
              date: data.date || '',
              excerpt: data.excerpt || '',
              category: data.category || '',
              tags: data.tags || [],
              readingTime: data.readingTime || 5,
              content: data.content || [],
            });
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [slug, router]);

  function updateField<K extends keyof ArticleData>(key: K, value: ArticleData[K]) {
    setArticle(prev => ({ ...prev, [key]: value }));
  }

  function addContentItem(type: BlogContentItem['type']) {
    setArticle(prev => ({
      ...prev,
      content: [...prev.content, getDefaultContentItem(type)],
    }));
  }

  function updateContentItem(index: number, updates: Partial<BlogContentItem>) {
    setArticle(prev => {
      const content = [...prev.content];
      content[index] = { ...content[index], ...updates } as BlogContentItem;
      return { ...prev, content };
    });
  }

  function removeContentItem(index: number) {
    setArticle(prev => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index),
    }));
  }

  function moveContentItem(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= article.content.length) return;
    setArticle(prev => {
      const content = [...prev.content];
      [content[index], content[newIndex]] = [content[newIndex], content[index]];
      return { ...prev, content };
    });
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !article.tags.includes(tag)) {
      updateField('tags', [...article.tags, tag]);
      setTagInput('');
    }
  }

  function removeTag(tag: string) {
    updateField('tags', article.tags.filter(t => t !== tag));
  }

  function handleListItemsChange(index: number, items: string[]) {
    updateContentItem(index, { items } as Partial<BlogContentItem>);
  }

  function addListItem(index: number) {
    const item = article.content[index];
    if (item.type === 'list') {
      handleListItemsChange(index, [...item.items, '']);
    }
  }

  function removeListItem(contentIndex: number, itemIndex: number) {
    const item = article.content[contentIndex];
    if (item.type === 'list') {
      const items = item.items.filter((_, i) => i !== itemIndex);
      handleListItemsChange(contentIndex, items.length ? items : ['']);
    }
  }

  function updateListItem(contentIndex: number, itemIndex: number, value: string) {
    const item = article.content[contentIndex];
    if (item.type === 'list') {
      const items = [...item.items];
      items[itemIndex] = value;
      handleListItemsChange(contentIndex, items);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = isEditing
        ? `/api/admin/blog/${slug}`
        : '/api/admin/blog';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Ошибка сохранения');
        return;
      }

      const data = await res.json();
      router.push('/admin');
    } catch {
      setError('Ошибка соединения');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1a2e',
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
      }}>
        Загрузка...
      </div>
    );
  }

  const typeNames: Record<BlogContentItem['type'], string> = {
    heading: 'Заголовок',
    paragraph: 'Текст',
    list: 'Список',
    image: 'Изображение',
    quote: 'Цитата',
    warning: 'Предупреждение',
  };

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
        <h1 style={{ fontSize: '20px', margin: 0 }}>
          {isEditing ? 'Редактировать статью' : 'Новая статья'}
        </h1>
        <button
          onClick={() => router.push('/admin')}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            color: '#ccc',
            border: '1px solid #555',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          ← Назад
        </button>
      </header>

      <form onSubmit={handleSubmit} style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
        {error && (
          <div style={{
            color: '#ff6b6b',
            background: 'rgba(255,107,107,0.1)',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', color: '#ccc', fontSize: '14px' }}>
            Заголовок *
          </label>
          <input
            type="text"
            value={article.title}
            onChange={e => updateField('title', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #333',
              borderRadius: '6px',
              background: '#0f3460',
              color: '#fff',
              fontSize: '16px',
              boxSizing: 'border-box',
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', color: '#ccc', fontSize: '14px' }}>
            URL (slug) — если оставить пустым, сгенерируется из заголовка
          </label>
          <input
            type="text"
            value={article.slug}
            onChange={e => updateField('slug', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #333',
              borderRadius: '6px',
              background: '#0f3460',
              color: '#fff',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#ccc', fontSize: '14px' }}>
              Путь к изображению (img)
            </label>
            <input
              type="text"
              value={article.img}
              onChange={e => updateField('img', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #333',
                borderRadius: '6px',
                background: '#0f3460',
                color: '#fff',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
              placeholder="/img/blog/1.webp"
            />
            <div style={{ marginTop: '6px' }}>
              <ImageUpload
                onUploaded={(url) => updateField('img', url)}
                buttonLabel="Загрузить"
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#ccc', fontSize: '14px' }}>
              Hero изображение (опционально)
            </label>
            <input
              type="text"
              value={article.hero}
              onChange={e => updateField('hero', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #333',
                borderRadius: '6px',
                background: '#0f3460',
                color: '#fff',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
              placeholder="/img/blog/1/hero.webp"
            />
            <div style={{ marginTop: '6px' }}>
              <ImageUpload
                onUploaded={(url) => updateField('hero', url)}
                buttonLabel="Загрузить"
              />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', color: '#ccc', fontSize: '14px' }}>
            Краткое описание (excerpt)
          </label>
          <textarea
            value={article.excerpt}
            onChange={e => updateField('excerpt', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #333',
              borderRadius: '6px',
              background: '#0f3460',
              color: '#fff',
              fontSize: '14px',
              minHeight: '80px',
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#ccc', fontSize: '14px' }}>
              Категория
            </label>
            <input
              type="text"
              value={article.category}
              onChange={e => updateField('category', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #333',
                borderRadius: '6px',
                background: '#0f3460',
                color: '#fff',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
              placeholder="Выбор продукции"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#ccc', fontSize: '14px' }}>
              Время чтения (мин)
            </label>
            <input
              type="number"
              value={article.readingTime}
              onChange={e => updateField('readingTime', parseInt(e.target.value) || 5)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #333',
                borderRadius: '6px',
                background: '#0f3460',
                color: '#fff',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
              min={1}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#ccc', fontSize: '14px' }}>
              Дата (формат: DD.MM.YYYY)
            </label>
            <input
              type="text"
              value={article.date}
              onChange={e => updateField('date', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #333',
                borderRadius: '6px',
                background: '#0f3460',
                color: '#fff',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
              placeholder="22.09.2025"
            />
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '6px', color: '#ccc', fontSize: '14px' }}>
            Теги
          </label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            {article.tags.map((tag, i) => (
              <span key={i} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                background: '#0f3460',
                borderRadius: '4px',
                fontSize: '13px',
                color: '#ccc',
              }}>
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff6b6b',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '14px',
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #333',
                borderRadius: '6px',
                background: '#0f3460',
                color: '#fff',
                fontSize: '14px',
              }}
              placeholder="Введите тег и нажмите Enter"
            />
            <button
              type="button"
              onClick={addTag}
              style={{
                padding: '10px 16px',
                background: '#e94560',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              + Добавить
            </button>
          </div>
        </div>

        {/* Content blocks */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '18px', margin: 0, color: '#fff' }}>Содержание статьи</h2>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(['heading', 'paragraph', 'list', 'image', 'quote', 'warning'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addContentItem(type)}
                  style={{
                    padding: '6px 12px',
                    background: '#0f3460',
                    color: '#ccc',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  + {typeNames[type]}
                </button>
              ))}
            </div>
          </div>

          {article.content.length === 0 && (
            <p style={{ color: '#666', textAlign: 'center', padding: '40px', border: '2px dashed #333', borderRadius: '8px' }}>
              Нажмите на кнопку выше, чтобы добавить блок контента
            </p>
          )}

          {article.content.map((item, index) => (
            <div key={index} style={{
              background: '#16213e',
              border: '1px solid #0f3460',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '12px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <span style={{
                  fontSize: '12px',
                  color: '#888',
                  background: '#0f3460',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}>
                  {typeNames[item.type]}
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => moveContentItem(index, -1)}
                    disabled={index === 0}
                    style={{
                      padding: '4px 8px',
                      background: 'transparent',
                      color: index === 0 ? '#444' : '#aaa',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      cursor: index === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveContentItem(index, 1)}
                    disabled={index === article.content.length - 1}
                    style={{
                      padding: '4px 8px',
                      background: 'transparent',
                      color: index === article.content.length - 1 ? '#444' : '#aaa',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      cursor: index === article.content.length - 1 ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeContentItem(index)}
                    style={{
                      padding: '4px 8px',
                      background: 'transparent',
                      color: '#ff6b6b',
                      border: '1px solid #ff6b6b',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {item.type === 'heading' && (
                <div>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                    <select
                      value={item.level || 2}
                      onChange={e => updateContentItem(index, { level: parseInt(e.target.value) as 1 | 2 | 3 })}
                      style={{
                        padding: '8px',
                        border: '1px solid #333',
                        borderRadius: '4px',
                        background: '#0f3460',
                        color: '#fff',
                        fontSize: '14px',
                      }}
                    >
                      <option value={1}>H1</option>
                      <option value={2}>H2</option>
                      <option value={3}>H3</option>
                      <option value={4}>H4</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={item.text}
                    onChange={e => updateContentItem(index, { text: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      background: '#0f3460',
                      color: '#fff',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                    placeholder="Текст заголовка"
                  />
                </div>
              )}

              {item.type === 'paragraph' && (
                <textarea
                  value={item.text}
                  onChange={e => updateContentItem(index, { text: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    background: '#0f3460',
                    color: '#fff',
                    fontSize: '14px',
                    minHeight: '80px',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                  placeholder="Текст абзаца (можно использовать HTML-теги)"
                />
              )}

              {item.type === 'list' && (
                <div>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ color: '#aaa', fontSize: '13px', marginRight: '12px' }}>
                      <input
                        type="checkbox"
                        checked={!item.ordered}
                        onChange={e => updateContentItem(index, { ordered: !e.target.checked })}
                        style={{ marginRight: '4px' }}
                      />
                      Маркированный
                    </label>
                  </div>
                  {item.items.map((listItem, liIndex) => (
                    <div key={liIndex} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      <input
                        type="text"
                        value={listItem}
                        onChange={e => updateListItem(index, liIndex, e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: '1px solid #333',
                          borderRadius: '4px',
                          background: '#0f3460',
                          color: '#fff',
                          fontSize: '13px',
                        }}
                        placeholder="Элемент списка"
                      />
                      <button
                        type="button"
                        onClick={() => removeListItem(index, liIndex)}
                        style={{
                          padding: '4px 8px',
                          background: 'transparent',
                          color: '#ff6b6b',
                          border: '1px solid #ff6b6b',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addListItem(index)}
                    style={{
                      padding: '6px 12px',
                      background: '#0f3460',
                      color: '#aaa',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      marginTop: '4px',
                    }}
                  >
                    + Добавить элемент
                  </button>
                </div>
              )}

              {item.type === 'image' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    value={item.src}
                    onChange={e => updateContentItem(index, { src: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      background: '#0f3460',
                      color: '#fff',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                    placeholder="/img/blog/image.jpg"
                  />
                  <ImageUpload
                    onUploaded={(url) => updateContentItem(index, { src: url })}
                    buttonLabel="Загрузить"
                  />
                  <input
                    type="text"
                    value={item.alt}
                    onChange={e => updateContentItem(index, { alt: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      background: '#0f3460',
                      color: '#fff',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                    placeholder="Alt текст"
                  />
                  <input
                    type="text"
                    value={item.caption || ''}
                    onChange={e => updateContentItem(index, { caption: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      background: '#0f3460',
                      color: '#fff',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                    placeholder="Подпись (опционально)"
                  />
                </div>
              )}

              {item.type === 'quote' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <textarea
                    value={item.text}
                    onChange={e => updateContentItem(index, { text: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      background: '#0f3460',
                      color: '#fff',
                      fontSize: '14px',
                      minHeight: '60px',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                    }}
                    placeholder="Текст цитаты"
                  />
                  <input
                    type="text"
                    value={item.author || ''}
                    onChange={e => updateContentItem(index, { author: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      background: '#0f3460',
                      color: '#fff',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                    placeholder="Автор (опционально)"
                  />
                </div>
              )}

              {item.type === 'warning' && (
                <textarea
                  value={item.text}
                  onChange={e => updateContentItem(index, { text: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    background: '#0f3460',
                    color: '#fff',
                    fontSize: '14px',
                    minHeight: '60px',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                  placeholder="Текст предупреждения"
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #0f3460' }}>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              color: '#ccc',
              border: '1px solid #555',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '15px',
            }}
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '12px 24px',
              background: saving ? '#555' : '#e94560',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              fontWeight: 'bold',
            }}
          >
            {saving ? 'Сохранение...' : isEditing ? 'Сохранить изменения' : 'Создать статью'}
          </button>
        </div>
      </form>
    </div>
  );
}