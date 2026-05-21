"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import s from "./AboutCard.module.css";
import { AboutItem } from "@/types/about";
import { LocalizedLink } from "@/components/ui/LocalizedLink";

type AboutCardProps = {
    item: AboutItem
    isActive: boolean
    onMouseEnter: () => void
}

export default function AboutCard({ item, isActive, onMouseEnter }: AboutCardProps) {
    
    const CardContent = () => (
        <>
            <Image
                src={item.icon}
                alt={item.title}
                width={47}
                height={47}
                style={{
                    maxWidth: '100%',
                    height: 'auto',
                    objectFit: 'contain'
                }}
            />

            <div className={s.cardContent}>
                <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    {item.title}
                </motion.h3>

                <motion.div
                    className={s.cardTextWrapper}
                    initial={false}
                    animate={
                        isActive
                            ? { opacity: 1, y: 0, pointerEvents: "auto" }
                            : { opacity: 0, y: 10, pointerEvents: "none" }
                    }
                    transition={{
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1],
                        opacity: { delay: isActive ? 0.1 : 0 }
                    }}
                >
                    <motion.div
                        className={s.goCircle}
                        whileHover="hover"
                        whileTap="tap"
                        variants={{
                            hover: {
                                scale: 1.02,
                                x: 2,
                                transition: { duration: 0.2 }
                            },
                            tap: {
                                scale: 0.95,
                                transition: { duration: 0.1 }
                            }
                        }}
                    >
                        <motion.div
                            className={s.goRipple}
                            animate={{
                                boxShadow: [
                                    "0 0 0 0px rgba(255,255,255,0.2)",
                                    "0 0 0 10px rgba(255,255,255,0)",
                                ]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 1
                            }}
                        />
                        <span className={s.goText}>Подробнее</span>
                        <motion.div
                            className={s.goArrowWrapper}
                            variants={{
                                hover: {
                                    rotate: -45,
                                    x: 3,
                                    y: -3
                                }
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M7 17L17 7M17 7H7M17 7V17"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );

    const cardElement = (
        <motion.div
            className={s.card}
            onMouseEnter={onMouseEnter}
            animate={{
                opacity: isActive ? 1 : 0.7,
                scale: isActive ? 1.03 : 1
            }}
            style={{
                background: `url(${item.gallery[0].src}) center / cover no-repeat`,
                backgroundColor: 'rgb(0 0 0 / 51%)',
                backgroundBlendMode: 'overlay'
            }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -6 }}
        >
            <CardContent />
        </motion.div>
    );

    // Если есть href - оборачиваем в Link
    if (item.href) {
        return (
            <LocalizedLink href={item.href} style={{ textDecoration: 'none', display: 'block' }}>
                {cardElement}
            </LocalizedLink>
        );
    }

    // Если есть onClick - добавляем обработчик
    if (item.onClick) {
        return (
            <div onClick={item.onClick} style={{ cursor: 'pointer' }}>
                {cardElement}
            </div>
        );
    }

    // Если нет ни ссылки, ни события - возвращаем просто карточку
    return cardElement;
}