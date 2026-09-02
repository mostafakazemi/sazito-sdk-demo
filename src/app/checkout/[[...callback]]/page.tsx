import type { Metadata } from "next";
import { CreditCard, ShieldCheck } from "lucide-react";

import { CheckoutClient } from "@/app/checkout/checkout-client";
import { Badge } from "@/components/ui/badge";
import {
  extractPaymentReturnParams,
  isPaymentCallbackRoute,
} from "@/lib/sazito/payment-return";
import type { CheckoutSearchParams } from "@/lib/sazito/payment-return";

export const metadata: Metadata = {
  title: "سبد خرید و تسویه حساب",
  description: "بررسی سبد خرید، انتخاب روش ارسال و پرداخت امن سفارش",
  alternates: { canonical: "/checkout" },
  robots: { index: false, follow: false },
};

type CheckoutPageProps = {
  params: Promise<{ callback?: string[] }>;
  searchParams: Promise<CheckoutSearchParams>;
};

export default async function CheckoutPage({
  params,
  searchParams,
}: CheckoutPageProps) {
  const [{ callback }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const paymentReturnParams = isPaymentCallbackRoute(callback)
    ? extractPaymentReturnParams(resolvedSearchParams)
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
