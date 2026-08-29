import type { Metadata } from "next";

import { OrderDetailPage } from "@/components/account/order-detail-page";

export const metadata: Metadata = {
  title: "جزئیات سفارش",
  robots: { index: false, follow: false },
};

export default function AccountOrderDetailPage() {
  return (
    <div className="site-container py-8 sm:py-12">
      <OrderDetailPage />
    </div>
  );
}
