"use client";

import * as React from "react";
import type { SazitoClient } from "@sazito/client-sdk";
import {
  Inbox,
  LoaderCircle,
  Minus,
  Plus,
  ReceiptText,
  RefreshCcw,
  WalletCards,
} from "lucide-react";

import { useAccount } from "@/components/account/account-provider";
import { AccountGate, AccountShell } from "@/components/account/account-shell";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { accountErrorMessage } from "@/lib/sazito/account";
import { formatPersianDate, formatPrice } from "@/lib/sazito/presenters";
import {
  formatWalletAmount,
  walletAmountKind,
  walletTransactionLabel,
} from "@/lib/sazito/wallet";
import { cn } from "@/lib/utils";

type WalletResponse = Awaited<
  ReturnType<SazitoClient["wallet"]["getBalance"]>
>;
type WalletData = NonNullable<WalletResponse["data"]>;
type TransactionsResponse = Awaited<
  ReturnType<SazitoClient["wallet"]["listTransactions"]>
>;
type TransactionsData = NonNullable<TransactionsResponse["data"]>;
type WalletTransaction = TransactionsData["transactions"][number];

const PAGE_SIZE = 10;

function WalletContents() {
  const { client } = useCommerce();
  const { logout } = useAccount();
  const [wallet, setWallet] = React.useState<WalletData | null>(null);
  const [transactions, setTransactions] = React.useState<WalletTransaction[]>(
    [],
  );
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadWallet = React.useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const [balanceResponse, transactionsResponse] = await Promise.all([
          client.wallet.getBalance({ cache: false, signal }),
          client.wallet.listTransactions(
            { pageNumber: 1, pageSize: PAGE_SIZE },
            { cache: false, signal },
          ),
        ]);

        if (signal?.aborted) return;

        const responseError =
          balanceResponse.error ?? transactionsResponse.error;

        if (responseError?.status === 401 || responseError?.status === 403) {
          logout();
          return;
        }

        if (balanceResponse.error || !balanceResponse.data) {
          setError(
            balanceResponse.error
              ? accountErrorMessage(
                  balanceResponse.error,
                  "اطلاعات کیف پول از فروشگاه دریافت نشد.",
                )
              : "اطلاعات کیف پول از فروشگاه دریافت نشد.",
          );
          return;
        }

        setWallet(balanceResponse.data);

        if (transactionsResponse.error || !transactionsResponse.data) {
          setTransactions([]);
          setHasMore(false);
          setError(
            transactionsResponse.error
              ? accountErrorMessage(
                  transactionsResponse.error,
                  "گردش اعتبار از فروشگاه دریافت نشد.",
                )
              : "گردش اعتبار از فروشگاه دریافت نشد.",
          );
          return;
        }

        const transactionData = transactionsResponse.data;
        setTransactions(transactionData.transactions);
        setPage(transactionData.pageNumber ?? 1);
        setHasMore(
          typeof transactionData.totalCount === "number"
            ? transactionData.transactions.length < transactionData.totalCount
            : transactionData.transactions.length === PAGE_SIZE,
        );
      } catch {
        if (!signal?.aborted) {
          setError("ارتباط با فروشگاه برقرار نشد. دوباره تلاش کنید.");
        }
      } finally {
        if (!signal?.aborted) setIsLoading(false);
      }
    },
    [client, logout],
  );

  const loadMore = React.useCallback(async () => {
    setIsLoadingMore(true);
    setError(null);

    try {
      const response = await client.wallet.listTransactions(
        { pageNumber: page + 1, pageSize: PAGE_SIZE },
        { cache: false },
      );

      if (response.error?.status === 401 || response.error?.status === 403) {
        logout();
        return;
      }

      if (response.error || !response.data) {
        setError(
          response.error
            ? accountErrorMessage(
                response.error,
                "تراکنش‌های بیشتر دریافت نشد.",
              )
            : "تراکنش‌های بیشتر دریافت نشد.",
        );
        return;
      }

      const nextTransactions = response.data.transactions;
      const nextLength = transactions.length + nextTransactions.length;
      setTransactions((current) => [...current, ...nextTransactions]);
      setPage(response.data.pageNumber ?? page + 1);
      setHasMore(
        typeof response.data.totalCount === "number"
          ? nextLength < response.data.totalCount
          : nextTransactions.length === PAGE_SIZE,
      );
    } catch {
      setError("تراکنش‌های بیشتر دریافت نشد. دوباره تلاش کنید.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [client, logout, page, transactions.length]);

  React.useEffect(() => {
    const controller = new AbortController();
    const frame = window.requestAnimationFrame(() => {
      void loadWallet(controller.signal);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      controller.abort();
    };
  }, [loadWallet]);

  if (isLoading) {
    return (
      <div
        className="flex min-h-64 items-center justify-center gap-3 rounded-4xl border bg-card text-sm text-muted-foreground"
        role="status"
      >
        <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" />
        در حال دریافت کیف پول…
      </div>
    );
  }

  if (!wallet && error) {
    return (
      <div className="rounded-4xl border border-danger/25 bg-card p-8 text-center">
        <p role="alert" className="text-sm leading-7 text-danger">
          {error}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-5"
          onClick={() => void loadWallet()}
        >
          <RefreshCcw />
          تلاش دوباره
        </Button>
      </div>
    );
  }

  if (!wallet) return null;

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-primary/20 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_14%,var(--card)),var(--card)_58%)]">
        <CardContent className="relative p-6 sm:p-8">
          <span
            className="absolute -left-12 -top-16 size-48 rounded-full bg-primary/8 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge variant="secondary" className="gap-2">
                <WalletCards className="size-4" />
                کیف پول من
              </Badge>
              <p className="mt-6 text-sm text-muted-foreground">
                موجودی قابل استفاده
              </p>
              <p className="mt-2 text-3xl font-black text-primary sm:text-4xl">
                {formatPrice(wallet.balance)}
              </p>
            </div>
            <div className="rounded-2xl border border-primary/10 bg-card/70 px-4 py-3 text-xs leading-6 text-muted-foreground backdrop-blur-sm">
              {wallet.enabled
                ? "کیف پول فروشگاه فعال است."
                : "کیف پول برای این فروشگاه غیرفعال است."}
              <br />
              مبالغ مستقیماً از سازیتو دریافت می‌شوند.
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle>گردش اعتبار</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              افزایش و مصرف اعتبار حساب شما
            </p>
          </div>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
            <ReceiptText className="size-5" />
          </span>
        </CardHeader>
        <CardContent>
          {!transactions.length ? (
            <div className="flex min-h-52 flex-col items-center justify-center text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
                <Inbox className="size-6" />
              </span>
              <p className="mt-4 font-black">هنوز تراکنشی ثبت نشده است</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                پس از افزایش یا استفاده از اعتبار، جزئیات آن اینجا نمایش داده
                می‌شود.
              </p>
            </div>
          ) : (
            <ul aria-label="تراکنش‌های کیف پول">
              {transactions.map((transaction, index) => {
                const amountKind = walletAmountKind(transaction.amount);
                const AmountIcon = amountKind === "debit" ? Minus : Plus;

                return (
                  <React.Fragment key={transaction.id}>
                    {index > 0 ? <Separator /> : null}
                    <li className="flex items-center gap-3 py-4 sm:gap-4">
                      <span
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-2xl",
                          amountKind === "credit" &&
                            "bg-primary/10 text-primary",
                          amountKind === "debit" &&
                            "bg-danger/10 text-danger",
                          amountKind === "neutral" &&
                            "bg-muted text-muted-foreground",
                        )}
                      >
                        <AmountIcon className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold">
                          {walletTransactionLabel(transaction.reason)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatPersianDate(transaction.createdAt) ||
                            "تاریخ نامشخص"}
                        </p>
                      </div>
                      <p
                        className={cn(
                          "shrink-0 text-sm font-black sm:text-base",
                          amountKind === "credit" && "text-primary",
                          amountKind === "debit" && "text-danger",
                          amountKind === "neutral" &&
                            "text-muted-foreground",
                        )}
                        dir="ltr"
                      >
                        {formatWalletAmount(transaction.amount)}
                      </p>
                    </li>
                  </React.Fragment>
                );
              })}
            </ul>
          )}

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-2xl bg-danger/10 px-4 py-3 text-center text-sm leading-7 text-danger"
            >
              {error}
            </p>
          ) : null}

          {hasMore ? (
            <div className="mt-5 text-center">
              <Button
                type="button"
                variant="outline"
                disabled={isLoadingMore}
                onClick={() => void loadMore()}
              >
                {isLoadingMore ? (
                  <LoaderCircle className="animate-spin motion-reduce:animate-none" />
                ) : null}
                نمایش تراکنش‌های بیشتر
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export function WalletPage() {
  return (
    <AccountGate>
      <AccountShell
        title="کیف پول من"
        description="موجودی و گردش اعتبار حساب سازیتوی شما"
      >
        <WalletContents />
      </AccountShell>
    </AccountGate>
  );
}
