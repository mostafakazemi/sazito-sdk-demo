import type { MetadataRoute } from "next";

import { absoluteStorefrontUrl } from "@/lib/seo";
import { getSitemapCatalogData } from "@/lib/sazito/data";

function validDate(value: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const home: MetadataRoute.Sitemap[number] = {
    url: absoluteStorefrontUrl("/"),
    changeFrequency: "daily",
    priority: 1,
  };

  try {
    const catalog = await getSitemapCatalogData();
    const categories: MetadataRoute.Sitemap = catalog.categories.map((entry) => ({
      url: absoluteStorefrontUrl(entry.href),
      lastModified: validDate(entry.updatedAt),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
    const products: MetadataRoute.Sitemap = catalog.products.map((entry) => ({
      url: absoluteStorefrontUrl(entry.href),
      lastModified: validDate(entry.updatedAt),
      changeFrequency: "daily",
      priority: 0.8,
      images: entry.imageUrl ? [entry.imageUrl] : undefined,
    }));

    return [home, ...categories, ...products];
  } catch {
    return [home];
  }
}
