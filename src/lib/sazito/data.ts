import "server-only";

import { unstable_cache } from "next/cache";
import type {
  Product,
  ProductEntityRoute,
  ProductCategoryEntityRoute,
  ProductSort,
} from "@sazito/client-sdk";

import { localStorefrontPath } from "@/lib/seo";

import { sazitoCacheConfig } from "./cache";
import { sazitoClient, sazitoStoreDomain, sazitoStoreOrigin } from "./client";
import { toCmsPageView } from "./cms";
import {
  normalizeStoreAssetUrl,
  toCategory,
  toHomePageData,
  toProductCollection,
  toProductDetail,
  toStoreChrome,
} from "./presenters";
import { SazitoDataError, unwrapSazitoResponse } from "./response";
import type {
  BlogIndexData,
  CategoryPageData,
  CategoryView,
  CmsPageView,
  HomePageData,
  ProductDetailView,
  SearchPageData,
  SitemapCatalogData,
  StoreChrome,
} from "./types";
import type { CatalogQuery } from "./catalog";

const getGeneralInfo = unstable_cache(
  async () =>
    unwrapSazitoResponse(
      await sazitoClient.general.getInfo({ cache: false }),
      "دریافت اطلاعات فروشگاه ناموفق بود.",
    ),
  ["sazito-general-info", sazitoStoreDomain],
  sazitoCacheConfig,
);

const getHeaderMenu = unstable_cache(
  async () =>
    unwrapSazitoResponse(
      await sazitoClient.menu.getHeaderMenu(undefined, { cache: false }),
      "دریافت منوی فروشگاه ناموفق بود.",
    ),
  ["sazito-header-menu", sazitoStoreDomain],
  sazitoCacheConfig,
);

const getCmsContent = unstable_cache(
  async () => {
    const [pagesResponse, blogPostsResponse] = await Promise.all([
      sazitoClient.cms.listPages(
        { page: 1, pageSize: 100 },
        { cache: false },
      ),
      sazitoClient.cms.listBlogPosts(
        { page: 1, pageSize: 100 },
        { cache: false },
      ),
    ]);
    const pages = unwrapSazitoResponse(
      pagesResponse,
      "دریافت محتوای فروشگاه ناموفق بود.",
    );
    const blogPosts = unwrapSazitoResponse(
      blogPostsResponse,
      "دریافت نوشته‌های وبلاگ ناموفق بود.",
    );

    return { items: [...pages.items, ...blogPosts.items] };
  },
  ["sazito-cms-content-v2", sazitoStoreDomain],
  sazitoCacheConfig,
);

const getCmsPageByPath = unstable_cache(
  async (path: string) =>
    unwrapSazitoResponse(
      await sazitoClient.cms.getPage(path, { cache: false }),
      "دریافت صفحه ناموفق بود.",
    ),
  ["sazito-cms-page", sazitoStoreDomain],
  sazitoCacheConfig,
);

const getBlogPostByPath = unstable_cache(
  async (path: string) =>
    unwrapSazitoResponse(
      await sazitoClient.cms.getBlogPost(path, { cache: false }),
      "دریافت نوشته وبلاگ ناموفق بود.",
    ),
  ["sazito-blog-post", sazitoStoreDomain],
  sazitoCacheConfig,
);

function isMissingCmsContent(error: unknown) {
  return (
    (error instanceof SazitoDataError && error.status === 404) ||
    (error instanceof Error &&
      /^Expected (CMS page|blog post)/.test(error.message))
  );
}

const getCategories = unstable_cache(
  async () =>
    unwrapSazitoResponse(
      await sazitoClient.categories.list(
        { page: 1, pageSize: 100 },
        { cache: false },
      ),
      "دریافت دسته‌بندی‌ها ناموفق بود.",
    ),
  ["sazito-categories", sazitoStoreDomain],
  sazitoCacheConfig,
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
  sazitoCacheConfig,
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
  sazitoCacheConfig,
);

