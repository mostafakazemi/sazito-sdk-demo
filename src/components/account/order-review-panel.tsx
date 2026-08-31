"use client";

import * as React from "react";
import type { Order } from "@sazito/client-sdk";
import {
  CheckCircle2,
  LoaderCircle,
  MessageSquareText,
  RefreshCcw,
  Send,
  Star,
} from "lucide-react";

import { useAccount } from "@/components/account/account-provider";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  isSazitoAuthenticationError,
  sazitoConnectionErrorMessage,
  sazitoErrorMessage,
} from "@/lib/sazito/error";
import {
  buildProductReviewInput,
  emptyProductReviewDraft,
  feedbackItemKey,
  hasProductReviewContent,
  readPendingOrderReview,
  validateOrderReview,
  type FeedbackSeed,
  type PendingOrderReview,
  type ProductReviewDraft,
} from "@/lib/sazito/review";
import { cn } from "@/lib/utils";

type ReviewPhase = "idle" | "loading" | "ready" | "complete";

const inputClassName =
  "w-full rounded-2xl border border-border/80 bg-background px-4 py-3 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-60";

function StarRating({
  value,
  onChange,
  label,
  disabled = false,
}: {
  value: number;
  onChange(value: number): void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1" role="radiogroup" aria-label={label}>
      {Array.from({ length: 5 }, (_, index) => index + 1).map((rating) => (
        <button
          key={rating}
          type="button"
          role="radio"
          aria-checked={value === rating}
          aria-label={`${rating.toLocaleString("fa-IR")} از ۵ ستاره`}
          disabled={disabled}
          className="flex size-10 items-center justify-center rounded-xl text-border outline-none transition-[color,background-color,transform] hover:scale-105 hover:bg-accent hover:text-highlight focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60 motion-reduce:transform-none"
          onClick={() => onChange(rating)}
        >
          <Star
            className={cn(
              "size-6",
              rating <= value && "fill-highlight text-highlight",
            )}
          />
        </button>
      ))}
      <span className="mr-2 text-xs text-muted-foreground" aria-live="polite">
        {value ? `${value.toLocaleString("fa-IR")} از ۵` : "انتخاب نشده"}
      </span>
    </div>
  );
}

function savePendingReview(key: string, pending: PendingOrderReview) {
  window.sessionStorage.setItem(key, JSON.stringify(pending));
}

