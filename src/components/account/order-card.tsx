import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Box, PackageCheck } from "lucide-react";
import type { Order } from "@sazito/client-sdk";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  orderItemCount,
  orderItems,
  orderTotal,
} from "@/lib/sazito/account";
import { orderDetailsHref } from "@/lib/sazito/order-routes";
import { attributeValue, formatNumber, formatPrice } from "@/lib/sazito/presenters";

export function OrderCard({ order }: { order: Order }) {
  const items = orderItems(order);
  const itemCount = orderItemCount(order);

  return (
    <Card className="group overflow-hidden border-border/70 bg-card transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_20px_50px_-32px_rgba(31,42,36,0.65)] motion-reduce:transform-none">
      <CardHeader className="flex-row items-start justify-between gap-4 border-b bg-secondary/25 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-card">
            <PackageCheck className="size-3.5" />
              سفارش ثبت‌شده
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatNumber(itemCount)} کالا
            </span>
          </div>
          <CardTitle className="mt-3 truncate text-base sm:text-lg">
            سفارش شماره {order.orderNumber || formatNumber(order.id)}
          </CardTitle>
        </div>
        <div className="shrink-0 text-left">
          <p className="text-[0.6875rem] text-muted-foreground">مبلغ سفارش</p>
          <p className="mt-1 text-base font-black text-primary sm:text-lg">
            {formatPrice(orderTotal(order))}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-5 sm:p-6">
        <div className="space-y-2.5 text-sm text-muted-foreground">
          {items.slice(0, 2).map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-secondary/30 p-3">
              <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-secondary text-primary">
                {item.image?.url ? (
                  <Image
                    src={item.image.url}
                    alt={item.name || "محصول سفارش"}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <Box className="size-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="min-w-0 truncate font-bold text-foreground">
                  {item.name || "محصول سفارش"}
                </span>
                {item.attributes.length ? (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {item.attributes.map((attribute) => (
                    <span
                      key={`${item.id}-${attribute.name}`}
                      className="rounded-full bg-card px-2 py-0.5 text-[0.6875rem]"
                    >
                      {attribute.name}: {attributeValue(attribute)}
                    </span>
                  ))}
                  </div>
                ) : null}
              </div>
              <span className="shrink-0 rounded-full bg-card px-2 py-1 text-[0.6875rem] font-bold">
                {formatNumber(item.quantity)} عدد
              </span>
            </div>
          ))}
          {items.length > 2 ? (
            <p className="px-1 text-xs text-muted-foreground">
              و {formatNumber(items.length - 2)} مورد دیگر
            </p>
          ) : null}
        </div>

        <Link
          href={orderDetailsHref(order)}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground outline-none transition-[background-color,box-shadow,transform] hover:bg-primary/90 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring group-hover:gap-3"
        >
          مشاهده جزئیات
          <ArrowLeft className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
