"use client";

import * as React from "react";
import { Check, CircleOff, Info, PackageCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/sazito/presenters";
import type { ProductVariantView } from "@/lib/sazito/types";
import { cn } from "@/lib/utils";

export function VariantSelector({
  variants,
  defaultVariantId,
}: {
  variants: ProductVariantView[];
  defaultVariantId: number | null;
}) {
  const [selectedId, setSelectedId] = React.useState(
    defaultVariantId ?? variants[0]?.id ?? null,
  );
  const selected =
    variants.find((variant) => variant.id === selectedId) ?? variants[0] ?? null;

  if (!selected) {
    return (
      <div className="rounded-2xl border bg-muted/45 p-4 text-sm text-muted-foreground">
        اطلاعات قیمت و تنوع این محصول ثبت نشده است.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        {selected.price.original ? (
          <p className="text-sm text-muted-foreground line-through">
            {formatPrice(selected.price.original)}
          </p>
        ) : null}
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <p className="text-2xl font-black sm:text-3xl">
            {formatPrice(selected.price.current)}
          </p>
          {selected.price.discounted ? <Badge variant="accent">قیمت ویژه</Badge> : null}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm font-semibold">
        {selected.available ? (
          <>
            <PackageCheck className="size-5 text-primary" />
            <span className="text-primary">موجود در فروشگاه</span>
          </>
        ) : (
          <>
            <CircleOff className="size-5 text-danger" />
            <span className="text-danger">در حال حاضر ناموجود</span>
          </>
        )}
        {selected.sku ? (
          <span className="mr-auto text-xs font-normal text-muted-foreground" dir="ltr">
            {selected.sku}
          </span>
        ) : null}
      </div>

      {variants.length > 1 || selected.attributes.length ? (
        <div>
          <p className="mb-3 text-sm font-bold">انتخاب ویژگی</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="تنوع محصول">
            {variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                role="radio"
                aria-checked={variant.id === selected.id}
                onClick={() => setSelectedId(variant.id)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  variant.id === selected.id
                    ? "border-primary bg-secondary text-primary"
                    : "hover:border-primary/40",
                  !variant.available && "text-muted-foreground line-through",
                )}
              >
                {variant.id === selected.id ? <Check className="size-4" /> : null}
                {variant.attributes[0]?.extra ? (
                  <span
                    className="size-4 rounded-full border"
                    style={{ background: variant.attributes[0].extra }}
                    aria-hidden="true"
                  />
                ) : null}
                {variant.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <Separator />
      <div className="flex items-start gap-3 rounded-2xl bg-secondary/70 p-4 text-sm leading-7 text-secondary-foreground">
        <Info className="mt-1 size-4 shrink-0" />
        <p>این نسخه برای مشاهده کاتالوگ است و امکان افزودن به سبد خرید در این مرحله فعال نیست.</p>
      </div>
    </div>
  );
}
