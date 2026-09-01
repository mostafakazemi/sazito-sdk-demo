import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CmsArticle } from "@/components/store/cms-article";
import { localStorefrontPath } from "@/lib/seo";
import { sazitoStoreOrigin } from "@/lib/sazito/client";
import { getCmsPageData, getStoreChrome } from "@/lib/sazito/data";

type CmsPageProps = {
  params: Promise<{ slug: string[] }>;
};

function cmsPath(slug: string[]) {
  return `/${slug.join("/")}`;
}

export async function generateMetadata({ params }: CmsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getCmsPageData(cmsPath(slug));

  if (!page) return { title: "صفحه پیدا نشد" };

  const canonical =
    localStorefrontPath(page.canonicalHref, sazitoStoreOrigin) ??
    page.canonicalHref;
  const image = page.image
    ? [{ url: page.image.src, alt: page.image.alt }]
    : undefined;

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical },
    robots: { index: !page.noIndex, follow: !page.noIndex },
    openGraph: {
      type: "website",
      locale: "fa_IR",
      title: page.metaTitle,
      description: page.metaDescription,
      url: canonical,
      images: image,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: page.metaTitle,
      description: page.metaDescription,
      images: image?.map((item) => item.url),
    },
  };
}

export default async function CmsPage({ params }: CmsPageProps) {
  const { slug } = await params;
  const [page, store] = await Promise.all([
    getCmsPageData(cmsPath(slug)),
    getStoreChrome(),
  ]);

  if (!page) notFound();

  return <CmsArticle page={page} store={store} />;
}
