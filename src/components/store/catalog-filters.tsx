import Form from "next/form";
import Link from "next/link";
import { Filter, RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CatalogQuery } from "@/lib/sazito/catalog";
import type { CategoryView } from "@/lib/sazito/types";

const inputClass =
  "h-11 w-full rounded-xl border bg-card px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/25";

export function CatalogFilters({
  action,
  query,
  searchTerm,
  categories = [],
  selectedCategoryId,
  showProductFilters = true,
}: {
  action: string;
  query: CatalogQuery;
  searchTerm?: string;
  categories?: CategoryView[];
  selectedCategoryId?: number | null;
  showProductFilters?: boolean;
}) {
  return (
    <aside className="rounded-[var(--radius-card)] border bg-card p-5 lg:sticky lg:top-28">
      <div className="flex items-center gap-2">
        <Filter className="size-5 text-primary" />
        <h2 className="font-black">فیلتر محصولات</h2>
      </div>

      <Form action={action} className="mt-5 space-y-5">
        {searchTerm !== undefined ? (
          <input type="hidden" name="q" value={searchTerm} />
        ) : null}

        {categories.length ? (
          <label className="grid gap-2 text-sm font-semibold">
            دسته‌بندی
            <select
              name="category"
              defaultValue={selectedCategoryId ?? ""}
              className={inputClass}
            >
              <option value="">همه دسته‌ها</option>
              {categories.map((category) =>
                category.id !== null ? (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ) : null,
              )}
            </select>
          </label>
        ) : null}

        {showProductFilters ? (
          <label className="grid gap-2 text-sm font-semibold">
            ترتیب نمایش
            <select name="sort" defaultValue={query.sort} className={inputClass}>
              <option value="newest">جدیدترین</option>
              <option value="best-selling">پرفروش‌ترین</option>
              <option value="availability">موجودی</option>
              <option value="discount">بیشترین تخفیف</option>
              <option value="price">ارزان‌ترین</option>
              <option value="!price">گران‌ترین</option>
            </select>
          </label>
        ) : null}

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold">محدوده قیمت (تومان)</legend>
          <div className="grid grid-cols-2 gap-2">
            <label className="grid gap-1 text-xs text-muted-foreground">
              از
              <input
                className={inputClass}
                type="number"
                name="priceMin"
                min="0"
                inputMode="numeric"
                defaultValue={query.priceMin ?? ""}
                placeholder="۰"
              />
            </label>
            <label className="grid gap-1 text-xs text-muted-foreground">
              تا
              <input
                className={inputClass}
                type="number"
                name="priceMax"
                min="0"
                inputMode="numeric"
                defaultValue={query.priceMax ?? ""}
                placeholder="بدون محدودیت"
              />
            </label>
          </div>
        </fieldset>

        {showProductFilters ? (
          <div className="space-y-3 text-sm">
            <label className="flex cursor-pointer items-center gap-3 font-semibold">
              <input
                type="checkbox"
                name="available"
                value="1"
                defaultChecked={query.availableOnly}
                className="size-4 accent-primary"
              />
              فقط کالاهای موجود
            </label>
            <label className="flex cursor-pointer items-center gap-3 font-semibold">
              <input
                type="checkbox"
                name="discounted"
                value="1"
                defaultChecked={query.discountedOnly}
                className="size-4 accent-primary"
              />
              فقط تخفیف‌دارها
            </label>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <Button type="submit">
            {searchTerm !== undefined ? <Search /> : <Filter />}
            اعمال
          </Button>
          <Button variant="outline" asChild>
            <Link href={searchTerm ? `${action}?q=${encodeURIComponent(searchTerm)}` : action}>
              <RotateCcw />
              پاک‌کردن
            </Link>
          </Button>
        </div>
      </Form>
    </aside>
  );
}
