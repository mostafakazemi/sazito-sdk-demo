import { NextResponse } from "next/server";

import { sazitoStoreOrigin } from "@/lib/sazito/client";
import { mockSazitoResponse } from "@/lib/sazito/mock";

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
const REVIEW_UPLOAD_PATH = "/api/v1/service/filemanager/uploads/public/tajrobe";

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
  const pathname = `/${path.join("/")}`;
  const isReviewUpload = pathname === REVIEW_UPLOAD_PATH;
  const mockResponse = mockSazitoResponse({
    pathname,
    searchParams: incomingUrl.searchParams,
    method: request.method,
  });

  if (mockResponse) {
    return NextResponse.json(mockResponse.body, {
      status: mockResponse.status ?? 200,
      headers: { "Cache-Control": "no-store" },
    });
  }

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
    let body: BodyInit | ArrayBuffer | undefined;
    if (hasBody && isReviewUpload) {
      const incomingForm = await request.formData();
      const file = incomingForm.get("images[][file]");
      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: { type: "validation", message: "Review image file is required." } },
          { status: 400 },
        );
      }

      const uploadForm = new FormData();
      uploadForm.append("file", file, file.name);
      body = uploadForm;
      headers.delete("content-type");
      headers.delete("content-length");
    } else {
      body = hasBody ? await request.arrayBuffer() : undefined;
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });
    if (isReviewUpload && response.headers.get("content-type")?.includes("application/json")) {
      const responseBody = await response.json();
      const result =
        responseBody && typeof responseBody === "object" && "result" in responseBody
          ? responseBody.result
          : responseBody;
      if (result && typeof result === "object" && "file" in result && !("images" in result)) {
        const normalizedResult = { ...result, images: [result.file] };
        delete normalizedResult.file;
        if (responseBody && typeof responseBody === "object" && "result" in responseBody) {
          responseBody.result = normalizedResult;
        } else {
          responseBody.images = normalizedResult.images;
          delete responseBody.file;
        }
      }
      return NextResponse.json(responseBody, {
        status: response.status,
        headers: { "Cache-Control": "no-store" },
      });
    }
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
