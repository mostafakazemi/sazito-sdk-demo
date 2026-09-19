import type { ProductReviewSummary } from "./types";

function nonEmpty(value: string | undefined | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export interface ReviewCollectionInput {
  entities: Array<{
    productRate: number;
    userFirstName: string;
    userLastName: string;
    createdAt: string;
    text: string;
    recommendationStatus: string;
    pros: string[];
    cons: string[];
    isAnonymous: boolean;
    metadata?: { variantId?: string };
  }>;
  totalCount: number;
  averageRate: number;
  recommendations?: { recommendedPercentage: number };
}

export interface ReviewStatisticsInput {
  productStatistics: {
    averageRate: number;
    totalCount?: number;
    total?: number;
    recommendations?: { recommendedPercentage: number };
  };
}

export function toProductReviewSummary(
  statistics?: ReviewStatisticsInput,
  reviews?: ReviewCollectionInput,
): ProductReviewSummary | null {
  const stats = statistics?.productStatistics;
  const statisticsCount = stats?.totalCount ?? stats?.total ?? 0;
  const reviewCount = reviews?.totalCount ?? 0;
  const count = Math.max(reviewCount, statisticsCount);
  const hasReviewItems = Boolean(reviews?.entities.length);

  if (!count && !hasReviewItems) return null;

  return {
    average: hasReviewItems
      ? reviews?.averageRate ?? stats?.averageRate ?? 0
      : stats?.averageRate ?? reviews?.averageRate ?? 0,
    count,
    recommendedPercentage: hasReviewItems
      ? reviews?.recommendations?.recommendedPercentage ??
        stats?.recommendations?.recommendedPercentage ??
        null
      : stats?.recommendations?.recommendedPercentage ??
        reviews?.recommendations?.recommendedPercentage ??
        null,
    items: (reviews?.entities ?? []).map((review, index) => ({
      id: `${review.metadata?.variantId ?? "review"}-${review.createdAt}-${index}`,
      author: review.isAnonymous
        ? "خریدار ناشناس"
        : nonEmpty(`${review.userFirstName} ${review.userLastName}`) ?? "خریدار",
      rating: review.productRate,
      date: review.createdAt,
      text: review.text,
      recommended:
        review.recommendationStatus === "RECOMMENDED"
          ? true
          : review.recommendationStatus === "NOT-RECOMMENDED"
            ? false
            : null,
      pros: review.pros ?? [],
      cons: review.cons ?? [],
    })),
  };
}
