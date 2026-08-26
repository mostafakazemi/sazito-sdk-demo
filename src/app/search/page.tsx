import type { Metadata } from "next";
import Form from "next/form";
import { Search } from "lucide-react";

import { CatalogFilters } from "@/components/store/catalog-filters";
import { CatalogGrid } from "@/components/store/catalog-grid";
import { CatalogPagination } from "@/components/store/catalog-pagination";
import { Button } from "@/components/ui/button";
import {
  CATALOG_PAGE_SIZE,
  firstSearchParam,
  parseCatalogQuery,
  type CatalogSearchParams,
} from "@/lib/sazito/catalog";
import { getCatalogCategories, getSearchPageData } from "@/lib/sazito/data";

export const metadata: Metadata = {
  title: "جست‌وجوی محصولات",
  description: "جست‌وجو در محصولات فروشگاه",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const rawSearchParams = await searchParams;
  const query = (firstSearchParam(rawSearchParams.q) ?? "").trim().slice(0, 100);
  const catalogQuery = parseCatalogQuery(rawSearchParams);
  const rawCategory = Number(firstSearchParam(rawSearchParams.category));
  const categoryId = Number.isInteger(rawCategory) && rawCategory > 0 ? rawCategory : null;
  const categoriesPromise = getCatalogCategories();

  if (!query) {
    const categories = await categoriesPromise;
    return (
      <div className="site-container py-12 sm:py-20">
        <div className="mx-auto max-w-2xl rounded-[2rem] border bg-card p-7 text-center sm:p-10">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            <Search className="size-6" />
          </span>
          <h1 className="mt-5 text-2xl font-black sm:text-3xl">دنبال چه محصولی هستید؟</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            نام محصول را وارد کنید تا میان محصولات و دسته‌بندی‌های فروشگاه جست‌وجو کنیم.
          </p>
          <Form action="/search" className="mt-7 flex gap-2">
            <input
              name="q"
              autoFocus
              className="h-12 min-w-0 flex-1 rounded-xl border bg-background px-4 outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
              placeholder="مثلاً غذای خشک"
            />
            <Button type="submit" size="lg"><Search />جست‌وجو</Button>
          </Form>
          {categories.length ? (
            <p className="mt-6 text-xs text-muted-foreground">
              جست‌وجو در {categories.length.toLocaleString("fa-IR")} دسته‌بندی فعال
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  const [data, categories] = await Promise.all([
    getSearchPageData({
      query,
      page: catalogQuery.page,
      pageSize: CATALOG_PAGE_SIZE,
      categoryId,
      priceMin: catalogQuery.priceMin,
      priceMax: catalogQuery.priceMax,
    }),
    categoriesPromise,
  ]);

  return (
    <div className="site-container py-8 sm:py-12">
      <header>
        <p className="text-sm font-bold text-highlight">نتایج جست‌وجو</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">«{query}»</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {data.products.total.toLocaleString("fa-IR")} محصول پیدا شد
        </p>
      </header>

      <div className="mt-8 grid items-start gap-7 lg:grid-cols-[17rem_1fr]">
        <CatalogFilters
          action="/search"
          query={catalogQuery}
          searchTerm={query}
          categories={categories}
          selectedCategoryId={categoryId}
          showProductFilters={false}
        />
        <div className="space-y-7">
          <CatalogGrid products={data.products.items} />
          <CatalogPagination
            pathname="/search"
            searchParams={rawSearchParams}
            page={data.products.page}
            totalPages={data.products.totalPages}
          />
        </div>
      </div>
    </div>
  );
}
