import { headers } from "next/headers";
import { getCityByHost } from "@/lib/getCityByHost";
import { ROOT_DOMAIN_UNICODE } from "@/types/cities";
import { buildCitySeo } from "./cities";
import { CITIES } from "@/config/cities";

const ROOT_METRIKA_ID = 107705030;

export async function getSiteContext() {
  const h = await headers();

  const host =
    h.get("x-forwarded-host") ||
    h.get("host") ||
    ROOT_DOMAIN_UNICODE;

  const cityKey = h.get("x-city");

  const city =
    (cityKey
      ? Object.values(CITIES).find((c) => c.key === cityKey)
      : null)
    ?? getCityByHost(host);

  const metrikaId = city?.metrikaId ?? ROOT_METRIKA_ID;

  const baseUrl = city
    ? `https://${city.host}`
    : `https://${ROOT_DOMAIN_UNICODE}`;

  const seo = city ? buildCitySeo(city) : null;

  return {
    host,
    city,
    seo,
    metrikaId,
    baseUrl,
    isRegional: Boolean(city),
  };
}