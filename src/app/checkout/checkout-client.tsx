"use client";

import * as React from "react";
import {
  CheckoutProvider,
  SazitoCheckout,
  useCheckout,
} from "@sazito/checkout/next";
import type { CheckoutConfig } from "@sazito/checkout/core";

import { useCommerce } from "@/components/commerce/commerce-provider";
import { orderDetailsHref } from "@/lib/sazito/order-routes";

// Every value points at a storefront CSS token, so the checkout follows the
// site's light/dark preference (data-theme on <html>) without extra JS.
const checkoutTheme = {
  accent: "var(--primary)",
  accentForeground: "var(--primary-foreground)",
  accentSoft: "var(--secondary)",
  background: "var(--background)",
  foreground: "var(--foreground)",
  muted: "var(--muted)",
  mutedForeground: "var(--muted-foreground)",
  border: "var(--border)",
  card: "var(--card)",
  summaryBackground: "var(--checkout-summary-bg)",
  danger: "var(--danger)",
  success: "var(--primary)",
  successForeground: "var(--primary-foreground)",
  logoBackground: "var(--checkout-logo-bg)",
  shippingNeutral: "var(--checkout-shipping-neutral)",
  shippingNeutralForeground: "var(--checkout-shipping-neutral-foreground)",
  radius: 18,
  fontFamily: "var(--font-ui)",
} satisfies NonNullable<CheckoutConfig["theme"]>;

function CheckoutStateBridge() {
  const { state } = useCheckout();
  const { syncCart } = useCommerce();

  React.useEffect(() => {
    if (state.result?.status === "success") {
      syncCart(null);
    } else if (state.step !== "result") {
      syncCart(state.cart);
    }
  }, [state.cart, state.result?.status, state.step, syncCart]);

  return (
    <SazitoCheckout
      theme={checkoutTheme}
      continueShoppingUrl="/"
      getOrderDetailsUrl={orderDetailsHref}
      className="store-checkout"
      emptyCart={{
        title: "سبد خرید شما خالی است",
        description:
          "محصول دلخواهتان را انتخاب کنید و برای تکمیل خرید به این صفحه برگردید.",
        actionLabel: "بازگشت به فروشگاه",
      }}
    />
  );
}

export function CheckoutClient() {
  const config = React.useMemo<CheckoutConfig>(
    () => ({
      locale: "fa",
      direction: "rtl",
      continueShoppingUrl: "/",
      currencyLabel: "تومان",
      pollIntervalMs: 15_000,
      theme: checkoutTheme,
    }),
    [],
  );

  return (
    <CheckoutProvider config={config}>
      <CheckoutStateBridge />
    </CheckoutProvider>
  );
}
