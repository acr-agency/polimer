// app/layout.tsx (обновленная версия)
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/shared/header/header";
import Footer from "@/components/shared/footer/footer";
import { ModalProvider } from "@/components/providers/ModalProvider";
import YandexMetrika from "@/components/YandexMetrika";
import { getSiteContext } from "@/lib/getSiteContext";
import YandexMetrikaParams from "@/components/YandexMetrikaParams";
import { CookieConsent } from "@/components/shared/CookieConsent/CookieConsent";
import { inter, montserrat, russoOne } from './fonts';
import { CityProvider } from "@/components/providers/CityProvider";
import GeoDetector from "@/components/providers/GeoDetector";

export async function generateMetadata(): Promise<Metadata> {
  const { city, seo, baseUrl } = await getSiteContext();

  return {
    title: seo?.title ?? "Полимерпесчаные люки — производство и продажа | 73полимер.рф",
    description:
      seo?.metaDescription ??
      "Производство полимерпесчаных люков в России. Доставка по всей РФ. Гарантия качества. Низкие цены.",
    keywords: [
      "полимерпесчаные люки",
      "канализационные люки",
      "люки от производителя",
      city?.city,
      city?.region,
      city?.geoRegion,
    ].filter(Boolean) as string[],
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      url: "/",
      siteName: seo?.title ?? "Полимерпесчаные люки — производство и продажа | 73полимер.рф",
      title: seo?.title ?? "Полимерпесчаные люки — производство и продажа | 73полимер.рф",
      description:
        seo?.metaDescription ??
        "Производство полимерпесчаных люков в России. Доставка по всей РФ. Гарантия качества. Низкие цены.",
      images: [
        {
          url: "/ogG.png",
          width: 1200,
          height: 630,
          alt:
            seo?.metaDescription ??
            "Производство полимерпесчаных люков в России. Доставка по всей РФ. Гарантия качества. Низкие цены.",
          type: "image/jpeg",
          secureUrl: `${baseUrl}/ogG.png`,
        },
      ],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { city, metrikaId, isRegional } = await getSiteContext();

  return (
    <html lang="ru" className={`${inter.variable} ${montserrat.variable} ${russoOne.variable}`}>
      <head>
        <meta name="yandex-verification" content="4c9a400d0b243641" />
      </head>
      <body data-city={city?.subdomain ?? "root"}>
        <CityProvider city={city?.key ?? null}>
          <ModalProvider>
            <YandexMetrika metrikaId={metrikaId} />
            <GeoDetector />
            <YandexMetrikaParams />
            <Header />
            {children}
            <Footer />
            <CookieConsent />
          </ModalProvider></CityProvider>
      </body>
    </html>
  );
}