"use client";

import Link from "next/link";
import { LoaderCircle, ShoppingBag } from "lucide-react";

import { useCommerce } from "@/components/commerce/commerce-provider";

export function CartButton() {
  const { itemCount, isLoading } = useCommerce();
  const count = itemCount.toLocaleString("fa-IR");

  return (
    <Link
      href="/checkout"
      aria-label={isLoading ? "در حال دریافت سبد خرید" : `سبد خرید؛ ${count} کالا`}
      className="relative inline-flex h-11 items-center gap-2 rounded-xl border bg-card px-3 text-sm font-bold outline-none transition-colors hover:border-primary/40 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
    >
      {isLoading ? (
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
      ) : (
        <ShoppingBag className="size-5 text-primary" />
      )}
      <span className="hidden sm:inline">سبد خرید</span>
      {!isLoading && itemCount > 0 ? (
        <span className="flex min-w-5 items-center justify-center rounded-full bg-highlight px-1.5 py-0.5 text-[11px] leading-4 font-black text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