const getSitemapProducts = unstable_cache(
  async () => {
    const requestedPageSize = 100;
    const maximumProducts = 49_000;
    const firstPage = unwrapSazitoResponse(
      await sazitoClient.products.list(
        { page: 1, pageSize: requestedPageSize, sort: "newest" },
        { cache: false },
      ),
      "دریافت محصولات نقشه سایت ناموفق بود.",
    );
    const pageSize = Math.max(1, firstPage.pageSize || requestedPageSize);
    const totalPages = Math.ceil(
      Math.min(firstPage.total, maximumProducts) / pageSize,
    );
    const products: Product[] = [...firstPage.items];
    const remainingPages = Array.from(
      { length: Math.max(0, totalPages - 1) },
      (_, index) => index + 2,
    );

    for (let index = 0; index < remainingPages.length; index += 8) {
      const batch = await Promise.all(
        remainingPages.slice(index, index + 8).map(async (page) =>
          unwrapSazitoResponse(
            await sazitoClient.products.list(
              { page, pageSize, sort: "newest" },
              { cache: false },
            ),
            "دریافت محصولات نقشه سایت ناموفق بود.",
          ),
        ),
      );
      products.push(...batch.flatMap((result) => result.items));
    }

    return products.slice(0, maximumProducts);
  },
  ["sazito-sitemap-products", sazitoStoreDomain],
  sazitoCacheConfig,
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
  sazitoCacheConfig,
);

const resolveEntityRoute = unstable_cache(
  async (path: string) =>
    unwrapSazitoResponse(
      await sazitoClient.entityRoutes.resolve(path, { cache: false }),
      "دریافت محصول ناموفق بود.",
    ),
  ["sazito-entity-route", sazitoStoreDomain],
  sazitoCacheConfig,
);

const getCategoryProducts = unstable_cache(
  async (
    categoryId: number,
    page: number,
    pageSize: number,
    sort: ProductSort,
    priceMin: number | null,
    priceMax: number | null,
    availableOnly: boolean,
    discountedOnly: boolean,
  ) =>
    unwrapSazitoResponse(
      await sazitoClient.products.list(
        {
          categories: categoryId,
          page,
          pageSize,
          sort,
          priceMin: priceMin ?? undefined,
          priceMax: priceMax ?? undefined,
          availableOnly,
          discountedOnly,
        },
        { cache: false },
      ),
      "دریافت محصولات این دسته ناموفق بود.",
    ),
  ["sazito-category-products", sazitoStoreDomain],
  sazitoCacheConfig,
);

const searchStore = unstable_cache(
  async (
    query: string,
    page: number,
    pageSize: number,
    categoryId: number | null,
    minPrice: number | null,
    maxPrice: number | null,
  ) =>
    unwrapSazitoResponse(
      await sazitoClient.search.query(
        query,
        {
          page,
          pageSize,
          categoryId: categoryId ?? undefined,
          minPrice: minPrice ?? undefined,
          maxPrice: maxPrice ?? undefined,
        },
        { cache: false },
      ),
      "جست‌وجوی محصولات ناموفق بود.",
    ),
  ["sazito-search", sazitoStoreDomain],
  sazitoCacheConfig,
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
  sazitoCacheConfig,
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
  sazitoCacheConfig,
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
  sazitoCacheConfig,
);

function valueOf<T>(result: PromiseSettledResult<T>) {
  return result.status === "fulfilled" ? result.value : undefined;
}

