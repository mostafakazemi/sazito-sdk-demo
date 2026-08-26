import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Box, ChevronLeft, Layers3 } from "lucide-react";

import { ProductGallery } from "@/components/store/product-gallery";
import { ProductReviews } from "@/components/store/product-reviews";
import { ProductSection } from "@/components/store/product-section";
import { VariantSelector } from "@/components/store/variant-selector";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getProductPageData, getResolvedProduct } from "@/lib/sazito/data";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = await getResolvedProduct(slug);

  if (!route) return { title: "محصول پیدا نشد" };

  const product = route.entity;
  const attribute = (name: string) => {
    const item = product.attributes?.find(
      (entry) => entry.name.toLocaleLowerCase("en-US") === name,
    );
    if (!item) return "";
    return typeof item.value === "string" ? item.value : item.value.value;
  };
  const description = attribute("metadescription") || attribute("description").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
  const noIndex = ["1", "true", "yes"].includes(attribute("noindex").toLocaleLowerCase("en-US"));

  return {
    title: attribute("metatitle") || product.name,
    description: description || `مشاهده جزئیات ${product.name}`,
    robots: { index: !noIndex, follow: !noIndex },
    openGraph: {
      type: "website",
      title: product.name,
      description: description || undefined,
      images: product.images[0]?.url ? [{ url: product.images[0].url, alt: product.images[0].alt || product.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductPageData(slug);

  if (!product) notFound();

  return (
    <div className="site-container space-y-14 py-7 sm:space-y-20 sm:py-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">خانه</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          {product.categories[0] ? (
            <>
              <BreadcrumbItem><BreadcrumbLink href={product.categories[0].href}>{product.categories[0].name}</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          ) : null}
          <BreadcrumbItem><BreadcrumbPage>{product.name}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <section className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <ProductGallery images={product.images} productName={product.name} />

        <Card className="lg:sticky lg:top-28">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary"><Box />کالای {product.productType === "physical" ? "فیزیکی" : product.productType}</Badge>
              {product.categories.slice(0, 2).map((category) => (
                <a key={`${category.id}-${category.href}`} href={category.href}>
                  <Badge variant="outline">{category.name}</Badge>
                </a>
              ))}
            </div>
            <h1 className="mt-5 text-3xl leading-[1.5] font-black sm:text-4xl">{product.name}</h1>
            {product.summary ? <p className="mt-4 line-clamp-3 text-sm leading-8 text-muted-foreground">{product.summary}</p> : null}
            <Separator className="my-7" />
            <VariantSelector variants={product.variants} defaultVariantId={product.defaultVariantId} />
          </CardContent>
        </Card>
      </section>

      {product.descriptionHtml || product.specifications.length ? (
        <section className="grid gap-6 lg:grid-cols-[1fr_0.55fr]">
          {product.descriptionHtml ? (
            <div className="rounded-4xl border bg-card p-6 sm:p-9">
              <p className="text-sm font-bold text-highlight">درباره محصول</p>
              <h2 className="mt-2 text-2xl font-black">معرفی و توضیحات</h2>
              <div className="product-rich-text mt-6 text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
            </div>
          ) : null}
          {product.specifications.length ? (
            <div className="rounded-4xl border bg-card p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary"><Layers3 className="size-5" /></span>
                <h2 className="text-xl font-black">مشخصات محصول</h2>
              </div>
              <dl className="mt-6 divide-y">
                {product.specifications.map((item) => (
                  <div key={`${item.name}-${item.value}`} className="grid grid-cols-[0.75fr_1.25fr] gap-4 py-4 text-sm">
                    <dt className="text-muted-foreground">{item.name}</dt>
                    <dd className="font-semibold">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </section>
      ) : null}

      <ProductReviews reviews={product.reviews} />

      <ProductSection
        title="محصولات مرتبط"
        eyebrow="شاید این‌ها را هم بپسندید"
        description="چند انتخاب نزدیک به محصولی که در حال مشاهده آن هستید."
        products={product.related}
      />

      <div className="flex justify-center">
        <Link href="/" className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-primary hover:bg-secondary">
          بازگشت به همه محصولات
          <ChevronLeft className="size-4" />
        </Link>
      </div>
    </div>
  );
}
