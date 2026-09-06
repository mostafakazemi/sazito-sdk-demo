import "server-only";

import { sazitoStoreDomain } from "./client";

export const sazitoCacheTag = `sazito:${sazitoStoreDomain}`;
export const sazitoCacheMode =
  process.env.SAZITO_USE_MOCKS?.trim() === "true" ? "mock" : "live";

export function sazitoCacheKey(name: string) {
  return [name, sazitoStoreDomain, sazitoCacheMode];
}

export const sazitoCacheConfig: { revalidate: number; tags: string[] } = {
  revalidate: 300,
  tags: [sazitoCacheTag],
};
