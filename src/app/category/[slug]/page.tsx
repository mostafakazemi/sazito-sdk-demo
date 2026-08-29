import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FolderOpen } from "lucide-react";

import { JsonLd } from "@/components/seo/json-ld";
import { CatalogFilters } from "@/components/store/catalog-filters";
import { CatalogGrid } from "@/components/store/catalog-grid";
import { CatalogPagination } from "@/components/store/catalog-pagination";
import { Badge } from "@/components/ui/badge";
import {
  CATALOG_PAGE_SIZE,
  parseCatalogQuery,
  type CatalogSearchParams,
} from "@/lib/sazito/catalog";
import {
  buildBreadcrumbJsonLd,
  buildProductListJsonLd,
  localStorefrontPath,
  plainText,
} from "@/lib/seo";
import { sazitoStoreOrigin } from "@/lib/sazito/client";
import { getCategoryPageData, getResolvedCategory } from "@/lib/sazito/data";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CatalogSearchParams>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = await getResolvedCategory(slug);

  if (!route) return { title: "دسته‌بندی پیدا نشد" };

  const categoryDescription = route.entity.description
    ? plainText(route.entity.description, 180)
    : "";
  const description =
    categoryDescription || `خرید محصولات دسته ${route.entity.name}`;
  const canonical =
    localStorefrontPath(route.entity.url, sazitoStoreOrigin) ??
    `/category/${slug}`;

  return {
    title: route.entity.name,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "fa_IR",
      title: route.entity.name,
      description,
      url: canonical,
    },
    twitter: {
      card: "summary",
      title: route.entity.name,
      description,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ slug }, rawSearchParams] = await Promise.all([params, searchParams]);
  const query = parseCatalogQuery(rawSearchParams);
  const data = await getCategoryPageData(slug, query, CATALOG_PAGE_SIZE);

  if (!data) notFound();

  const pathname = `/category/${slug}`;

  return (
    <div className="site-container py-8 sm:py-12">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "خانه", href: "/" },
            { name: data.category.name, href: data.category.href },
          ]),
          buildProductListJsonLd(data.category.name, data.products.items),
        ]}
      />
      <header className="rounded-4xl border bg-card p-6 sm:p-8">
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
