"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  CalendarCheck2,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  MapPin,
  PackageSearch,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

import { LoginPanel } from "@/components/account/login-panel";
import { useAccount } from "@/components/account/account-provider";
import { Button } from "@/components/ui/button";
import { accountDisplayName } from "@/lib/sazito/account";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/account", label: "نمای کلی", icon: LayoutDashboard },
  { href: "/account/orders", label: "سفارش‌ها", icon: PackageSearch },
  { href: "/account/bookings", label: "رزروها", icon: CalendarCheck2 },
  { href: "/account/wallet", label: "کیف پول", icon: WalletCards },
  { href: "/account/addresses", label: "نشانی‌ها", icon: MapPin },
  { href: "/account/profile", label: "پروفایل", icon: UserRound },
];

export function AccountGate({ children }: { children: React.ReactNode }) {
  const { status } = useAccount();

  if (status === "loading") {
    return (
      <div
        className="flex min-h-80 items-center justify-center gap-3 text-sm text-muted-foreground"
        role="status"
      >
        <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" />
        در حال بررسی حساب کاربری…
      </div>
    );
  }

  if (status === "anonymous") {
    return <LoginPanel />;
  }

  return children;
}

export function AccountShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout, notice, clearNotice } = useAccount();

  return (
    <div className="grid gap-4 lg:gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="h-fit rounded-4xl border bg-card p-2 shadow-[0_16px_50px_-34px_rgba(31,42,36,0.45)] sm:p-3 lg:sticky lg:top-24 lg:p-4">
        <div className="flex items-center gap-2 rounded-2xl bg-secondary/70 p-2 lg:gap-3 lg:p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground lg:size-11 lg:rounded-2xl">
            <UserRound className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-black lg:text-sm">
              {accountDisplayName(user)}
            </p>
            <p className="mt-0.5 hidden truncate text-xs text-muted-foreground lg:block">
              {user?.email || user?.mobilePhone || "مشتری فروشگاه"}
            </p>
          </div>
        </div>

        <nav className="mt-2 overflow-x-auto lg:mt-3" aria-label="حساب کاربری">
          <ul className="flex gap-1 lg:grid">
            {navigation.map((item) => {
              const active =
                item.href === "/account"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <li key={item.href} className="shrink-0">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-bold outline-none transition-colors hover:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-ring lg:gap-2 lg:px-4 lg:py-3 lg:text-sm",
                      active && "bg-secondary text-primary",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Button
          type="button"
          variant="ghost"
          className="mt-2 h-9 w-full justify-center px-2 text-xs text-danger hover:bg-danger/10 hover:text-danger lg:mt-3 lg:h-auto lg:justify-start lg:px-4 lg:py-3 lg:text-sm"
          onClick={logout}
        >
          <LogOut />
          <span className="hidden lg:inline">خروج از حساب</span>
        </Button>
      </aside>

      <section className="min-w-0">
        <header className="mb-4 lg:mb-6">
          <h1 className="text-xl font-black sm:text-2xl lg:text-3xl">{title}</h1>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            {description}
          </p>
        </header>
        {notice ? (
          <div
            className="mb-5 flex items-start gap-3 rounded-3xl border border-highlight/30 bg-highlight/10 p-4 text-sm leading-7"
            role="status"
          >
            <AlertTriangle className="mt-1 size-5 shrink-0 text-highlight-foreground" />
            <p className="flex-1">{notice}</p>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="-m-1 shrink-0"
              aria-label="بستن پیام"
              onClick={clearNotice}
            >
              <X />
            </Button>
          </div>
        ) : null}
        {children}
      </section>
    </div>
  );
}
