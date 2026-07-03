"use client";

import { getAllDirections } from "@/lib/directions";
import s from "./ProductHeaderMenu.module.scss";
import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

const itemLink = [
    {
        "img": '/img/headerMenu/1.jpg',
        "name": "Конус-люк",
        "subName": "",
        "slug": "konus-luk-lm",
        "directions": ["1", "4", "5", "6"]
    },
    {
        "img": '/img/headerMenu/2.jpg',
        "name": "Люки ЛМ",
        "subName": "Легкий малогабаритный",
        "slug": "luk-lm",
        "directions": ["1", "4", "5"]
    },
    {
        "img": '/img/headerMenu/3.jpg',
        "name": "Люки Л",
        "subName": "Легкий",
        "slug": "luk-l",
        "directions": ["2", "4", "5"]
    }, {
        "img": '/img/headerMenu/4.jpg',
        "name": "Люки ЛУ ",
        "subName": "Легкий усиленный",
        "slug": "luk-lu",
        "directions": ["2", "4", "5"]
    }, {
        "img": '/img/headerMenu/5.jpg',
        "name": "Люки С",
        "subName": "Средний",
        "slug": "luk-c",
        "directions": ["2", "4", "5"]
    },
    {
        "img": '/img/headerMenu/6.jpg',
        "name": "Люки Т",
        "subName": "Тяжелый",
        "slug": "luk-t",
        "directions": ["3", "4", "5"]
    },
    {
        "img": '/img/headerMenu/7.jpg',
        "name": "Люки ТМ",
        "subName": "Тяжелый магистральный",
        "slug": "luk-tm",
        "directions": ["3", "5"]
    },
    {
        "img": '/img/headerMenu/8.jpg',
        "name": "Кольцо колодца",
        "subName": "Тяжелый магистральный",
        "slug": "kolco-smotrovogo-kolodca",
        "directions": ["6"]
    }, {
        "img": '/img/none.webp',
        "name": "Дно колодца",
        "subName": "",
        "slug": "dno-smotrovogo-kolodca",
        "directions": ["6"]
    },
    {
        "img": '/img/headerMenu/9.jpg',
        "name": "Плитка тротуарная",
        "subName": "",
        "slug": "333-polimerpeschanaya-plitka-na-8-kirpichey",
        "directions": ["7"]
    }, {
        "img": '/img/headerMenu/10.jpg',
        "name": "Поребрик",
        "subName": "",
        "slug": "polimerpeschaniy-bordyur-porebrik",
        "directions": ["8"]
    },
    {
        "img": '/img/headerMenu/11.jpg',
        "name": "Водоотвод",
        "subName": "",
        "slug": "polimerpeschaniy-livneviy-lotok",
        "directions": ["9"]
    },
];


interface ProductHeaderMenuProps {
    onClose?: () => void;
}

export default function ProductHeaderMenu({ onClose }: ProductHeaderMenuProps) {
    const [activeDirections, setActiveDirections] = useState<string>('all');
    const allDirections = getAllDirections();

    // Фильтрация товаров
    const filteredItems = activeDirections === 'all'
        ? itemLink
        : itemLink.filter(item => item.directions.includes(activeDirections));

    // Варианты анимации для контейнера
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.05
            }
        }
    };

    // Варианты анимации для каждого элемента
    const itemVariants: Variants = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        },
        exit: {
            opacity: 0,
            y: -20,
            scale: 0.95,
            transition: {
                duration: 0.2,
                ease: "easeIn"
            }
        }
    };

    // Закрытие при клике на фон
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && onClose) {
            onClose();
        }
    };

    return (
        <motion.div 
            className={s.overflou}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleOverlayClick}
        >
            <motion.div 
                className={s.budy}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                {/* <button className={s.closeButton} onClick={onClose}>
                    ✕
                </button> */}
                <div className={s.head}>
                    <motion.button
                        onClick={() => setActiveDirections('all')}
                        className={`${s.tab} ${activeDirections === "all" && s.active}`}
                        whileTap={{ scale: 0.95 }}
                    >
                        Все
                    </motion.button>
                    {allDirections.map((e) => (
                        <motion.button
                            key={e.id}
                            onClick={() => setActiveDirections(e.id)}
                            className={`${s.tab} ${activeDirections === e.id && s.active}`}
                            whileTap={{ scale: 0.95 }}
                        >
                            {e.name}
                        </motion.button>
                    ))}
                </div>
                <h3 className={s.title}>
                    Продукция: 
                </h3>
                <motion.div
                    className={s.main}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    key={activeDirections}
                >
                    <AnimatePresence mode="wait">
                        {filteredItems.map((item, index) => (
                            <motion.a
                                key={`${item.slug}-${index}`}
                                className={s.productCard}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                layout
                                href={`/products/${item.slug}`}
                                onClick={onClose}
                            >
                                <div className={s.imageWrapper}>
                                    <img src={item.img} alt={item.name} />
                                    <div className={s.productInfo}>
                                        <h4 className={s.productName}>{item.name}</h4>
                                        {item.subName && (
                                            <p className={s.productSubName}>{item.subName}</p>
                                        )}
                                    </div>
                                </div>
                            </motion.a>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}