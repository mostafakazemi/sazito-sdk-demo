import type { Metadata } from "next";

import { OrdersPage } from "@/components/account/orders-page";

export const metadata: Metadata = {
  title: "سفارش‌های من",
  robots: { index: false, follow: false },
};

export default function AccountOrdersPage() {
  return (
    <div className="site-container py-8 sm:py-12">
      <OrdersPage />
    </div>
  );
}
