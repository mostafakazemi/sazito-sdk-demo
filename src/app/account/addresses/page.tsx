import type { Metadata } from "next";

import { AddressesPage } from "@/components/account/addresses-page";

export const metadata: Metadata = {
  title: "نشانی‌های من",
  robots: { index: false, follow: false },
};

export default function AccountAddressesPage() {
  return (
    <div className="site-container py-8 sm:py-12">
      <AddressesPage />
    </div>
  );
}
