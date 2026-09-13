import type { CheckoutOrder } from "@sazito/client-sdk";

/** Shared by checkout completion and account order history. */
export function orderDetailsHref(
  order: Pick<CheckoutOrder, "id" | "orderIdentifier">,
): string {
  return `/account/orders/${encodeURIComponent(String(order.id))}?identifier=${encodeURIComponent(order.orderIdentifier)}`;
}
