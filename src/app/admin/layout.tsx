'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [auth, setAuth] = useState<boolean | null>(null);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setAuth(true);
      return;
    }

    fetch('/api/admin/blog')
      .then(res => {
        if (res.status === 401) {
          router.push('/admin/login');
        } else {
          setAuth(true);
        }
      })
      .catch(() => {
        router.push('/admin/login');
      });
  }, [pathname, router]);

  if (auth === null && pathname !== '/admin/login') {
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
        Проверка авторизации...
      </div>
    );
  }

  return children;
}