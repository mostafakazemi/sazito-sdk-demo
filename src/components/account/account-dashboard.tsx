"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  MapPin,
  PackageSearch,
  Phone,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import { AccountGate, AccountShell } from "@/components/account/account-shell";
import { useAccount } from "@/components/account/account-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const actions = [
  {
    href: "/account/orders",
    title: "سفارش‌های من",
    description: "مشاهده فهرست و جزئیات خریدهای ثبت‌شده",
    icon: PackageSearch,
  },
  {
    href: "/account/addresses",
    title: "نشانی‌های من",
    description: "مشاهده و ثبت نشانی‌های ارسال ذخیره‌شده",
    icon: MapPin,
  },
  {
    href: "/account/profile",
    title: "اطلاعات حساب",
    description: "ویرایش نام، ایمیل و تاریخ تولد",
    icon: UserRound,
  },
  {
    href: "/checkout",
    title: "ادامه خرید",
    description: "بررسی سبد خرید و رفتن به تسویه حساب",
    icon: ShoppingBag,
  },
];

function DashboardContent() {
  const { user } = useAccount();

  return (
    <AccountShell
      title="حساب کاربری"
      description="اطلاعات این بخش مستقیماً از حساب سازیتوی شما دریافت می‌شود."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-4xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Card className="h-full transition-[border-color,box-shadow,transform] group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-md motion-reduce:transform-none">
                <CardHeader>
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="flex items-center justify-between pt-3">
                    {action.title}
                    <ArrowLeft className="size-4 text-muted-foreground transition-transform group-hover:-translate-x-1 motion-reduce:transform-none" />
                  </CardTitle>
                  <CardDescription className="leading-7">
                    {action.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>راه‌های ارتباطی حساب</CardTitle>
          <CardDescription>
            شماره موبایل از این صفحه قابل تغییر نیست و فقط نمایش داده می‌شود.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl bg-background/70 p-4">
            <Mail className="size-5 text-primary" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">ایمیل</p>
              <p className="mt-1 truncate text-sm font-bold" dir="ltr">
                {user?.email || "ثبت نشده"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-background/70 p-4">
            <Phone className="size-5 text-primary" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">شماره موبایل</p>
              <p className="mt-1 truncate text-sm font-bold" dir="ltr">
                {user?.mobilePhone || user?.phoneNumber || "ثبت نشده"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AccountShell>
  );
}

export function AccountDashboard() {
  return (
    <AccountGate>
      <DashboardContent />
    </AccountGate>
  );
}
