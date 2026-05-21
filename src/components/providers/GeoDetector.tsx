"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function CityDetector() {
  const pathname = usePathname();

  useEffect(() => {
    const hasCityInPath =
      pathname.split("/")[1];

    if (hasCityInPath) return;

    fetch("/api/detect-city")
      .then((r) => r.json())
      .then((data) => {
        console.log(data.city);
      });
  }, [pathname]);

  return null;
}