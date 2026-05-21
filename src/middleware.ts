import { CITIES } from "@/config/cities";
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // ⛔ 1. Исключаем сервисные файлы сразу
    if (
        pathname.startsWith("/yandex_") ||
        pathname.startsWith("/_next") ||
        pathname === "/robots.txt" ||
        pathname === "/favicon.ico" ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    console.log("MIDDLEWARE:", pathname);

    const segments = pathname.split("/").filter(Boolean);

    const firstSegment = segments[0];

    const city = Object.values(CITIES).find(
        (c) => c.key === firstSegment
    );

    if (!city) {
        return NextResponse.next();
    }

    const url = request.nextUrl.clone();

    url.pathname = "/" + segments.slice(1).join("/");

    if (url.pathname === "/") {
        url.pathname = "/";
    }

    const response = NextResponse.rewrite(url);

    response.headers.set("x-city", city.key);

    return response;
}

export const config = {
    matcher: "/:path*",
};