import { PackageSearch } from "lucide-react";

import { ProductCard } from "@/components/store/product-card";
import type { ProductCardView } from "@/lib/sazito/types";

export function CatalogGrid({ products }: { products: ProductCardView[] }) {
  if (!products.length) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-4xl border border-dashed bg-card/60 p-8 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
          <PackageSearch className="size-6" />
        </span>
        <h2 className="mt-4 text-lg font-black">محصولی پیدا نشد</h2>
        <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">
          فیلترها یا عبارت جست‌وجو را تغییر دهید و دوباره امتحان کنید.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={`${product.id}-${product.href}`} product={product} />
      ))}
    </div>
  );
}
