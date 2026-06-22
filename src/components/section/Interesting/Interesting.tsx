"use client";

import { useRef } from "react";
import s from "./style.module.css";
import { SliderArrows } from "@/components/ui/SliderArrows/SliderArrows";
import {
  CardsCarousel,
  CarouselHandle,
} from "@/components/ui/CardsCarousel/CardsCarousel";
import CardBlog from "@/components/ui/CardBlog/CardBlog";
import { BlogCardData } from "@/types/blog";

export default function Interesting({ items }: { items: BlogCardData[] }) {
  const carouselRef = useRef<CarouselHandle | null>(null);

  return (
    <section className={s.Interesting}>
      <div className="container">
        <div className={s.InterestingHeader}>
          <h2 className="h2">Полезные статьи</h2>

          <SliderArrows
            onPrev={() => carouselRef.current?.prev()}
            onNext={() => carouselRef.current?.next()}
            theme="auto"
          />
        </div>

        <div className={s.InterestingContent}>
          <CardsCarousel
            ref={carouselRef}
            items={items}
            perView={3}
            renderItem={(card) => <CardBlog {...card} />}
          />
        </div>
      </div>
    </section>
  );
}
