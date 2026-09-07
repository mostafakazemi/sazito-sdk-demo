import {
  createSazitoClient as createSdkSazitoClient,
  type SazitoClient,
  type SazitoConfig,
} from "@sazito/client-sdk";

function defaultDebugValue() {
  const configuredValue =
    process.env.SAZITO_DEBUG ?? process.env.NEXT_PUBLIC_SAZITO_DEBUG;

  if (configuredValue === undefined) return true;
  return configuredValue.trim() === "true";
}

/** Create an SDK client with the storefront defaults applied consistently. */
export function createSazitoClient(
  initialProps: SazitoConfig,
): SazitoClient {
  return createSdkSazitoClient({
    debug: defaultDebugValue(),
    ...initialProps,
  });
}
