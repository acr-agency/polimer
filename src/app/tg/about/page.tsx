"use client";

import AboutAdvantages from "@/components/section/aboutPage/advantages/advantages";
import AboutInfo from "@/components/section/aboutPage/info/info";
import Contact from "@/components/section/contact/contact";
import Interesting from "@/components/section/Interesting/Interesting";
import Link from "next/link";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    Telegram?: any;
  }
}

interface ArticleCard {
  id: number;
  title: string;
  slug: string;
  img: string;
  date: string;
  excerpt: string;
}

export default function TgPage() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [blogArticles, setBlogArticles] = useState<ArticleCard[]>([]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    tg.ready();
    tg.expand();
    setUser(tg.initDataUnsafe?.user ?? null);
    setReady(true);

    tg.MainButton.setText("Готово");
    tg.MainButton.show();
    tg.MainButton.onClick(() => {
      tg.close();
    });

    return () => {
      try {
        tg.MainButton.offClick(() => {});
      } catch {}
    };
  }, []);

  // Загружаем статьи через публичный API (без кэширования require)
  useEffect(() => {
    fetch('/api/blog-list')
      .then(res => res.json())
      .then(data => setBlogArticles(data || []))
      .catch(() => setBlogArticles([]));
  }, []);

  return (
    <main style={{ padding: 16 }}>
      <AboutInfo/>
      <AboutAdvantages/>
      <Interesting items={blogArticles} />
      <Contact/>
    </main>
  );
}