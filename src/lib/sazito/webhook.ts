import { createHash, timingSafeEqual } from "node:crypto";

export const MINIMUM_REVALIDATE_SECRET_LENGTH = 32;

export type WebhookAuthStatus =
  | "authorized"
  | "misconfigured"
  | "unauthorized";

function digest(value: string) {
  return createHash("sha256").update(value, "utf8").digest();
}

export function webhookAuthStatus(
  request: Request,
  expectedSecret: string | undefined,
): WebhookAuthStatus {
  const secret = expectedSecret?.trim();

  if (!secret || secret.length < MINIMUM_REVALIDATE_SECRET_LENGTH) {
    return "misconfigured";
  }

  const providedSecret = new URL(request.url).searchParams.get("secret") ?? "";

  return timingSafeEqual(digest(providedSecret), digest(secret))
    ? "authorized"
    : "unauthorized";
}
