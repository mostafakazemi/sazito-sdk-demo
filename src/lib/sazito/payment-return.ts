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

export function isPaymentCallbackRoute(callback?: string[]) {
  return Boolean(
    callback?.length && callback.every((segment) => Boolean(segment.trim())),
  );
}

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

export function summarizePaymentReturnRequest(
  callback: string[] | undefined,
  searchParams: CheckoutSearchParams,
) {
  const receivedParameterCount = Object.keys(searchParams).length;
  const recognizedParameterKeys = Object.keys(
    extractPaymentReturnParams(searchParams) ?? {},
  ).sort();

  return {
    callbackSegmentCount: callback?.length ?? 0,
    receivedParameterCount,
    recognizedParameterKeys,
    ignoredParameterCount:
      receivedParameterCount - recognizedParameterKeys.length,
  };
}

export function removePaymentReturnParams(href: string): string {
  const url = new URL(href, "http://localhost");

  PAYMENT_RETURN_KEYS.forEach((key) => url.searchParams.delete(key));
  const pathname = url.pathname.startsWith("/checkout/")
    ? "/checkout"
    : url.pathname;

  return `${pathname}${url.search}${url.hash}`;
}
