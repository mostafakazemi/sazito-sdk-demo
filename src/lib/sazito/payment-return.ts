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

export function summarizePaymentReturnRequest(
  callback: string[] | undefined,
  searchParams: CheckoutSearchParams,
  paymentReturnParams?: Record<string, string>,
) {
  const forwardedParameterKeys = Object.keys(paymentReturnParams ?? {});
  const recognizedKeySet = new Set<string>(PAYMENT_RETURN_KEYS);
  const recognizedParameterKeys = forwardedParameterKeys
    .filter((key) => recognizedKeySet.has(key))
    .sort();

  return {
    callbackSegmentCount: callback?.length ?? 0,
    callbackParsed: Boolean(paymentReturnParams),
    receivedQueryParameterCount: Object.keys(searchParams).length,
    forwardedParameterCount: forwardedParameterKeys.length,
    recognizedParameterKeys,
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
