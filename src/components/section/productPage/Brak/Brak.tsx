"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import s from "./Brak.module.css";

export default function Brak() {
    const images1 = [
        "/img/products/brak/1-1.png",
        "/img/products/brak/2-2.jpg",
        "/img/products/brak/3-3.jpg",
        "/img/products/brak/4-4.jpg",
        "/img/products/brak/5-5.jpg",
    ];

    const images2 = [
        "/img/products/brak/1.jpg",
        "/img/products/brak/2.jpg",
        "/img/products/brak/3.jpeg",
        "/img/products/brak/4.jpg",
        "/img/products/brak/5.jpg",
    ];

    return (
        <section className={s.brak}>
            <div className="container">
                <h2 className="h2">
                    Неправильная установка и эксплуатация полимерно-песчаных люков.
                </h2>

                <div className={s.content}>
                    <div className={s.block}>
                        <h3 className={s.subtitle}>Неправильно выбран люк. </h3>
                        <p className={s.text}>
                            Нагрузка на люк при эксплуатации больше заявленной производителем.
                        </p>
                        <div className={s.sliderWrap}>
                            <Swiper
                                className={s.swiper}
                                spaceBetween={12}
                                slidesPerView={1}
                                breakpoints={{
                                    0: {
                                        slidesPerView: 1,
                                        allowTouchMove: true,
                                    },
                                    768: {
                                        slidesPerView: 5,
                                        allowTouchMove: false,
                                    },
                                }}
                            >
                                {images1.map((src, idx) => (
                                    <SwiperSlide key={idx} className={s.slide}>
                                        <div className={s.imageBox}>
                                            <Image
                                                src={src}
                                                alt={`Неправильный монтаж люка ${idx + 1}`}
                                                fill
                                                className={s.image}
                                            />
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>

                    <div className={s.block}>
                        <h3 className={s.subtitle}>Неправильная установка и эксплуатация полимерно-песчаных люков.</h3>

                        <p className={s.text}>
                            Не допускается монтаж полимерно-песчаных люков на монтажную пену.
                        </p>

                        <div className={s.sliderWrap}>
                            <Swiper
                                className={s.swiper}
                                spaceBetween={12}
                                slidesPerView={1}
                                breakpoints={{
                                    0: {
                                        slidesPerView: 1,
                                        allowTouchMove: true,
                                    },
                                    768: {
                                        slidesPerView: 5,
                                        allowTouchMove: false,
                                    },
                                }}
                            >
                                {images2.map((src, idx) => (
                                    <SwiperSlide key={idx} className={s.slide}>
                                        <div className={s.imageBox}>
                                            <Image
                                                src={src}
                                                alt={`Недопустимый монтаж люка ${idx + 1}`}
                                                fill
                                                className={s.image}
                                            />
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}