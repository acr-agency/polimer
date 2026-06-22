import Image from "next/image";
import s from "./style.module.css";
import BreadCrumbs from "@/components/ui/BreadCrumbs/BreadCrumbs";

export default function Contacts() {
    const companyDetails = {
        name: "ООО «Полимерные Технологии»",
        legalAddress: "432063, РФ, Ульяновская обл., г.Ульяновск, Ул. Кирова, д. 6, кв. 397",
        postalAddress: "432063, РФ, Ульяновская обл., г.Ульяновск, Ул. Кирова, д. 6, кв. 397",
        factoryAddress: "г. Ульяновск, проезд Максимова 33 строение 3",
        phone: "+7 (800) 222 43 09",
        phoneRaw: "+78002224309",
        email: "73polimer@mail.ru",
        telegram: "",
        max: "",
        vk: "",
    };

    return (
        <section className={s.contacts}>
            <div className="container">
                <BreadCrumbs items={[{title:"Контакты  ООО «Полимерные Технологии»"}]}/>
                <h1 className="h1">Контакты {companyDetails.name}</h1>

                <div className={s.contactsGrid}>
                    {/* Адреса */}
                    <div className={s.contactBlock}>
                        <h2>Юридический адрес</h2>
                        <p>{companyDetails.legalAddress}</p>

                        <h2>Почтовый адрес</h2>
                        <p>{companyDetails.postalAddress}</p>

                        <h2>Производство</h2>
                        <p>
                            <a
                                href="https://yandex.ru/maps/-/CPq6ZWNy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link"
                            >
                                {companyDetails.factoryAddress}
                            </a>
                        </p>
                    </div>

                    {/* Телефоны и email */}
                    <div className={s.contactBlock}>
                        <h2>Телефоны</h2>
                        <p>
                            <a href={`tel:${companyDetails.phoneRaw}`} className="link">
                                Мобильный: {companyDetails.phone}
                            </a>
                        </p>
                       

                        <h2>Email</h2>
                        <p>
                            <a href={`mailto:${companyDetails.email}`} className="link">
                                {companyDetails.email}
                            </a>
                        </p>
                        
                    </div>

                    {/* Соцсети */}
                    {/* <div className={s.contactBlock}>
                        <h2>Мы в мессенджерах и соцсетях</h2>
                        <div className={s.socRow}>
                            <a
                                href={companyDetails.telegram}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Telegram"
                            >
                                <Image src="/icons/tg.svg" alt="Telegram" width={44} height={44} />
                            </a>
                            <a
                                href={companyDetails.max}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="MAX"
                            >
                                <Image src="/icons/max.svg" alt="MAX" width={44} height={44} />
                            </a>
                            <a
                                href={companyDetails.vk}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="VK"
                            >
                                <Image src="/icons/vk.svg" alt="VK" width={44} height={44} />
                            </a>
                        </div>
                    </div> */}
                </div>

                {/* Карта */}
                <div className={s.mapWrapper}>
                    <iframe
                        src="https://yandex.ru/map-widget/v1/?ll=48.589901%2C54.352746&z=16&pt=48.589901,54.352746,pm2rdm"
                        width="100%"
                        height="400"
                        frameBorder="0"
                        allowFullScreen
                        title="Карта производства"
                    ></iframe>
                </div>
            </div>
        </section>
    );
}