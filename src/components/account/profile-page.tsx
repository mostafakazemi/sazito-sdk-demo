"use client";

import * as React from "react";
import { CheckCircle2, LoaderCircle, Save } from "lucide-react";
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";

import { useAccount } from "@/components/account/account-provider";
import { AccountGate, AccountShell } from "@/components/account/account-shell";
import { MobilePhoneUpdateCard } from "@/components/account/mobile-phone-update-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const inputClassName =
  "h-12 w-full rounded-2xl border border-border/80 bg-background px-4 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/25 disabled:opacity-60";

function normalizeBirthDate(value?: string) {
  if (!value) return "";

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? match[0] : "";
}

function toPersianDate(value: string) {
  if (!value) return null;

  const date = new DateObject(new Date(`${value}T12:00:00`));
  return date.convert(persian, persianFa);
}

function toIsoDate(value: DateObject | null) {
  if (!value) return "";

  const date = value.toDate();
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part) => String(part).padStart(2, "0"))
    .join("-");
}

function ProfileForm() {
  const { user, updateProfile } = useAccount();
  const [birthDateOverride, setBirthDateOverride] = React.useState<string | null>(
    null,
  );
  const birthDate =
    birthDateOverride ?? normalizeBirthDate(user?.birthDate);
  const [message, setMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const submit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setMessage(null);

    startTransition(async () => {
      try {
        const result = await updateProfile({
          firstName: String(form.get("firstName") ?? "").trim(),
          lastName: String(form.get("lastName") ?? "").trim(),
          email: String(form.get("email") ?? "").trim(),
          birthDate: String(form.get("birthDate") ?? "").trim() || undefined,
        });
        setMessage(
          result.ok
            ? { type: "success", text: "اطلاعات حساب ذخیره شد." }
            : { type: "error", text: result.message },
        );
      } catch {
        setMessage({
          type: "error",
          text: "ارتباط با فروشگاه برقرار نشد. دوباره تلاش کنید.",
        });
      }
    });
  };

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <form className="grid gap-5" onSubmit={submit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold" htmlFor="first-name">
              نام
              <input
                id="first-name"
                name="firstName"
                autoComplete="given-name"
                defaultValue={user?.firstName ?? ""}
                disabled={isPending}
                className={inputClassName}
              />
            </label>
            <label className="grid gap-2 text-sm font-bold" htmlFor="last-name">
              نام خانوادگی
              <input
                id="last-name"
                name="lastName"
                autoComplete="family-name"
                defaultValue={user?.lastName ?? ""}
                disabled={isPending}
                className={inputClassName}
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-bold" htmlFor="profile-email">
            ایمیل
            <input
              id="profile-email"
              name="email"
              type="email"
              autoComplete="email"
              dir="ltr"
              defaultValue={user?.email ?? ""}
              disabled={isPending}
              className={inputClassName}
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2 text-sm font-bold">
              <label htmlFor="birth-date">تاریخ تولد</label>
              <DatePicker
                id="birth-date"
                calendar={persian}
                locale={persianFa}
                value={toPersianDate(birthDate)}
                onChange={(value) => setBirthDateOverride(toIsoDate(value))}
                format="YYYY/MM/DD"
                calendarPosition="bottom-right"
                inputClass={inputClassName}
                disabled={isPending}
                placeholder="انتخاب تاریخ تولد"
                containerClassName="w-full"
              />
              <input type="hidden" name="birthDate" value={birthDate} />
            </div>
            <label className="grid gap-2 text-sm font-bold" htmlFor="profile-mobile">
              شماره موبایل
              <input
                id="profile-mobile"
                type="tel"
                dir="ltr"
                readOnly
                value={user?.mobilePhone || user?.phoneNumber || "ثبت نشده"}
                className={`${inputClassName} cursor-not-allowed bg-muted/60 text-muted-foreground`}
              />
            </label>
          </div>

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
                <CheckCircle2 className="size-4" />
              ) : null}
              {message.text}
            </p>
          ) : null}

          <Button type="submit" size="lg" className="sm:w-fit" disabled={isPending}>
            {isPending ? (
              <LoaderCircle className="animate-spin motion-reduce:animate-none" />
            ) : (
              <Save />
            )}
            ذخیره تغییرات
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function ProfilePage() {
  return (
    <AccountGate>
      <AccountShell
        title="اطلاعات حساب"
        description="اطلاعات فردی و شماره موبایل حساب سازیتوی خود را مدیریت کنید."
      >
        <div className="space-y-5">
          <ProfileForm />
          <MobilePhoneUpdateCard />
        </div>
      </AccountShell>
    </AccountGate>
  );
}
