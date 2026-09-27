"use client";

import * as React from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Image as ImageIcon,
  MessageCircle,
  Maximize2,
  Quote,
  Star,
  ThumbsDown,
  ThumbsUp,
  X,
  XCircle,
} from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber, formatPersianDate } from "@/lib/sazito/presenters";
import type { ProductReviewSummary } from "@/lib/sazito/types";

function Stars({ value, className = "size-4" }: { value: number; className?: string }) {
  return (
    <span className="flex gap-0.5" aria-label={`${value} از ۵ ستاره`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`${className} ${index < Math.round(value) ? "fill-highlight text-highlight" : "text-border"}`}
        />
      ))}
    </span>
  );
}

export function ProductReviewStats({ reviews }: { reviews: ProductReviewSummary }) {
  return (
    <div className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-border/70 bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
      <strong className="text-lg font-black text-foreground">
        {formatNumber(reviews.average, { maximumFractionDigits: 1 })}
      </strong>
      <Stars value={reviews.average} />
      <span>{formatNumber(reviews.count)} دیدگاه</span>
      {reviews.recommendedPercentage !== null ? (
        <span>٪{formatNumber(reviews.recommendedPercentage)} پیشنهاد کرده‌اند</span>
      ) : null}
    </div>
  );
}

type ReviewLightboxState = {
  author: string;
  images: string[];
  index: number;
  direction: "next" | "previous";
};

