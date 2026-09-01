import type { Metadata } from "next";

import {
  PasswordResetPage as PasswordResetPageContent,
} from "@/components/account/password-reset-page";
import {
  extractPasswordResetToken,
  type PasswordResetSearchParams,
} from "@/lib/sazito/password-reset";

export const metadata: Metadata = {
  title: "بازیابی رمز عبور",
  description: "انتخاب رمز عبور جدید برای حساب کاربری",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<PasswordResetSearchParams>;
}) {
  const token = extractPasswordResetToken(await searchParams);

  return (
    <div className="site-container py-10 sm:py-16">
      <PasswordResetPageContent token={token} />
    </div>
  );
}
