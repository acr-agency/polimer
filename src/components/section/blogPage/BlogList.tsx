'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import s from "./style.module.css";
import CardBlog from "@/components/ui/CardBlog/CardBlog";

interface ArticleCard {
  id: number;
  slug: string;
  title: string;
  img: string;
  date: string;
  excerpt: string;
}

const PER_PAGE = 6;

// Варианты анимации для карточек
const cardVariants = {
  initial: { opacity: 0, y: 24 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.35,
      ease: 'easeOut' as const,
    },
  }),
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

export default function BlogList() {
  const [articles, setArticles] = useState<ArticleCard[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(0); // -1 назад, +1 вперёд

  useEffect(() => {
    setLoading(true);
    fetch(`/api/blog-list?page=${page}&limit=${PER_PAGE}`)
      .then(res => res.json())
      .then(data => {
        setArticles(data.items || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [page]);

  const goToPage = (p: number) => {
    setDirection(p > page ? 1 : -1);
    setPage(p);
  };

  if (articles.length === 0 && !loading) {
    return (
      <section className={s.blogList}>
        <div className="container">
          <p style={{ textAlign: 'center', color: '#888', padding: '60px 0' }}>Статей пока нет</p>
        </div>
      </section>
    );
  }

  return (
    <section className={s.blogList}>
      <div className="container">
        {loading ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '60px 0' }}>Загрузка...</p>
        ) : (
          <div className={s.blogListContent}>
            <AnimatePresence mode="wait">
              {articles.map((e, i) => (
                <motion.div
                  key={`${page}-${e.id}`}
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  custom={i}
                >
                  <CardBlog {...e} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className={s.pagination}>
            <button
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
              className={s.pageBtn}
            >
              ← Назад
            </button>

            <div className={s.pageNumbers}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`${s.pageNum} ${p === page ? s.pageNumActive : ''}`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
              className={s.pageBtn}
            >
              Вперед →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
