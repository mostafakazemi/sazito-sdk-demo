import { ArrowLeft, Compass, Shapes, Sparkles } from "lucide-react";
import Link from "next/link";

import type { CategoryView } from "@/lib/sazito/types";
import { formatNumber } from "@/lib/sazito/presenters";

export function CategoryStrip({ categories }: { categories: CategoryView[] }) {
  if (!categories.length) return null;

  const icons = [Shapes, Compass, Sparkles] as const;

  return (
    <section aria-labelledby="categories-title" className="relative">
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
        <div>
          <p className="text-xs font-bold text-highlight sm:text-sm">انتخاب بر اساس نیاز</p>
          <div className="mt-2 flex items-end gap-3">
            <h2 id="categories-title" className="text-xl font-black sm:text-2xl">
              از اینجا شروع کنید
            </h2>
            <span className="mb-1 hidden h-px w-12 bg-primary/30 sm:block" aria-hidden="true" />
          </div>
          <p className="mt-2 max-w-xl text-xs leading-6 text-muted-foreground sm:text-sm">
            مجموعه‌های محبوب را سریع‌تر پیدا کنید.
          </p>
        </div>
        <span className="hidden rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground sm:inline-flex">
          {formatNumber(categories.length)} دسته
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {categories.map((category, index) => {
          const Icon = icons[index % icons.length];

          return (
            <Link
              key={`${category.id}-${category.href}`}
              href={category.href}
              className="group flex min-h-32 flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_16px_38px_-28px_rgba(31,42,36,0.65)] sm:min-h-36 sm:rounded-3xl sm:p-5"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground sm:size-10">
                  <Icon className="size-4 sm:size-[18px]" aria-hidden="true" />
                </span>
                {category.count !== null ? (
                  <span className="text-[10px] font-bold text-muted-foreground sm:text-[11px]">
                    {formatNumber(category.count)} کالا
                  </span>
                ) : null}
              </span>
              <span className="mt-4 block min-w-0">
                <span className="block truncate text-sm font-black sm:text-base">{category.name}</span>
                <span className="mt-1 block truncate text-[11px] text-muted-foreground sm:text-xs">
                  {category.description ?? "محصولات منتخب این دسته"}
                </span>
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">
                مشاهده
                <ArrowLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
