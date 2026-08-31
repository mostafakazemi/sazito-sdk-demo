import type { SazitoClient } from "@sazito/client-sdk";

export type FeedbackSeed = NonNullable<
  Awaited<ReturnType<SazitoClient["feedbacks"]["getSeed"]>>["data"]
>;
export type FeedbackSeedItem = FeedbackSeed["items"][number];
export type ProductReviewInput = Parameters<
  SazitoClient["feedbacks"]["submitProductReview"]
>[0];
export type RecommendationStatus =
  ProductReviewInput["recommendationStatus"];

export interface ProductReviewDraft {
  productRate: number;
  text: string;
  pros: string;
  cons: string;
  recommendationStatus: RecommendationStatus;
  isAnonymous: boolean;
}

export interface PendingOrderReview {
  commentId: string;
  submittedItemKeys: string[];
}

export function emptyProductReviewDraft(): ProductReviewDraft {
  return {
    productRate: 0,
    text: "",
    pros: "",
    cons: "",
    recommendationStatus: "NONE",
    isAnonymous: false,
  };
}

export function feedbackItemKey(item: FeedbackSeedItem, index: number) {
  return `${item.productId}:${item.productVariantId}:${index}`;
}

export function parseReviewLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function hasProductReviewContent(draft: ProductReviewDraft) {
  return Boolean(
    draft.productRate ||
      draft.text.trim() ||
      draft.pros.trim() ||
      draft.cons.trim() ||
      draft.recommendationStatus !== "NONE",
  );
}

export function validateOrderReview(
  orderRate: number,
  drafts: Array<{ key: string; draft: ProductReviewDraft }>,
) {
  const productErrors: Record<string, string> = {};

  if (!Number.isInteger(orderRate) || orderRate < 1 || orderRate > 5) {
    return {
      orderError: "امتیاز کلی سفارش را انتخاب کنید.",
      productErrors,
    };
  }

  drafts.forEach(({ key, draft }) => {
    if (!hasProductReviewContent(draft)) return;

    if (
      !Number.isInteger(draft.productRate) ||
      draft.productRate < 1 ||
      draft.productRate > 5
    ) {
      productErrors[key] = "برای این محصول امتیاز انتخاب کنید.";
    } else if (!draft.text.trim()) {
      productErrors[key] = "متن تجربه این محصول را وارد کنید.";
    }
  });

  return { orderError: undefined, productErrors };
}

export function buildProductReviewInput(
  item: FeedbackSeedItem,
  commentId: string,
  draft: ProductReviewDraft,
): ProductReviewInput {
  return {
    commentId,
    productId: item.productId,
    productVariantId: item.productVariantId,
    productName: item.productName,
    productAttributes: item.productAttributes,
    productImage: item.productImage,
    productRate: draft.productRate,
    text: draft.text.trim(),
    pros: parseReviewLines(draft.pros),
    cons: parseReviewLines(draft.cons),
    recommendationStatus: draft.recommendationStatus,
    attachmentsServeKeys: [],
    owner: true,
    isAnonymous: draft.isAnonymous,
  };
}

export function readPendingOrderReview(value: string | null) {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<PendingOrderReview>;
    if (!parsed.commentId?.trim()) return null;

    return {
      commentId: parsed.commentId,
      submittedItemKeys: Array.isArray(parsed.submittedItemKeys)
        ? parsed.submittedItemKeys.filter(
            (key): key is string => typeof key === "string",
          )
        : [],
    } satisfies PendingOrderReview;
  } catch {
    return null;
  }
}
