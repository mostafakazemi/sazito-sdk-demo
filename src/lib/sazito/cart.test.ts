import { describe, expect, it } from "vitest";
import type { Cart } from "@sazito/client-sdk";

import { cartErrorMessage, cartItemCount, clampCartQuantity } from "./cart";

describe("cart presentation", () => {
  it("counts quantities rather than distinct cart lines", () => {
    const cart = {
      items: [{ quantity: 2 }, { quantity: 3 }],
    } as Cart;

    expect(cartItemCount(cart)).toBe(5);
    expect(cartItemCount(null)).toBe(0);
  });

  it("keeps requested quantities inside variant limits", () => {
    expect(clampCartQuantity(0, 2, 5)).toBe(2);
    expect(clampCartQuantity(9, 2, 5)).toBe(5);
    expect(clampCartQuantity(4, 2, null)).toBe(4);
  });

  it("normalizes network and rate-limit errors in Persian", () => {
    expect(
      cartErrorMessage({ type: "network", message: "offline" }),
    ).toContain("ارتباط");
    expect(
      cartErrorMessage({ type: "api", status: 429, message: "rate limited" }),
    ).toContain("درخواست‌های زیادی");
  });
});
