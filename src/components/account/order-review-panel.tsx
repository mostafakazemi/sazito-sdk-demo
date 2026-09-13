"use client";

import * as React from "react";
import type { Order } from "@sazito/client-sdk";
import {
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  MessageSquareText,
  Paperclip,
  RefreshCcw,
  Send,
  Star,
  Trash2,
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
  MAX_REVIEW_IMAGES,
  readPendingOrderReview,
  validateReviewImageSelection,
  type FeedbackSeed,
  type PendingOrderReview,
  type ProductReviewDraft,
} from "@/lib/sazito/review";
import { cn } from "@/lib/utils";

type ReviewPhase = "idle" | "loading" | "ready" | "complete";
type ReviewStep = "order" | "product";

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
  const [step, setStep] = React.useState<ReviewStep>("order");
  const [activeProductIndex, setActiveProductIndex] = React.useState(0);
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
      const firstPendingProductIndex = response.data.items.findIndex(
        (item, index) =>
          !savedPending?.submittedItemKeys.includes(feedbackItemKey(item, index)),
      );
      if (savedPending && firstPendingProductIndex === -1) {
        window.sessionStorage.removeItem(storageKey);
        setPhase("complete");
        return;
      }
      setActiveProductIndex(Math.max(firstPendingProductIndex, 0));
      setStep(savedPending ? "product" : "order");
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

  const completeReview = React.useCallback(() => {
    window.sessionStorage.removeItem(storageKey);
    setPending(null);
    setPhase("complete");
  }, [storageKey]);

  const submitOrderRating = () => {
    if (
      !seed ||
      !Number.isInteger(orderRate) ||
      orderRate < 1 ||
      orderRate > 5
    ) {
      setOrderError("امتیاز کلی سفارش را انتخاب کنید.");
      return;
    }

    setMessage(null);
    startSubmitting(async () => {
      try {
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

        const nextPending = {
          commentId: ratingResponse.data.id,
          submittedItemKeys: [],
          uploadedAttachmentServeKeys: {},
        };
        setPending(nextPending);
        savePendingReview(storageKey, nextPending);
        if (seed.items.length) {
          setActiveProductIndex(0);
          setStep("product");
        } else {
          completeReview();
        }
      } catch {
        setMessage(sazitoConnectionErrorMessage());
      }
    });
  };

  const submitProductReview = () => {
    if (!seed || !pending) return;

    const item = seed.items[activeProductIndex];
    if (!item) {
      completeReview();
      return;
    }
    const key = feedbackItemKey(item, activeProductIndex);
    const draft = drafts[key] ?? emptyProductReviewDraft();
    if (
      !Number.isInteger(draft.productRate) ||
      draft.productRate < 1 ||
      draft.productRate > 5
    ) {
      setProductErrors((current) => ({
        ...current,
        [key]: "برای این محصول امتیاز انتخاب کنید.",
      }));
      return;
    }

    setMessage(null);
    startSubmitting(async () => {
      let currentPending = pending;
      try {
        let attachmentServeKeys: string[] =
          currentPending.uploadedAttachmentServeKeys[key] ?? [];

        if (draft.attachments.length && !attachmentServeKeys.length) {
            const uploadResponse = await client.feedbacks.uploadReviewImages(
              draft.attachments.map(({ file }) => ({
                file,
                name: file.name,
                alt: item.productName,
              })),
              { cache: false },
            );

            if (uploadResponse.error || !uploadResponse.data) {
              if (isSazitoAuthenticationError(uploadResponse.error)) {
                logout();
                return;
              }

              setMessage(
                uploadResponse.error
                  ? sazitoErrorMessage(
                      uploadResponse.error,
                      `تصویرهای دیدگاه «${item.productName}» بارگذاری نشدند.`,
                    )
                  : `پاسخ بارگذاری تصویرهای «${item.productName}» کامل نبود.`,
              );
              return;
            }

            attachmentServeKeys = uploadResponse.data.images
              .map((image) => image.serveKey.trim())
              .filter(Boolean);
            if (attachmentServeKeys.length !== draft.attachments.length) {
              setMessage(
                `بارگذاری همه تصویرهای دیدگاه «${item.productName}» کامل نشد. دوباره تلاش کنید.`,
              );
              return;
            }

            currentPending = {
              ...currentPending,
              uploadedAttachmentServeKeys: {
                ...currentPending.uploadedAttachmentServeKeys,
                [key]: attachmentServeKeys,
              },
            };
            setPending(currentPending);
            savePendingReview(storageKey, currentPending);
        }

        const response = await client.feedbacks.submitProductReview(
            buildProductReviewInput(
              item,
              currentPending.commentId,
              draft,
              attachmentServeKeys,
            ),
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

        const submittedKeys = new Set(currentPending.submittedItemKeys);
        submittedKeys.add(key);
        currentPending = {
          ...currentPending,
          submittedItemKeys: [...submittedKeys],
        };
        setPending(currentPending);
        savePendingReview(storageKey, currentPending);

        const nextProductIndex = seed.items.findIndex(
          (nextItem, index) =>
            index > activeProductIndex &&
            !submittedKeys.has(feedbackItemKey(nextItem, index)),
        );
        if (nextProductIndex === -1) {
          completeReview();
        } else {
          setActiveProductIndex(nextProductIndex);
        }
      } catch {
        setMessage(sazitoConnectionErrorMessage());
      }
    });
  };

  const submit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === "order") {
      submitOrderRating();
    } else {
      submitProductReview();
    }
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
        <CardHeader className="gap-4 p-4 sm:p-5 md:grid md:grid-cols-[minmax(0,1fr)_13rem] md:items-center">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
              <MessageSquareText className="size-5" />
            </span>
            <div className="min-w-0">
              <CardTitle className="text-base">تجربه خرید شما</CardTitle>
              <CardDescription className="mt-1 text-xs leading-6">
                به سفارش و محصولات خریداری‌شده امتیاز دهید.
              </CardDescription>
              <div className="mt-2 flex flex-wrap gap-2 text-[0.6875rem] font-bold text-muted-foreground">
                <span className="rounded-full bg-secondary px-2.5 py-1">امتیاز سفارش</span>
                <span className="rounded-full bg-secondary px-2.5 py-1">دیدگاه محصولات</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-border/70 bg-secondary/35 p-2.5 md:flex-col md:items-stretch">
            <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground md:justify-center">
              <span className="flex items-center gap-0.5 text-highlight" aria-hidden="true">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star key={index} className="size-3 fill-current" />
                ))}
              </span>
              <span>کمتر از یک دقیقه</span>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-9 shrink-0 px-3 text-xs"
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
          </div>
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
          {step === "order"
            ? "ابتدا به تجربه کلی این سفارش امتیاز دهید."
            : `دیدگاه محصول ${(activeProductIndex + 1).toLocaleString("fa-IR")} از ${seed.items.length.toLocaleString("fa-IR")} را ثبت کنید.`}
        </CardDescription>
        <div className="mt-2 flex items-center gap-2" aria-label="مراحل ثبت تجربه">
          <Badge variant={step === "order" ? "default" : "secondary"}>
            ۱. امتیاز سفارش
          </Badge>
          <Badge variant={step === "product" ? "default" : "outline"}>
            ۲. دیدگاه محصولات
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6" onSubmit={submit} noValidate>
          <fieldset className="grid gap-6" disabled={isSubmitting}>
            {step === "order" ? (
              <section
                className="rounded-3xl bg-secondary/60 p-5"
                aria-labelledby="order-rating-title"
              >
              <h3 id="order-rating-title" className="font-black">
                امتیاز کلی به سفارش
              </h3>
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
              </section>
            ) : null}

            {step === "product" && seed.items.length ? (
              <section aria-labelledby="product-reviews-title">
                <h3 id="product-reviews-title" className="font-black">
                  دیدگاه محصولات
                </h3>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  نظر هر محصول جداگانه ارسال می‌شود و بعد به محصول بعدی می‌روید.
                </p>
                <div className="mt-4 grid gap-3">
                  {seed.items.map((item, index) => {
                    if (index !== activeProductIndex) return null;

                    const key = feedbackItemKey(item, index);
                    const draft = drafts[key] ?? emptyProductReviewDraft();
                    const attachmentsUploaded = Boolean(
                      pending?.uploadedAttachmentServeKeys[key]?.length,
                    );

                    return (
                      <details
                        key={key}
                        open
                        className="group rounded-3xl border bg-background/65 open:bg-card"
                      >
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-3xl p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                          <span className="min-w-0">
                            <strong className="block truncate text-sm">
                              {item.productName || "محصول سفارش"}
                            </strong>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              محصول {(index + 1).toLocaleString("fa-IR")} از{" "}
                              {seed.items.length.toLocaleString("fa-IR")}
                            </span>
                          </span>
                          <Badge variant="outline">در حال تکمیل</Badge>
                        </summary>

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

                            <div className="grid gap-3 rounded-2xl border border-dashed bg-muted/35 p-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="flex items-center gap-2 text-sm font-bold">
                                    <Paperclip className="size-4 text-primary" />
                                    تصویرهای دیدگاه
                                  </p>
                                  <p className="mt-1 text-xs leading-6 text-muted-foreground">
                                    حداکثر {MAX_REVIEW_IMAGES.toLocaleString("fa-IR")} تصویر JPG، PNG یا WebP؛ هر فایل تا ۵ مگابایت
                                  </p>
                                </div>
                                <label
                                  className={cn(
                                    "inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border bg-card px-3 text-xs font-bold outline-none transition-colors hover:bg-accent focus-within:ring-2 focus-within:ring-ring",
                                    attachmentsUploaded &&
                                      "pointer-events-none opacity-60",
                                  )}
                                >
                                  <ImagePlus className="size-4" />
                                  انتخاب تصویر
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/webp"
                                    className="sr-only"
                                    disabled={attachmentsUploaded}
                                    onChange={(event) => {
                                      const selection = validateReviewImageSelection(
                                        draft.attachments.length,
                                        Array.from(event.currentTarget.files ?? []),
                                      );
                                      event.currentTarget.value = "";

                                      if (selection.error) {
                                        setProductErrors((current) => ({
                                          ...current,
                                          [key]: selection.error!,
                                        }));
                                        return;
                                      }

                                      updateDraft(key, {
                                        attachments: [
                                          ...draft.attachments,
                                          ...selection.files.map((file, fileIndex) => ({
                                            id: `${file.name}:${file.size}:${file.lastModified}:${fileIndex}`,
                                            file,
                                          })),
                                        ],
                                      });
                                    }}
                                  />
                                </label>
                              </div>

                              {attachmentsUploaded ? (
                                <p className="flex items-center gap-2 text-xs text-primary">
                                  <CheckCircle2 className="size-4" />
                                  تصویرها بارگذاری شده‌اند و در تلاش دوباره استفاده می‌شوند.
                                </p>
                              ) : null}

                              {draft.attachments.length ? (
                                <ul className="grid gap-2" aria-label="تصویرهای انتخاب‌شده">
                                  {draft.attachments.map((attachment) => (
                                    <li
                                      key={attachment.id}
                                      className="flex items-center gap-3 rounded-xl bg-card px-3 py-2 text-xs"
                                    >
                                      <ImagePlus className="size-4 shrink-0 text-primary" />
                                      <span className="min-w-0 flex-1 truncate" dir="ltr">
                                        {attachment.file.name}
                                      </span>
                                      <span className="shrink-0 text-muted-foreground">
                                        {(attachment.file.size / 1024 / 1024).toLocaleString("fa-IR", {
                                          maximumFractionDigits: 1,
                                        })} MB
                                      </span>
                                      <button
                                        type="button"
                                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-danger outline-none hover:bg-danger/10 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                                        aria-label={`حذف ${attachment.file.name}`}
                                        disabled={attachmentsUploaded}
                                        onClick={() =>
                                          updateDraft(key, {
                                            attachments: draft.attachments.filter(
                                              (current) => current.id !== attachment.id,
                                            ),
                                          })
                                        }
                                      >
                                        <Trash2 className="size-4" />
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>

                            {productErrors[key] ? (
                              <p role="alert" className="text-xs text-danger">
                                {productErrors[key]}
                              </p>
                            ) : null}
                        </div>
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
            {step === "order"
              ? "ثبت امتیاز و ادامه"
              : activeProductIndex === seed.items.length - 1
                ? "ثبت نهایی"
                : "ثبت و محصول بعدی"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
