import { ProductCard } from "@/components/store/product-card";
import type { ProductCardView } from "@/lib/sazito/types";
import { cn } from "@/lib/utils";

export function ProductSection({
  id,
  title,
  eyebrow,
  description,
  products,
  tone = "plain",
}: {
  id?: string;
  title: string;
  eyebrow: string;
  description: string;
  products: ProductCardView[];
  tone?: "plain" | "accent";
}) {
  if (!products.length) return null;

  return (
    <section
      id={id}
      aria-labelledby={`${id ?? title}-title`}
      className={cn(
        "scroll-mt-28",
        tone === "accent" && "rounded-4xl bg-accent/55 px-4 py-8 sm:px-8 sm:py-10",
      )}
    >
      <div className="mb-7 max-w-2xl">
        <p className="text-sm font-bold text-highlight">{eyebrow}</p>
        <h2 id={`${id ?? title}-title`} className="mt-2 text-2xl font-black sm:text-3xl">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard key={`${product.href}-${index}`} product={product} />
        ))}
      </div>
    </section>
  );
}
