import { CheckCircle2, Star, ThumbsDown, ThumbsUp, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber, formatPersianDate } from "@/lib/sazito/presenters";
import type { ProductReviewSummary } from "@/lib/sazito/types";

function Stars({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${value} از ۵ ستاره`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={index < Math.round(value) ? "fill-highlight text-highlight" : "text-border"}
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
  if (!reviews) {
    return (
      <section aria-labelledby="reviews-title" className="rounded-4xl border bg-card p-6 sm:p-8">
        <h2 id="reviews-title" className="text-2xl font-black">دیدگاه خریداران</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          هنوز دیدگاهی برای این محصول ثبت نشده است.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="reviews-title">
      <div className="mb-7 rounded-4xl bg-secondary p-6 sm:p-8">
        <p className="text-sm font-bold text-primary">تجربه خریداران</p>
        <h2 id="reviews-title" className="mt-2 text-2xl font-black">دیدگاه‌های محصول</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          نظرهای ثبت‌شده خریداران این محصول
        </p>
      </div>

      {reviews.items.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.items.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold">{review.author}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatPersianDate(review.date)}</p>
                  </div>
                  <Stars value={review.rating} />
                </div>
                {review.recommended !== null ? (
                  <Badge className="mt-4" variant={review.recommended ? "secondary" : "outline"}>
                    {review.recommended ? <ThumbsUp /> : <ThumbsDown />}
                    {review.recommended ? "پیشنهاد می‌کنم" : "پیشنهاد نمی‌کنم"}
                  </Badge>
                ) : null}
                <p className="mt-4 text-sm leading-7">{review.text}</p>
                {review.pros.length || review.cons.length ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {review.pros.length ? (
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {review.pros.map((item) => (
                          <li key={`pro-${item}`} className="flex items-center gap-2">
                            <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {review.cons.length ? (
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {review.cons.map((item) => (
                          <li key={`con-${item}`} className="flex items-center gap-2">
                            <XCircle className="size-3.5 shrink-0 text-danger" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}