function ReviewImageLightbox({
  lightbox,
  onClose,
  onNavigate,
}: {
  lightbox: ReviewLightboxState;
  onClose(): void;
  onNavigate(index: number, direction: ReviewLightboxState["direction"]): void;
}) {
  const image = lightbox.images[lightbox.index];
  const [loadedImage, setLoadedImage] = React.useState<string | null>(null);
  const imageLoaded = loadedImage === image;

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft" && lightbox.images.length > 1) {
        onNavigate((lightbox.index + 1) % lightbox.images.length, "next");
      } else if (event.key === "ArrowRight" && lightbox.images.length > 1) {
        onNavigate((lightbox.index - 1 + lightbox.images.length) % lightbox.images.length, "previous");
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightbox, onClose, onNavigate]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-foreground/75 p-4 backdrop-blur-sm sm:p-8"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="relative flex w-full max-w-5xl flex-col gap-3 rounded-3xl border border-white/15 bg-card/95 p-3 shadow-2xl sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-label={`تصاویر دیدگاه ${lightbox.author}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-1">
          <p className="text-sm font-bold">تصویر دیدگاه {lightbox.author}</p>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-xl text-muted-foreground outline-none transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="بستن تصویر"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="relative flex h-[min(72vh,680px)] min-h-64 items-center justify-center overflow-hidden rounded-2xl bg-foreground/5">
          {!imageLoaded ? (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-xs text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <span className="size-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
              <span>در حال دریافت تصویر</span>
            </div>
          ) : null}
          <div
            key={`${image}-${lightbox.direction}`}
            className={`absolute inset-0 ${imageLoaded ? `review-image-swing-${lightbox.direction}` : "invisible"}`}
          >
            <Image
              src={image}
              alt={`تصویر ${formatNumber(lightbox.index + 1)} از دیدگاه ${lightbox.author}`}
              fill
              sizes="(max-width: 640px) 92vw, 960px"
              className="object-contain"
              unoptimized
              priority
              onLoad={() => setLoadedImage(image)}
            />
          </div>
          {lightbox.images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => onNavigate((lightbox.index + 1) % lightbox.images.length, "next")}
                className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground shadow-lg outline-none transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="تصویر بعدی"
              >
                <ArrowRight className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate((lightbox.index - 1 + lightbox.images.length) % lightbox.images.length, "previous")}
                className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground shadow-lg outline-none transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="تصویر قبلی"
              >
                <ArrowLeft className="size-5" />
              </button>
            </>
          ) : null}
        </div>

        {lightbox.images.length > 1 ? (
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <span>{formatNumber(lightbox.index + 1)}</span>
            <span>/</span>
            <span>{formatNumber(lightbox.images.length)}</span>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export function ProductReviews({ reviews }: { reviews: ProductReviewSummary | null }) {
  const [lightbox, setLightbox] = React.useState<ReviewLightboxState | null>(null);

  const closeLightbox = React.useCallback(() => setLightbox(null), []);
  const navigateLightbox = React.useCallback(
    (index: number, direction: ReviewLightboxState["direction"]) => {
      setLightbox((current) => (current ? { ...current, index, direction } : null));
    },
    [],
  );

  return (
    <>
      <section aria-labelledby="reviews-title" className="rounded-4xl border border-border/80 bg-card p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 border-b border-border/70 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
              <MessageCircle className="size-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="reviews-title" className="text-2xl font-black">دیدگاه‌های محصول</h2>
                {reviews ? (
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
                    {formatNumber(reviews.count)} دیدگاه
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                تجربه واقعی خریداران این محصول
              </p>
            </div>
          </div>
          {reviews ? (
            <div className="flex w-fit items-center gap-3 rounded-2xl border border-border/70 bg-secondary/45 px-3 py-2">
              <Stars value={reviews.average} className="size-3.5" />
              <strong className="text-sm">{formatNumber(reviews.average, { maximumFractionDigits: 1 })}</strong>
              {reviews.recommendedPercentage !== null ? (
                <span className="border-r border-border/70 pr-3 text-xs text-muted-foreground">
                  {formatNumber(reviews.recommendedPercentage)}٪ پیشنهاد
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {reviews?.items.length ? (
          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            {reviews.items.map((review) => (
              <Card key={review.id} className="overflow-hidden border-border/80 shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="p-0">
                  <div className="flex items-start justify-between gap-4 border-b border-border/70 bg-secondary/20 px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-black text-primary">
                        {review.author.slice(0, 1)}
                      </span>
                      <div>
                        <p className="font-bold">{review.author}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatPersianDate(review.date)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Stars value={review.rating} />
                      <span className="text-xs text-muted-foreground">{formatNumber(review.rating)} از ۵</span>
                    </div>
                  </div>
                  <div className="space-y-5 px-5 py-5 sm:px-6">
                    {review.recommended !== null ? (
                      <Badge variant={review.recommended ? "secondary" : "outline"}>
                        {review.recommended ? <ThumbsUp /> : <ThumbsDown />}
                        {review.recommended ? "پیشنهاد می‌کنم" : "پیشنهاد نمی‌کنم"}
                      </Badge>
                    ) : null}
                    {review.text.trim() ? (
                      <div className="relative rounded-2xl bg-secondary/55 px-4 py-4 text-sm leading-7">
                        <Quote className="absolute left-3 top-3 size-5 text-primary/25" />
                        <p className="pl-5">{review.text}</p>
                      </div>
                    ) : null}
                    {review.attachments.length ? (
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-muted-foreground">
                          <ImageIcon className="size-4 text-primary" />
                          <span>تصاویر خریدار</span>
                          <span className="rounded-full bg-secondary px-1.5 py-0.5">{formatNumber(review.attachments.length)}</span>
                        </div>
                        <div className="flex flex-wrap gap-2" aria-label="تصاویر دیدگاه">
                          {review.attachments.map((src, index) => (
                            <button
                              key={`${src}-${index}`}
                              type="button"
                              onClick={() => setLightbox({ author: review.author, images: review.attachments, index, direction: "next" })}
                              className="group relative size-20 overflow-hidden rounded-xl border border-border/80 bg-muted/40 text-right outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              aria-label={`نمایش تصویر ${formatNumber(index + 1)} از دیدگاه ${review.author}`}
                            >
                              <Image
                                src={src}
                                alt={`تصویر ${formatNumber(index + 1)} از دیدگاه ${review.author}`}
                                fill
                                sizes="80px"
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                unoptimized
                              />
                              <span className="absolute inset-0 flex items-center justify-center bg-foreground/0 text-white opacity-0 transition-all group-hover:bg-foreground/35 group-hover:opacity-100">
                                <Maximize2 className="size-5" />
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {review.pros.length || review.cons.length ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {review.pros.length ? (
                          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-3.5">
                            <p className="mb-2 text-xs font-bold text-primary">نکات مثبت</p>
                            <ul className="space-y-2 text-xs text-muted-foreground">
                              {review.pros.map((item) => (
                                <li key={`pro-${item}`} className="flex items-start gap-2">
                                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        {review.cons.length ? (
                          <div className="rounded-2xl border border-danger/15 bg-danger/5 p-3.5">
                            <p className="mb-2 text-xs font-bold text-danger">نکات منفی</p>
                            <ul className="space-y-2 text-xs text-muted-foreground">
                              {review.cons.map((item) => (
                                <li key={`con-${item}`} className="flex items-start gap-2">
                                  <XCircle className="mt-0.5 size-3.5 shrink-0 text-danger" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-2xl bg-secondary/55 px-4 py-5 text-sm leading-7 text-muted-foreground">
            هنوز دیدگاهی برای این محصول ثبت نشده است.
          </p>
        )}
      </section>
      {lightbox ? (
        <ReviewImageLightbox
          lightbox={lightbox}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
        />
      ) : null}
    </>
  );
}
