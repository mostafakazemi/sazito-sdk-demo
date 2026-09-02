import { describe, expect, it } from "vitest";
import { parsePaymentReturn } from "@sazito/checkout/next/payment-return";

import {
  removePaymentReturnParams,
  summarizePaymentReturnRequest,
} from "./payment-return";

describe("payment return parameters", () => {
  it("uses the checkout package parser to restore path credentials", () => {
    const paymentReturn = parsePaymentReturn(
      ["gateway-result", "payment", "42", "identifier", "payment-id"],
      {
        tatoken: "token",
        isFailed: "false",
        code: "100",
        imageUrl: "https://example.com/receipt.jpg",
        trackingData: '{"reference":"abc"}',
        payload: '{"gateway":"sample"}',
      },
    );

    expect(paymentReturn).toEqual({
      payment: { id: 42, identifier: "payment-id" },
      params: {
        tatoken: "token",
        isFailed: "false",
        code: "100",
        imageUrl: "https://example.com/receipt.jpg",
        trackingData: '{"reference":"abc"}',
        payload: '{"gateway":"sample"}',
        id: "42",
        paymentIdentifier: "payment-id",
      },
    });
  });

  it("preserves arbitrary gateway query parameters exactly as the package documents", () => {
    expect(
      parsePaymentReturn(
        ["result", "payment", "7", "identifier", "abc"],
        { gatewayStatus: "verified", repeated: ["first", "second"] },
      )?.params,
    ).toEqual({
      gatewayStatus: "verified",
      repeated: "first",
      id: "7",
      paymentIdentifier: "abc",
    });
  });

  it("rejects ordinary and malformed nested checkout routes", () => {
    expect(parsePaymentReturn(undefined, {})).toBeUndefined();
    expect(parsePaymentReturn(["payment-return"], {})).toBeUndefined();
    expect(
      parsePaymentReturn(
        ["result", "payment", "invalid", "identifier", "abc"],
        {},
      ),
    ).toBeUndefined();
  });

  it("builds useful callback diagnostics without exposing parameter values", () => {
    const summary = summarizePaymentReturnRequest(
      ["gateway-result", "payment", "42", "identifier", "payment-id"],
      {
        tatoken: "super-secret-token",
        code: "100",
        payload: '{"secret":"private"}',
        utm_source: "gateway",
      },
      {
        tatoken: "super-secret-token",
        code: "100",
        payload: "private",
        id: "42",
        paymentIdentifier: "payment-id",
        utm_source: "gateway",
      },
    );

    expect(summary).toEqual({
      callbackSegmentCount: 5,
      callbackParsed: true,
      receivedQueryParameterCount: 4,
      forwardedParameterCount: 6,
      recognizedParameterKeys: [
        "code",
        "id",
        "payload",
        "paymentIdentifier",
        "tatoken",
      ],
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
