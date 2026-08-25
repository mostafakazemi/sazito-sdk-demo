"use client";

import * as React from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  CircleOff,
  Info,
  LoaderCircle,
  Minus,
  PackageCheck,
  Plus,
  ShoppingBag,
} from "lucide-react";

import { useCommerce } from "@/components/commerce/commerce-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { clampCartQuantity } from "@/lib/sazito/cart";
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
  const { addItem, isMutating } = useCommerce();
  const [selectedId, setSelectedId] = React.useState(
    defaultVariantId ?? variants[0]?.id ?? null,
  );
  const [quantities, setQuantities] = React.useState<Record<number, number>>({});
  const [feedback, setFeedback] = React.useState<
    { type: "success" | "error"; message: string } | null
  >(null);
  const selected =
    variants.find((variant) => variant.id === selectedId) ?? variants[0] ?? null;

  if (!selected) {
    return (
      <div className="rounded-2xl border bg-muted/45 p-4 text-sm text-muted-foreground">
        اطلاعات قیمت و تنوع این محصول ثبت نشده است.
      </div>
    );
  }

  const quantity = clampCartQuantity(
    quantities[selected.id] ?? selected.minQuantity,
    selected.minQuantity,
    selected.maxQuantity,
  );
  const setQuantity = (value: number) => {
    setFeedback(null);
    setQuantities((current) => ({
      ...current,
      [selected.id]: clampCartQuantity(
        value,
        selected.minQuantity,
        selected.maxQuantity,
      ),
    }));
  };
  const handleAddToCart = async () => {
    setFeedback(null);
    const result = await addItem(selected.id, quantity);

    setFeedback(
      result.ok
        ? { type: "success", message: "محصول به سبد خرید اضافه شد." }
        : { type: "error", message: result.message },
    );
  };

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
                onClick={() => {
                  setSelectedId(variant.id);
                  setFeedback(null);
                }}
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

      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
          <div
            className="flex h-13 items-center justify-between rounded-2xl border bg-card p-1"
            aria-label="تعداد محصول"
          >
            <button
              type="button"
              onClick={() => setQuantity(quantity - 1)}
              disabled={quantity <= selected.minQuantity || isMutating}
              aria-label="کم کردن تعداد"
              className="flex size-10 items-center justify-center rounded-xl text-primary outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-35"
            >
              <Minus className="size-4" />
            </button>
            <span className="min-w-10 text-center font-black" aria-live="polite">
              {quantity.toLocaleString("fa-IR")}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              disabled={
                isMutating ||
                (selected.maxQuantity !== null && quantity >= selected.maxQuantity)
              }
              aria-label="زیاد کردن تعداد"
              className="flex size-10 items-center justify-center rounded-xl text-primary outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-35"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <Button
            type="button"
            size="lg"
            disabled={!selected.available || isMutating}
            onClick={() => void handleAddToCart()}
          >
            {isMutating ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <ShoppingBag />
            )}
            {selected.available ? "افزودن به سبد خرید" : "محصول ناموجود است"}
          </Button>
        </div>

        <div aria-live="polite" aria-atomic="true">
          {feedback ? (
            <div
              className={cn(
                "flex flex-wrap items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold",
                feedback.type === "success"
                  ? "bg-secondary text-primary"
                  : "bg-danger/10 text-danger",
              )}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <CircleOff className="size-4" />
              )}
              <span>{feedback.message}</span>
              {feedback.type === "success" ? (
                <Link
                  href="/checkout"
                  className="mr-auto rounded-lg px-2 py-1 underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  مشاهده سبد و تسویه
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl bg-secondary/70 p-4 text-sm leading-7 text-secondary-foreground">
        <Info className="mt-1 size-4 shrink-0" />
        <p>سبد خرید و مراحل ارسال و پرداخت مستقیماً با زیرساخت امن سازیتو انجام می‌شود.</p>
      </div>
    </div>
  );
}
