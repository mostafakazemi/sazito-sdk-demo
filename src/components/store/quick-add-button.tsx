"use client";

import * as React from "react";
import Link from "next/link";
import { LoaderCircle, Settings2, ShoppingBag } from "lucide-react";

import { useCommerce } from "@/components/commerce/commerce-provider";
import { Button } from "@/components/ui/button";
import type { ProductCardView } from "@/lib/sazito/types";

export function QuickAddButton({ product }: { product: ProductCardView }) {
  const { addItem } = useCommerce();
  const [error, setError] = React.useState<string | null>(null);
  const [isAdding, setIsAdding] = React.useState(false);

  if (!product.available) {
    return <Button type="button" variant="outline" size="sm" disabled className="w-full">ناموجود</Button>;
  }

  if (!product.canQuickAdd || product.variantId === null) {
    return (
      <Button asChild variant="outline" size="sm" className="w-full">
        <Link href={product.href}><Settings2 />انتخاب گزینه‌ها</Link>
      </Button>
    );
  }

  const handleAdd = async () => {
    if (isAdding) return;
    setError(null);
    setIsAdding(true);
    try {
      const result = await addItem(product.variantId!, product.minQuantity);
      if (!result.ok) setError(result.message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div>
      <Button
        type="button"
        size="sm"
        className="w-full"
        disabled={isAdding}
        aria-busy={isAdding}
        onClick={() => void handleAdd()}
      >
        {isAdding ? <LoaderCircle className="animate-spin" /> : <ShoppingBag />}
        افزودن سریع
      </Button>
      {error ? <p role="alert" className="mt-2 text-xs leading-5 text-danger">{error}</p> : null}
    </div>
  );
}
