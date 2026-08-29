"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  Box,
  LoaderCircle,
  PackageOpen,
  RefreshCcw,
} from "lucide-react";
import type { Order } from "@sazito/client-sdk";

import { useAccount } from "@/components/account/account-provider";
import { AccountGate, AccountShell } from "@/components/account/account-shell";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { StoreLink } from "@/components/store/store-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  accountErrorMessage,
  orderItemCount,
  orderItems,
  orderTotal,
} from "@/lib/sazito/account";
import {
  formatPrice,
  normalizeStoreHref,
} from "@/lib/sazito/presenters";

function OrderDetail() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);
  const { client } = useCommerce();
  const { logout } = useAccount();
  const [order, setOrder] = React.useState<Order | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadOrder = React.useCallback(
    async (signal?: AbortSignal) => {
      if (!Number.isInteger(orderId) || orderId <= 0) {
        setError("شناسه سفارش معتبر نیست.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await client.orders.get(orderId, {
          cache: false,
          signal,
        });

        if (signal?.aborted) return;

        if (response.error || !response.data) {
          if (
            response.error?.status === 401 ||
            response.error?.status === 403
          ) {
            logout();
            return;
          }

          setError(
            response.error
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
    [client, logout, orderId],
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
      <div className="flex min-h-64 items-center justify-center gap-3 rounded-4xl border bg-card text-sm text-muted-foreground">
        <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" />
        در حال دریافت جزئیات سفارش…
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
            <Link href="/account/orders">بازگشت به سفارش‌ها</Link>
          </Button>
        </div>
      </div>
    );
  }

  const items = orderItems(order);

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-4">
          <div>
            <Badge variant="secondary">
              <PackageOpen className="size-3.5" />
              {orderItemCount(order).toLocaleString("fa-IR")} کالا
            </Badge>
            <CardTitle className="mt-3 text-xl">
              سفارش شماره {order.orderNumber || order.id.toLocaleString("fa-IR")}
            </CardTitle>
          </div>
          <div className="text-left">
            <p className="text-xs text-muted-foreground">جمع اقلام</p>
            <p className="mt-1 text-xl font-black text-primary">
              {formatPrice(orderTotal(order))}
            </p>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-3">
        {items.map((item) => {
          const target = item.url
            ? normalizeStoreHref(item.url)
            : { href: "/", external: false };

          return (
            <Card key={item.id}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <Box className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <StoreLink
                    item={{
                      ...target,
                      label: item.name || "محصول سفارش",
                    }}
                    className="font-black outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.quantity.toLocaleString("fa-IR")} عدد ×{" "}
                    {formatPrice(item.unitPrice)}
                  </p>
                  {item.attributes.length ? (
                    <p className="mt-2 text-xs leading-6 text-muted-foreground">
                      {item.attributes
                        .map((attribute) => {
                          const value =
                            typeof attribute.value === "string"
                              ? attribute.value
                              : attribute.value.value;
                          return `${attribute.name}: ${value}`;
                        })
                        .join("، ")}
                    </p>
                  ) : null}
                </div>
                <strong className="shrink-0">{formatPrice(item.lineTotal)}</strong>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Link
        href="/account/orders"
        className="inline-flex w-fit items-center gap-2 rounded-xl text-sm font-bold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowRight className="size-4" />
        بازگشت به سفارش‌ها
      </Link>
    </div>
  );
}

export function OrderDetailPage() {
  return (
    <AccountGate>
      <AccountShell
        title="جزئیات سفارش"
        description="اقلام ثبت‌شده در این سفارش سازیتو"
      >
        <OrderDetail />
      </AccountShell>
    </AccountGate>
  );
}
