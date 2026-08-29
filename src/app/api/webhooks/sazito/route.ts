import { revalidateTag } from "next/cache";

import { sazitoCacheTag } from "@/lib/sazito/cache";
import { sazitoClient } from "@/lib/sazito/client";
import { webhookAuthStatus } from "@/lib/sazito/webhook";

export const runtime = "nodejs";

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const auth = webhookAuthStatus(
    request,
    process.env.SAZITO_REVALIDATE_SECRET,
  );

  if (auth === "misconfigured") {
    return json(
      {
        ok: false,
        error: "SAZITO_REVALIDATE_SECRET must contain at least 32 characters.",
      },
      503,
    );
  }

  if (auth === "unauthorized") {
    return json({ ok: false, error: "Unauthorized webhook request." }, 401);
  }

  sazitoClient.clearCache();
  revalidateTag(sazitoCacheTag, { expire: 0 });

  return json({
    ok: true,
    revalidated: true,
    tag: sazitoCacheTag,
    now: new Date().toISOString(),
  });
}
