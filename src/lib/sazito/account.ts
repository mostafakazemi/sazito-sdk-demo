import { toEnglishDigits } from "@sazito/client-sdk";
import type {
  InvoiceItem,
  Order,
  User,
} from "@sazito/client-sdk";

import { sazitoErrorMessage, type SazitoError } from "./error";

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
  return sazitoErrorMessage(error, fallback);
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
