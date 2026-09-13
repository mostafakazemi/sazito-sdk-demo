import { afterEach, describe, expect, it, vi } from "vitest";
import { createSazitoClient } from "@sazito/client-sdk";

import { orderDetailsHref } from "./order-routes";
import { createMockSazitoFetch } from "./mock";
import orders from "./mocks/orders.json";
import paymentAction from "./mocks/payment-action.json";

describe("host order detail routes", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("encodes both credentials without adding query parameters", () => {
    const url = new URL(orderDetailsHref({ id: "123/4", orderIdentifier: "token+/&?=#" }), "https://theme.example.com");
    expect(url.pathname).toBe("/account/orders/123%2F4");
    expect([...url.searchParams]).toEqual([["identifier", "token+/&?=#"]]);
  });

  it("loads the checkout order anonymously through the host route and updated SDK", async () => {
    vi.stubEnv("SAZITO_USE_MOCKS", "true");
    const fetchApi = vi.fn(createMockSazitoFetch({ delayMs: 0 }));
    const client = createSazitoClient({ domain: "mock-store.sazito.com", customFetchApi: fetchApi });
    const url = new URL(orderDetailsHref(paymentAction.result.order), "https://theme.example.com");
    const id = Number(url.pathname.split("/").pop());
    const result = await client.orders.get(id, url.searchParams.get("identifier")!, { cache: false });
    expect(result.error).toBeUndefined();
    expect(result.data).toMatchObject({ id: 101, orderIdentifier: orders.orders[0].orderIdentifier });
    expect(fetchApi).toHaveBeenCalledTimes(1);
  });

  it.each([
    [101, ""],
    [101, "wrong-token"],
    [101, orders.orders[1].orderIdentifier],
    [999, orders.orders[0].orderIdentifier],
  ])("rejects an invalid credential pair for order %s", async (id, identifier) => {
    vi.stubEnv("SAZITO_USE_MOCKS", "true");
    const fetchApi = createMockSazitoFetch({ delayMs: 0 });
    const url = new URL(`/api/v1/orders/${id}`, "https://mock-store.sazito.com");
    if (identifier) url.searchParams.set("identifier", String(identifier));
    const response = await fetchApi(url);
    expect(response.status).toBe(404);
  });
});
