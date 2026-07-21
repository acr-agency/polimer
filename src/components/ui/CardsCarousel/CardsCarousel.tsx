"use client";

import React, {
  forwardRef,
  JSX,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import s from "./CardsCarousel.module.css";

export type CarouselHandle = {
  prev: () => void;
  next: () => void;
  canPrev: () => boolean;
  canNext: () => boolean;
};
export type CardsCarouselProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;

  className?: string;
  perView?: number;
  gap?: number;
  mobilePerView?: number; // Добавляем возможность указать сколько показывать на мобилке
};

type CardsCarouselComponent = <T>(
  props: CardsCarouselProps<T> & React.RefAttributes<CarouselHandle>
) => JSX.Element;

export const CardsCarousel = forwardRef(function CardsCarouselInner<T>(
  { 
    items, 
    renderItem, 
    className = "", 
    perView = 3, 
    gap = 18,
    mobilePerView = 1
  }: CardsCarouselProps<T>,
  ref: React.Ref<CarouselHandle>
) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const [currentPerView, setCurrentPerView] = useState(perView);

  // Определяем сколько элементов показывать в зависимости от ширины экрана
  useEffect(() => {
    const updatePerView = () => {
      if (window.innerWidth < 768) {
        setCurrentPerView(mobilePerView);
      } else {
        setCurrentPerView(perView);
      }
    };

    updatePerView();
    window.addEventListener('resize', updatePerView);
    return () => window.removeEventListener('resize', updatePerView);
  }, [perView, mobilePerView]);

  const getStep = (): number => {
    const viewport = viewportRef.current;
    if (!viewport) return 0;

    const first = viewport.querySelector<HTMLElement>(`[data-carousel-item]`);
    if (!first) return 0;

    const style = window.getComputedStyle(viewport);
    const gapPx = parseFloat(style.gap || "0") || gap;

    return first.offsetWidth + gapPx;
  };

  const scrollToIndex = (idx: number): void => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const step = getStep();
    viewport.scrollTo({ left: step * idx, behavior: "smooth" });
  };

  const getMaxIndex = (): number => {
    return Math.max(0, items.length - currentPerView);
  };

  const prev = (): void => {
    const nextIdx = Math.max(0, active - 1);
    setActive(nextIdx);
    scrollToIndex(nextIdx);
  };

  const next = (): void => {
    const maxIdx = getMaxIndex();
    const nextIdx = Math.min(maxIdx, active + 1);
    setActive(nextIdx);
    scrollToIndex(nextIdx);
  };

  const canPrev = (): boolean => {
    return active > 0;
  };

  const canNext = (): boolean => {
    return active < getMaxIndex();
  };

  useImperativeHandle(ref, () => ({ 
    prev, 
    next, 
    canPrev, 
    canNext 
  }), [active, items.length, currentPerView]);

  return (
    <div
      className={`${s.root} ${className}`}
      style={{ 
        ["--gap" as any]: `${gap}px`, 
        ["--perView" as any]: currentPerView 
      }}
    >
      <div ref={viewportRef} className={s.viewport}>
        <div className={s.track}>
          {items.map((item, i) => (
            <div key={i} className={s.item} data-carousel-item>
              {renderItem(item, i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}) as CardsCarouselComponent;