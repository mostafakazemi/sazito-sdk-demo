import Form from "next/form";
import Link from "next/link";
import { ChevronDown, Filter, RotateCcw, Search } from "lucide-react";

import { TemporaryFilterList } from "@/components/store/temporary-filter-list";
import { Button } from "@/components/ui/button";
import type { CatalogQuery } from "@/lib/sazito/catalog";
import type { CategoryView } from "@/lib/sazito/types";

const inputClass =
  "h-11 w-full rounded-xl border bg-card px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/25";

const temporaryFilters = {
  colors: [
    { label: "قرمز", value: "red", color: "#D95555" },
    { label: "آبی", value: "blue", color: "#4D78D8" },
    { label: "سبز", value: "green", color: "#4F8B68" },
    { label: "مشکی", value: "black", color: "#272727" },
    { label: "سفید", value: "white", color: "#FFFFFF" },
    { label: "کرم", value: "beige", color: "#D8C2A4" },
    { label: "صورتی", value: "pink", color: "#E79AB2" },
    { label: "زرد", value: "yellow", color: "#E7C84A" },
    { label: "بنفش", value: "purple", color: "#8B6CB8" },
    { label: "نارنجی", value: "orange", color: "#E58A46" },
  ],
  materials: [
    { label: "نخی", value: "cotton" },
    { label: "چرمی", value: "leather" },
    { label: "فلزی", value: "metal" },
    { label: "پلاستیکی", value: "plastic" },
    { label: "چوبی", value: "wood" },
    { label: "شیشه‌ای", value: "glass" },
    { label: "سیلیکونی", value: "silicone" },
    { label: "پلی‌استر", value: "polyester" },
  ],
  ageGroups: [
    { label: "نوزاد", value: "infant" },
    { label: "کودک", value: "child" },
    { label: "نوجوان", value: "teen" },
    { label: "بزرگسال", value: "adult" },
    { label: "سالمند", value: "senior" },
    { label: "همه سنین", value: "all-ages" },
  ],
  audiences: [
    { label: "زنانه", value: "women" },
    { label: "مردانه", value: "men" },
    { label: "دخترانه", value: "girls" },
    { label: "پسرانه", value: "boys" },
    { label: "بدون محدودیت", value: "unisex" },
  ],
};

function SelectControl({ children, ...props }: React.ComponentProps<"select">) {
  return (
    <span className="relative block">
      <select
        className="h-11 w-full cursor-pointer appearance-none rounded-2xl border border-border/80 bg-background/65 pr-3 pl-10 text-sm font-bold shadow-sm outline-none transition-[border-color,background-color,box-shadow] hover:border-primary/30 hover:bg-card focus:border-primary focus:bg-card focus:ring-2 focus:ring-ring/25"
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary"
        aria-hidden="true"
      />
    </span>
  );
}

function FilterSwitch({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="group flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/55 px-3.5 py-3 font-semibold transition-[border-color,background-color,box-shadow] hover:border-primary/30 hover:bg-secondary/45 has-[:checked]:border-primary/25 has-[:checked]:bg-secondary/60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/30">
      <span>{label}</span>
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          type="checkbox"
          role="switch"
          name={name}
          value="1"
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-muted shadow-inner transition-colors peer-checked:bg-primary"
        />
        <span
          aria-hidden="true"
          className="absolute right-0.5 size-5 rounded-full bg-card shadow-sm transition-transform duration-200 ease-out peer-checked:-translate-x-5"
        />
      </span>
    </label>
  );
}

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
            <SelectControl name="category" defaultValue={selectedCategoryId ?? ""}>
              <option value="">همه دسته‌ها</option>
              {categories.map((category) =>
                category.id !== null ? (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ) : null,
              )}
            </SelectControl>
          </label>
        ) : null}

        {showProductFilters ? (
          <label className="grid gap-2 text-sm font-semibold">
            ترتیب نمایش
            <SelectControl name="sort" defaultValue={query.sort}>
              <option value="newest">جدیدترین</option>
              <option value="best-selling">پرفروش‌ترین</option>
              <option value="availability">موجودی</option>
              <option value="discount">بیشترین تخفیف</option>
              <option value="price">ارزان‌ترین</option>
              <option value="!price">گران‌ترین</option>
            </SelectControl>
          </label>
        ) : null}

        {showProductFilters ? (
          <div className="space-y-2.5 text-sm">
            <FilterSwitch
              name="available"
              label="فقط کالاهای موجود"
              defaultChecked={query.availableOnly}
            />
            <FilterSwitch
              name="discounted"
              label="فقط تخفیف‌دارها"
              defaultChecked={query.discountedOnly}
            />
          </div>
        ) : null}

        {showProductFilters ? (
          <section className="space-y-3 border-t border-border/70 pt-5" aria-labelledby="temporary-filters-title">
            <div className="flex items-center justify-between gap-3">
              <h3 id="temporary-filters-title" className="text-sm font-black">
                ویژگی‌های محصول
              </h3>
              <span className="rounded-full bg-accent px-2 py-1 text-[10px] font-bold text-accent-foreground">
                آزمایشی
              </span>
            </div>
            <TemporaryFilterList
              label="رنگ"
              options={temporaryFilters.colors}
              defaultOpen
            />
            <TemporaryFilterList label="جنس" options={temporaryFilters.materials} />
            <TemporaryFilterList label="گروه سنی" options={temporaryFilters.ageGroups} />
            <TemporaryFilterList label="جنسیت مخاطب" options={temporaryFilters.audiences} />
          </section>
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
