import { afterEach, describe, expect, it } from "vitest";

import { mockSazitoResponse } from "./mock";

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
});
