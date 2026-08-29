import type { Metadata } from "next";

import { ProfilePage } from "@/components/account/profile-page";

export const metadata: Metadata = {
  title: "اطلاعات حساب",
  robots: { index: false, follow: false },
};

export default function AccountProfilePage() {
  return (
    <div className="site-container py-8 sm:py-12">
      <ProfilePage />
    </div>
  );
}
