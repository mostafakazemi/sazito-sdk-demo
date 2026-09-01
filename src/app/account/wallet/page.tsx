import type { Metadata } from "next";

import { WalletPage } from "@/components/account/wallet-page";

export const metadata: Metadata = {
  title: "کیف پول من",
  robots: { index: false, follow: false },
};

export default function AccountWalletPage() {
  return (
    <div className="site-container py-8 sm:py-12">
      <WalletPage />
    </div>
  );
}
