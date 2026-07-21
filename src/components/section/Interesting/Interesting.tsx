"use client";

import { useRef, useState, useEffect } from "react";
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
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  // Обновляем состояние кнопок при изменении активного слайда
  const updateButtonsState = () => {
    if (carouselRef.current) {
      setCanPrev(carouselRef.current.canPrev());
      setCanNext(carouselRef.current.canNext());
    }
  };

  // Обновляем состояние при монтировании и при изменении items
  useEffect(() => {
    updateButtonsState();
  }, [items]);

  const handlePrev = () => {
    carouselRef.current?.prev();
    // Обновляем состояние после анимации
    setTimeout(updateButtonsState, 100);
  };

  const handleNext = () => {
    carouselRef.current?.next();
    setTimeout(updateButtonsState, 100);
  };

  return (
    <section className={s.Interesting}>
      <div className="container">
        <div className={s.InterestingHeader}>
          <h2 className="h2">Полезные статьи</h2>

          <SliderArrows
            onPrev={handlePrev}
            onNext={handleNext}
            prevDisabled={!canPrev}
            nextDisabled={!canNext}
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