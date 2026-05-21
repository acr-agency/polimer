"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import {
  SlideInLeft,
  SlideInRight,
  ScaleIn,
  Stagger,
  StaggerItem
} from "@/components/ui/Motion";
import s from "./AboutHero.module.css";
import { LocalizedLink } from "@/components/ui/LocalizedLink";

export default function AboutHero() {
  // Array of slide images
  const slides = [
    {
      id: 1,
      image: "img/about/slider/1.webp",
      alt: "About us image 1"
    },
    {
      id: 2,
      image: "img/about/slider/2.webp",
      alt: "About us image 2"
    },
    {
      id: 3,
      image: "img/about/slider/3.webp",
      alt: "About us image 3"
    },
    {
      id: 4,
      image: "img/about/slider/4.webp",
      alt: "About us image 4"
    },
    {
      id: 5,
      image: "img/about/slider/5.webp",
      alt: "About us image 5"
    }
  ];

  return (
    <section className={s.hero}>
      <div className="container">
        <h2 className={`h2 ${s.heroTitle}`}>
          О нас
        </h2>

        <div className={s.heroContent}>
          {/* Swiper Slider вместо motion.div */}
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true
            }}
            loop={true}
            speed={800}
            className={s.heroSlider}
            initialSlide={0}
          >
            {slides.map((slide) => (
              <SwiperSlide key={slide.id}>
                <motion.div
                  className={s.heroDecorative}
                  initial={{ scale: 1.1, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    backgroundImage: `url(${slide.image})`
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          <SlideInRight delay={0.3} amount={0.2}>
            <div className={s.heroText}>
              
              <ScaleIn delay={0.6} amount={0.2}>
                <motion.div
                  whileHover={{ x: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LocalizedLink href="/about-us" className="link">
                    Подробнее
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 2
                      }}
                      style={{ display: 'inline-block', marginLeft: '5px' }}
                    >
                      →
                    </motion.span>
                  </LocalizedLink>
                </motion.div>
              </ScaleIn>
            </div>
          </SlideInRight>
        </div>
      </div>
    </section>
  );
}