import { lazy, Suspense } from "react";
import Hero from "@/components/section/hero/hero";
import { getLatestArticles } from "@/lib/blog";
import Profitable from "@/components/section/Profitable/Profitable";
import Faq from "@/components/section/faq/Faq";

// Компоненты для ленивой загрузки
const Products = lazy(() => import("@/components/section/products/products"));
const About = lazy(() => import("@/components/section/about"));
const Geography = lazy(() => import("@/components/section/geography/geography"));
const Reviews = lazy(() => import("@/components/section/reviews/reviews"));
const Interesting = lazy(() => import("@/components/section/Interesting/Interesting"));
const Contact = lazy(() => import("@/components/section/contact/contact"));

// Компоненты-заглушки для Suspense
const SectionFallback = () => (
  <div style={{ 
    height: '400px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    background: '#f5f5f5',
    margin: '20px 0'
  }}>
    <div>Загрузка раздела...</div>
  </div>
);

export default async function Home() {
  const blogArticles = await getLatestArticles(6);

  const blogMock = blogArticles.map(article => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    img: article.img,
    date: article.date,
    excerpt: article.excerpt
  }));

  return (
    <main>
      <Hero /> {/* Загружается сразу */}
      
      <Suspense fallback={<SectionFallback />}>
        <Products />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <Profitable />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <About />
      </Suspense>
      
      <Suspense fallback={<SectionFallback />}>
        <Geography />
      </Suspense>
      
      <Suspense fallback={<SectionFallback />}>
        <Reviews />
      </Suspense>
      
      <Suspense fallback={<SectionFallback />}>
        <Interesting items={blogMock} />
      </Suspense>
       <Suspense fallback={<SectionFallback />}>
        <Faq />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <Contact />
      </Suspense>
    </main>
  );
}