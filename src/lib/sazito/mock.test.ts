import { afterEach, describe, expect, it } from "vitest";
import { createSazitoClient, CredentialsManager, MemoryStorage } from "@sazito/client-sdk";

import { createMockSazitoFetch, mockSazitoResponse } from "./mock";

const endpointCases = [
  "/api/v2/general/info",
  "/api/v1/trees/fetch_single",
  "/api/v2/regions",
  "/api/v1/product_categories",
  "/api/v1/product_categories/1",
  "/api/v1/products",
  "/api/v1/entity_route/route",
  "/api/v1/search",
  "/api/v1/cms_pages",
  "/api/v1/feedbacks",
  "/api/v1/feedbacks/comments",
  "/api/v1/feedbacks/comments/details/1",
  "/api/v1/feedbacks/seed/order-1",
  "/api/v2/carts/0",
  "/api/v2/invoices",
  "/api/v2/invoices/1/applicable_shipping_methods",
  "/api/v2/shipping_addresses",
  "/api/v2/shipping_addresses/1",
  "/api/v2/shipping_methods",
  "/api/v2/payments",
  "/api/v2/payments/list",
  "/api/v2/payments/1/process_payment_step",
  "/api/v1/orders",
  "/api/v1/orders/101",
  "/api/v1/users/current",
  "/api/v1/users/login",
  "/api/v1/users/register",
  "/api/v1/sessions/login",
  "/api/v1/users/wallet/balance",
  "/api/v1/wallet/transactions",
  "/api/v1/scheduler/bookings",
  "/api/v1/scheduler/bookings/501/cancel",
  "/api/v1/scheduler/events",
  "/api/v1/scheduler/events/1",
  "/api/v1/scheduler/availabilities",
  "/api/v1/dynamic_form/1",
  "/api/v1/images",
  "/api/v1/visits/add",
  "/api/v1/pinch",
] as const;

