import { ArrowUpLeft, Shapes } from "lucide-react";

import type { CategoryView } from "@/lib/sazito/types";

export function CategoryStrip({ categories }: { categories: CategoryView[] }) {
  if (!categories.length) return null;

  return (
    <section aria-labelledby="categories-title">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-highlight">سریع‌تر پیدا کن</p>
          <h2 id="categories-title" className="mt-2 text-2xl font-black sm:text-3xl">
            دسته‌بندی‌های فروشگاه
          </h2>
        </div>
        <Shapes className="hidden size-8 text-primary/35 sm:block" />
      </div>
      <div className="flex snap-x gap-3 overflow-x-auto pb-2">
        {categories.map((category) => (
          <a
            key={`${category.id}-${category.href}`}
            href={category.href}
            className="group flex min-w-44 snap-start items-center justify-between gap-4 rounded-2xl border bg-card px-5 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/35"
          >
            <span>
              <span className="block font-bold">{category.name}</span>
              {category.count !== null ? (
                <span className="mt-1 block text-xs text-muted-foreground">
                  {new Intl.NumberFormat("fa-IR").format(category.count)} محصول
                </span>
              ) : null}
            </span>
            <ArrowUpLeft className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
          </a>
        ))}
      </div>
    </section>
  );
}
