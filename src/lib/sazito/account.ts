import { toEnglishDigits } from "@sazito/client-sdk";
import type {
  InvoiceItem,
  Order,
  SazitoResponse,
  User,
} from "@sazito/client-sdk";

type SazitoError = NonNullable<SazitoResponse<unknown>["error"]>;

export function accountDisplayName(user: User | null) {
  const fullName = [user?.firstName, user?.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  return fullName || user?.mobilePhone || user?.email || "حساب کاربری";
}

export function normalizeMobileInput(value: string) {
  const normalized = toEnglishDigits(value).replace(/[\s()-]/g, "");

  if (normalized.startsWith("+98")) return `0${normalized.slice(3)}`;
  if (normalized.startsWith("0098")) return `0${normalized.slice(4)}`;

  return normalized;
}

export function isIranianMobile(value: string) {
  return /^09\d{9}$/.test(normalizeMobileInput(value));
}

export function normalizeOtpInput(value: string) {
  return toEnglishDigits(value).replace(/\s/g, "");
}

export function accountErrorMessage(
  error: SazitoError,
  fallback = "انجام درخواست ناموفق بود. دوباره تلاش کنید.",
) {
  if (error.status === 401 || error.status === 403) {
    return "اطلاعات ورود صحیح نیست یا نشست شما منقضی شده است.";
  }

  if (error.status === 429) {
    return "درخواست‌های زیادی ارسال شده است. کمی صبر کنید و دوباره تلاش کنید.";
  }

  if (error.type === "network") {
    return "ارتباط با فروشگاه برقرار نشد. اتصال اینترنت را بررسی کنید.";
  }

  return error.message?.trim() || fallback;
}

export function orderItems(order: Order): InvoiceItem[] {
  return Array.isArray(order.invoice?.invoiceItems)
    ? order.invoice.invoiceItems
    : [];
}

export function orderItemCount(order: Order) {
  return orderItems(order).reduce(
    (total, item) => total + Math.max(0, item.quantity || 0),
    0,
  );
}

export function orderTotal(order: Order) {
  return orderItems(order).reduce(
    (total, item) => total + Math.max(0, item.lineTotal || 0),
    0,
  );
}
