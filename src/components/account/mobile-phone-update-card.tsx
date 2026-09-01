"use client";

import * as React from "react";
import {
  CheckCircle2,
  LoaderCircle,
  MessageSquareText,
  Phone,
  RefreshCcw,
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

type Message = { type: "success" | "error"; text: string };

export function MobilePhoneUpdateCard() {
  const {
    user,
    requestMobilePhoneUpdate,
    verifyMobilePhoneUpdate,
  } = useAccount();
  const [mobilePhone, setMobilePhone] = React.useState("");
  const [token, setToken] = React.useState("");
  const [otpRequested, setOtpRequested] = React.useState(false);
  const [message, setMessage] = React.useState<Message | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const currentMobile =
    user?.mobilePhone || user?.phoneNumber || "شماره‌ای ثبت نشده است";

  const requestCode = React.useCallback(() => {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await requestMobilePhoneUpdate(mobilePhone);
        if (!result.ok) {
          setMessage({ type: "error", text: result.message });
          return;
        }

        setOtpRequested(true);
        setMessage({
          type: "success",
          text: "کد تأیید به شماره جدید ارسال شد.",
        });
      } catch {
        setMessage({
          type: "error",
          text: "ارتباط با فروشگاه برقرار نشد. دوباره تلاش کنید.",
        });
      }
    });
  }, [mobilePhone, requestMobilePhoneUpdate]);

  const submit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!otpRequested) {
      requestCode();
      return;
    }

    setMessage(null);
    startTransition(async () => {
      try {
        const result = await verifyMobilePhoneUpdate(mobilePhone, token);
        if (!result.ok) {
          setMessage({ type: "error", text: result.message });
          return;
        }

        setOtpRequested(false);
        setMobilePhone("");
        setToken("");
        setMessage({
          type: "success",
          text: "شماره موبایل حساب با موفقیت تغییر کرد.",
        });
      } catch {
        setMessage({
          type: "error",
          text: "ارتباط با فروشگاه برقرار نشد. دوباره تلاش کنید.",
        });
      }
    });
  };

  const editMobile = () => {
    setOtpRequested(false);
    setToken("");
    setMessage(null);
  };

  return (
    <Card>
      <CardHeader>
        <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
          <Phone className="size-5" />
        </span>
        <CardTitle className="pt-2">تغییر شماره موبایل</CardTitle>
        <CardDescription className="leading-7">
          شماره فعلی: <span dir="ltr">{currentMobile}</span>. شماره جدید فقط
          پس از تأیید کد پیامکی ذخیره می‌شود.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={submit}>
          <label
            className="grid gap-2 text-sm font-bold"
            htmlFor="new-mobile-phone"
          >
            شماره موبایل جدید
            <input
              id="new-mobile-phone"
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
              htmlFor="mobile-update-token"
            >
              کد تأیید
              <span className="relative">
                <MessageSquareText className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="mobile-update-token"
                  name="token"
                  type="text"
                  required
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  dir="ltr"
                  autoFocus
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  disabled={isPending}
                  className={`${inputClassName} pr-11 text-center tracking-[0.35em]`}
                  placeholder="ــــــ"
                />
              </span>
            </label>
          ) : null}

          {message ? (
            <p
              role={message.type === "error" ? "alert" : "status"}
              className={
                message.type === "success"
                  ? "flex items-center gap-2 rounded-2xl bg-secondary p-3 text-sm text-primary"
                  : "rounded-2xl bg-danger/10 p-3 text-sm text-danger"
              }
            >
              {message.type === "success" ? (
                <CheckCircle2 className="size-4 shrink-0" />
              ) : null}
              {message.text}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? (
                <LoaderCircle className="animate-spin motion-reduce:animate-none" />
              ) : otpRequested ? (
                <CheckCircle2 />
              ) : (
                <MessageSquareText />
              )}
              {otpRequested ? "تأیید شماره جدید" : "دریافت کد تأیید"}
            </Button>

            {otpRequested ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={isPending}
                  onClick={editMobile}
                >
                  ویرایش شماره
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  disabled={isPending}
                  onClick={requestCode}
                >
                  <RefreshCcw />
                  ارسال دوباره کد
                </Button>
              </>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
