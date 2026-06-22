"use client";

import { useEffect, useState, useRef } from "react";
import s from "./lightbox.module.css";

interface LightboxProps {
  isOpen: boolean;
  images: SlideItem[];
  title?: string;
  onClose: () => void;
}

export type SlideItem = {
  image: string;
  pdf?: string;
  onPopup?: () => void;
};

export default function Lightbox({ isOpen, images, title, onClose }: LightboxProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [imageOrientation, setImageOrientation] = useState<"portrait" | "landscape" | "square">("landscape");

  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  // Функция для определения ориентации изображения
  const checkImageOrientation = (imageUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      if (ratio > 1.1) {
        setImageOrientation("landscape");
      } else if (ratio < 0.9) {
        setImageOrientation("portrait");
      } else {
        setImageOrientation("square");
      }
    };
    img.src = imageUrl;
  };

  // Проверяем ориентацию при смене слайда или открытии лайтбокса
  useEffect(() => {
    if (isOpen && images[currentSlide]) {
      checkImageOrientation(images[currentSlide].image);
    }
  }, [isOpen, currentSlide, images]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, currentSlide]);

  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      setIsClosing(false);
      setDragX(0);
      setIsDragging(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setCurrentSlide(0);
      setDragX(0);
      setIsDragging(false);
    }, 280);
  };

  const nextSlide = () => {
    if (!images.length) return;
    setCurrentSlide((prev) => (prev + 1) % images.length);
    setDragX(0);
  };

  const prevSlide = () => {
    if (!images.length) return;
    setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setDragX(0);
  };

  const handleDragStart = (clientX: number) => {
    startXRef.current = clientX;
    currentXRef.current = clientX;
    setIsDragging(true);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    currentXRef.current = clientX;
    setDragX(clientX - startXRef.current);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;

    const delta = currentXRef.current - startXRef.current;
    const threshold = 70;

    if (delta > threshold) {
      prevSlide();
    } else if (delta < -threshold) {
      nextSlide();
    }

    setIsDragging(false);
    setDragX(0);
  };

  if (!isOpen && !isClosing) return null;

  const currentItem = images[currentSlide];

  return (
    <div
      className={`${s.lightbox} ${isClosing ? s.lightboxClosing : s.lightboxOpen}`}
      onClick={handleClose}
    >
      <button
        type="button"
        className={`${s.navBtn} ${s.navPrev}`}
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        aria-label="Предыдущий слайд"
      >
        ‹
      </button>

      <div
        className={`${s.lightboxContent} ${isClosing ? s.contentClosing : s.contentOpen
          } ${s[`orientation_${imageOrientation}`] || ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={s.closeBtn}
          onClick={handleClose}
          aria-label="Закрыть"
        >
          ×
        </button>

        <div
          className={s.imageFrame}
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseMove={(e) => handleDragMove(e.clientX)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
          onTouchEnd={handleDragEnd}
        >
          <div
            className={`${s.sliderTrack} ${isDragging ? s.sliderTrackDragging : ""}`}
            style={{
              transform: `translateX(calc(-${currentSlide * 100}% + ${dragX}px))`,
            }}
          >
            {images.map((image, index) => (
              <div className={s.slide} key={`slide-${index}`}>
                <img
                  src={image.image}
                  alt={`${title || "Изображение"} ${index + 1}`}
                  className={s.slideImage}
                  draggable={false}
                />
              </div>
            ))}
          </div>
          <>
            {currentItem?.pdf && (
              <a
                href={currentItem.pdf}
                download
                target="_blank"
                rel="noopener noreferrer"
                className={s.downloadBtn}
                onClick={(e) => e.stopPropagation()}
              >
                Скачать PDF
              </a>
            )}

            {currentItem?.onPopup && (
              <button

                className={s.downloadBtn}
                onClick={currentItem?.onPopup}
              >
                Скачать PDF
              </button>
            )}



          </>

        </div>
      </div>

      <button
        type="button"
        className={`${s.navBtn} ${s.navNext}`}
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        aria-label="Следующий слайд"
      >
        ›
      </button>

      {images.length > 1 && (
        <div className={s.counter}>
          {currentSlide + 1} / {images.length}
        </div>
      )}
    </div>
  );
}