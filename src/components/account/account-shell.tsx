"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  MapPin,
  PackageSearch,
  UserRound,
  WalletCards,
} from "lucide-react";

import { LoginPanel } from "@/components/account/login-panel";
import { useAccount } from "@/components/account/account-provider";
import { Button } from "@/components/ui/button";
import { accountDisplayName } from "@/lib/sazito/account";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/account", label: "نمای کلی", icon: LayoutDashboard },
  { href: "/account/orders", label: "سفارش‌ها", icon: PackageSearch },
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
  const { user, logout } = useAccount();

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="h-fit rounded-4xl border bg-card p-4 shadow-[0_16px_50px_-34px_rgba(31,42,36,0.45)] lg:sticky lg:top-24">
        <div className="flex items-center gap-3 rounded-2xl bg-secondary/70 p-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <UserRound className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black">
              {accountDisplayName(user)}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {user?.email || user?.mobilePhone || "مشتری فروشگاه"}
            </p>
          </div>
        </div>

        <nav className="mt-3 overflow-x-auto" aria-label="حساب کاربری">
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
                      "flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold outline-none transition-colors hover:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-ring",
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
          className="mt-3 w-full justify-start text-danger hover:bg-danger/10 hover:text-danger"
          onClick={logout}
        >
          <LogOut />
          خروج از حساب
        </Button>
      </aside>

      <section className="min-w-0">
        <header className="mb-6">
          <h1 className="text-2xl font-black sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            {description}
          </p>
        </header>
        {children}
      </section>
    </div>
  );
}
