import { NextResponse } from "next/server";

import { sazitoStoreOrigin } from "@/lib/sazito/client";

type ProxyContext = {
  params: Promise<{ path: string[] }>;
};

const FORWARDED_REQUEST_HEADERS = [
  "accept",
  "accept-language",
  "authorization",
  "content-type",
  "x-exact-json",
  "x-forwarded-host",
];

const SAZITO_API_ORIGIN = "http://api.sazito.com:8080";

async function proxySazitoRequest(request: Request, context: ProxyContext) {
  const { path } = await context.params;

  if (
    !path.length ||
    path.some((segment) => !segment || segment === "." || segment === "..")
  ) {
    return NextResponse.json(
      { error: { type: "validation", message: "Invalid Sazito API path." } },
      { status: 400 },
    );
  }

  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(`/${path.join("/")}`, SAZITO_API_ORIGIN);
  targetUrl.search = incomingUrl.search;

  const headers = new Headers();
  FORWARDED_REQUEST_HEADERS.forEach((name) => {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  });
  headers.set("origin", sazitoStoreOrigin);
  headers.set("referer", `${sazitoStoreOrigin}/`);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
    });
    const responseHeaders = new Headers();
    const contentType = response.headers.get("content-type");
    if (contentType) responseHeaders.set("content-type", contentType);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          type: "network",
          message: "Sazito upstream service is unavailable.",
        },
      },
      { status: 502 },
    );
  }
}

export const dynamic = "force-dynamic";

export const GET = proxySazitoRequest;
export const POST = proxySazitoRequest;
export const PUT = proxySazitoRequest;
export const PATCH = proxySazitoRequest;
export const DELETE = proxySazitoRequest;
