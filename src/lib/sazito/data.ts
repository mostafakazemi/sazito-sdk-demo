import "server-only";

import { unstable_cache } from "next/cache";
import type { ProductEntityRoute } from "@sazito/client-sdk";

import { sazitoClient, sazitoStoreDomain, sazitoStoreOrigin } from "./client";
import { toHomePageData, toProductDetail, toStoreChrome } from "./presenters";
import { SazitoDataError, unwrapSazitoResponse } from "./response";
import type { HomePageData, ProductDetailView, StoreChrome } from "./types";

const cacheConfig: { revalidate: number; tags: string[] } = {
  revalidate: 300,
  tags: [`sazito:${sazitoStoreDomain}`],
};

const getGeneralInfo = unstable_cache(
  async () =>
    unwrapSazitoResponse(
      await sazitoClient.general.getInfo({ cache: false }),
      "دریافت اطلاعات فروشگاه ناموفق بود.",
    ),
  ["sazito-general-info", sazitoStoreDomain],
  cacheConfig,
);

const getHeaderMenu = unstable_cache(
  async () =>
    unwrapSazitoResponse(
      await sazitoClient.menu.getHeaderMenu(undefined, { cache: false }),
      "دریافت منوی فروشگاه ناموفق بود.",
    ),
  ["sazito-header-menu", sazitoStoreDomain],
  cacheConfig,
);

const getCategories = unstable_cache(
  async () =>
    unwrapSazitoResponse(
      await sazitoClient.categories.list(
        { page: 1, pageSize: 30 },
        { cache: false },
      ),
      "دریافت دسته‌بندی‌ها ناموفق بود.",
    ),
  ["sazito-categories", sazitoStoreDomain],
  cacheConfig,
);

const getBestSellers = unstable_cache(
  async () =>
    unwrapSazitoResponse(
      await sazitoClient.products.list(
        { page: 1, pageSize: 8, sort: "best-selling" },
        { cache: false },
      ),
      "دریافت محصولات پرفروش ناموفق بود.",
    ),
  ["sazito-products-best-selling", sazitoStoreDomain],
  cacheConfig,
);

const getNewest = unstable_cache(
  async () =>
    unwrapSazitoResponse(
      await sazitoClient.products.list(
        { page: 1, pageSize: 8, sort: "newest" },
        { cache: false },
      ),
      "دریافت محصولات تازه ناموفق بود.",
    ),
  ["sazito-products-newest", sazitoStoreDomain],
  cacheConfig,
);

const getDiscounted = unstable_cache(
  async () =>
    unwrapSazitoResponse(
      await sazitoClient.products.list(
        {
          page: 1,
          pageSize: 4,
          sort: "discount",
          discountedOnly: true,
        },
        { cache: false },
      ),
      "دریافت محصولات تخفیف‌دار ناموفق بود.",
    ),
  ["sazito-products-discounted", sazitoStoreDomain],
  cacheConfig,
);

const resolveEntityRoute = unstable_cache(
  async (path: string) =>
    unwrapSazitoResponse(
      await sazitoClient.entityRoutes.resolve(path, { cache: false }),
      "دریافت محصول ناموفق بود.",
    ),
  ["sazito-entity-route", sazitoStoreDomain],
  cacheConfig,
);

const getRelatedProducts = unstable_cache(
  async (entityId: number) =>
    unwrapSazitoResponse(
      await sazitoClient.products.list(
        { page: 1, pageSize: 5, similarTo: entityId },
        { cache: false },
      ),
      "دریافت محصولات مرتبط ناموفق بود.",
    ),
  ["sazito-related-products", sazitoStoreDomain],
  cacheConfig,
);

const getReviewStatistics = unstable_cache(
  async (entityId: number) =>
    unwrapSazitoResponse(
      await sazitoClient.feedbacks.getProductStatistics(String(entityId), {
        cache: false,
      }),
      "دریافت امتیاز محصول ناموفق بود.",
    ),
  ["sazito-review-statistics", sazitoStoreDomain],
  cacheConfig,
);

const getProductReviews = unstable_cache(
  async (entityId: number) =>
    unwrapSazitoResponse(
      await sazitoClient.feedbacks.getProductReviews(
        String(entityId),
        { pageNumber: 1, pageSize: 6 },
        { cache: false },
      ),
      "دریافت دیدگاه‌های محصول ناموفق بود.",
    ),
  ["sazito-product-reviews", sazitoStoreDomain],
  cacheConfig,
);

function valueOf<T>(result: PromiseSettledResult<T>) {
  return result.status === "fulfilled" ? result.value : undefined;
}

export async function getStoreChrome(): Promise<StoreChrome> {
  const [info, menu] = await Promise.allSettled([
    getGeneralInfo(),
    getHeaderMenu(),
  ]);

  return toStoreChrome(
    valueOf(info),
    valueOf(menu),
    sazitoStoreOrigin,
  );
}

export async function getHomePageData(): Promise<HomePageData> {
  const [store, categories, bestSellers, newest, discounted] =
    await Promise.allSettled([
      getStoreChrome(),
      getCategories(),
      getBestSellers(),
      getNewest(),
      getDiscounted(),
    ]);
  const fallbackStore = toStoreChrome(undefined, undefined, sazitoStoreOrigin);
  const catalogResults = [categories, bestSellers, newest, discounted];

  return toHomePageData({
    store: valueOf(store) ?? fallbackStore,
    categories: valueOf(categories)?.categories,
    bestSellers: valueOf(bestSellers)?.items,
    newest: valueOf(newest)?.items,
    discounted: valueOf(discounted)?.items,
    hasCatalogError: catalogResults.every((result) => result.status === "rejected"),
    storeOrigin: sazitoStoreOrigin,
  });
}

export async function getResolvedProduct(
  slug: string,
): Promise<ProductEntityRoute | null> {
  try {
    const route = await resolveEntityRoute(`/product/${slug}`);
    return route.entityType === "product" ? route : null;
  } catch (error) {
    if (error instanceof SazitoDataError && error.status === 404) return null;
    throw error;
  }
}

export async function getProductPageData(
  slug: string,
): Promise<ProductDetailView | null> {
  const route = await getResolvedProduct(slug);
  if (!route) return null;

  const [related, statistics, reviews] = await Promise.allSettled([
    getRelatedProducts(route.entityId),
    getReviewStatistics(route.entityId),
    getProductReviews(route.entityId),
  ]);

  return toProductDetail(
    route.entityId,
    route.entity,
    sazitoStoreOrigin,
    valueOf(related)?.items ?? [],
    valueOf(statistics),
    valueOf(reviews),
  );
}
