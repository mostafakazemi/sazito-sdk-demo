"use client";

import * as React from "react";
import { Inbox, LoaderCircle, RefreshCcw } from "lucide-react";
import type { Order } from "@sazito/client-sdk";

import { useAccount } from "@/components/account/account-provider";
import { AccountGate, AccountShell } from "@/components/account/account-shell";
import { OrderCard } from "@/components/account/order-card";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { Button } from "@/components/ui/button";
import { accountErrorMessage } from "@/lib/sazito/account";

function OrdersList() {
  const { client } = useCommerce();
  const { logout } = useAccount();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [page, setPage] = React.useState(0);
  const [totalCount, setTotalCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadPage = React.useCallback(
    async (nextPage: number, append: boolean, signal?: AbortSignal) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await client.orders.list(
          { pageNumber: nextPage, pageSize: 10 },
          { cache: false, signal },
        );

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
                  "سفارش‌ها از فروشگاه دریافت نشد.",
                )
              : "سفارش‌ها از فروشگاه دریافت نشد.",
          );
          return;
        }

        const data = response.data;
        setOrders((current) =>
          append ? [...current, ...data.orders] : data.orders,
        );
        setPage(data.pageNumber ?? nextPage);
        setTotalCount(data.totalCount ?? data.orders.length);
      } catch {
        if (!signal?.aborted) {
          setError("ارتباط با فروشگاه برقرار نشد. دوباره تلاش کنید.");
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [client, logout],
  );

  React.useEffect(() => {
    const controller = new AbortController();
    const frame = window.requestAnimationFrame(() => {
      void loadPage(1, false, controller.signal);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      controller.abort();
    };
  }, [loadPage]);

  if (isLoading) {
    return (
      <div
        className="flex min-h-64 items-center justify-center gap-3 rounded-4xl border bg-card text-sm text-muted-foreground"
        role="status"
      >
        <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" />
        در حال دریافت سفارش‌ها…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-4xl border border-danger/25 bg-card p-8 text-center">
        <p role="alert" className="text-sm leading-7 text-danger">
          {error}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-5"
          onClick={() => void loadPage(1, false)}
        >
          <RefreshCcw />
          تلاش دوباره
        </Button>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-4xl border bg-card p-8 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary">
          <Inbox className="size-7" />
        </span>
        <p className="mt-5 font-black">هنوز سفارشی ثبت نشده است</p>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          پس از تکمیل خرید، سفارش شما در این بخش نمایش داده می‌شود.
        </p>
      </div>
    );
  }

  const hasMore = orders.length < totalCount;

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-2">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
      {hasMore ? (
        <div className="mt-6 text-center">
          <Button
            type="button"
            variant="outline"
            disabled={isLoadingMore}
            onClick={() => void loadPage(page + 1, true)}
          >
            {isLoadingMore ? (
              <LoaderCircle className="animate-spin motion-reduce:animate-none" />
            ) : null}
            نمایش سفارش‌های بیشتر
          </Button>
        </div>
      ) : null}
    </>
  );
}

export function OrdersPage() {
  return (
    <AccountGate>
      <AccountShell
        title="سفارش‌های من"
        description="فهرست سفارش‌های ثبت‌شده در حساب سازیتوی شما"
      >
        <OrdersList />
      </AccountShell>
    </AccountGate>
  );
}
