import { describe, expect, it } from "vitest";

import {
  extractPaymentReturnParams,
  isPaymentCallbackRoute,
  removePaymentReturnParams,
  summarizePaymentReturnRequest,
} from "./payment-return";

describe("payment return parameters", () => {
  it("forwards every callback field supported by the checkout package", () => {
    expect(
      extractPaymentReturnParams({
        tatoken: "token",
        isFailed: "false",
        code: "100",
        imageUrl: "https://example.com/receipt.jpg",
        id: "42",
        paymentIdentifier: "payment-id",
        trackingData: '{"reference":"abc"}',
        payload: '{"gateway":"sample"}',
      }),
    ).toEqual({
      tatoken: "token",
      isFailed: "false",
      code: "100",
      imageUrl: "https://example.com/receipt.jpg",
      id: "42",
      paymentIdentifier: "payment-id",
      trackingData: '{"reference":"abc"}',
      payload: '{"gateway":"sample"}',
    });
  });

  it("does not imply support for undocumented aliases or unrelated parameters", () => {
    expect(
      extractPaymentReturnParams({
        tracking_data: "legacy",
        is_failed: "true",
        payment_identifier: "legacy-id",
        utm_source: "gateway",
      }),
    ).toBeUndefined();
  });

  it("uses the first value for repeated callback parameters", () => {
    expect(
      extractPaymentReturnParams({ tatoken: ["first", "second"] }),
    ).toEqual({ tatoken: "first" });
  });

  it("recognizes only a non-empty nested checkout callback route", () => {
    expect(isPaymentCallbackRoute()).toBe(false);
    expect(isPaymentCallbackRoute([])).toBe(false);
    expect(isPaymentCallbackRoute([""])).toBe(false);
    expect(isPaymentCallbackRoute(["payment-return"])).toBe(true);
    expect(isPaymentCallbackRoute(["gateway", "return"])).toBe(true);
  });

  it("builds useful callback diagnostics without exposing parameter values", () => {
    const summary = summarizePaymentReturnRequest(
      ["gateway", "return"],
      {
        tatoken: "super-secret-token",
        code: "100",
        payload: '{"secret":"private"}',
        utm_source: "gateway",
      },
    );

    expect(summary).toEqual({
      callbackSegmentCount: 2,
      receivedParameterCount: 4,
      recognizedParameterKeys: ["code", "payload", "tatoken"],
      ignoredParameterCount: 1,
    });
    expect(JSON.stringify(summary)).not.toContain("super-secret-token");
    expect(JSON.stringify(summary)).not.toContain("private");
    expect(JSON.stringify(summary)).not.toContain("utm_source");
  });

  it("removes callback data after a terminal result and keeps unrelated query state", () => {
    expect(
      removePaymentReturnParams(
        "/checkout?tatoken=secret&code=100&utm_source=gateway#result",
      ),
    ).toBe("/checkout?utm_source=gateway#result");
  });

  it("returns a nested callback URL to the canonical checkout route", () => {
    expect(
      removePaymentReturnParams(
        "/checkout/gateway/return?tatoken=secret&utm_source=gateway#result",
      ),
    ).toBe("/checkout?utm_source=gateway#result");
  });
});
