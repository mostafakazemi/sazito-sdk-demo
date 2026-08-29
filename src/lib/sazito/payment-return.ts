export type CheckoutSearchParams = Record<
  string,
  string | string[] | undefined
>;

export const PAYMENT_RETURN_KEYS = [
  "tatoken",
  "isFailed",
  "code",
  "imageUrl",
  "id",
  "paymentIdentifier",
  "trackingData",
  "payload",
] as const;

const paymentReturnKeySet = new Set<string>(PAYMENT_RETURN_KEYS);

export function extractPaymentReturnParams(
  searchParams: CheckoutSearchParams,
): Record<string, string> | undefined {
  const entries = Object.entries(searchParams).flatMap(([key, value]) => {
    if (!paymentReturnKeySet.has(key)) return [];

    const normalized = Array.isArray(value) ? value[0] : value;
    return normalized === undefined ? [] : [[key, normalized] as const];
  });

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

export function removePaymentReturnParams(href: string): string {
  const url = new URL(href, "http://localhost");

  PAYMENT_RETURN_KEYS.forEach((key) => url.searchParams.delete(key));

  return `${url.pathname}${url.search}${url.hash}`;
}
