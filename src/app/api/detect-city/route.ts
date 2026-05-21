import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");

    const ip = forwardedFor?.split(",")[0]?.trim();

    if (!ip) {
      return NextResponse.json({
        city: null,
      });
    }

    const response = await fetch(
      `https://api.sypexgeo.net/json/${ip}`,
      {
        next: {
          revalidate: 86400,
        },
      }
    );

    const data = await response.json();

    return NextResponse.json({
      city: data?.city?.name_en?.toLowerCase() ?? null,
    });
  } catch {
    return NextResponse.json({
      city: null,
    });
  }
}