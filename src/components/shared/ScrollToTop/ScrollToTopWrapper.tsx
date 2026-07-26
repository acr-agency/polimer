'use client';

import dynamic from 'next/dynamic';

const ScrollToTop = dynamic(
  () => import('@/components/shared/ScrollToTop/ScrollToTop'),
  { ssr: false }
);

export default function ScrollToTopWrapper() {
  return <ScrollToTop />;
}