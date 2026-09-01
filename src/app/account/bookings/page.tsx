import type { Metadata } from "next";

import { BookingsPage } from "@/components/account/bookings-page";

export const metadata: Metadata = {
  title: "رزروهای من",
  robots: { index: false, follow: false },
};

export default function AccountBookingsPage() {
  return (
    <div className="site-container py-8 sm:py-12">
      <BookingsPage />
    </div>
  );
}