describe("Sazito mock endpoint coverage", () => {
  afterEach(() => {
    delete process.env.SAZITO_USE_MOCKS;
    delete process.env.NEXT_PUBLIC_SAZITO_USE_MOCKS;
  });

  it.each(endpointCases)("has a response for %s", (pathname) => {
    process.env.SAZITO_USE_MOCKS = "true";

    const response = mockSazitoResponse({
      pathname,
      searchParams: new URLSearchParams({ url_part: "/product/sample-shoe" }),
      method: pathname.includes("/cancel") ? "POST" : "GET",
    });

    expect(response?.status).not.toBe(501);
  });

  it("honors the SDK snake_case pagination parameters", () => {
    process.env.SAZITO_USE_MOCKS = "true";

    const response = mockSazitoResponse({
      pathname: "/api/v1/products",
      searchParams: new URLSearchParams({ page_number: "2", page_size: "3" }),
      method: "GET",
    });

    expect(response?.body).toMatchObject({ page: 2, pageSize: 3 });
  });

  it("uses different semantic images for generated products", () => {
    process.env.SAZITO_USE_MOCKS = "true";

    const response = mockSazitoResponse({
      pathname: "/api/v1/products",
      searchParams: new URLSearchParams({ page_size: "4" }),
      method: "GET",
    });
    const body = response?.body as {
      items: Array<{ images: Array<{ url: string }> }>;
    };

    expect(new Set(body.items.map((item) => item.images[0]?.url)).size).toBe(4);
  });

  it("keeps mock cart mutations across requests", async () => {
    process.env.SAZITO_USE_MOCKS = "true";
    const mockFetch = createMockSazitoFetch();

    const createResponse = await mockFetch("https://mock-store.sazito.com/api/v2/carts", {
      method: "POST",
      body: JSON.stringify({ variants: [{ id: 10, count: 2 }] }),
    });
    const created = (await createResponse.json()) as { result: { items: unknown[] } };
    expect(created.result.items).toHaveLength(1);

    const updateResponse = await mockFetch("https://mock-store.sazito.com/api/v2/carts/0/update_products_in_cart", {
      method: "POST",
      body: JSON.stringify({ cartProductId: "mock-cart-item-10", variants: [{ id: 10, count: 3 }] }),
    });
    const updated = (await updateResponse.json()) as { result: { items: Array<{ quantity: number }> } };
    expect(updated.result.items[0].quantity).toBe(3);

    const removeResponse = await mockFetch("https://mock-store.sazito.com/api/v2/carts/0/remove_products_from_cart", {
      method: "POST",
      body: JSON.stringify({ cartProductId: "mock-cart-item-10", variants: [{ id: 10 }] }),
    });
    const removed = (await removeResponse.json()) as { result: { items: unknown[] } };
    expect(removed.result.items).toHaveLength(0);
  });

  it("builds a payable mock invoice from the cart", async () => {
    process.env.SAZITO_USE_MOCKS = "true";
    const mockFetch = createMockSazitoFetch();

    await mockFetch("https://mock-store.sazito.com/api/v2/carts", {
      method: "POST",
      body: JSON.stringify({ variants: [{ id: 10, count: 2 }] }),
    });

    const response = await mockFetch("https://mock-store.sazito.com/api/v2/invoices", {
      method: "POST",
      body: JSON.stringify({ cart_id: "0", cart_identifier: "سبد-نمونه-۱" }),
    });
    const result = (await response.json()) as {
      result: { items: unknown[]; netTotal: number; finalTotal: number };
    };

    expect(result.result.items).toHaveLength(1);
    expect(result.result.netTotal).toBe(245000);
    expect(result.result.finalTotal).toBe(245000);
  });

  it("applies and recalculates mock discounts through the SDK", async () => {
    process.env.SAZITO_USE_MOCKS = "true";
    const client = createSazitoClient(
      { domain: "mock-store.sazito.com", customFetchApi: createMockSazitoFetch(), debug: false },
      new CredentialsManager(new MemoryStorage()),
    );
    const cart = await client.cart.addItemWithAttributes(10, 2);
    await client.invoices.create();
    const discounted = await client.invoices.addDiscountCode("تخفیف");
    expect(discounted.error).toBeUndefined();
    expect(discounted.data).toMatchObject({ netTotal: 245000, couponTotal: 24500, discountTotal: 0, finalTotal: 220500, discountCode: "تخفیف" });
    expect((await client.invoices.refresh()).data?.finalTotal).toBe(220500);
    expect((await client.invoices.addDiscountCode("تخفیف")).data?.finalTotal).toBe(220500);
    await client.cart.updateItemWithAttributes(cart.data!.items[0].id, 10, 3);
    expect((await client.invoices.refresh()).data).toMatchObject({ couponTotal: 36750, finalTotal: 330750 });
    expect((await client.invoices.addDiscountCode(" ")).error?.status).toBe(422);
    await client.cart.removeItem(cart.data!.items[0].id, 10);
    expect((await client.invoices.refresh()).data).toMatchObject({ couponTotal: 0, finalTotal: 0 });
  });

  it("provides selectable payment methods through the checkout SDK client", async () => {
    process.env.SAZITO_USE_MOCKS = "true";
    const client = createSazitoClient(
      { domain: "mock-store.sazito.com", customFetchApi: createMockSazitoFetch(), debug: false },
      new CredentialsManager(new MemoryStorage()),
    );
    await client.cart.addItemWithAttributes(10, 1);
    await client.invoices.create();
    const response = await client.payments.getMethods();
    expect(response.error).toBeUndefined();
    expect(response.data).toHaveLength(2);
    expect(response.data?.find((method) => method.isDefault)).toMatchObject({ id: 1, titleFa: "درگاه پرداخت آنلاین" });
    expect(response.data?.every((method) => method.id > 0)).toBe(true);
  });

  it("preserves prices through SDK cart and invoice operations", async () => {
    process.env.SAZITO_USE_MOCKS = "true";
    const client = createSazitoClient(
      { domain: "mock-store.sazito.com", customFetchApi: createMockSazitoFetch(), debug: false },
      new CredentialsManager(new MemoryStorage()),
    );
    const added = await client.cart.addItemWithAttributes(10, 2);
    expect(added.error).toBeUndefined();
    expect(added.data?.netTotal).toBe(245000);
    expect(added.data?.items[0]).toMatchObject({ quantity: 2, unitPrice: 122500, lineTotal: 245000 });

    const created = await client.invoices.create();
    expect(created.error).toBeUndefined();
    expect(created.data?.finalTotal).toBe(245000);
    expect(created.data?.items).toHaveLength(1);

    await client.cart.updateItemWithAttributes(added.data!.items[0].id, 10, 3);
    const refreshed = await client.invoices.refresh();
    expect(refreshed.data?.finalTotal).toBe(367500);
    expect(refreshed.data?.items[0].quantity).toBe(3);

    await client.cart.removeItem(added.data!.items[0].id, 10);
    const empty = await client.invoices.refresh();
    expect(empty.data?.finalTotal).toBe(0);
    expect(empty.data?.items).toHaveLength(0);
  });
});
