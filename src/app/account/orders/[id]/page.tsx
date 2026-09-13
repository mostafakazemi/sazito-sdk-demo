import type { Metadata } from "next";

import { OrderDetailPage } from "@/components/account/order-detail-page";

export const metadata: Metadata = {
  title: "جزئیات سفارش",
  robots: { index: false, follow: false },
};

export default async function AccountOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ identifier?: string | string[] }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const identifier = typeof query.identifier === "string" ? query.identifier : "";
  return (
    <div className="site-container py-8 sm:py-12">
      <OrderDetailPage key={`${id}:${identifier}`} orderId={Number(id)} orderIdentifier={identifier} />
    </div>
  );
}
