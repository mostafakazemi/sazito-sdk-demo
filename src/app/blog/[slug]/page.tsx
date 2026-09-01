import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CmsArticle } from "@/components/store/cms-article";
import { localStorefrontPath } from "@/lib/seo";
import { sazitoStoreOrigin } from "@/lib/sazito/client";
import { getBlogPostData, getStoreChrome } from "@/lib/sazito/data";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

function blogPath(slug: string) {
  return `/blog/${slug}`;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getBlogPostData(blogPath(slug));

  if (!page) return { title: "نوشته پیدا نشد" };

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
      type: "article",
      locale: "fa_IR",
      title: page.metaTitle,
      description: page.metaDescription,
      url: canonical,
      images: image,
      publishedTime: page.createdAt,
      modifiedTime: page.updatedAt,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: page.metaTitle,
      description: page.metaDescription,
      images: image?.map((item) => item.url),
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const [page, store] = await Promise.all([
    getBlogPostData(blogPath(slug)),
    getStoreChrome(),
  ]);

  if (!page) notFound();

  return <CmsArticle page={page} store={store} />;
}
