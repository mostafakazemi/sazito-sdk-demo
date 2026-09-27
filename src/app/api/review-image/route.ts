import { NextResponse } from "next/server";

import {
  isReviewImageUrl,
  reviewImageContentType,
} from "@/lib/review-image";

const IMAGE_CACHE_CONTROL =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

export async function GET(request: Request) {
  const sourceParam = new URL(request.url).searchParams.get("url");

  if (!sourceParam) {
    return NextResponse.json({ error: "Image URL is required." }, { status: 400 });
  }

  let source: URL;
  try {
    source = new URL(sourceParam);
  } catch {
    return NextResponse.json({ error: "Invalid image URL." }, { status: 400 });
  }

  if (!isReviewImageUrl(source)) {
    return NextResponse.json({ error: "Image URL is not allowed." }, { status: 403 });
  }

  try {
    const upstream = await fetch(source, { cache: "no-store", redirect: "error" });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: "Review image could not be loaded." },
        { status: 502 },
      );
    }

    const upstreamType = upstream.headers.get("content-type")?.split(";", 1)[0];
    const contentType = upstreamType?.startsWith("image/")
      ? upstreamType
      : reviewImageContentType(source);

    if (!contentType) {
      return NextResponse.json(
        { error: "Review image type is not supported." },
        { status: 415 },
      );
    }

    return new Response(upstream.body, {
      headers: {
        "Cache-Control": IMAGE_CACHE_CONTROL,
        "Content-Type": contentType,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Review image service is unavailable." },
      { status: 502 },
    );
  }
}

export const runtime = "nodejs";
