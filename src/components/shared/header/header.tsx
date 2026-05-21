"use client";

import Image from "next/image";
import s from "./style.module.scss";
import { useModal } from "@/components/providers/ModalProvider";
import { JSX, useEffect, useRef, useState } from "react";
import ChatPopup from "@/components/ui/ChatPopup/ChatPopup";
import { LocalizedLink } from "@/components/ui/LocalizedLink";

type NavLink = {
  href: string;
  text: string;
};
type Product = {
  id: string;
  slug: string;
  title: string;
};


export default function Header(): JSX.Element {
  const { openRequest } = useModal();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const lastScrollY = useRef(0);
  const links: NavLink[] = [
    { href: "/products", text: "Продукция" },
    { href: "/about-us", text: "О нас" },
    { href: "/blog", text: "Новости" },
    { href: "/sotrudnichestvo", text: "Условия сотрудничества" },
  ];
  const lukProducts: Product[] = [
     {
      id: "6",
      slug: "konus-luk-lm",
      title: "Конус-люк тип «ЛМ»",
    },
    {
      id: "1",
      slug: "luk-lm",
      title: "Люк тип «ЛМ»",
    },
    {
      id: "2",
      slug: "luk-l",
      title: "Люк тип «Л»",
    },
    {
      id: "3",
      slug: "luk-lu",
      title: "Люк тип  «ЛУ»",
    },
    {
      id: "4",
      slug: "luk-c",
      title: "Люк тип «С»",
    },
    {
      id: "5",
      slug: "luk-t",
      title: "Люк тип  «Т»",
    },
     {
      id: "9",
      slug: "luk-tm",
      title: "Люк тип  «ТМ»",
    },
    {
      id: "7",
      slug: "luk-c-logotipom",
      title: "Люк c логотипом",
    }, {
      id: "8",
      slug: "lyuk-s-zapornym-ustroistvom",
      title: "Люк с ЗЗУ",
    },
  ];


  const terProd: Product[] = [
    {
      id: "1",
      slug: "333-polimerpeschanaya-plitka-na-8-kirpichey",
      title: "Тротуарная плитка ",
    },
    {
      id: "2",
      slug: "polimerpeschaniy-bordyur-porebrik",
      title: "Поребрик, бордюр",
    },
    {
      id: "3",
      slug: "polimerpeschaniy-livneviy-lotok",
      title: " Ливневый водоотвод",
    }
  ];
const colodecProd: Product[] =[
   {
      id: "1",
      slug: "kolco-smotrovogo-kolodca",
      title: "Кольцо смотрового колодца",
    },{
      id: "2",
      slug: "dno-smotrovogo-kolodca",
      title: "Дно смотрового колодца",
    },
]
  const closeMenu = (): void => setIsOpen(false);
  const toggleMenu = (): void => setIsOpen((v) => !v);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {


      const currentScrollY = window.scrollY;

      if (isOpen) {
        setIsHidden(false);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY <= 20) {
        setIsHidden(false);
      } else if (
        currentScrollY > lastScrollY.current &&
        currentScrollY > 120
      ) {
        setIsHidden(true);
      } else if (currentScrollY < lastScrollY.current) {
        setIsHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };


    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHidden]);

  return (
    <header
      className={`${s.header} ${isHidden ? s.headerHidden : ""} ${isOpen ? s.headerMenuOpen : ""}`}
    >
      <div className={"container " + s.headerContent}>
        <div className={s.left}>
          <LocalizedLink href="/" className={s.headerLogo + " flex-center"}>
            <Image
              src="/logo.png"
              alt='Логотип ООО "Полимерные Технологии"'
              width={176}
              height={36}
            />
          </LocalizedLink>

          <nav className={s.navDesktop}>
            <ul className={s.headerLinkBox}>
              {links.map((e, i) => (
                <li key={i}>
                  <LocalizedLink className={s.headerLink} href={e.href}>
                    {e.text}
                  </LocalizedLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <ChatPopup />

        <div className={s.right}>
          <div className={s.actionsDesktop + " flex-center"}>
            <a className={s.headerLink + " flex-center " + s.headerMail} href="mailto:73polimer@mail.ru">73polimer@mail.ru</a>
            <a
              className={s.headerLink + " flex-center " + s.headerTel}
              href="tel:+78002224309"
            >
              <Image
                src="/icons/tel.svg"
                alt='Номер телефона для связи ООО "Полимерные Технологии"'
                width={12}
                height={12}
              />
              +7 (800) 222 43 09
            </a>

            <button onClick={openRequest} className={"butt " + s.headerButt}>
              Оставить заявку
            </button>
          </div>

          <button
            type="button"
            className={s.burger}
            onClick={toggleMenu}
            aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <span className={s.burgerLine + " " + (isOpen ? s.lineTopOpen : "")} />
            <span className={s.burgerLine + " " + (isOpen ? s.lineMidOpen : "")} />
            <span className={s.burgerLine + " " + (isOpen ? s.lineBotOpen : "")} />
          </button>
        </div>
      </div>

      <div
        className={s.overlay + " " + (isOpen ? s.overlayOpen : "")}
        onClick={closeMenu}
      />

      <aside
        id="mobile-menu"
        className={s.mobilePanel + " " + (isOpen ? s.mobilePanelOpen : "")}
        aria-hidden={!isOpen}
      >
        <nav className={s.navMobile}>
          <ul className={s.mobileLinks}>
            {links.map((e, i) => (
              <li key={i}>
                <a className={s.mobileLink} href={e.href} onClick={closeMenu}>
                  {e.text}
                </a>
                { e.href === "/products" && (
                  
                  <ul key={`ul-${i}`} className={s.mobileSubLinks}>

                   {lukProducts.map((luc, idx) => (
                     <li key={`lukProducts-${idx}`}>
                      <a className={s.mobileSubLink} href={`/products/${luc.slug}`} onClick={closeMenu}>
                        {luc.title}
                      </a>
                    </li>
                   ))}
                   <br />
                   
                   {terProd.map((luc, idx) => (
                     <li  key={`terProd-${idx}`}>
                      <a className={s.mobileSubLink} href={`/products/${luc.slug}`} onClick={closeMenu}>
                        {luc.title}
                      </a>
                    </li>
                   ))}
                   <br />
                   {colodecProd.map((luc, idx) => (
                     <li   key={`colodecProd-${idx}`}>
                      <a className={s.mobileSubLink} href={`/products/${luc.slug}`} onClick={closeMenu}>
                        {luc.title}
                      </a>
                    </li>
                   ))}
                    
                  </ul>
                )}

              </li>
            ))}
          </ul>
        </nav>

        <div className={s.mobileActions}>
          <a className={s.headerLink + "  " + s.headerMail} href="mailto:73polimer@mail.ru">73polimer@mail.ru</a>
          <a className={s.mobileTel} href="tel:+78002224309" onClick={closeMenu}>
            <Image
              src="/icons/tel.svg"
              alt='Номер телефона для связи ООО "Полимерные Технологии"'
              width={14}
              height={14}
            />
            +7 (800) 222 43 09
          </a>

          <button
            type="button"
            onClick={() => {
              closeMenu();
              openRequest();
            }}
            className={"butt " + s.mobileBtn}
          >
            Оставить заявку
          </button>
        </div>
      </aside>
    </header>
  );
}