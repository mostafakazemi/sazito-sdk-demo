"use client";

import * as React from "react";
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  Mail,
  MessageSquareText,
  UserPlus,
} from "lucide-react";

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
type AccessView = "login" | "register" | "forgot";
type Message = { type: "success" | "error"; text: string };
type OperationResult = { ok: true } | { ok: false; message: string };

export function LoginPanel() {
  const {
    loginWithPassword,
    registerWithEmail,
    requestMobileOtp,
    requestPasswordReset,
    verifyMobileOtp,
  } = useAccount();
  const [view, setView] = React.useState<AccessView>("login");
  const [mode, setMode] = React.useState<LoginMode>("mobile");
  const [otpRequested, setOtpRequested] = React.useState(false);
  const [mobilePhone, setMobilePhone] = React.useState("");
  const [resetRequested, setResetRequested] = React.useState(false);
  const [message, setMessage] = React.useState<Message | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const run = (
    operation: () => Promise<OperationResult>,
    onSuccess?: () => void,
  ) => {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await operation();
        if (result.ok) {
          onSuccess?.();
        } else {
          setMessage({ type: "error", text: result.message });
        }
      } catch {
        setMessage({
          type: "error",
          text: "ارتباط با فروشگاه برقرار نشد. دوباره تلاش کنید.",
        });
      }
    });
  };

  const changeView = (nextView: AccessView) => {
    setView(nextView);
    setOtpRequested(false);
    setResetRequested(false);
    setMessage(null);
  };

  const submitPassword = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    if (!email.trim() || !password) {
      setMessage({ type: "error", text: "ایمیل و رمز عبور را کامل کنید." });
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
      run(
        () => requestMobileOtp(phone),
        () => setOtpRequested(true),
      );
      return;
    }

    const token = String(form.get("token") ?? "");
    run(() => verifyMobileOtp(phone, token));
  };

  const submitRegistration = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const passwordConfirmation = String(
      form.get("passwordConfirmation") ?? "",
    );

    if (password !== passwordConfirmation) {
      setMessage({ type: "error", text: "تکرار رمز عبور یکسان نیست." });
      return;
    }

    run(() =>
      registerWithEmail({
        firstName: String(form.get("firstName") ?? ""),
        lastName: String(form.get("lastName") ?? ""),
        email: String(form.get("email") ?? ""),
        password,
        passwordConfirmation,
      }),
    );
  };

  const submitForgotPassword = (
    event: React.SubmitEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");

    run(
      () => requestPasswordReset(email),
      () => setResetRequested(true),
    );
  };

  const title =
    view === "register"
      ? "ساخت حساب کاربری"
      : view === "forgot"
        ? "بازیابی رمز عبور"
        : "ورود به حساب کاربری";
  const description =
    view === "register"
      ? "حساب جدید شما مستقیماً در فروشگاه سازیتو ساخته می‌شود."
      : view === "forgot"
        ? "ایمیل حساب را وارد کنید تا سازیتو راهنمای بازیابی را ارسال کند."
        : "سفارش‌ها و اطلاعات حساب شما مستقیماً از سازیتو دریافت می‌شود.";
  const HeaderIcon = view === "register" ? UserPlus : KeyRound;

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader className="p-6 sm:p-8">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
          <HeaderIcon className="size-5" />
        </span>
        <CardTitle className="pt-3 text-2xl">{title}</CardTitle>
        <CardDescription className="leading-7">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0 sm:p-8 sm:pt-0">
        {view === "login" ? (
          <>
            <div
              className="mb-6 grid grid-cols-2 rounded-2xl bg-muted/75 p-1"
              role="tablist"
              aria-label="روش ورود"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "mobile"}
                onClick={() => {
                  setMode("mobile");
                  setOtpRequested(false);
                  setMessage(null);
                }}
                className="rounded-xl px-3 py-2.5 text-sm font-bold outline-none transition-colors aria-selected:bg-card aria-selected:text-primary aria-selected:shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
              >
                پیامک
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "password"}
                onClick={() => {
                  setMode("password");
                  setOtpRequested(false);
                  setMessage(null);
                }}
                className="rounded-xl px-3 py-2.5 text-sm font-bold outline-none transition-colors aria-selected:bg-card aria-selected:text-primary aria-selected:shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
              >
                ایمیل و رمز
              </button>
            </div>

            {mode === "password" ? (
              <form className="grid gap-4" onSubmit={submitPassword}>
                <label
                  className="grid gap-2 text-sm font-bold"
                  htmlFor="account-email"
                >
                  ایمیل
                  <span className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="account-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      dir="ltr"
                      disabled={isPending}
                      className={`${inputClassName} pr-11 text-left`}
                      placeholder="name@example.com"
                    />
                  </span>
                </label>
                <label
                  className="grid gap-2 text-sm font-bold"
                  htmlFor="account-password"
                >
                  رمز عبور
                  <input
                    id="account-password"
                    name="password"
                    type="password"
                    required
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
                <label
                  className="grid gap-2 text-sm font-bold"
                  htmlFor="account-mobile"
                >
                  شماره موبایل
                  <input
                    id="account-mobile"
                    name="mobilePhone"
                    type="tel"
                    required
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
                  <label
                    className="grid gap-2 text-sm font-bold"
                    htmlFor="account-token"
                  >
                    کد ورود
                    <span className="relative">
                      <MessageSquareText className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="account-token"
                        name="token"
                        type="text"
                        required
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

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t pt-5 text-sm">
              <button
                type="button"
                className="font-bold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => changeView("register")}
              >
                ایجاد حساب جدید
              </button>
              <button
                type="button"
                className="font-bold text-muted-foreground outline-none hover:text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => changeView("forgot")}
              >
                رمز عبور را فراموش کرده‌ام
              </button>
            </div>
          </>
        ) : view === "register" ? (
          <form className="grid gap-4" onSubmit={submitRegistration}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label
                className="grid gap-2 text-sm font-bold"
                htmlFor="register-first-name"
              >
                نام
                <input
                  id="register-first-name"
                  name="firstName"
                  autoComplete="given-name"
                  disabled={isPending}
                  className={inputClassName}
                />
              </label>
              <label
                className="grid gap-2 text-sm font-bold"
                htmlFor="register-last-name"
              >
                نام خانوادگی
                <input
                  id="register-last-name"
                  name="lastName"
                  autoComplete="family-name"
                  disabled={isPending}
                  className={inputClassName}
                />
              </label>
            </div>
            <label
              className="grid gap-2 text-sm font-bold"
              htmlFor="register-email"
            >
              ایمیل
              <input
                id="register-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                dir="ltr"
                disabled={isPending}
                className={inputClassName}
                placeholder="name@example.com"
              />
            </label>
            <label
              className="grid gap-2 text-sm font-bold"
              htmlFor="register-password"
            >
              رمز عبور
              <input
                id="register-password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                dir="ltr"
                disabled={isPending}
                className={inputClassName}
              />
            </label>
            <label
              className="grid gap-2 text-sm font-bold"
              htmlFor="register-password-confirmation"
            >
              تکرار رمز عبور
              <input
                id="register-password-confirmation"
                name="passwordConfirmation"
                type="password"
                required
                autoComplete="new-password"
                dir="ltr"
                disabled={isPending}
                className={inputClassName}
              />
            </label>
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? (
                <LoaderCircle className="animate-spin motion-reduce:animate-none" />
              ) : (
                <UserPlus />
              )}
              ساخت حساب
            </Button>
          </form>
        ) : resetRequested ? (
          <div className="rounded-3xl bg-secondary/70 p-6 text-center">
            <CheckCircle2 className="mx-auto size-9 text-primary" />
            <p className="mt-4 font-black">درخواست بازیابی ثبت شد</p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              اگر این ایمیل در فروشگاه ثبت شده باشد، راهنمای بازیابی ارسال شده
              است. صندوق ورودی و پوشه هرزنامه را بررسی کنید.
            </p>
          </div>
        ) : (
          <form className="grid gap-4" onSubmit={submitForgotPassword}>
            <label
              className="grid gap-2 text-sm font-bold"
              htmlFor="forgot-email"
            >
              ایمیل حساب
              <span className="relative">
                <Mail className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  dir="ltr"
                  disabled={isPending}
                  className={`${inputClassName} pr-11 text-left`}
                  placeholder="name@example.com"
                />
              </span>
            </label>
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? (
                <LoaderCircle className="animate-spin motion-reduce:animate-none" />
              ) : (
                <Mail />
              )}
              ارسال ایمیل بازیابی
            </Button>
          </form>
        )}

        {message ? (
          <p
            role={message.type === "error" ? "alert" : "status"}
            className={
              message.type === "success"
                ? "mt-4 rounded-2xl bg-secondary p-3 text-sm leading-6 text-primary"
                : "mt-4 rounded-2xl bg-danger/10 p-3 text-sm leading-6 text-danger"
            }
          >
            {message.text}
          </p>
        ) : null}

        {view !== "login" ? (
          <button
            type="button"
            onClick={() => changeView("login")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl text-sm font-bold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowRight className="size-4" />
            بازگشت به ورود
          </button>
        ) : null}
      </CardContent>
    </Card>
  );
}
