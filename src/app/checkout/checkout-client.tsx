"use client";

import * as React from "react";
import { AlertTriangle, LoaderCircle, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  CheckoutProvider,
  SazitoCheckout,
  useCheckout,
} from "@sazito/checkout/next";
import type { CheckoutConfig } from "@sazito/checkout/core";

import { useCommerce } from "@/components/commerce/commerce-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { removePaymentReturnParams } from "@/lib/sazito/payment-return";

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
  onAbandonReturn,
  onRetryReturn,
}: {
  paymentReturnParams?: Record<string, string>;
  onAbandonReturn(): void;
  onRetryReturn(): void;
}) {
  const { state, actions } = useCheckout();
  const { syncCart } = useCommerce();
  const returnHandled = React.useRef(false);
  const previousDebugState = React.useRef("");
  const [isRetrying, setIsRetrying] = React.useState(Boolean(paymentReturnParams));

  const resolvePaymentReturn = React.useCallback(async () => {
    if (!paymentReturnParams) return;

    console.info("[Sazito SDK][checkout callback] Verification started.", {
      recognizedParameterKeys: Object.keys(paymentReturnParams).sort(),
    });
    setIsRetrying(true);
    try {
      await actions.resolvePaymentReturn(paymentReturnParams);
    } finally {
      console.info("[Sazito SDK][checkout callback] Verification settled.");
      setIsRetrying(false);
    }
  }, [actions, paymentReturnParams]);

  React.useEffect(() => {
    if (!paymentReturnParams) return;

    const snapshot = {
      checkoutStatus: state.status,
      checkoutStep: state.step,
      resultStatus: state.result?.status ?? null,
      errorCode: state.error?.code ?? null,
      errorStatus: state.error?.status ?? null,
      errorStep: state.error?.step ?? null,
    };
    const signature = JSON.stringify(snapshot);

    if (signature === previousDebugState.current) return;
    previousDebugState.current = signature;
    console.info(
      "[Sazito SDK][checkout callback] Checkout state changed.",
      snapshot,
    );
  }, [
    paymentReturnParams,
    state.error?.code,
    state.error?.status,
    state.error?.step,
    state.result?.status,
    state.status,
    state.step,
  ]);

  React.useEffect(() => {
    if (!paymentReturnParams || returnHandled.current) return;
    returnHandled.current = true;
    void resolvePaymentReturn();
  }, [paymentReturnParams, resolvePaymentReturn]);

  React.useEffect(() => {
    if (state.result?.status === "success") {
      syncCart(null);
    } else if (state.cart || !paymentReturnParams) {
      syncCart(state.cart);
    }
  }, [paymentReturnParams, state.cart, state.result?.status, syncCart]);

  React.useEffect(() => {
    if (!paymentReturnParams) return;

    const status = state.result?.status;
    if (
      status !== "success" &&
      status !== "failed" &&
      status !== "stock_violated"
    ) {
      return;
    }

    const cleanUrl = removePaymentReturnParams(window.location.href);
    window.history.replaceState(window.history.state, "", cleanUrl);
    console.info(
      "[Sazito SDK][checkout callback] Sensitive return parameters removed from the URL.",
    );
  }, [paymentReturnParams, state.result?.status]);

  if (paymentReturnParams && isRetrying && !state.result) {
    return (
      <Card role="status" aria-live="polite">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <LoaderCircle className="size-8 animate-spin text-primary motion-reduce:animate-none" />
          <div>
            <p className="font-bold">در حال بررسی نتیجه پرداخت</p>
            <p className="mt-2 text-sm text-muted-foreground">
              لطفاً تا دریافت پاسخ درگاه این صفحه را نبندید.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const returnError =
    paymentReturnParams &&
    state.error &&
    state.result?.status === "pending";

  if (returnError) {
    return (
      <Card role="alert" className="border-destructive/35">
        <CardHeader>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" />
          </div>
          <CardTitle className="pt-2">بررسی نتیجه پرداخت کامل نشد</CardTitle>
          <CardDescription className="leading-7">
            {state.error?.message ??
              "ارتباط با سرویس پرداخت برقرار نشد. دوباره تلاش کنید."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button type="button" onClick={onRetryReturn}>
            <RotateCcw aria-hidden="true" />
            بررسی دوباره
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onAbandonReturn}
          >
            بازگشت به تسویه حساب
          </Button>
        </CardContent>
      </Card>
    );
  }

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

export function CheckoutClient({
  paymentReturnParams,
}: {
  paymentReturnParams?: Record<string, string>;
}) {
  const router = useRouter();
  const [returnSessionParams] = React.useState(paymentReturnParams);
  const [returnAbandoned, setReturnAbandoned] = React.useState(false);
  const [returnAttempt, setReturnAttempt] = React.useState(0);
  const activePaymentReturnParams = returnAbandoned
    ? undefined
    : returnSessionParams;
  const retryPaymentReturn = React.useCallback(() => {
    console.info(
      "[Sazito SDK][checkout callback] Verification retry requested.",
    );
    setReturnAttempt((attempt) => attempt + 1);
  }, []);
  const abandonPaymentReturn = React.useCallback(() => {
    console.info(
      "[Sazito SDK][checkout callback] Callback flow abandoned by the shopper.",
    );
    setReturnAbandoned(true);
    router.replace("/checkout");
  }, [router]);

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
      autoStart={!activePaymentReturnParams}
      key={activePaymentReturnParams ? `payment-return-${returnAttempt}` : "checkout"}
    >
      <CheckoutStateBridge
        paymentReturnParams={activePaymentReturnParams}
        onAbandonReturn={abandonPaymentReturn}
        onRetryReturn={retryPaymentReturn}
      />
    </CheckoutProvider>
  );
}
