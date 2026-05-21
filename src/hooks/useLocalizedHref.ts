// hooks/useLocalizedHref.ts

"use client";

import { useCity } from "@/components/providers/CityProvider";

export function useLocalizedHref() {
  const city = useCity();

  return (path: string) => {
    if (!city) return path;

    return `/${city}${path}`;
  };
}