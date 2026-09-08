import { ArrowLeft, Compass, Shapes, Sparkles } from "lucide-react";
import Link from "next/link";

import type { CategoryView } from "@/lib/sazito/types";

export function CategoryStrip({ categories }: { categories: CategoryView[] }) {
  if (!categories.length) return null;

  const icons = [Shapes, Compass, Sparkles] as const;

  return (
    <section aria-labelledby="categories-title" className="relative">
      <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
        <div>
          <p className="text-sm font-bold text-highlight">انتخاب بر اساس نیاز</p>
          <div className="mt-2 flex items-end gap-3">
            <h2 id="categories-title" className="text-2xl font-black sm:text-3xl">
              از اینجا شروع کنید
            </h2>
            <span className="mb-1 hidden h-px w-12 bg-primary/30 sm:block" aria-hidden="true" />
          </div>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
            مجموعه‌های محبوب را مرور کنید و سریع‌تر به انتخاب مناسب خود برسید.
          </p>
        </div>
        <span className="hidden rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground sm:inline-flex">
          {new Intl.NumberFormat("fa-IR").format(categories.length)} دسته
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => {
          const Icon = icons[index % icons.length];

          return (
            <Link
            key={`${category.id}-${category.href}`}
            href={category.href}
            className={`group relative min-h-44 overflow-hidden rounded-3xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_20px_55px_-35px_rgba(31,42,36,0.65)] ${
              index === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2 lg:min-h-92" : ""
            }`}
          >
              <span
                className={`absolute -left-3 -top-7 text-8xl leading-none font-black text-primary/[0.06] transition-transform duration-500 group-hover:scale-110 ${
                  index === 0 ? "lg:text-[11rem]" : ""
                }`}
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="relative flex items-start justify-between gap-4">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                {category.count !== null ? (
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                    {new Intl.NumberFormat("fa-IR").format(category.count)} محصول
                  </span>
                ) : null}
              </span>
              <span className="relative mt-8 block">
                <span className="block text-lg font-black sm:text-xl">{category.name}</span>
                <span className="mt-2 block text-sm leading-7 text-muted-foreground">
                  {category.description ?? "محصولات منتخب این دسته را ببینید."}
                </span>
              </span>
              <span className="relative mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">
                مشاهده مجموعه
                <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
