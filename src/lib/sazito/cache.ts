import "server-only";

import { sazitoStoreDomain } from "./client";

export const sazitoCacheTag = `sazito:${sazitoStoreDomain}`;

export const sazitoCacheConfig: { revalidate: number; tags: string[] } = {
  revalidate: 300,
  tags: [sazitoCacheTag],
};
