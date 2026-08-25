import type { Cart, SazitoResponse } from "@sazito/client-sdk";

type SazitoError = NonNullable<SazitoResponse<unknown>["error"]>;

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
  if (error.status === 429) {
    return "درخواست‌های زیادی ارسال شده است. کمی صبر کنید و دوباره تلاش کنید.";
  }

  if (error.type === "network") {
    return "ارتباط با فروشگاه برقرار نشد. اتصال اینترنت را بررسی و دوباره تلاش کنید.";
  }

  return error.message?.trim() || "به‌روزرسانی سبد خرید ناموفق بود.";
}
