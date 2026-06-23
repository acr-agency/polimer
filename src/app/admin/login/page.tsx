'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Ошибка входа');
        return;
      }

      router.push('/admin');
    } catch {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1a1a2e',
    }}>
      <form onSubmit={handleSubmit} style={{
        background: '#16213e',
        padding: '40px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}>
        <h1 style={{
          color: '#fff',
          fontSize: '24px',
          marginBottom: '30px',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
        }}>
          Вход в админ-панель
        </h1>

        {error && (
          <div style={{
            color: '#ff6b6b',
            background: 'rgba(255,107,107,0.1)',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            color: '#ccc',
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
          }}>
            Логин
          </label>
          <input
            type="text"
            value={login}
            onChange={e => setLogin(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #333',
              borderRadius: '6px',
              background: '#0f3460',
              color: '#fff',
              fontSize: '16px',
              boxSizing: 'border-box',
              outline: 'none',
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{
            color: '#ccc',
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
          }}>
            Пароль
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #333',
              borderRadius: '6px',
              background: '#0f3460',
              color: '#fff',
              fontSize: '16px',
              boxSizing: 'border-box',
              outline: 'none',
            }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? '#555' : '#e94560',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}