"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  KeyRound,
  Link2Off,
  LoaderCircle,
  ShieldCheck,
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
import { validatePasswordResetInput } from "@/lib/sazito/password-reset";

const inputClassName =
  "h-12 w-full rounded-2xl border border-border/80 bg-background px-4 text-sm outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-ring/25 disabled:opacity-60";

export function PasswordResetPage({ token }: { token: string | null }) {
  const { resetPassword } = useAccount();
  const [message, setMessage] = React.useState<string | null>(null);
  const [isComplete, setIsComplete] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const submit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const passwordConfirmation = String(
      form.get("passwordConfirmation") ?? "",
    );
    const validationMessage = validatePasswordResetInput({
      forgotPasswordToken: token,
      password,
      passwordConfirmation,
    });

    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    setMessage(null);
    startTransition(async () => {
      try {
        const result = await resetPassword(
          token,
          password,
          passwordConfirmation,
        );

        if (!result.ok) {
          setMessage(result.message);
          return;
        }

        window.history.replaceState(
          window.history.state,
          "",
          "/account/reset-password",
        );
        setIsComplete(true);
      } catch {
        setMessage("ارتباط با فروشگاه برقرار نشد. دوباره تلاش کنید.");
      }
    });
  };

  if (!token) {
    return (
      <Card className="mx-auto max-w-xl border-danger/25">
        <CardHeader className="items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-danger/10 text-danger">
            <Link2Off className="size-6" />
          </span>
          <CardTitle className="pt-3">لینک بازیابی معتبر نیست</CardTitle>
          <CardDescription className="max-w-md leading-7">
            توکن بازیابی در این نشانی وجود ندارد. از صفحه ورود یک ایمیل
            بازیابی تازه درخواست کنید.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link href="/account">بازگشت به ورود</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isComplete) {
    return (
      <Card className="mx-auto max-w-xl border-primary/25">
        <CardHeader className="items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            <CheckCircle2 className="size-7" />
          </span>
          <CardTitle className="pt-3">رمز عبور تغییر کرد</CardTitle>
          <CardDescription className="max-w-md leading-7">
            رمز عبور جدید ذخیره شد و اکنون وارد حساب کاربری خود شده‌اید.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link href="/account">رفتن به حساب کاربری</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
          <KeyRound className="size-5" />
        </span>
        <CardTitle className="pt-3 text-2xl">انتخاب رمز عبور جدید</CardTitle>
        <CardDescription className="leading-7">
          رمز عبور جدید را دو بار وارد کنید. پس از ثبت موفق، ورود شما به حساب
          کاربری نیز انجام می‌شود.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={submit}>
          <label
            className="grid gap-2 text-sm font-bold"
            htmlFor="reset-password"
          >
            رمز عبور جدید
            <input
              id="reset-password"
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
            htmlFor="reset-password-confirmation"
          >
            تکرار رمز عبور جدید
            <input
              id="reset-password-confirmation"
              name="passwordConfirmation"
              type="password"
              required
              autoComplete="new-password"
              dir="ltr"
              disabled={isPending}
              className={inputClassName}
            />
          </label>

          {message ? (
            <p
              role="alert"
              className="rounded-2xl bg-danger/10 p-3 text-sm leading-7 text-danger"
            >
              {message}
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? (
              <LoaderCircle className="animate-spin motion-reduce:animate-none" />
            ) : (
              <ShieldCheck />
            )}
            ذخیره رمز عبور جدید
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
