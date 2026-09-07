import "server-only";

import { createMockSazitoFetch } from "./mock";
import { createSazitoClient } from "./create-client";

function readStoreDomain() {
  const domain = process.env.SAZITO_STORE_DOMAIN?.trim();

  if (!domain) {
    throw new Error("SAZITO_STORE_DOMAIN is required.");
  }

  if (domain.includes("://") || domain === "sazito.com") {
    throw new Error(
      "SAZITO_STORE_DOMAIN must be a Sazito shop domain without protocol.",
    );
  }

  return domain;
}

export const sazitoStoreDomain = readStoreDomain();
export const sazitoStoreOrigin = `https://${sazitoStoreDomain}`;

const customFetchApi =
  process.env.SAZITO_USE_MOCKS?.trim() === "true"
    ? createMockSazitoFetch()
    : undefined;

export const sazitoClient = createSazitoClient({
  domain: sazitoStoreDomain,
  timeout: 15_000,
  retry: {
    enabled: true,
    retries: 2,
    retryDelay: 700,
  },
  cache: {
    products: { enabled: false },
    categories: { enabled: false },
    entityRoutes: { enabled: false },
  },
  customFetchApi,
});
