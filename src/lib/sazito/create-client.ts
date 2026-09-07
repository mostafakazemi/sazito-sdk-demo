import {
  createSazitoClient as createSdkSazitoClient,
  type SazitoClient,
  type SazitoConfig,
} from "@sazito/client-sdk";

/** Create an SDK client with the storefront defaults applied consistently. */
export function createSazitoClient(
  initialProps: SazitoConfig,
): SazitoClient {
  return createSdkSazitoClient({
    debug: true,
    ...initialProps,
  });
}
