import { describe, expect, it } from "vitest";

import {
  isSazitoAuthenticationError,
  normalizeSazitoError,
  sazitoErrorMessage,
} from "./error";
import { SazitoDataError, unwrapSazitoResponse } from "./response";

describe("Sazito common error response normalization", () => {
  it("preserves the documented status, type, and details fields", () => {
    const details = { field: "email", reason: "already-exists" };
    const normalized = normalizeSazitoError({
      type: "validation",
      status: 422,
      message: "این ایمیل قبلاً ثبت شده است.",
      details,
    });

    expect(normalized).toMatchObject({
      type: "validation",
      status: 422,
      details,
      isRetryable: false,
      requiresAuthentication: false,
    });
    expect(normalized.message).toBe("این ایمیل قبلاً ثبت شده است.");
  });

  it("gives actionable Persian messages for authentication, rate limits, and outages", () => {
    expect(
      normalizeSazitoError({
        type: "api",
        status: 401,
        message: "Unauthorized",
      }),
    ).toMatchObject({ requiresAuthentication: true, isRetryable: false });
    expect(
      sazitoErrorMessage({
        type: "api",
        status: 429,
        message: "Too many requests",
      }),
    ).toContain("درخواست‌های زیادی");
    expect(
      normalizeSazitoError({
        type: "api",
        status: 503,
        message: "Unavailable",
      }),
    ).toMatchObject({ isRetryable: true });
    expect(
      sazitoErrorMessage({ type: "network", message: "offline" }),
    ).toContain("ارتباط");
  });

  it("uses the caller fallback when the API omits a usable message", () => {
    expect(
      sazitoErrorMessage(
        { type: "validation", message: "   " },
        "اطلاعات را بررسی کنید.",
      ),
    ).toBe("اطلاعات را بررسی کنید.");
  });

  it("identifies authentication failures without duplicated status checks", () => {
    expect(
      isSazitoAuthenticationError({
        type: "api",
        status: 403,
        message: "Forbidden",
      }),
    ).toBe(true);
    expect(
      isSazitoAuthenticationError({
        type: "api",
        status: 404,
        message: "Missing",
      }),
    ).toBe(false);
  });

  it("keeps raw SDK details on typed server data errors", () => {
    const details = { requestId: "req-1" };

    try {
      unwrapSazitoResponse(
        { error: { type: "api", status: 500, message: "failed", details } },
        "fallback",
      );
      throw new Error("Expected unwrapSazitoResponse to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(SazitoDataError);
      expect((error as SazitoDataError).details).toEqual(details);
    }
  });
});
