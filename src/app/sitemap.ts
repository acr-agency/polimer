import type { MetadataRoute } from "next";
import {  ROOT_DOMAIN_UNICODE } from "@/types/cities";
import { CITIES } from "@/config/cities";

const ROUTES = [
  "",
  "/contacts",
  "/catalog",
  "/products",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const rootUrl = `https://${ROOT_DOMAIN_UNICODE}`;

  const pages: MetadataRoute.Sitemap = [];

  // ROOT URLS
  for (const route of ROUTES) {
    pages.push({
      url: `${rootUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" ? "weekly" : "monthly",
      priority: route === "" ? 1 : 0.8,
    });
  }

  // REGIONAL URLS
  for (const city of Object.values(CITIES)) {
    for (const route of ROUTES) {
      pages.push({
        url: `${rootUrl}/${city.key}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "weekly" : "monthly",
        priority: route === "" ? 0.9 : 0.7,
      });
    }
  }

  return pages;
}