export function OrderReviewPanel({ order }: { order: Order }) {
  const { client } = useCommerce();
  const { logout } = useAccount();
  const [phase, setPhase] = React.useState<ReviewPhase>("idle");
  const [seed, setSeed] = React.useState<FeedbackSeed | null>(null);
  const [orderRate, setOrderRate] = React.useState(0);
  const [drafts, setDrafts] = React.useState<Record<string, ProductReviewDraft>>(
    {},
  );
  const [pending, setPending] = React.useState<PendingOrderReview | null>(null);
  const [orderError, setOrderError] = React.useState<string | undefined>();
  const [productErrors, setProductErrors] = React.useState<
    Record<string, string>
  >({});
  const [message, setMessage] = React.useState<string | null>(null);
  const [isSubmitting, startSubmitting] = React.useTransition();
  const storageKey = `sazito-order-review:${order.orderIdentifier}`;

  const loadSeed = React.useCallback(async () => {
    if (!order.orderIdentifier?.trim()) {
      setMessage("شناسه بازخورد این سفارش از فروشگاه دریافت نشد.");
      return;
    }

    setPhase("loading");
    setMessage(null);

    console.log(order)

    try {
      const response = await client.feedbacks.getSeed(order.orderIdentifier, {
        cache: false,
      });

      if (response.error || !response.data) {
        if (isSazitoAuthenticationError(response.error)) {
          logout();
          return;
        }

        setPhase("idle");
        setMessage(
          response.error
            ? sazitoErrorMessage(
                response.error,
                "امکان ثبت تجربه برای این سفارش بررسی نشد.",
              )
            : "اطلاعات ثبت تجربه از فروشگاه دریافت نشد.",
        );
        return;
      }

      const savedPending = readPendingOrderReview(
        window.sessionStorage.getItem(storageKey),
      );

      if (response.data.hasCommentAlready && !savedPending) {
        setPhase("complete");
        return;
      }

      setSeed(response.data);
      setPending(savedPending);
      setDrafts(
        Object.fromEntries(
          response.data.items.map((item, index) => [
            feedbackItemKey(item, index),
            emptyProductReviewDraft(),
          ]),
        ),
      );
      setPhase("ready");
    } catch {
      setPhase("idle");
      setMessage(sazitoConnectionErrorMessage());
    }
  }, [client, logout, order.orderIdentifier, storageKey]);

  const updateDraft = React.useCallback(
    (key: string, patch: Partial<ProductReviewDraft>) => {
      setDrafts((current) => ({
        ...current,
        [key]: { ...(current[key] ?? emptyProductReviewDraft()), ...patch },
      }));
      setProductErrors((current) => ({ ...current, [key]: "" }));
      setMessage(null);
    },
    [],
  );

  const submit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!seed) return;

    const entries = seed.items.map((item, index) => {
      const key = feedbackItemKey(item, index);
      return { key, item, draft: drafts[key] ?? emptyProductReviewDraft() };
    });
    const validation = validateOrderReview(
      pending ? 5 : orderRate,
      entries.map(({ key, draft }) => ({ key, draft })),
    );

    setOrderError(validation.orderError);
    setProductErrors(validation.productErrors);
    setMessage(null);

    if (
      validation.orderError ||
      Object.keys(validation.productErrors).length
    ) {
      return;
    }

    startSubmitting(async () => {
      let currentPending = pending;

      try {
        if (!currentPending) {
          const ratingResponse = await client.feedbacks.createOrderRating(
            {
              orderId: seed.orderId,
              orderIdentifier: seed.orderIdentifier,
              orderRate,
            },
            { cache: false },
          );

          if (ratingResponse.error || !ratingResponse.data?.id) {
            if (isSazitoAuthenticationError(ratingResponse.error)) {
              logout();
              return;
            }

            setMessage(
              ratingResponse.error
                ? sazitoErrorMessage(
                    ratingResponse.error,
                    "ثبت امتیاز سفارش انجام نشد.",
                  )
                : "شناسه امتیاز ثبت‌شده از فروشگاه دریافت نشد.",
            );
            return;
          }

          currentPending = {
            commentId: ratingResponse.data.id,
            submittedItemKeys: [],
          };
          setPending(currentPending);
          savePendingReview(storageKey, currentPending);
        }

        const submittedKeys = new Set(currentPending.submittedItemKeys);
        const activeEntries = entries.filter(
          ({ key, draft }) =>
            hasProductReviewContent(draft) && !submittedKeys.has(key),
        );

        for (const { key, item, draft } of activeEntries) {
          const response = await client.feedbacks.submitProductReview(
            buildProductReviewInput(item, currentPending.commentId, draft),
            { cache: false },
          );

          if (response.error) {
            if (isSazitoAuthenticationError(response.error)) {
              logout();
              return;
            }

            setMessage(
              sazitoErrorMessage(
                response.error,
                `امتیاز سفارش ذخیره شد، اما تجربه «${item.productName}» ارسال نشد. دوباره تلاش کنید.`,
              ),
            );
            return;
          }

          submittedKeys.add(key);
          currentPending = {
            ...currentPending,
            submittedItemKeys: [...submittedKeys],
          };
          setPending(currentPending);
          savePendingReview(storageKey, currentPending);
        }

        window.sessionStorage.removeItem(storageKey);
        setPending(null);
        setPhase("complete");
      } catch {
        setMessage(sazitoConnectionErrorMessage());
      }
    });
  };

  if (phase === "complete") {
    return (
      <Card className="border-primary/20 bg-secondary/45">
        <CardContent className="flex items-center gap-4 p-6">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <CheckCircle2 className="size-6" />
          </span>
          <div>
            <p className="font-black">تجربه این سفارش ثبت شده است</p>
            <p className="mt-1 text-sm leading-7 text-muted-foreground">
              از زمانی که برای ثبت امتیاز و دیدگاه گذاشتید سپاسگزاریم.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (phase === "idle" || phase === "loading") {
    return (
      <Card>
        <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareText className="size-5 text-primary" />
              تجربه خرید شما
            </CardTitle>
            <CardDescription className="mt-2 leading-7">
              به سفارش و محصولاتی که خریده‌اید امتیاز دهید.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={phase === "loading"}
            onClick={() => void loadSeed()}
          >
            {phase === "loading" ? (
              <LoaderCircle className="animate-spin motion-reduce:animate-none" />
            ) : message ? (
              <RefreshCcw />
            ) : (
              <MessageSquareText />
            )}
            {message ? "تلاش دوباره" : "ثبت تجربه خرید"}
          </Button>
        </CardHeader>
        {message ? (
          <CardContent>
            <p role="alert" className="rounded-2xl bg-danger/10 p-3 text-sm text-danger">
              {message}
            </p>
          </CardContent>
        ) : null}
      </Card>
    );
  }

  if (!seed) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquareText className="size-5 text-primary" />
          ثبت تجربه خرید
        </CardTitle>
        <CardDescription className="leading-7">
          امتیاز کلی سفارش الزامی است؛ ثبت دیدگاه برای هر محصول اختیاری است.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6" onSubmit={submit} noValidate>
          <fieldset className="grid gap-6" disabled={isSubmitting}>
            <section className="rounded-3xl bg-secondary/60 p-5" aria-labelledby="order-rating-title">
              <h3 id="order-rating-title" className="font-black">
                امتیاز کلی به سفارش
              </h3>
              {pending ? (
                <p className="mt-3 flex items-center gap-2 text-sm text-primary">
                  <CheckCircle2 className="size-4" />
                  امتیاز سفارش ذخیره شده؛ ارسال دیدگاه‌های باقی‌مانده را ادامه دهید.
                </p>
              ) : (
                <div className="mt-3">
                  <StarRating
                    label="امتیاز کلی سفارش"
                    value={orderRate}
                    onChange={(value) => {
                      setOrderRate(value);
                      setOrderError(undefined);
                    }}
                    disabled={isSubmitting}
                  />
                  {orderError ? (
                    <p role="alert" className="mt-2 text-xs text-danger">
                      {orderError}
                    </p>
                  ) : null}
                </div>
              )}
            </section>

            {seed.items.length ? (
              <section aria-labelledby="product-reviews-title">
                <h3 id="product-reviews-title" className="font-black">
                  دیدگاه محصولات
                </h3>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  فقط محصولاتی را که می‌خواهید درباره‌شان بنویسید باز کنید.
                </p>
                <div className="mt-4 grid gap-3">
                  {seed.items.map((item, index) => {
                    const key = feedbackItemKey(item, index);
                    const draft = drafts[key] ?? emptyProductReviewDraft();
                    const alreadySubmitted =
                      pending?.submittedItemKeys.includes(key) ?? false;

                    return (
                      <details
                        key={key}
                        className="group rounded-3xl border bg-background/65 open:bg-card"
                      >
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-3xl p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                          <span className="min-w-0">
                            <strong className="block truncate text-sm">
                              {item.productName || "محصول سفارش"}
                            </strong>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              ثبت دیدگاه اختیاری
                            </span>
                          </span>
                          {alreadySubmitted ? (
                            <Badge variant="secondary">
                              <CheckCircle2 /> ارسال شد
                            </Badge>
                          ) : (
                            <span className="text-xs font-bold text-primary group-open:hidden">
                              باز کردن
                            </span>
                          )}
                        </summary>

                        {alreadySubmitted ? (
                          <p className="border-t px-4 py-5 text-sm text-primary">
                            دیدگاه این محصول با موفقیت ارسال شده است.
                          </p>
                        ) : (
                          <div className="grid gap-5 border-t p-4 sm:p-5">
                            <div>
                              <p className="mb-2 text-sm font-bold">امتیاز محصول</p>
                              <StarRating
                                label={`امتیاز ${item.productName}`}
                                value={draft.productRate}
                                onChange={(value) =>
                                  updateDraft(key, { productRate: value })
                                }
                                disabled={isSubmitting}
                              />
                            </div>

                            <label className="grid gap-2 text-sm font-bold">
                              تجربه شما
                              <textarea
                                value={draft.text}
                                className={`${inputClassName} min-h-28 resize-y leading-7`}
                                placeholder="تجربه استفاده از این محصول را بنویسید…"
                                onChange={(event) =>
                                  updateDraft(key, { text: event.target.value })
                                }
                              />
                            </label>

                            <div className="grid gap-5 sm:grid-cols-2">
                              <label className="grid gap-2 text-sm font-bold">
                                نکات مثبت
                                <textarea
                                  value={draft.pros}
                                  className={`${inputClassName} min-h-24 resize-y leading-7`}
                                  placeholder="هر مورد در یک خط"
                                  onChange={(event) =>
                                    updateDraft(key, { pros: event.target.value })
                                  }
                                />
                              </label>
                              <label className="grid gap-2 text-sm font-bold">
                                نکات منفی
                                <textarea
                                  value={draft.cons}
                                  className={`${inputClassName} min-h-24 resize-y leading-7`}
                                  placeholder="هر مورد در یک خط"
                                  onChange={(event) =>
                                    updateDraft(key, { cons: event.target.value })
                                  }
                                />
                              </label>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2 sm:items-end">
                              <label className="grid gap-2 text-sm font-bold">
                                پیشنهاد به دیگران
                                <select
                                  value={draft.recommendationStatus}
                                  className={`${inputClassName} h-12 py-0`}
                                  onChange={(event) =>
                                    updateDraft(key, {
                                      recommendationStatus: event.target
                                        .value as ProductReviewDraft["recommendationStatus"],
                                    })
                                  }
                                >
                                  <option value="NONE">بدون نظر</option>
                                  <option value="RECOMMENDED">پیشنهاد می‌کنم</option>
                                  <option value="NEUTRAL">نظری ندارم</option>
                                  <option value="NOT-RECOMMENDED">
                                    پیشنهاد نمی‌کنم
                                  </option>
                                </select>
                              </label>
                              <label className="flex h-12 cursor-pointer items-center justify-between gap-4 rounded-2xl border bg-background px-4 text-sm font-bold">
                                نمایش دیدگاه به‌صورت ناشناس
                                <input
                                  type="checkbox"
                                  checked={draft.isAnonymous}
                                  className="size-5 accent-primary"
                                  onChange={(event) =>
                                    updateDraft(key, {
                                      isAnonymous: event.target.checked,
                                    })
                                  }
                                />
                              </label>
                            </div>

                            {productErrors[key] ? (
                              <p role="alert" className="text-xs text-danger">
                                {productErrors[key]}
                              </p>
                            ) : null}
                          </div>
                        )}
                      </details>
                    );
                  })}
                </div>
              </section>
            ) : null}
          </fieldset>

          {message ? (
            <p role="alert" className="rounded-2xl bg-danger/10 p-4 text-sm leading-7 text-danger">
              {message}
            </p>
          ) : null}

          <Button type="submit" size="lg" className="sm:w-fit" disabled={isSubmitting}>
            {isSubmitting ? (
              <LoaderCircle className="animate-spin motion-reduce:animate-none" />
            ) : (
              <Send />
            )}
            ارسال تجربه
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
