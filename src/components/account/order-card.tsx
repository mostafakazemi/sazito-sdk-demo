import Link from "next/link";
import { ArrowLeft, PackageCheck } from "lucide-react";
import type { Order } from "@sazito/client-sdk";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  orderItemCount,
  orderItems,
  orderTotal,
} from "@/lib/sazito/account";
import { formatPrice } from "@/lib/sazito/presenters";

export function OrderCard({ order }: { order: Order }) {
  const items = orderItems(order);
  const itemCount = orderItemCount(order);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4">
        <div>
          <Badge variant="secondary">
            <PackageCheck className="size-3.5" />
            {itemCount.toLocaleString("fa-IR")} کالا
          </Badge>
          <CardTitle className="mt-3">
            سفارش شماره {order.orderNumber || order.id.toLocaleString("fa-IR")}
          </CardTitle>
        </div>
        <p className="shrink-0 font-black text-primary">
          {formatPrice(orderTotal(order))}
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {items.slice(0, 3).map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3">
              <span className="truncate">{item.name || "محصول سفارش"}</span>
              <span className="shrink-0">
                {item.quantity.toLocaleString("fa-IR")} عدد
              </span>
            </li>
          ))}
        </ul>
        {items.length > 3 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            و {(items.length - 3).toLocaleString("fa-IR")} مورد دیگر
          </p>
        ) : null}
        <Link
          href={`/account/orders/${order.id}`}
          className="mt-5 inline-flex items-center gap-2 rounded-xl text-sm font-bold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          مشاهده جزئیات
          <ArrowLeft className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
