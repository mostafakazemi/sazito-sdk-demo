import { describe, expect, it } from "vitest";
import type { Order } from "@sazito/client-sdk";

import {
  accountDisplayName,
  accountErrorMessage,
  isIranianMobile,
  normalizeMobileInput,
  normalizeOtpInput,
  orderItemCount,
  orderTotal,
} from "./account";

function order(): Order {
  return {
    id: 12,
    orderNumber: "10012",
    orderIdentifier: "order-token",
    invoice: {
      shippingItems: [],
      invoiceItems: [
        {
          id: 1,
          productVariantId: 2,
          name: "محصول اول",
          attributes: [],
          quantity: 2,
          unitPrice: 120_000,
          lineTotal: 240_000,
          rawPrice: 120_000,
          customerProfit: 0,
        },
        {
          id: 2,
          productVariantId: 3,
          name: "محصول دوم",
          attributes: [],
          quantity: 1,
          unitPrice: 80_000,
          lineTotal: 80_000,
          rawPrice: 80_000,
          customerProfit: 0,
        },
      ],
    },
  };
}

describe("account presentation", () => {
  it("uses a full name before contact identifiers", () => {
    expect(
      accountDisplayName({
        firstName: "مینا",
        lastName: "احمدی",
        email: "mina@example.com",
      }),
    ).toBe("مینا احمدی");
    expect(accountDisplayName({ mobilePhone: "09120000000" })).toBe(
      "09120000000",
    );
  });

  it("normalizes Persian digits and Iranian country prefixes", () => {
    expect(normalizeMobileInput("۰۹۱۲ ۳۴۵ ۶۷۸۹")).toBe("09123456789");
    expect(normalizeMobileInput("+98 (912) 345-6789")).toBe("09123456789");
    expect(isIranianMobile("۰۹۱۲۳۴۵۶۷۸۹")).toBe(true);
    expect(isIranianMobile("09123")).toBe(false);
    expect(normalizeOtpInput("۱۲ ۳۴ ۵۶")).toBe("123456");
  });

  it("summarizes order quantities and totals from SDK invoice items", () => {
    expect(orderItemCount(order())).toBe(3);
    expect(orderTotal(order())).toBe(320_000);
  });

  it("normalizes authentication and network errors", () => {
    expect(
      accountErrorMessage({
        type: "api",
        message: "Unauthorized",
        status: 401,
      }),
    ).toContain("نشست");
    expect(
      accountErrorMessage({ type: "network", message: "Failed" }),
    ).toContain("ارتباط");
  });
});
