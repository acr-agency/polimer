import type { MetadataRoute } from "next";
import { ROOT_DOMAIN_UNICODE } from "@/types/cities";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = `https://${ROOT_DOMAIN_UNICODE}`;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}