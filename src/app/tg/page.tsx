"use client";

import About from "@/components/section/about";
import Contact from "@/components/section/contact/contact";
import Hero from "@/components/section/hero/hero";
import Products from "@/components/section/products/products";
import Reviews from "@/components/section/reviews/reviews";
import { LocalizedLink } from "@/components/ui/LocalizedLink";
import Link from "next/link";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    Telegram?: any;
  }
}

export default function TgPage() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    tg.ready(); // сообщаем Telegram что приложение готово
    tg.expand(); // раскрыть по высоте (по желанию)
    setUser(tg.initDataUnsafe?.user ?? null);
    setReady(true);

    // пример: кнопка снизу в Telegram
    tg.MainButton.setText("Готово");
    tg.MainButton.show();
    tg.MainButton.onClick(() => {
      tg.close(); // закрыть мини-апп
    });

    return () => {
      try {
        tg.MainButton.offClick(() => {});
      } catch {}
    };
  }, []);

  return (
    <main style={{ padding: 16 }}>
        <LocalizedLink href={'/tg/about'}>О нас</LocalizedLink>
      <Hero />
      <Products />
      <About />
      <Reviews />
      <Contact />
    </main>
  );
}
