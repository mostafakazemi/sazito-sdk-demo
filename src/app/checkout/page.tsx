import type { Metadata } from "next";
import { CreditCard, ShieldCheck } from "lucide-react";

import { CheckoutClient } from "@/app/checkout/checkout-client";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "سبد خرید و تسویه حساب",
  description: "بررسی سبد خرید، انتخاب روش ارسال و پرداخت امن سفارش",
  alternates: { canonical: "/checkout" },
  robots: { index: false, follow: false },
};

type CheckoutPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const PAYMENT_RETURN_KEYS = new Set([
  "tatoken",
  "trackingData",
  "tracking_data",
  "isFailed",
  "is_failed",
  "code",
  "paymentIdentifier",
  "payment_identifier",
]);

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const rawParams = await searchParams;
  const hasPaymentReturn = Object.keys(rawParams).some((key) =>
    PAYMENT_RETURN_KEYS.has(key),
  );
  const paymentReturnParams = hasPaymentReturn
    ? Object.fromEntries(
        Object.entries(rawParams).flatMap(([key, value]) => {
          const normalized = Array.isArray(value) ? value[0] : value;
          return normalized === undefined ? [] : [[key, normalized]];
        }),
      )
    : undefined;

  return (
    <div className="site-container py-8 sm:py-12">
      <div className="mb-8 max-w-2xl">
        <Badge variant="secondary">
          <ShieldCheck />
          خرید امن با زیرساخت سازیتو
        </Badge>
        <h1 className="mt-4 flex items-center gap-3 text-3xl font-black sm:text-4xl">
          <CreditCard className="size-8 text-primary" />
          سبد خرید و تسویه حساب
        </h1>
        <p className="mt-3 text-sm leading-8 text-muted-foreground sm:text-base">
          محصولات را بررسی کنید، نشانی و روش ارسال را انتخاب کنید و پرداخت را انجام دهید.
        </p>
      </div>

      <CheckoutClient paymentReturnParams={paymentReturnParams} />
    </div>
  );
}
