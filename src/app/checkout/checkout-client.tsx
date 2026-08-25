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
  fontFamily: "var(--font-estedad), Tahoma, Arial, sans-serif",
} satisfies NonNullable<CheckoutConfig["theme"]>;

function CheckoutStateBridge({
  paymentReturnParams,
}: {
  paymentReturnParams?: Record<string, string>;
}) {
  const { state, actions } = useCheckout();
  const { syncCart } = useCommerce();
  const returnHandled = React.useRef(false);

  React.useEffect(() => {
    if (!paymentReturnParams || returnHandled.current) return;
    returnHandled.current = true;
    void actions.resolvePaymentReturn(paymentReturnParams);
  }, [actions, paymentReturnParams]);

  React.useEffect(() => {
    syncCart(state.result?.status === "success" ? null : state.cart);
  }, [state.cart, state.result?.status, syncCart]);

  return null;
}

export function CheckoutClient({
  paymentReturnParams,
}: {
  paymentReturnParams?: Record<string, string>;
}) {
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
    <CheckoutProvider
      config={config}
      autoStart={!paymentReturnParams}
    >
      <CheckoutStateBridge paymentReturnParams={paymentReturnParams} />
      <SazitoCheckout
        theme={checkoutTheme}
        continueShoppingUrl="/"
        className="store-checkout"
        emptyCart={{
          title: "سبد خرید شما خالی است",
          description: "محصول دلخواهتان را انتخاب کنید و برای تکمیل خرید به این صفحه برگردید.",
          actionLabel: "بازگشت به فروشگاه",
        }}
      />
    </CheckoutProvider>
  );
}
