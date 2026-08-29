"use client";

import Link from "next/link";
import { LoaderCircle, LogIn, UserRound } from "lucide-react";

import { useAccount } from "@/components/account/account-provider";
import { accountDisplayName } from "@/lib/sazito/account";

export function AccountButton() {
  const { status, user } = useAccount();
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  return (
    <Link
      href="/account"
      aria-label={
        isLoading
          ? "در حال بررسی حساب کاربری"
          : isAuthenticated
            ? `حساب ${accountDisplayName(user)}`
            : "ورود به حساب کاربری"
      }
      className="inline-flex h-11 max-w-40 items-center gap-2 rounded-full border border-border/80 bg-card px-3 text-sm font-bold shadow-sm outline-none transition-[border-color,background-color,box-shadow] hover:border-primary/40 hover:bg-secondary hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
    >
      {isLoading ? (
        <LoaderCircle className="size-5 animate-spin text-muted-foreground motion-reduce:animate-none" />
      ) : isAuthenticated ? (
        <UserRound className="size-5 text-primary" />
      ) : (
        <LogIn className="size-5 text-primary" />
      )}
      <span className="hidden truncate lg:inline">
        {isAuthenticated ? accountDisplayName(user) : "ورود"}
      </span>
    </Link>
  );
}
