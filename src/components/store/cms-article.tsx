import Image from "next/image";
import { CalendarDays, FileText, Newspaper } from "lucide-react";

import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { buildBreadcrumbJsonLd, buildCmsPageJsonLd } from "@/lib/seo";
import { formatPersianDate } from "@/lib/sazito/presenters";
import type { CmsPageView, StoreChrome } from "@/lib/sazito/types";

export function CmsArticle({
  page,
  store,
}: {
  page: CmsPageView;
  store: StoreChrome;
}) {
  const isBlog = page.type === "blog";
  const breadcrumbItems = [
    { name: "خانه", href: "/" },
    ...(isBlog ? [{ name: "وبلاگ", href: "/blog" }] : []),
    { name: page.title, href: page.href },
  ];
  const displayDate = formatPersianDate(page.updatedAt || page.createdAt);

  return (
    <article className="site-container py-8 sm:py-12">
      <JsonLd
        data={[
          buildCmsPageJsonLd(page, store),
          buildBreadcrumbJsonLd(breadcrumbItems),
        ]}
      />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">خانه</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {isBlog ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink href="/blog">وبلاگ</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          ) : null}
          <BreadcrumbItem>
            <BreadcrumbPage>{page.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mx-auto mt-8 max-w-4xl text-center">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Badge variant="secondary">
            {isBlog ? <Newspaper /> : <FileText />}
            {isBlog ? "نوشته وبلاگ" : "صفحه فروشگاه"}
          </Badge>
          {displayDate ? (
            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="size-4" />
              {displayDate}
            </span>
          ) : null}
        </div>
        <h1 className="mt-5 text-3xl leading-[1.5] font-black sm:text-5xl">
          {page.title}
        </h1>
        {page.summary ? (
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-muted-foreground sm:text-base">
            {page.summary}
          </p>
        ) : null}
      </header>

      {page.image ? (
        <div className="relative mx-auto mt-9 aspect-[16/7] max-w-5xl overflow-hidden rounded-4xl border bg-muted/50 shadow-sm">
          <Image
            src={page.image.src}
            alt={page.image.alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 960px"
            className="object-cover"
          />
        </div>
      ) : null}

      <section className="mx-auto mt-9 max-w-4xl rounded-4xl border bg-card p-6 shadow-sm sm:p-10 lg:p-12">
        {page.contentHtml ? (
          <div
            className="cms-rich-text"
            dangerouslySetInnerHTML={{ __html: page.contentHtml }}
          />
        ) : (
          <div className="py-8 text-center">
            <FileText className="mx-auto size-9 text-muted-foreground/60" />
            <p className="mt-4 font-bold">محتوایی برای این صفحه ثبت نشده است.</p>
          </div>
        )}
      </section>
    </article>
  );
}
