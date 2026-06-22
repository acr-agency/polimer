"use client";

import Lightbox, { SlideItem } from "@/components/ui/Lightbox/lightbox";
import s from "./style.module.css";
import Image from "next/image";
import { useState } from "react";
import PriceForm from "@/components/ui/PriceForm/PriceForm";
import PrezentForm from "@/components/ui/PrezentForm/PrezentForm";

type Advantage = {
  icon: string;
  text: string;
};

export type Instruct = {
  title: string;
  gallery: SlideItem[];
};
export default function Hero() {
  const [activeItem, setActiveItem] = useState<Instruct | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isPriceFormOpen, setIsPriceFormOpen] = useState(false);
  const [isPrezentFormOpen, setIsPrezentFormOpen] = useState(false);
  const advantages: Advantage[] = [
    { icon: "/icons/about/4.svg", text: "доставка по всей россии от нас до клиента" },
    { icon: "/icons/advantages/2.svg", text: "большой складской запас продукции" },
    { icon: "/icons/about/2.svg", text: "Люки с запорным устройством" },
    { icon: "/icons/about/1.svg", text: "логотип вашей компании на люках" },
  ];

  const openModal = (item: Instruct) => {
    setActiveItem(item);
    setIsLightboxOpen(true);
  };

  const closeModal = () => {
    setIsLightboxOpen(false);
    setActiveItem(null);
  };

  // Функция для открытия/закрытия попапа с прайс-листом
  const openPriceForm = () => {
    setIsPriceFormOpen(true);
  };

  const closePriceForm = () => {
    setIsPriceFormOpen(false);
  };

   const closePrezentForm = () => {
    setIsPrezentFormOpen(false);
  };

  return (
    <>
      <div className={s.heroWrapper}>
        {/* Фоновое изображение через компонент Image для лучшей оптимизации */}
        <div className={s.heroBg}>
          <picture>
            <source
              media="(max-width: 640px)"
              srcSet="/img/hero/fonMob.webp"
              type="image/webp"
            />
            <Image
              src="/img/hero/fon.jpg"
              alt='ООО "Полимерные Технологии" производство и оптовая продажа полимерпесчаных люков, полимерпесчаных плитки, полимерпесчаных водоотводов, поребриков.'
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              quality={70}
            />
          </picture>
          <div className={s.heroOverlay}></div>
        </div>

        <div className={`container ${s.contain}`}>
          <div className={s.heroContent}>
            <h1 className={`h1 ${s.title}`}>
              люки <span className={`seryy ${s.subTitle}`}>Канализационные</span>  <br /> полимерно-песчаные <br /> оптом <span className={`seryy ${s.subTitle}`}>с доставкой по Рф</span>
            </h1>

            <h2 className={s.heroH2}>
              Производство и <b>оптовая</b> продажа: <br /> - люки полимерпесчаные,<br /> - плитка тротуарная полимерпесчаная, <br />- водоотводы полимерпесчаные, <br /> - поребрики полимерпесчаные<br /> <span className={s.heroH2Sp}>  ООО "Полимерные Технологии"</span>
            </h2>

            <div className={s.heroButBox}>
              <button className={"butt " + s.heroBtn + " " + s.heroBtn2} onClick={() => openModal({
                title: "Презентация компании", gallery:
                  [
                    { image: "/img/present/1.webp", onPopup:() => setIsPrezentFormOpen(true) },
                    { image: "/img/present/2.webp",  onPopup:() => setIsPrezentFormOpen(true)  },
                    { image: "/img/present/3.webp",  onPopup:() => setIsPrezentFormOpen(true)  },
                    { image: "/img/present/4.webp",  onPopup:() => setIsPrezentFormOpen(true)  },
                    { image: "/img/present/5.webp",  onPopup:() => setIsPrezentFormOpen(true)  },
                    { image: "/img/present/6.webp",  onPopup:() => setIsPrezentFormOpen(true)  },
                    { image: "/img/present/7.webp",  onPopup:() => setIsPrezentFormOpen(true)  },
                    { image: "/img/present/8.webp",  onPopup:() => setIsPrezentFormOpen(true)  },
                    { image: "/img/present/9.webp",  onPopup:() => setIsPrezentFormOpen(true)  },
                    { image: "/img/present/10.webp",  onPopup:() => setIsPrezentFormOpen(true)  },
                    { image: "/img/present/11.webp",  onPopup:() => setIsPrezentFormOpen(true)  },
                    { image: "/img/present/12.webp",  onPopup:() => setIsPrezentFormOpen(true)  },
                    { image: "/img/present/13.webp",  onPopup:() => setIsPrezentFormOpen(true)  },
                    { image: "/img/present/14.webp",  onPopup:() => setIsPrezentFormOpen(true)  },
                    { image: "/img/present/15.webp",  onPopup:() => setIsPrezentFormOpen(true)  },
                    { image: "/img/present/16.webp",  onPopup:() => setIsPrezentFormOpen(true)  },
                    { image: "/img/present/17.webp",  onPopup:() => setIsPrezentFormOpen(true)  },
                    { image: "/img/present/18.webp",  onPopup:() => setIsPrezentFormOpen(true)  },
                    { image: "/img/present/19.webp",  onPopup:() => setIsPrezentFormOpen(true)  },
                  ]
              })} >
                Скачать презентацию и каталог продукции
              </button>



              <button
                className={"butt " + s.heroBtn + " " + s.heroBtn2 + " " + s.priceBtn}
                onClick={openPriceForm}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  style={{ marginRight: '8px' }}
                >
                  <path
                    d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Получить оптовый прайс-лист
              </button>

            </div>
          </div>
        </div>
      </div>

      <div className={s.heroAdvantages}>
        <div className="container">
          <div className={s.advGrid}>
            {advantages.map((e, i) => (
              <div key={i} className={s.heroAdvantagesItem}>
                <Image
                  src={e.icon}
                  alt={e.text}
                  width={47}
                  height={47}
                  loading="eager"
                />
                <p>{e.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Lightbox
        isOpen={isLightboxOpen}
        images={activeItem?.gallery || []}
        title={activeItem?.title}
        onClose={closeModal}
      />
      {isPrezentFormOpen && (
        <PrezentForm onClose={closePrezentForm} />
      )}
      {/* Попап для скачивания прайс-листа */}
      {isPriceFormOpen && (
        <PriceForm onClose={closePriceForm} />
      )}
    </>
  );
}