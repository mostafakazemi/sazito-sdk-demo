import type { Metadata } from "next";

import { AccountDashboard } from "@/components/account/account-dashboard";

export const metadata: Metadata = {
  title: "حساب کاربری",
  description: "مدیریت پروفایل، نشانی‌ها، سفارش‌ها، رزروها و کیف پول",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <div className="site-container py-8 sm:py-12">
      <AccountDashboard />
    </div>
  );
}
