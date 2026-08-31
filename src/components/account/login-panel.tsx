"use client";

import * as React from "react";
import { KeyRound, LoaderCircle, Mail, MessageSquareText } from "lucide-react";

import { useAccount } from "@/components/account/account-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const inputClassName =
  "h-12 w-full rounded-2xl border border-border/80 bg-background px-4 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/25 disabled:opacity-60";

type LoginMode = "password" | "mobile";

export function LoginPanel() {
  const { loginWithPassword, requestMobileOtp, verifyMobileOtp } = useAccount();
  const [mode, setMode] = React.useState<LoginMode>("mobile");
  const [otpRequested, setOtpRequested] = React.useState(false);
  const [mobilePhone, setMobilePhone] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const run = (operation: () => Promise<{ ok: true } | { ok: false; message: string }>) => {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await operation();
        if (!result.ok) setMessage(result.message);
      } catch {
        setMessage("ارتباط با فروشگاه برقرار نشد. دوباره تلاش کنید.");
      }
    });
  };

  const submitPassword = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    if (!email.trim() || !password) {
      setMessage("ایمیل و رمز عبور را کامل کنید.");
      return;
    }

    run(() => loginWithPassword(email, password));
  };

  const submitMobile = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const phone = String(form.get("mobilePhone") ?? mobilePhone);
    setMobilePhone(phone);

    if (!otpRequested) {
      run(async () => {
        const result = await requestMobileOtp(phone);
        if (result.ok) setOtpRequested(true);
        return result;
      });
      return;
    }

    const token = String(form.get("token") ?? "");
    run(() => verifyMobileOtp(phone, token));
  };

  const changeMode = (nextMode: LoginMode) => {
    setMode(nextMode);
    setOtpRequested(false);
    setMessage(null);
  };

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader className="p-6 sm:p-8">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
          <KeyRound className="size-5" />
        </span>
        <CardTitle className="pt-3 text-2xl">ورود به حساب کاربری</CardTitle>
        <CardDescription className="leading-7">
          سفارش‌ها و اطلاعات حساب شما مستقیماً از سازیتو دریافت می‌شود.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0 sm:p-8 sm:pt-0">
        <div
          className="mb-6 grid grid-cols-2 rounded-2xl bg-muted/75 p-1"
          role="tablist"
          aria-label="روش ورود"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "mobile"}
            onClick={() => changeMode("mobile")}
            className="rounded-xl px-3 py-2.5 text-sm font-bold outline-none transition-colors aria-selected:bg-card aria-selected:text-primary aria-selected:shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
          >
            پیامک
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "password"}
            onClick={() => changeMode("password")}
            className="rounded-xl px-3 py-2.5 text-sm font-bold outline-none transition-colors aria-selected:bg-card aria-selected:text-primary aria-selected:shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
          >
            ایمیل و رمز
          </button>
        </div>

        {mode === "password" ? (
          <form className="grid gap-4" onSubmit={submitPassword}>
            <label className="grid gap-2 text-sm font-bold" htmlFor="account-email">
              ایمیل
              <span className="relative">
                <Mail className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="account-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  dir="ltr"
                  disabled={isPending}
                  className={`${inputClassName} pr-11 text-left`}
                  placeholder="name@example.com"
                />
              </span>
            </label>
            <label className="grid gap-2 text-sm font-bold" htmlFor="account-password">
              رمز عبور
              <input
                id="account-password"
                name="password"
                type="password"
                autoComplete="current-password"
                dir="ltr"
                disabled={isPending}
                className={inputClassName}
              />
            </label>
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? (
                <LoaderCircle className="animate-spin motion-reduce:animate-none" />
              ) : null}
              ورود
            </Button>
          </form>
        ) : (
          <form className="grid gap-4" onSubmit={submitMobile}>
            <label className="grid gap-2 text-sm font-bold" htmlFor="account-mobile">
              شماره موبایل
              <input
                id="account-mobile"
                name="mobilePhone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                dir="ltr"
                value={mobilePhone}
                onChange={(event) => setMobilePhone(event.target.value)}
                readOnly={otpRequested}
                disabled={isPending}
                className={inputClassName}
                placeholder="09123456789"
              />
            </label>
            {otpRequested ? (
              <label className="grid gap-2 text-sm font-bold" htmlFor="account-token">
                کد ورود
                <span className="relative">
                  <MessageSquareText className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="account-token"
                    name="token"
                    type="text"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    dir="ltr"
                    autoFocus
                    disabled={isPending}
                    className={`${inputClassName} pr-11 text-center tracking-[0.35em]`}
                    placeholder="ــــــ"
                  />
                </span>
              </label>
            ) : null}
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? (
                <LoaderCircle className="animate-spin motion-reduce:animate-none" />
              ) : null}
              {otpRequested ? "تأیید و ورود" : "دریافت کد ورود"}
            </Button>
            {otpRequested ? (
              <button
                type="button"
                onClick={() => {
                  setOtpRequested(false);
                  setMessage(null);
                }}
                className="text-sm font-bold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              >
                ویرایش شماره موبایل
              </button>
            ) : null}
          </form>
        )}

        {message ? (
          <p
            role="alert"
            className="mt-4 rounded-2xl bg-danger/10 p-3 text-sm leading-6 text-danger"
          >
            {message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
