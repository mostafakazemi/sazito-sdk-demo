"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ImageOff,
  LoaderCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { useCommerce } from "@/components/commerce/commerce-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { formatPrice, normalizeStoreHref } from "@/lib/sazito/presenters";

export function CartButton() {
  const {
    cart,
    itemCount,
    isLoading,
    isMutating,
    isCartOpen,
    setCartOpen,
    updateItem,
    removeItem,
  } = useCommerce();
  const [error, setError] = React.useState<string | null>(null);
  const count = itemCount.toLocaleString("fa-IR");

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={isLoading ? "در حال دریافت سبد خرید" : `سبد خرید؛ ${count} کالا`}
          className="relative inline-flex h-11 items-center gap-2 rounded-full border border-border/80 bg-card px-3 text-sm font-bold shadow-sm outline-none transition-[border-color,background-color,box-shadow] hover:border-primary/40 hover:bg-secondary hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
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
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b p-6 pl-14">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="size-5 text-primary" />
            سبد خرید
          </SheetTitle>
          <SheetDescription>{count} کالا در سبد شماست</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {isLoading ? (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-5 animate-spin" />
              در حال دریافت سبد…
            </div>
          ) : !cart?.items.length ? (
            <div className="flex h-full min-h-80 flex-col items-center justify-center text-center">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary">
                <ShoppingBag className="size-7" />
              </span>
              <p className="mt-5 font-black">سبد خرید خالی است</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                از میان محصولات فروشگاه انتخاب کنید.
              </p>
              <SheetClose asChild>
                <Button asChild variant="outline" className="mt-5">
                  <Link href="/">مشاهده محصولات</Link>
                </Button>
              </SheetClose>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.items.map((item) => {
                const minimum = Math.max(1, item.product.minOrderQuantity || 1);
                const maximum = item.product.hasMaxOrder
                  ? Math.max(minimum, item.product.maxOrderQuantity || minimum)
                  : null;
                const href = item.product.url
                  ? normalizeStoreHref(item.product.url).href
                  : "/";

                const mutate = async (action: "increase" | "decrease" | "remove") => {
                  setError(null);
                  const result = action === "remove"
                    ? await removeItem(item.id, item.productVariantId)
                    : await updateItem(
                        item.id,
                        item.productVariantId,
                        item.quantity + (action === "increase" ? 1 : -1),
                        item.formAttributes,
                      );
                  if (!result.ok) setError(result.message);
                };

                return (
                  <article key={item.id} className="rounded-2xl border bg-background/55 p-3">
                    <div className="flex gap-3">
                      <Link href={href} onClick={() => setCartOpen(false)} className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
                        {item.product.image?.url ? (
                          <Image src={item.product.image.url} alt={item.product.image.alt || item.product.name} fill sizes="80px" className="object-cover" />
                        ) : (
                          <ImageOff className="size-5 text-muted-foreground" />
                        )}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link href={href} onClick={() => setCartOpen(false)} className="line-clamp-2 text-sm leading-6 font-bold hover:text-primary">
                          {item.product.name}
                        </Link>
                        <p className="mt-1 text-sm font-black text-primary">{formatPrice(item.lineTotal)}</p>
                        {item.formAttributes && Object.keys(item.formAttributes).length ? (
                          <p className="mt-1 text-xs text-muted-foreground">دارای اطلاعات سفارشی</p>
                        ) : null}
                      </div>
                      <button type="button" onClick={() => void mutate("remove")} disabled={isMutating} aria-label={`حذف ${item.product.name}`} className="flex size-9 shrink-0 items-center justify-center rounded-lg text-danger outline-none hover:bg-danger/10 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-xl border bg-card p-0.5">
                        <button type="button" onClick={() => void mutate("decrease")} disabled={isMutating || item.quantity <= minimum} aria-label="کم کردن تعداد" className="flex size-8 items-center justify-center rounded-lg hover:bg-secondary disabled:opacity-30"><Minus className="size-3.5" /></button>
                        <span className="min-w-9 text-center text-sm font-black">{item.quantity.toLocaleString("fa-IR")}</span>
                        <button type="button" onClick={() => void mutate("increase")} disabled={isMutating || (maximum !== null && item.quantity >= maximum)} aria-label="زیاد کردن تعداد" className="flex size-8 items-center justify-center rounded-lg hover:bg-secondary disabled:opacity-30"><Plus className="size-3.5" /></button>
                      </div>
                      <span className="text-xs text-muted-foreground">هر واحد {formatPrice(item.unitPrice)}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {error ? <p role="alert" className="mx-5 mb-3 rounded-xl bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}

        {cart?.items.length ? (
          <div className="border-t bg-card p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">جمع سبد خرید</span>
              <strong className="text-lg">{formatPrice(cart.netTotal)}</strong>
            </div>
            <Separator className="my-4" />
            <SheetClose asChild>
              <Button asChild size="lg" className="w-full">
                <Link href="/checkout">ادامه و تسویه حساب</Link>
              </Button>
            </SheetClose>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