export async function getStoreChrome(): Promise<StoreChrome> {
  const [info, menu, content] = await Promise.allSettled([
    getGeneralInfo(),
    getHeaderMenu(),
    getCmsContent(),
  ]);
  const localContentUrls = (valueOf(content)?.items ?? [])
    .filter((page) => page.enabled !== false)
    .map((page) => page.url);

  return toStoreChrome(
    valueOf(info),
    valueOf(menu),
    sazitoStoreOrigin,
    localContentUrls,
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

export async function getCatalogCategories(): Promise<CategoryView[]> {
  const result = await getCategories();
  return result.categories
    .filter((category) => category.enabled !== false)
    .map((category) => toCategory(category, sazitoStoreOrigin));
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

export async function getResolvedCategory(
  slug: string,
): Promise<ProductCategoryEntityRoute | null> {
  try {
    const route = await resolveEntityRoute(`/category/${slug}`);
    return route.entityType === "product_category" ? route : null;
  } catch (error) {
    if (error instanceof SazitoDataError && error.status === 404) return null;
    throw error;
  }
}

export async function getCategoryPageData(
  slug: string,
  query: CatalogQuery,
  pageSize: number,
): Promise<CategoryPageData | null> {
  const route = await getResolvedCategory(slug);
  if (!route) return null;

  const products = await getCategoryProducts(
    route.entityId,
    query.page,
    pageSize,
    query.sort,
    query.priceMin,
    query.priceMax,
    query.availableOnly,
    query.discountedOnly,
  );

  return {
    category: toCategory(route.entity, sazitoStoreOrigin),
    products: toProductCollection(products),
  };
}

export async function getSearchPageData(input: {
  query: string;
  page: number;
  pageSize: number;
  categoryId: number | null;
  priceMin: number | null;
  priceMax: number | null;
}): Promise<SearchPageData> {
  const result = await searchStore(
    input.query,
    input.page,
    input.pageSize,
    input.categoryId,
    input.priceMin,
    input.priceMax,
  );

  return {
    query: input.query,
    products: toProductCollection(result.products),
    categories: result.productCategories.items
      .filter((category) => category.enabled !== false)
      .map((category) => toCategory(category, sazitoStoreOrigin)),
  };
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

export async function getCmsPageData(
  path: string,
): Promise<CmsPageView | null> {
  try {
    const page = await getCmsPageByPath(path);
    if (page.enabled === false || page.cmsPageType === "blog") return null;
    return toCmsPageView(page, sazitoStoreOrigin);
  } catch (error) {
    if (isMissingCmsContent(error)) return null;
    throw error;
  }
}

export async function getBlogPostData(
  path: string,
): Promise<CmsPageView | null> {
  try {
    const page = await getBlogPostByPath(path);
    if (page.enabled === false || page.cmsPageType !== "blog") return null;
    return toCmsPageView(page, sazitoStoreOrigin);
  } catch (error) {
    if (isMissingCmsContent(error)) return null;
    throw error;
  }
}

export async function getBlogIndexData(): Promise<BlogIndexData> {
  const content = await getCmsContent();
  const posts = content.items
    .filter((page) => page.enabled !== false && page.cmsPageType === "blog")
    .map((page) => toCmsPageView(page, sazitoStoreOrigin))
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt));

  return { posts, total: posts.length };
}

export async function getSitemapCatalogData(): Promise<SitemapCatalogData> {
  const [categoryResult, productResult, contentResult] = await Promise.allSettled([
    getCategories(),
    getSitemapProducts(),
    getCmsContent(),
  ]);
  if (
    categoryResult.status === "rejected" &&
    productResult.status === "rejected" &&
    contentResult.status === "rejected"
  ) {
    throw categoryResult.reason;
  }

  const categoryItems =
    categoryResult.status === "fulfilled" ? categoryResult.value.categories : [];
  const productItems =
    productResult.status === "fulfilled" ? productResult.value : [];
  const categories = categoryItems.flatMap((category) => {
    if (category.enabled === false) return [];
    const href = localStorefrontPath(category.url, sazitoStoreOrigin);
    if (!href?.startsWith("/category/")) return [];

    return [{ href, updatedAt: category.updatedAt ?? null }];
  });
  const products = productItems.flatMap((product) => {
    if (!product.enabled) return [];
    const href = localStorefrontPath(product.url, sazitoStoreOrigin);
    if (!href?.startsWith("/product/")) return [];

    return [
      {
        href,
        updatedAt: product.updatedAt || null,
        imageUrl: product.images[0]?.url,
      },
    ];
  });
  const contentItems =
    contentResult.status === "fulfilled" ? contentResult.value.items : [];
  const content = contentItems.flatMap((page) => {
    if (page.enabled === false) return [];
    const href = localStorefrontPath(page.url, sazitoStoreOrigin);
    if (!href) return [];

    return [
      {
        href,
        updatedAt: page.updatedAt || page.createdAt || null,
        imageUrl:
          normalizeStoreAssetUrl(page.image?.url, sazitoStoreOrigin) ??
          undefined,
      },
    ];
  });

  return {
    categories: [...new Map(categories.map((entry) => [entry.href, entry])).values()],
    products: [...new Map(products.map((entry) => [entry.href, entry])).values()],
    content: [...new Map(content.map((entry) => [entry.href, entry])).values()],
  };
}
