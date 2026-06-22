"use client"

import { useState } from "react"; // Добавляем импорт хука useState
import Image from "next/image";
import s from "./style.module.css";
import { JSX } from "react";
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

export default function Footer(): JSX.Element {
  // Состояние для управления аккордеоном
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const link: NavLink[] = [
    { href: "/about-us", text: `О компании ООО "Полимерные Технологии"` },
    { href: "/blog", text: `Новости ООО "Полимерные Технологии"` },
    { href: "/sotrudnichestvo", text: "Условия сотрудничества" },
    { href: "/contacts", text: "Контакты ООО \"Полимерные Технологии\"" },
  ];

  const lukProducts: Product[] = [
    {
      id: "6",
      slug: "konus-luk-lm",
      title: "Конус-люк канализационный полимерпесчаный «ЛМ»",
    },
    {
      id: "1",
      slug: "luk-lm",
      title: "Люк канализационный полимерпесчаный «ЛМ»",
    },
    {
      id: "2",
      slug: "luk-l",
      title: "Люк канализационный полимерпесчаный «Л»",
    },
    {
      id: "3",
      slug: "luk-lu",
      title: "Люк канализационный полимерпесчаный «ЛУ»",
    },
    {
      id: "4",
      slug: "luk-c",
      title: "Люк канализационный полимерпесчаный «С»",
    },
    {
      id: "5",
      slug: "luk-t",
      title: "Люк канализационный полимерпесчаный «Т»",
    },
    {
      id: "9",
      slug: "luk-tm",
      title: "Люк канализационный полимерпесчаный  «ТМ»",
    },
    {
      id: "7",
      slug: "luk-c-logotipom",
      title: "Люк полимерпесчаный c логотипом",
    }, {
      id: "8",
      slug: "lyuk-s-zapornym-ustroistvom",
      title: "Люк с запорным устройством",
    },
  ];


  const terProd: Product[] = [
    {
      id: "1",
      slug: "333-polimerpeschanaya-plitka-na-8-kirpichey",
      title: "Полимерно-песчаная тротуарная плитка (8 кирпичей)",
    },
    {
      id: "2",
      slug: "polimerpeschaniy-bordyur-porebrik",
      title: "Полимерпесчаный поребрик, бордюр",
    },
    {
      id: "3",
      slug: "polimerpeschaniy-livneviy-lotok",
      title: "Полимерпесчаный водоотвод",
    }
  ];
  const colodecProd: Product[] = [
    {
      id: "1",
      slug: "kolco-smotrovogo-kolodca",
      title: "Кольцо смотрового колодца",
    }, {
      id: "2",
      slug: "dno-smotrovogo-kolodca",
      title: "Дно смотрового колодца",
    },
  ]
  // Company details for microdata and easy maintenance
  const companyDetails = {
    name: "ООО «Полимерные Технологии»",
    legalName: "Общество с ограниченной ответственностью «Полимерные Технологии»",
    inn: "7328059047",
    kpp: "732101001",
    ogrn: "1107328001109",
    okpo: "87758168",
    legalAddress: "432063, РФ, Ульяновская обл., г.Ульяновск, Ул. Кирова, д. 6, кв. 397",
    postalAddress: "432063, РФ, Ульяновская обл., г.Ульяновск, Ул. Кирова, д. 6, кв. 397",
    factoryAddress: "г. Ульяновск, проезд Максимова 33 строение 3 (бывш. 9-й проезд Инженерный 33, строение 3)",
    phone: "+7 (800) 222 43 09",
    phoneRaw: "+78002224309",
    email: "73polimer@mail.ru",
    director: "Адаев Игорь Николаевич",
    bankAccount: "40702810329280003234",
    bankName: "ФИЛИАЛ \"НИЖЕГОРОДСКИЙ\" АО \"АЛЬФА-БАНК\"",
    bik: "042202824",
    correspondentAccount: "30101810200000000824",
  };

  return (
    <footer className={s.footer} itemScope itemType="https://schema.org/Organization">
      <meta itemProp="name" content={companyDetails.name} />
      <meta itemProp="legalName" content={companyDetails.legalName} />
      <meta itemProp="taxID" content={companyDetails.inn} />
      <meta itemProp="vatID" content={companyDetails.inn} />

      <div className="container">
        <div className={s.footerContent}>
          <div>
            <LocalizedLink
              href="/"
              className={s.footerLogo + " flex-center"}
              itemProp="url"
            >
              <Image
                src="/logo.png"
                alt={`Логотип ${companyDetails.name}`}
                width={176}
                height={36}
                itemProp="logo"
              />
            </LocalizedLink>
            <nav className={s.col} aria-label="Основная навигация">
              <ul className={s.list}>
                {link.map((e, i) => (
                  <li key={i}>
                    <LocalizedLink className={s.footerLink + " link"} href={e.href}>
                      {e.text}
                    </LocalizedLink>
                  </li>
                ))}
              </ul>
            </nav>
            <ul>
              <li className={s.linkSoc}>
                <a
                  className={s.footerLink + " link"}
                  href={`tel:${companyDetails.phoneRaw}`}
                  itemProp="telephone"
                >
                  <strong>Телефон:</strong> {companyDetails.phone}
                </a>
              </li>
              <li>
                <a
                  className={s.footerLink + " link"}
                  href={`mailto:${companyDetails.email}`}
                  itemProp="email"
                >
                  <strong>Email:</strong> {companyDetails.email}
                </a>
              </li>


              {/* <li className={s.socRow}>
                <a
                  className={s.footerSoc}
                  href="https://t.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                >
                  <Image src="/icons/tg.svg" alt="Связаться по Telegram" width={44} height={44} />
                </a>
                <a
                  className={s.footerSoc}
                  href=""
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                >
                  <Image src="/icons/max.svg" alt="Связаться по WhatsApp" width={44} height={44} />
                </a>
                <a
                  className={s.footerSoc}
                  href=""
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="VK"
                >
                  <Image src="/icons/vk.svg" alt="Связаться по VK" width={44} height={44} />
                </a>
              </li> */}
            </ul>

          </div>

          <div className={s.siteMap}>

            <nav className={s.col} aria-label="Навигация по продукции">
              <ul className={s.list}>
                <li>
                  <LocalizedLink className={s.footerLink + " link " + s.siteMapTitle} href="/products">
                    Каталог полимерпесчаных люков:
                  </LocalizedLink>
                </li>
                {lukProducts.map((product) => (
                  <li key={product.id}>
                    {product.slug ? (
                      <LocalizedLink
                        title={product.title}
                        className={s.footerLink + " link"}
                        href={`/products/${product.slug}`}
                      >
                        {product.title}
                      </LocalizedLink>
                    ) : (
                      <span className={s.footerLink}>
                        {product.title}
                      </span>
                    )}
                  </li>
                ))}
              </ul>

            </nav>
            <nav className={s.col}>
              <ul className={s.list}>
                <li>
                  <LocalizedLink className={s.footerLink + " link " + s.siteMapTitle} href="/products">
                    Каталог полимерпесчанной плитки, поребриков, водоотводов:
                  </LocalizedLink>
                </li>
                {terProd.map((product) => (
                  <li key={product.id}>
                    {product.slug ? (
                      <LocalizedLink
                        title={product.title}
                        className={s.footerLink + " link"}
                        href={`/products/${product.slug}`}
                      >
                        {product.title}
                      </LocalizedLink>
                    ) : (
                      <span className={s.footerLink}>
                        {product.title}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <ul className={s.list}>
                <li>
                  <LocalizedLink className={s.footerLink + " link " + s.siteMapTitle} href="/products">
                    Каталог смотрового колодца:
                  </LocalizedLink>
                </li>
                {colodecProd.map((product) => (
                  <li key={product.id}>
                    {product.slug ? (
                      <LocalizedLink
                        title={product.title}
                        className={s.footerLink + " link"}
                        href={`/products/${product.slug}`}
                      >
                        {product.title}
                      </LocalizedLink>
                    ) : (
                      <span className={s.footerLink}>
                        {product.title}
                      </span>
                    )}
                  </li>
                ))}
                <br />
                  <a className={s.footerLink + " link " + s.siteMapTitle}  href="/blog">Полезные статьи</a>
              </ul>
            
            </nav>
          </div>



        </div>

        {/* Company details accordion with microdata */}
        <div className={s.companyDetails}>
          <div
            className={s.detailsHeader}
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsDetailsOpen(!isDetailsOpen)}
            aria-expanded={isDetailsOpen}
            aria-controls="company-details-content"
          >
            <h3>Реквизиты:</h3>
            <span className={`${s.accordionIcon} ${isDetailsOpen ? s.open : ''}`}>▼</span>
          </div>

          <div
            id="company-details-content"
            className={`${s.detailsContent} ${isDetailsOpen ? s.expanded : ''}`}
          >
            <div className={s.detailsGrid}>
              <div className={s.detailItem}>
                <span className={s.detailLabel}>Юридический адрес:</span>
                <span itemProp="taxID">{companyDetails.legalAddress}</span>
              </div>
              <div className={s.detailItem}>
                <span className={s.detailLabel}>Почтовый адрес:</span>
                <span itemProp="taxID">{companyDetails.postalAddress}</span>
              </div>
              <div className={s.detailItem}>
                <span className={s.detailLabel}>Производство:</span>
                <span itemProp="taxID">{companyDetails.factoryAddress}</span>
              </div>
              <div className={s.detailItem}>
                <span className={s.detailLabel}>ИНН:</span>
                <span itemProp="taxID">{companyDetails.inn}</span>
              </div>
              <div className={s.detailItem}>
                <span className={s.detailLabel}>КПП:</span>
                <span>{companyDetails.kpp}</span>
              </div>
              <div className={s.detailItem}>
                <span className={s.detailLabel}>ОГРН:</span>
                <span>{companyDetails.ogrn}</span>
              </div>
              <div className={s.detailItem}>
                <span className={s.detailLabel}>ОКПО:</span>
                <span>{companyDetails.okpo}</span>
              </div>
              <div className={s.detailItem}>
                <span className={s.detailLabel}>Р/с:</span>
                <span>{companyDetails.bankAccount}</span>
              </div>
              <div className={s.detailItem}>
                <span className={s.detailLabel}>Банк:</span>
                <span>{companyDetails.bankName}</span>
              </div>
              <div className={s.detailItem}>
                <span className={s.detailLabel}>БИК:</span>
                <span>{companyDetails.bik}</span>
              </div>
              <div className={s.detailItem}>
                <span className={s.detailLabel}>Корр. счет:</span>
                <span>{companyDetails.correspondentAccount}</span>
              </div>
            </div>
            <div className={s.downloadWrapper}>
              <a
                href="/docs/Реквизиты Полимерные Технологии.doc"
                className={s.downloadLink}
                download
                target="_blank"
              >
                📄 Скачать реквизиты (файл .doc)
              </a>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className={s.bottom}>
          <span>© {companyDetails.name} — {new Date().getFullYear()}</span><br />
          {/* <span itemProp="copyrightYear">{new Date().getFullYear()}</span> */}

          <a className={"link " + s.policy} href="/politiko">
            Политика конфиденциальности
          </a>
          <a className={"link " + s.policy} href="/politika-cookies">
            Политика в отношении файлов cookie
          </a>
          <a className={"link " + s.policy} href="/soglasie-obrabotka-pers-dannih">
            Согласие на обработку персональных данных
          </a>
        </div>
      </div>
    </footer>
  );
}