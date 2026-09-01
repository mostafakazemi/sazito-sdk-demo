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
  attachments: ReviewAttachmentDraft[];
}

export interface ReviewAttachmentDraft {
  id: string;
  file: File;
}

interface ReviewImageFile {
  name: string;
  size: number;
  type: string;
}

export const MAX_REVIEW_IMAGES = 5;
export const MAX_REVIEW_IMAGE_BYTES = 5 * 1024 * 1024;
export const REVIEW_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export interface PendingOrderReview {
  commentId: string;
  submittedItemKeys: string[];
  uploadedAttachmentServeKeys: Record<string, string[]>;
}

export function emptyProductReviewDraft(): ProductReviewDraft {
  return {
    productRate: 0,
    text: "",
    pros: "",
    cons: "",
    recommendationStatus: "NONE",
    isAnonymous: false,
    attachments: [],
  };
}

export function validateReviewImageSelection<T extends ReviewImageFile>(
  currentCount: number,
  files: readonly T[],
): { files: T[]; error?: string } {
  if (currentCount + files.length > MAX_REVIEW_IMAGES) {
    return {
      files: [],
      error: `برای هر محصول حداکثر ${MAX_REVIEW_IMAGES.toLocaleString("fa-IR")} تصویر انتخاب کنید.`,
    };
  }

  const unsupported = files.find(
    (file) =>
      !REVIEW_IMAGE_TYPES.includes(
        file.type as (typeof REVIEW_IMAGE_TYPES)[number],
      ),
  );
  if (unsupported) {
    return {
      files: [],
      error: "فقط تصویرهای JPG، PNG و WebP قابل ارسال هستند.",
    };
  }

  const oversized = files.find((file) => file.size > MAX_REVIEW_IMAGE_BYTES);
  if (oversized) {
    return {
      files: [],
      error: "حجم هر تصویر باید حداکثر ۵ مگابایت باشد.",
    };
  }

  return { files: [...files] };
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
      draft.recommendationStatus !== "NONE" ||
      draft.attachments.length,
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
  attachmentsServeKeys: string[] = [],
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
    attachmentsServeKeys,
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
      uploadedAttachmentServeKeys:
        parsed.uploadedAttachmentServeKeys &&
        typeof parsed.uploadedAttachmentServeKeys === "object"
          ? Object.fromEntries(
              Object.entries(parsed.uploadedAttachmentServeKeys).flatMap(
                ([key, serveKeys]) =>
                  Array.isArray(serveKeys)
                    ? [
                        [
                          key,
                          serveKeys.filter(
                            (serveKey): serveKey is string =>
                              typeof serveKey === "string" &&
                              Boolean(serveKey.trim()),
                          ),
                        ],
                      ]
                    : [],
              ),
            )
          : {},
    } satisfies PendingOrderReview;
  } catch {
    return null;
  }
}
