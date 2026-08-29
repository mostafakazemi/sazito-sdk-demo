import { describe, expect, it } from "vitest";

import {
  extractPaymentReturnParams,
  removePaymentReturnParams,
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

  it("removes callback data after a terminal result and keeps unrelated query state", () => {
    expect(
      removePaymentReturnParams(
        "/checkout?tatoken=secret&code=100&utm_source=gateway#result",
      ),
    ).toBe("/checkout?utm_source=gateway#result");
  });
});
