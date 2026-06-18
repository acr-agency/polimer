import type { MetadataRoute } from "next";
import { ROOT_DOMAIN_UNICODE } from "@/types/cities";
// Импортируем встроенный модуль для работы с URL (он умеет конвертировать в Punycode)
import { URL } from "url";

export default function robots(): MetadataRoute.Robots {
  // 1. Создаем правильный объект URL, передавая протокол и домен
  // (Это автоматически преобразует кириллицу в punycode, если это валидный домен)
  const url = new URL(`https://${ROOT_DOMAIN_UNICODE}`);
  
  // 2. Получаем строку с уже закодированным (в Punycode) доменом
  const baseUrl = url.toString(); // Уберет последний слэш, если он есть

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    // 3. Используем преобразованный URL
    sitemap: `${baseUrl}sitemap.xml`,
    host: baseUrl,
  };
}