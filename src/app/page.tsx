import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";

import { JsonLd } from "@/components/seo/json-ld";
import { CategoryStrip } from "@/components/store/category-strip";
import { ProductSection } from "@/components/store/product-section";
import { StoreHero } from "@/components/store/store-hero";
import { buildStoreJsonLd } from "@/lib/seo";
import { getHomePageData, getStoreChrome } from "@/lib/sazito/data";

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreChrome();

  return {
    title: { absolute: store.name },
    description: store.description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "fa_IR",
      siteName: store.name,
      title: store.name,
      description: store.description,
      url: "/",
      images: store.logoUrl
        ? [{ url: store.logoUrl, alt: `لوگوی ${store.name}` }]
        : undefined,
    },
    twitter: {
      card: store.logoUrl ? "summary_large_image" : "summary",
      title: store.name,
      description: store.description,
      images: store.logoUrl ? [store.logoUrl] : undefined,
    },
  };
}

export default async function Home() {
  const data = await getHomePageData();

  return (
    <div className="pb-16 sm:pb-24">
      <JsonLd data={buildStoreJsonLd(data.store)} />
      <StoreHero store={data.store} product={data.heroProduct} />

      <div className="site-container space-y-16 pt-12 sm:space-y-24 sm:pt-18">
        {data.hasCatalogError ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-highlight/30 bg-highlight/10 p-5 text-sm leading-7"
          >
            <AlertTriangle className="mt-1 size-5 shrink-0 text-highlight" />
            <div>
              <p className="font-bold">محصولات فعلاً در دسترس نیستند</p>
              <p className="text-muted-foreground">
                ارتباط با فروشگاه برقرار نشد. کمی بعد دوباره تلاش کنید.
              </p>
            </div>
          </div>
        ) : null}

        <CategoryStrip categories={data.categories} />
        <ProductSection
          title="محبوب‌ترین انتخاب‌ها"
          eyebrow="پرفروش‌ها"
          description="محصولاتی که بیشتر از همه مورد توجه مشتریان بوده‌اند."
          products={data.bestSellers}
          eagerImageSrc={data.heroProduct?.image?.src}
        />
        <ProductSection
          id="newest"
          title="تازه‌های فروشگاه"
          eyebrow="همین حالا رسیده"
          description="جدیدترین محصولاتی که به ویترین فروشگاه اضافه شده‌اند."
          products={data.newest}
          eagerImageSrc={data.heroProduct?.image?.src}
        />
        <ProductSection
          title="فرصت‌های ویژه"
          eyebrow="با قیمت بهتر"
          description="محصولات تخفیف‌دار برای یک انتخاب به‌صرفه‌تر."
          products={data.discounted}
          eagerImageSrc={data.heroProduct?.image?.src}
          tone="accent"
        />
      </div>
    </div>
  );
}
