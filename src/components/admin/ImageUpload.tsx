'use client';

import { useState, useRef, DragEvent } from 'react';

interface ImageUploadProps {
  onUploaded: (url: string) => void;
  buttonLabel?: string;
}

export default function ImageUpload({ onUploaded, buttonLabel = 'Загрузить изображение' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Можно загружать только изображения');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Файл слишком большой (максимум 5 MB)');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Ошибка загрузки');
        return;
      }

      const data = await res.json();
      onUploaded(data.url);
      setPreview(data.url);
    } catch {
      setError('Ошибка соединения');
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input so same file can be uploaded again
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexWrap: 'wrap',
          padding: error ? '12px' : '8px 12px',
          border: `2px dashed ${dragOver ? '#e94560' : error ? '#ff6b6b' : '#444'}`,
          borderRadius: '8px',
          background: dragOver ? 'rgba(233,69,96,0.1)' : 'transparent',
          transition: 'all 0.2s',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: '6px 12px',
            background: uploading ? '#555' : '#0f3460',
            color: '#fff',
            border: '1px solid #444',
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            whiteSpace: 'nowrap',
          }}
        >
          {uploading ? 'Загрузка...' : buttonLabel}
        </button>
        <span style={{ color: '#666', fontSize: '11px' }}>
          или перетащите файл сюда (jpg, png, webp, до 5 MB)
        </span>
      </div>
      {error && (
        <p style={{ color: '#ff6b6b', fontSize: '12px', margin: '4px 0 0', padding: '0 4px' }}>{error}</p>
      )}
      {preview && (
        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#4ade80', fontSize: '12px' }}>✓ Загружено:</span>
          <code style={{
            color: '#aaa',
            fontSize: '11px',
            background: '#0f3460',
            padding: '2px 6px',
            borderRadius: '4px',
            wordBreak: 'break-all',
          }}>
            {preview}
          </code>
        </div>
      )}
    </div>
  );
}