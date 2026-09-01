import type { CartCredentials, SazitoResponse } from "@sazito/client-sdk";

export type GuestCartMergeStatus = "not-needed" | "merged" | "failed";
export type GuestCartRefreshResult =
  | { ok: true }
  | { ok: false; message: string };

export const GUEST_CART_MERGE_WARNING =
  "ورود انجام شد، اما همگام‌سازی سبد مهمان با حساب کامل نشد. پیش از پرداخت، محتوای سبد را بررسی کنید.";

export function hasGuestCartCredentials(
  credentials: CartCredentials | null,
) {
  return Boolean(credentials?.identifier.trim());
}

export async function mergeGuestCartAfterLogin({
  shouldMerge,
  mergeUser,
  refreshCart,
}: {
  shouldMerge: boolean;
  mergeUser(): Promise<SazitoResponse<unknown>>;
  refreshCart(): Promise<GuestCartRefreshResult>;
}): Promise<GuestCartMergeStatus> {
  if (!shouldMerge) return "not-needed";

  try {
    const response = await mergeUser();
    if (response.error) return "failed";

    const refreshResult = await refreshCart();
    return refreshResult.ok ? "merged" : "failed";
  } catch {
    return "failed";
  }
}
