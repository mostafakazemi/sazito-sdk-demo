import { createSazitoClient } from "@sazito/client-sdk";
import type { MenuItem, SazitoResponse } from "@sazito/client-sdk";
import { describe, expect, it } from "vitest";

const storeDomain = process.env.SAZITO_STORE_DOMAIN?.trim() || "testmosi.sazito.com";

const client = createSazitoClient({
  domain: storeDomain,
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
});

function unwrapLiveResponse<T>(response: SazitoResponse<T>, operation: string): T {
  if (response.error) {
    const status = response.error.status ? ` HTTP ${response.error.status}` : "";
    throw new Error(
      `${operation} failed for ${storeDomain}: ${response.error.type}${status}: ${response.error.message}`,
    );
  }

  if (response.data === undefined) {
    throw new Error(`${operation} returned no data for ${storeDomain}.`);
  }

  return response.data;
}

function flattenMenu(items: MenuItem[]): MenuItem[] {
  return items.flatMap((item) => [item, ...flattenMenu(item.children)]);
}

describe(`Sazito Client SDK live contract (${storeDomain})`, () => {
  it("returns the live store identity", async () => {
    const info = unwrapLiveResponse(
      await client.general.getInfo({ cache: false }),
      "general.getInfo",
    );

    expect(info.shop.name.trim()).not.toBe("");
    expect(info.shop.domain.url).toContain(storeDomain);
    expect(info.shop.logo).toEqual(
      expect.objectContaining({ main: expect.any(String), favicon: expect.any(String) }),
    );
  });

  it("returns a recursive header menu with valid destinations", async () => {
    const menu = unwrapLiveResponse(
      await client.menu.getHeaderMenu(undefined, { cache: false }),
      "menu.getHeaderMenu",
    );
    const flattened = flattenMenu(menu);

    expect(menu.length).toBeGreaterThan(0);
    expect(menu.some((item) => item.children.length > 0)).toBe(true);
    expect(flattened.length).toBeGreaterThan(menu.length);

    for (const item of flattened) {
      expect(item.name.trim()).not.toBe("");
      expect(item.url.trim()).not.toBe("");
      expect(Array.isArray(item.children)).toBe(true);
    }
  });

  it("returns both the category collection and its hierarchy", async () => {
    const result = unwrapLiveResponse(
      await client.categories.list({ page: 1, pageSize: 100 }, { cache: false }),
      "categories.list",
    );

    expect(result.categories.length).toBeGreaterThan(0);
    expect(result.tree.treeType).toBe("product_categories");
    expect(Array.isArray(result.tree.treeStructure.nodes)).toBe(true);

    for (const category of result.categories) {
      expect(category.name.trim()).not.toBe("");
      expect(category.url).toMatch(/^\/category\//);
    }
  });

  it("lists products and resolves a returned product URL", async () => {
    const products = unwrapLiveResponse(
      await client.products.list(
        { page: 1, pageSize: 5, sort: "newest" },
        { cache: false },
      ),
      "products.list",
    );
    const product = products.items[0];

    expect(products.total).toBeGreaterThan(0);
    expect(product).toBeDefined();
    expect(product.name.trim()).not.toBe("");
    expect(product.url).toMatch(/^\/product\//);
    expect(Array.isArray(product.variants)).toBe(true);

    const route = unwrapLiveResponse(
      await client.entityRoutes.resolve(product.url, { cache: false }),
      "entityRoutes.resolve",
    );

    expect(route.entityType).toBe("product");
    if (route.entityType === "product") {
      expect(route.entity.name).toBe(product.name);
      expect(route.entityId).toBeTypeOf("number");
    }
  });

  it("returns a normalized multi-entity search envelope", async () => {
    const products = unwrapLiveResponse(
      await client.products.list({ page: 1, pageSize: 1 }, { cache: false }),
      "products.list for search seed",
    );
    const searchTerm = products.items[0]?.name.trim();

    expect(searchTerm).toBeTruthy();

    const result = unwrapLiveResponse(
      await client.search.query(
        searchTerm,
        { page: 1, pageSize: 5 },
        { cache: false },
      ),
      "search.query",
    );

    expect(result.products).toEqual(
      expect.objectContaining({
        items: expect.any(Array),
        total: expect.any(Number),
        page: expect.any(Number),
        pageSize: expect.any(Number),
      }),
    );
    expect(result.blogPages.items).toBeInstanceOf(Array);
    expect(result.cmsPages.items).toBeInstanceOf(Array);
    expect(result.productCategories.items).toBeInstanceOf(Array);
  });
});
