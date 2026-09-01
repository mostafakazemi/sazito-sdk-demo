import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, ImageOff, Newspaper } from "lucide-react";

import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buildContentListJsonLd } from "@/lib/seo";
import { getBlogIndexData } from "@/lib/sazito/data";
import { formatPersianDate } from "@/lib/sazito/presenters";

export const metadata: Metadata = {
  title: "وبلاگ",
  description: "نوشته‌ها و تازه‌های فروشگاه",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    title: "وبلاگ",
    description: "نوشته‌ها و تازه‌های فروشگاه",
    url: "/blog",
  },
};

export default async function BlogPage() {
  const data = await getBlogIndexData();

  return (
    <div className="site-container py-8 sm:py-12">
      <JsonLd data={buildContentListJsonLd("وبلاگ", data.posts)} />
      <header className="rounded-4xl border bg-card p-6 sm:p-9">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">
            <Newspaper />
            وبلاگ فروشگاه
          </Badge>
          <span className="text-sm text-muted-foreground">
            {data.total.toLocaleString("fa-IR")} نوشته
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-black sm:text-4xl">تازه‌های فروشگاه</h1>
        <p className="mt-3 max-w-2xl text-sm leading-8 text-muted-foreground">
          راهنماها، خبرها و نوشته‌هایی که فروشگاه در سازیتو منتشر کرده است.
        </p>
      </header>

      {data.posts.length ? (
        <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.posts.map((post) => (
            <Card
              key={`${post.id}-${post.href}`}
              className="group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_24px_70px_-40px_rgba(31,42,36,0.7)]"
            >
              <div className="flex h-full flex-col">
                <Link
                  href={post.href}
                  className="relative block aspect-[16/10] overflow-hidden bg-muted/55 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  {post.image ? (
                    <Image
                      src={post.image.src}
                      alt={post.image.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                      <ImageOff className="size-8" />
                      <span className="text-xs">تصویری ثبت نشده است</span>
                    </span>
                  )}
                </Link>
                <CardContent className="flex flex-1 flex-col p-5 sm:p-6">
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="size-4" />
                    {formatPersianDate(post.updatedAt || post.createdAt)}
                  </p>
                  <h2 className="mt-3 text-lg leading-8 font-black">
                    <Link
                      href={post.href}
                      className="rounded outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  {post.summary ? (
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">
                      {post.summary}
                    </p>
                  ) : null}
                  <Link
                    href={post.href}
                    className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold text-primary outline-none hover:text-highlight focus-visible:underline"
                  >
                    ادامه نوشته
                    <ArrowLeft className="size-4" />
                  </Link>
                </CardContent>
              </div>
            </Card>
          ))}
        </section>
      ) : (
        <div className="mt-8 rounded-4xl border bg-card px-6 py-16 text-center">
          <Newspaper className="mx-auto size-10 text-muted-foreground/60" />
          <h2 className="mt-5 text-xl font-black">هنوز نوشته‌ای منتشر نشده است</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            نوشته‌های فعال سازیتو پس از انتشار در این صفحه نمایش داده می‌شوند.
          </p>
        </div>
      )}
    </div>
  );
}
