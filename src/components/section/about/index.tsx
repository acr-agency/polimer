"use client";

import { useState } from "react";
import { useModal } from "@/components/providers/ModalProvider";
import AboutHero from "./AboutHero";
import AboutAdvantages from "./AboutAdvantages";
import s from "./style.module.css";
import { AboutItem } from "@/types/about";

export default function About() {
  const { openRequest } = useModal();
  
  const details: AboutItem[] = [
    {
      icon: "/icons/about/1.svg",
      title: "Ваш логотип на люке",
      text: "Ваш логотип на люке и Ваши контактные данные - это самое лучшее вложение в рекламу!",
      gallery: [
         { src: "/img/about/logotip/3.jpg", alt: "Логотип на люке 3" },
        { src: "/img/about/logotip/1.jpg", alt: "Логотип на люке 1" },
        { src: "/img/about/logotip/2.jpg", alt: "Логотип на люке 2" },
       
      ],
      href: "/products/luk-c-logotipom"
    },
    {
      icon: "/icons/about/4.svg",
      title: "Доставка люков до клиента",
      text: "Собственная служба логистики доставит товар заказчикам по всей территории России",
      gallery: [
        { src: "/img/about/dostavka/3.jpg", alt: "Доставка 3" },
        { src: "/img/about/dostavka/1.jpg", alt: "Доставка 1" },
        { src: "/img/about/dostavka/2.jpg", alt: "Доставка 2" },
        
      ],
      onClick: openRequest
    },
    {
      icon: "/icons/about/2.svg",
      title: "Люки с запорным устройством",
      text: "Запорное устройство люка предназначенно для защиты колодцев от несанкционированного доступа.",
      gallery: [
          { src: "/img/about/luk-zapor/3.jpg", alt: "Запорное устройство 3" },
        { src: "/img/about/luk-zapor/1.jpg", alt: "Запорное устройство 1" },
        { src: "/img/about/luk-zapor/2.jpg", alt: "Запорное устройство 2" },
      
      ],
      href: "/products/lyuk-s-zapornym-ustroistvom"
    },
    {
      icon: "/icons/about/3.svg",
      title: "Неснижаемый складской запас",
      text: "Постоянный неснижаемый складской запас люков обеспечит потребности большинства клиентов",
      gallery: [
         { src: "/img/about/zapas/3.jpg", alt: "Складской запас 3" },
        { src: "/img/about/zapas/1.jpg", alt: "Складской запас 1" },
        { src: "/img/about/zapas/2.jpg", alt: "Складской запас 2" },
       
      ],
      onClick: openRequest
    },
  ];

  const [activeAbout, setActiveAbout] = useState<AboutItem>(details[0]);

  return (
    <>
      <AboutHero />
      <AboutAdvantages 
        details={details}
        activeAbout={activeAbout}
        setActiveAbout={setActiveAbout}
      />
    </>
  );
}