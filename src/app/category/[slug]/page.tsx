import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FolderOpen } from "lucide-react";

import { CatalogFilters } from "@/components/store/catalog-filters";
import { CatalogGrid } from "@/components/store/catalog-grid";
import { CatalogPagination } from "@/components/store/catalog-pagination";
import { Badge } from "@/components/ui/badge";
import {
  CATALOG_PAGE_SIZE,
  parseCatalogQuery,
  type CatalogSearchParams,
} from "@/lib/sazito/catalog";
import { getCategoryPageData, getResolvedCategory } from "@/lib/sazito/data";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CatalogSearchParams>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = await getResolvedCategory(slug);

  return route
    ? {
        title: route.entity.name,
        description:
          route.entity.description || `خرید محصولات دسته ${route.entity.name}`,
      }
    : { title: "دسته‌بندی پیدا نشد" };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ slug }, rawSearchParams] = await Promise.all([params, searchParams]);
  const query = parseCatalogQuery(rawSearchParams);
  const data = await getCategoryPageData(slug, query, CATALOG_PAGE_SIZE);

  if (!data) notFound();

  const pathname = `/category/${slug}`;

  return (
    <div className="site-container py-8 sm:py-12">
      <header className="rounded-[2rem] border bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary"><FolderOpen />دسته‌بندی</Badge>
          <span className="text-sm text-muted-foreground">
            {data.products.total.toLocaleString("fa-IR")} محصول
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-black sm:text-4xl">{data.category.name}</h1>
        {data.category.description ? (
          <p className="mt-3 max-w-3xl text-sm leading-8 text-muted-foreground">
            {data.category.description}
          </p>
        ) : null}
      </header>

      <div className="mt-8 grid items-start gap-7 lg:grid-cols-[17rem_1fr]">
        <CatalogFilters action={pathname} query={query} />
        <div className="space-y-7">
          <CatalogGrid products={data.products.items} />
          <CatalogPagination
            pathname={pathname}
            searchParams={rawSearchParams}
            page={data.products.page}
            totalPages={data.products.totalPages}
          />
        </div>
      </div>
    </div>
  );
}
