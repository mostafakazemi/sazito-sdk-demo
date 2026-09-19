import {
  CheckCircle2,
  MessageCircle,
  Quote,
  Star,
  ThumbsDown,
  ThumbsUp,
  XCircle,
} from "lucide-react";

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

export function ProductReviews({ reviews }: { reviews: ProductReviewSummary | null }) {
  return (
    <section aria-labelledby="reviews-title" className="rounded-4xl border border-border/80 bg-card p-5 shadow-sm sm:p-7">
      <div className="flex items-center gap-3 border-b border-border/70 pb-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
          <MessageCircle className="size-5" />
        </span>
        <div>
          <h2 id="reviews-title" className="text-2xl font-black">دیدگاه‌های محصول</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            تجربه و نظر خریداران این محصول
          </p>
        </div>
        {reviews ? (
          <span className="mr-auto rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
            {formatNumber(reviews.count)} دیدگاه
          </span>
        ) : null}
      </div>

      {reviews?.items.length ? (
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {reviews.items.map((review) => (
            <Card key={review.id} className="overflow-hidden border-border/80 shadow-sm">
              <CardContent className="p-0">
                <div className="flex items-start justify-between gap-4 border-b border-border/70 bg-card px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-black text-primary">
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
                  <div className="relative rounded-2xl bg-secondary/55 px-4 py-4 text-sm leading-7">
                    <Quote className="absolute left-3 top-3 size-5 text-primary/25" />
                    <p className="pl-5">{review.text}</p>
                  </div>
                  {review.pros.length || review.cons.length ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                    {review.pros.length ? (
                        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-3">
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
                        <div className="rounded-2xl border border-danger/15 bg-danger/5 p-3">
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
  );
}
