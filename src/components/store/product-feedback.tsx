"use client";

import * as React from "react";

import { useCommerce } from "@/components/commerce/commerce-provider";
import { ProductReviewStats, ProductReviews } from "@/components/store/product-reviews";
import { toProductReviewSummary } from "@/lib/sazito/review-presenter";
import type { ProductReviewSummary } from "@/lib/sazito/types";

type ProductFeedbackState = {
  requestKey: string;
  status: "loading" | "ready" | "error";
  summary: ProductReviewSummary | null;
  error: string | null;
};

type ProductFeedbackContextValue = ProductFeedbackState & {
  retry(): void;
};

const ProductFeedbackContext = React.createContext<ProductFeedbackContextValue | null>(null);

export function ProductFeedbackProvider({
  productId,
  children,
}: {
  productId: number;
  children: React.ReactNode;
}) {
  const { client } = useCommerce();
  const [reload, setReload] = React.useState(0);
  const requestKey = `${productId}:${reload}`;
  const [state, setState] = React.useState<ProductFeedbackState>({
    requestKey,
    status: "loading",
    summary: null,
    error: null,
  });

  React.useEffect(() => {
    const controller = new AbortController();
    let active = true;

    void Promise.all([
      client.feedbacks.getProductStatistics(String(productId), {
        cache: false,
        signal: controller.signal,
      }),
      client.feedbacks.getProductReviews(
        String(productId),
        { pageNumber: 1, pageSize: 6 },
        { cache: false, signal: controller.signal },
      ),
    ])
      .then(([statisticsResponse, reviewsResponse]) => {
        if (!active) return;

        const summary = toProductReviewSummary(
          statisticsResponse.data,
          reviewsResponse.data,
        );
        const hasError = Boolean(statisticsResponse.error || reviewsResponse.error);

        setState({
          requestKey,
          status: hasError ? "error" : "ready",
          summary,
          error: hasError ? "دریافت دیدگاه‌های محصول ناموفق بود." : null,
        });
      })
      .catch(() => {
        if (!active) return;
        setState({
          requestKey,
          status: "error",
          summary: null,
          error: "دریافت دیدگاه‌های محصول ناموفق بود.",
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [client, productId, reload, requestKey]);

  const value = React.useMemo(
    () => ({
      ...(state.requestKey === requestKey
        ? state
        : { requestKey, status: "loading" as const, summary: null, error: null }),
      retry: () => setReload((current) => current + 1),
    }),
    [requestKey, state],
  );

  return (
    <ProductFeedbackContext.Provider value={value}>
      {children}
    </ProductFeedbackContext.Provider>
  );
}

function useProductFeedback() {
  const context = React.useContext(ProductFeedbackContext);
  if (!context) {
    throw new Error("useProductFeedback must be used inside ProductFeedbackProvider.");
  }
  return context;
}

export function ProductReviewStatsClient() {
  const { status, summary } = useProductFeedback();

  if (status === "loading") {
    return <span className="h-10 w-44 animate-pulse rounded-2xl bg-secondary" aria-label="در حال دریافت امتیازها" />;
  }

  return summary ? <ProductReviewStats reviews={summary} /> : null;
}

function ProductReviewsSkeleton() {
  return (
    <section
      aria-labelledby="reviews-title"
      aria-busy="true"
      className="rounded-4xl border border-border/80 bg-card p-5 shadow-sm sm:p-7"
    >
      <div className="flex items-center gap-3 border-b border-border/70 pb-5">
        <span className="size-10 animate-pulse rounded-2xl bg-secondary" />
        <div className="space-y-2">
          <div className="h-6 w-36 animate-pulse rounded bg-secondary" />
          <div className="h-4 w-52 animate-pulse rounded bg-secondary" />
        </div>
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        {[0, 1].map((item) => (
          <div key={item} className="h-64 animate-pulse rounded-3xl bg-secondary/70" />
        ))}
      </div>
    </section>
  );
}

export function ProductReviewsClient() {
  const { status, summary, error, retry } = useProductFeedback();

  if (status === "loading") return <ProductReviewsSkeleton />;

  if (status === "error") {
    return (
      <section className="rounded-4xl border border-danger/20 bg-card p-6 text-center shadow-sm sm:p-8">
        <p className="text-sm text-danger">{error}</p>
        <button
          type="button"
          onClick={retry}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
        >
          تلاش دوباره
        </button>
      </section>
    );
  }

  return <ProductReviews reviews={summary} />;
}
