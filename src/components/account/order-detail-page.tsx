"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Box,
  CheckCircle2,
  LoaderCircle,
  RefreshCcw,
  ShoppingBag,
} from "lucide-react";
import type { Order } from "@sazito/client-sdk";

import { useAccount } from "@/components/account/account-provider";
import { AccountShell } from "@/components/account/account-shell";
import { OrderReviewPanel } from "@/components/account/order-review-panel";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { StoreLink } from "@/components/store/store-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  accountErrorMessage,
  orderItems,
  orderTotal,
} from "@/lib/sazito/account";
import {
  formatNumber,
  formatPrice,
  normalizeStoreHref,
} from "@/lib/sazito/presenters";

interface OrderDetailProps {
  orderId: number;
  orderIdentifier: string;
}

function OrderDetail({ orderId, orderIdentifier }: OrderDetailProps) {
  const { client } = useCommerce();
  const { status } = useAccount();
  const backHref = status === "authenticated" ? "/account/orders" : "/";
  const backLabel = status === "authenticated" ? "بازگشت به سفارش‌ها" : "بازگشت به فروشگاه";
  const [order, setOrder] = React.useState<Order | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadOrder = React.useCallback(
    async (signal?: AbortSignal) => {
      if (!Number.isSafeInteger(orderId) || orderId <= 0 || !orderIdentifier.trim()) {
        setError("لینک سفارش معتبر نیست. از لینک کامل جزئیات سفارش استفاده کنید.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await client.orders.get(orderId, orderIdentifier, {
          cache: false,
          signal,
        });

        if (signal?.aborted) return;

        if (response.error || !response.data) {
          setError(
            response.error?.status === 401 || response.error?.status === 403 || response.error?.status === 404
              ? "سفارش پیدا نشد یا لینک دسترسی معتبر نیست."
              : response.error
              ? accountErrorMessage(
                  response.error,
                  "جزئیات سفارش از فروشگاه دریافت نشد.",
                )
              : "جزئیات سفارش از فروشگاه دریافت نشد.",
          );
          return;
        }

        setOrder(response.data);
      } catch {
        if (!signal?.aborted) {
          setError("ارتباط با فروشگاه برقرار نشد. دوباره تلاش کنید.");
        }
      } finally {
        if (!signal?.aborted) setIsLoading(false);
      }
    },
    [client, orderId, orderIdentifier],
  );

  React.useEffect(() => {
    const controller = new AbortController();
    const frame = window.requestAnimationFrame(() => {
      void loadOrder(controller.signal);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      controller.abort();
    };
  }, [loadOrder]);

  if (isLoading) {
    return (
      <div className="grid gap-4" role="status" aria-label="در حال دریافت جزئیات سفارش">
        <div className="h-36 animate-pulse rounded-4xl border bg-card" />
        <div className="h-72 animate-pulse rounded-4xl border bg-card" />
        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" />
          در حال دریافت جزئیات سفارش…
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-4xl border border-danger/25 bg-card p-8 text-center">
        <p role="alert" className="text-sm leading-7 text-danger">
          {error || "سفارش پیدا نشد."}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={() => void loadOrder()}>
            <RefreshCcw />
            تلاش دوباره
          </Button>
          <Button asChild variant="outline">
            <Link href={backHref}>{backLabel}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const items = orderItems(order);
  const invoice = order.invoice;
  const itemTotal = orderTotal(order);
  const finalTotal = typeof invoice.finalTotal === "number" ? invoice.finalTotal : itemTotal;
  const discountTotal = typeof invoice.discountTotal === "number" ? invoice.discountTotal : 0;
  const shippingTotal = typeof invoice.shippingTotal === "number" ? invoice.shippingTotal : 0;
  const vat = typeof invoice.vat === "number" ? invoice.vat : 0;

  return (
    <div className="grid gap-4">
      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-card via-card to-secondary/40">
        <CardContent className="relative grid gap-4 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_10rem] md:items-center">
          <div className="absolute -left-10 -top-12 size-28 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="gap-1.5 bg-primary/10 text-primary hover:bg-primary/10">
                <CheckCircle2 className="size-3.5" />
                سفارش ثبت‌شده
              </Badge>
              <span className="text-xs font-bold text-muted-foreground">جزئیات خرید</span>
            </div>
            <CardTitle className="mt-3 text-xl leading-tight sm:text-2xl">
              سفارش شماره <span className="text-primary">{order.orderNumber || formatNumber(order.id)}</span>
            </CardTitle>
            <p className="mt-2 max-w-xl text-xs leading-6 text-muted-foreground sm:text-sm">
              اقلام سفارش، وضعیت و خلاصه پرداخت را در این بخش مشاهده می‌کنید.
            </p>
          </div>
          <div className="relative hidden h-20 items-center justify-center overflow-hidden rounded-2xl border border-primary/15 bg-primary/5 md:flex">
            <div className="absolute size-16 rounded-full bg-primary/10 blur-xl" />
            <span className="relative flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <ShoppingBag className="size-6" />
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3 border-b border-border/70 px-4 py-4 sm:px-5">
            <div>
              <CardTitle className="text-base">اقلام سفارش</CardTitle>
              <p className="mt-1 text-[0.6875rem] text-muted-foreground">محصولات انتخاب‌شده برای این سفارش</p>
            </div>
            <ShoppingBag className="size-4 text-primary" />
          </CardHeader>
          <CardContent className="p-0">
            {items.length ? items.map((item, index) => {
              const target = item.url ? normalizeStoreHref(item.url) : { href: "/", external: false };
              return (
                <div key={item.id} className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5 ${index ? "border-t border-border/70" : ""}`}>
                  <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-secondary text-primary">
                    {item.image?.url ? (
                      <Image src={item.image.url} alt={item.name || "محصول سفارش"} fill sizes="64px" className="object-cover" />
                    ) : <Box className="size-6" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <StoreLink item={{ ...target, label: item.name || "محصول سفارش" }} className="font-black outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring" />
                    <p className="mt-1 text-xs text-muted-foreground">{formatNumber(item.quantity)} عدد × {formatPrice(item.unitPrice)}</p>
                    {item.attributes.length ? <p className="mt-1 text-[0.6875rem] leading-5 text-muted-foreground">{item.attributes.map((attribute) => { const value = typeof attribute.value === "string" ? attribute.value : attribute.value.value; return `${attribute.name}: ${value}`; }).join("، ")}</p> : null}
                  </div>
                  <strong className="shrink-0 text-sm">{formatPrice(item.lineTotal)}</strong>
                </div>
              );
            }) : <p className="p-8 text-center text-sm text-muted-foreground">برای این سفارش کالایی ثبت نشده است.</p>}
          </CardContent>
        </Card>

        <Card className="lg:sticky lg:top-24">
          <CardHeader className="px-4 pb-2 pt-4"><CardTitle className="text-base">خلاصه پرداخت</CardTitle></CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            <div className="flex justify-between gap-4 text-sm"><span className="text-muted-foreground">جمع اقلام</span><span>{formatPrice(itemTotal)}</span></div>
            {discountTotal > 0 ? <div className="flex justify-between gap-4 text-sm text-primary"><span>تخفیف</span><span>- {formatPrice(discountTotal)}</span></div> : null}
            {shippingTotal > 0 ? <div className="flex justify-between gap-4 text-sm"><span className="text-muted-foreground">هزینه ارسال</span><span>{formatPrice(shippingTotal)}</span></div> : null}
            {vat > 0 ? <div className="flex justify-between gap-4 text-sm"><span className="text-muted-foreground">مالیات</span><span>{formatPrice(vat)}</span></div> : null}
            <Separator />
            <div className="flex items-end justify-between gap-4"><span className="text-sm font-bold">مبلغ نهایی</span><span className="text-lg font-black text-primary">{formatPrice(finalTotal)}</span></div>
          </CardContent>
        </Card>
      </div>

      {status === "authenticated" ? <OrderReviewPanel order={order} /> : null}

      <Link
        href={backHref}
        className="inline-flex w-fit items-center gap-2 rounded-xl text-sm font-bold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowRight className="size-4" />
        {backLabel}
      </Link>
    </div>
  );
}

export function OrderDetailPage(props: OrderDetailProps) {
  const { status } = useAccount();

  if (status === "authenticated") {
    return (
      <AccountShell
        title="جزئیات سفارش"
        description="اقلام ثبت‌شده در این سفارش سازیتو"
      >
        <OrderDetail {...props} />
      </AccountShell>
    );
  }

  return (
    <section>
      <h1 className="mb-6 text-2xl font-black sm:text-3xl">جزئیات سفارش</h1>
      <OrderDetail {...props} />
    </section>
  );
}
