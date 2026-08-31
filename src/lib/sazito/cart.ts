import type { Cart } from "@sazito/client-sdk";

import { sazitoErrorMessage, type SazitoError } from "./error";

export function cartItemCount(cart: Pick<Cart, "items"> | null) {
  return cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
}

export function clampCartQuantity(
  value: number,
  minimum: number,
  maximum: number | null,
) {
  const safeMinimum = Math.max(1, Math.floor(minimum) || 1);
  const safeMaximum = maximum === null
    ? Number.MAX_SAFE_INTEGER
    : Math.max(safeMinimum, Math.floor(maximum));
  const safeValue = Number.isFinite(value) ? Math.floor(value) : safeMinimum;

  return Math.min(safeMaximum, Math.max(safeMinimum, safeValue));
}

export function cartErrorMessage(error: SazitoError) {
  return sazitoErrorMessage(error, "به‌روزرسانی سبد خرید ناموفق بود.");
}
