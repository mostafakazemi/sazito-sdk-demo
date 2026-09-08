"use client";

import * as React from "react";
import {
  CheckoutProvider,
  SazitoCheckout,
  useCheckout,
} from "@sazito/checkout/next";
import type { CheckoutConfig } from "@sazito/checkout/core";

import { useCommerce } from "@/components/commerce/commerce-provider";

const checkoutTheme = {
  accent: "#2F6B57",
  accentForeground: "#FFFFFF",
  accentSoft: "#E5EEE8",
  background: "#F7F3EC",
  foreground: "#1F2A24",
  muted: "#EDE6DC",
  mutedForeground: "#6F746F",
  border: "#DED5C8",
  card: "#FFFDF8",
  summaryBackground: "#F1EBE2",
  danger: "#B54747",
  success: "#2F6B57",
  successForeground: "#FFFFFF",
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
