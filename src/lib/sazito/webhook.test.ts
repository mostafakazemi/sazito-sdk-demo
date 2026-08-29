import { describe, expect, it } from "vitest";

import {
  MINIMUM_REVALIDATE_SECRET_LENGTH,
  webhookAuthStatus,
} from "./webhook";

const secret = "a-secure-webhook-secret-with-32-characters";

function request(query = "", headers?: HeadersInit) {
  return new Request(`https://shop.example.com/api/webhooks/sazito${query}`, {
    method: "POST",
    headers,
  });
}

describe("Sazito webhook authentication", () => {
  it("rejects missing and short server configuration", () => {
    expect(webhookAuthStatus(request(`?secret=${secret}`), undefined)).toBe(
      "misconfigured",
    );
    expect(
      webhookAuthStatus(
        request(`?secret=${secret}`),
        "x".repeat(MINIMUM_REVALIDATE_SECRET_LENGTH - 1),
      ),
    ).toBe("misconfigured");
  });

  it("accepts the exact secret from the webhook URL", () => {
    const encoded = encodeURIComponent(secret);

    expect(webhookAuthStatus(request(`?secret=${encoded}`), secret)).toBe(
      "authorized",
    );
  });

  it("rejects missing or incorrect query secrets", () => {
    expect(webhookAuthStatus(request(), secret)).toBe("unauthorized");
    expect(webhookAuthStatus(request("?secret=wrong"), secret)).toBe(
      "unauthorized",
    );
  });

  it("does not infer undocumented authentication headers", () => {
    expect(
      webhookAuthStatus(
        request("", {
          authorization: `Bearer ${secret}`,
          "x-sazito-webhook-secret": secret,
        }),
        secret,
      ),
    ).toBe("unauthorized");
  });
});
