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
  const blog: MetadataRoute.Sitemap[number] = {
    url: absoluteStorefrontUrl("/blog"),
    changeFrequency: "weekly",
    priority: 0.6,
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
    const content: MetadataRoute.Sitemap = catalog.content.map((entry) => ({
      url: absoluteStorefrontUrl(entry.href),
      lastModified: validDate(entry.updatedAt),
      changeFrequency: "monthly",
      priority: entry.href.startsWith("/blog/") ? 0.6 : 0.5,
      images: entry.imageUrl ? [entry.imageUrl] : undefined,
    }));

    return [home, blog, ...categories, ...products, ...content];
  } catch {
    return [home, blog];
  }
}
