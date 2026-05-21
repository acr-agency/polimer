"use client";

import Link from "next/link";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";

export function LocalizedLink({
  href,
  ...props
}: any) {
  const localizedHref = useLocalizedHref();

  return (
    <Link
      href={localizedHref(href)}
      {...props}
    />
  );
}