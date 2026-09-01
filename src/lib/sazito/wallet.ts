import { formatPrice } from "./presenters";

const TRANSACTION_REASON_LABELS: Readonly<Record<string, string>> = {
  redeem: "استفاده از اعتبار",
  NthPurchase: "پاداش خرید",
  "merge-user": "ادغام حساب‌ها",
  SimpleCashbackRule: "بازگشت وجه خرید",
  BirthdateGift: "هدیه تولد",
  TajrobehAppreciation: "پاداش ثبت تجربه",
  edit_order: "ویرایش سفارش",
  cancel_order: "لغو سفارش",
  edit_shipping_cost: "اصلاح هزینه ارسال",
  edit_cashback: "اصلاح بازگشت وجه",
  gift: "هدیه",
  others: "تراکنش کیف پول",
  Refund: "بازپرداخت",
  Charge: "افزایش اعتبار",
  Expired: "انقضای اعتبار",
};

export type WalletAmountKind = "credit" | "debit" | "neutral";

export function walletTransactionLabel(reason: string) {
  if (reason.endsWith(":activity")) return "پاداش فعالیت";
  return TRANSACTION_REASON_LABELS[reason] ?? "تراکنش کیف پول";
}

export function walletAmountKind(amount: number): WalletAmountKind {
  if (amount > 0) return "credit";
  if (amount < 0) return "debit";
  return "neutral";
}

export function formatWalletAmount(amount: number) {
  const absoluteAmount = formatPrice(Math.abs(amount));

  if (amount > 0) return `+${absoluteAmount}`;
  if (amount < 0) return `−${absoluteAmount}`;
  return absoluteAmount;
}
