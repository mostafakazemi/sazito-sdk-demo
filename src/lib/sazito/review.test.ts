import { describe, expect, it } from "vitest";

import {
  buildProductReviewInput,
  emptyProductReviewDraft,
  hasProductReviewContent,
  parseReviewLines,
  readPendingOrderReview,
  validateOrderReview,
  type FeedbackSeedItem,
} from "./review";

const item: FeedbackSeedItem = {
  productId: "12",
  productVariantId: "34",
  productName: "محصول نمونه",
  productAttributes: [{ name: "رنگ", value: "سبز" }],
  productImage: { url: "https://example.com/product.jpg", alt: "محصول" },
};

describe("order review helpers", () => {
  it("treats untouched product drafts as optional", () => {
    const draft = emptyProductReviewDraft();

    expect(hasProductReviewContent(draft)).toBe(false);
    expect(
      validateOrderReview(5, [{ key: "item", draft }]),
    ).toEqual({ orderError: undefined, productErrors: {} });
  });

  it("requires an order rating and complete started product reviews", () => {
    const draft = {
      ...emptyProductReviewDraft(),
      recommendationStatus: "RECOMMENDED" as const,
    };

    expect(validateOrderReview(0, [{ key: "item", draft }]).orderError).toBe(
      "امتیاز کلی سفارش را انتخاب کنید.",
    );
    expect(
      validateOrderReview(4, [{ key: "item", draft }]).productErrors.item,
    ).toContain("امتیاز");
    expect(
      validateOrderReview(4, [
        { key: "item", draft: { ...draft, productRate: 4 } },
      ]).productErrors.item,
    ).toContain("متن");
  });

  it("builds the exact SDK product-review payload", () => {
    expect(
      buildProductReviewInput(item, "comment-1", {
        productRate: 5,
        text: "  تجربه خوبی بود. ",
        pros: "بسته‌بندی خوب\n ارسال سریع\n",
        cons: "\nقیمت بالا",
        recommendationStatus: "RECOMMENDED",
        isAnonymous: true,
      }),
    ).toEqual({
      commentId: "comment-1",
      productId: "12",
      productVariantId: "34",
      productName: "محصول نمونه",
      productAttributes: [{ name: "رنگ", value: "سبز" }],
      productImage: { url: "https://example.com/product.jpg", alt: "محصول" },
      productRate: 5,
      text: "تجربه خوبی بود.",
      pros: ["بسته‌بندی خوب", "ارسال سریع"],
      cons: ["قیمت بالا"],
      recommendationStatus: "RECOMMENDED",
      attachmentsServeKeys: [],
      owner: true,
      isAnonymous: true,
    });
  });

  it("parses line lists and rejects malformed pending state", () => {
    expect(parseReviewLines(" اول \n\n دوم ")).toEqual(["اول", "دوم"]);
    expect(readPendingOrderReview("not-json")).toBeNull();
    expect(
      readPendingOrderReview(
        JSON.stringify({
          commentId: "comment-1",
          submittedItemKeys: ["a", 2, "b"],
        }),
      ),
    ).toEqual({
      commentId: "comment-1",
      submittedItemKeys: ["a", "b"],
    });
  });
});
