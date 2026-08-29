import { createSazitoClient } from "@sazito/client-sdk";
import type { SazitoResponse } from "@sazito/client-sdk";
import { describe, expect, it } from "vitest";

const storeDomain = process.env.SAZITO_STORE_DOMAIN?.trim() || "testmosi.sazito.com";

const client = createSazitoClient({
  domain: storeDomain,
  timeout: 15_000,
  retry: { enabled: true, retries: 2, retryDelay: 700 },
  cache: {
    products: { enabled: false },
    entityRoutes: { enabled: false },
  },
});

function unwrapLiveResponse<T>(response: SazitoResponse<T>, operation: string): T {
  if (response.error) {
    const status = response.error.status ? ` HTTP ${response.error.status}` : "";
    throw new Error(
      `${operation} failed for ${storeDomain}: ${response.error.type}${status}: ${response.error.message}`,
    );
  }

  if (response.data === undefined) {
    throw new Error(`${operation} returned no data for ${storeDomain}.`);
  }

  return response.data;
}

describe(`Sazito product details live contract (${storeDomain})`, () => {
  it("returns normalized variants and read-only review envelopes", async () => {
    const products = unwrapLiveResponse(
      await client.products.list(
        { page: 1, pageSize: 10, sort: "newest" },
        { cache: false },
      ),
      "products.list for detail checks",
    );
    const product = products.items.find((item) => item.variants.length > 0);

    expect(product).toBeDefined();
    if (!product) throw new Error(`No product variants were returned for ${storeDomain}.`);

    for (const variant of product.variants) {
      expect(variant.id).toBeTypeOf("number");
      expect(variant.enabled).toBeTypeOf("boolean");
      expect(variant.price).toBeTypeOf("number");
      expect(variant.attributes).toBeInstanceOf(Array);
    }

    const route = unwrapLiveResponse(
      await client.entityRoutes.resolve(product.url, { cache: false }),
      "entityRoutes.resolve for feedback",
    );

    expect(route.entityType).toBe("product");
    if (route.entityType !== "product") {
      throw new Error(`${product.url} did not resolve to a product entity.`);
    }

    const statistics = unwrapLiveResponse(
      await client.feedbacks.getProductStatistics(String(route.entityId), {
        cache: false,
      }),
      "feedbacks.getProductStatistics",
    );
    const reviews = unwrapLiveResponse(
      await client.feedbacks.getProductReviews(
        String(route.entityId),
        { pageNumber: 1, pageSize: 5 },
        { cache: false },
      ),
      "feedbacks.getProductReviews",
    );

    const productStatistics = statistics.productStatistics as typeof statistics.productStatistics & {
      total?: number;
    };

    expect(productStatistics.averageRate).toBeTypeOf("number");
    expect(productStatistics.totalCount ?? productStatistics.total).toBeTypeOf("number");
    expect(reviews.entities).toBeInstanceOf(Array);
    expect(reviews.totalCount).toBeTypeOf("number");
    expect(reviews.averageRate).toBeTypeOf("number");
  });
});
