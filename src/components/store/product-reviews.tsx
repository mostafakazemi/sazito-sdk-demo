import { CheckCircle2, Star, ThumbsDown, ThumbsUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPersianDate } from "@/lib/sazito/presenters";
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

export function ProductReviews({ reviews }: { reviews: ProductReviewSummary | null }) {
  if (!reviews) {
    return (
      <section aria-labelledby="reviews-title" className="rounded-[2rem] border bg-card p-6 sm:p-8">
        <h2 id="reviews-title" className="text-2xl font-black">دیدگاه خریداران</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          هنوز دیدگاهی برای این محصول ثبت نشده است.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="reviews-title">
      <div className="mb-7 flex flex-col gap-5 rounded-[2rem] bg-secondary p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-sm font-bold text-primary">تجربه خریداران</p>
          <h2 id="reviews-title" className="mt-2 text-2xl font-black">دیدگاه‌های محصول</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {new Intl.NumberFormat("fa-IR").format(reviews.count)} دیدگاه ثبت شده
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-card px-5 py-4">
          <strong className="text-3xl font-black">{new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(reviews.average)}</strong>
          <div>
            <Stars value={reviews.average} />
            {reviews.recommendedPercentage !== null ? (
              <p className="mt-1 text-xs text-muted-foreground">
                ٪{new Intl.NumberFormat("fa-IR").format(reviews.recommendedPercentage)} پیشنهاد کرده‌اند
              </p>
            ) : null}
          </div>
        </div>
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
                {review.pros.length ? (
                  <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
                    {review.pros.map((item) => (
                      <li key={item} className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-primary" />{item}</li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}
