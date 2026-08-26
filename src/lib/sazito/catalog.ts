import type { ProductSort } from "@sazito/client-sdk";

export const CATALOG_PAGE_SIZE = 12;

export interface CatalogQuery {
  page: number;
  sort: ProductSort;
  priceMin: number | null;
  priceMax: number | null;
  availableOnly: boolean;
  discountedOnly: boolean;
}

export type CatalogSearchParams = Record<
  string,
  string | string[] | undefined
>;

const PRODUCT_SORTS = new Set<ProductSort>([
  "newest",
  "best-selling",
  "availability",
  "discount",
  "!price",
  "price",
]);

export function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function positiveInteger(value: string | string[] | undefined, fallback: number) {
  const parsed = Number(firstSearchParam(value));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function moneyValue(value: string | string[] | undefined) {
  const normalized = firstSearchParam(value)?.replace(/[٬,\s]/g, "");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : null;
}

export function parseCatalogQuery(params: CatalogSearchParams): CatalogQuery {
  const requestedSort = firstSearchParam(params.sort) as ProductSort | undefined;
  let priceMin = moneyValue(params.priceMin);
  let priceMax = moneyValue(params.priceMax);

  if (priceMin !== null && priceMax !== null && priceMin > priceMax) {
    [priceMin, priceMax] = [priceMax, priceMin];
  }

  return {
    page: positiveInteger(params.page, 1),
    sort:
      requestedSort && PRODUCT_SORTS.has(requestedSort)
        ? requestedSort
        : "newest",
    priceMin,
    priceMax,
    availableOnly: firstSearchParam(params.available) === "1",
    discountedOnly: firstSearchParam(params.discounted) === "1",
  };
}

export function catalogHref(
  pathname: string,
  current: CatalogSearchParams,
  changes: Record<string, string | number | boolean | null | undefined>,
) {
  const params = new URLSearchParams();

  for (const [key, raw] of Object.entries(current)) {
    const value = firstSearchParam(raw);
    if (value) params.set(key, value);
  }

  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined || value === null || value === false || value === "") {
      params.delete(key);
    } else {
      params.set(key, value === true ? "1" : String(value));
    }
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function paginationWindow(page: number, totalPages: number) {
  if (totalPages <= 1) return [];
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
