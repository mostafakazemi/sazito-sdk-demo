import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ImageOff } from "lucide-react";

import { QuickAddButton } from "@/components/store/quick-add-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/sazito/presenters";
import type { ProductCardView } from "@/lib/sazito/types";

export function ProductCard({ product }: { product: ProductCardView }) {
  return (
    <Card className="group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_24px_70px_-40px_rgba(31,42,36,0.7)]">
      <div className="flex h-full flex-col">
        <Link href={product.href} className="block outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
        <div className="relative aspect-square overflow-hidden bg-muted/55">
          {product.image ? (
            <Image
              src={product.image.src}
              alt={product.image.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-5 transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-card">
                <ImageOff className="size-6" />
              </span>
              <span className="text-xs">تصویر محصول ثبت نشده</span>
            </div>
          )}
          <div className="absolute right-3 top-3 flex flex-wrap gap-2">
            {product.price?.discounted ? <Badge variant="accent">تخفیف</Badge> : null}
            {!product.available ? <Badge variant="outline">ناموجود</Badge> : null}
          </div>
        </div>
        </Link>
        <CardContent className="flex flex-1 flex-col p-4 sm:p-5">
          {product.category ? (
            <p className="text-xs font-semibold text-highlight">{product.category}</p>
          ) : null}
          <h3 className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 font-bold sm:text-base">
            <Link href={product.href} className="rounded outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">
              {product.name}
            </Link>
          </h3>
          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            <div>
              {product.price ? (
                <>
                  {product.price.original ? (
                    <p className="text-xs text-muted-foreground line-through">
                      {formatPrice(product.price.original)}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm font-black sm:text-base">
                    {formatPrice(product.price.current)}
                  </p>
                </>
              ) : (
                <p className="text-sm font-semibold text-muted-foreground">قیمت نامشخص</p>
              )}
            </div>
            <Link href={product.href} aria-label={`مشاهده ${product.name}`} className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary outline-none transition-colors group-hover:bg-primary group-hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring">
              <ArrowLeft className="size-4" />
            </Link>
          </div>
          <div className="mt-4 border-t pt-4">
            <QuickAddButton product={product} />
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
