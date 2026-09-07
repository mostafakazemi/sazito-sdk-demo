import generalInfo from "./mocks/general-info.json";
import headerMenu from "./mocks/header-menu.json";
import regions from "./mocks/regions.json";
import categories from "./mocks/categories.json";
import products from "./mocks/products.json";
import cmsPages from "./mocks/cms-pages.json";
import blogPages from "./mocks/blog-pages.json";
import search from "./mocks/search.json";
import feedbackStatistics from "./mocks/feedback-statistics.json";
import feedbackReviews from "./mocks/feedback-reviews.json";
import feedbackSeedFixture from "./mocks/feedback-seed.json";
import cart from "./mocks/cart.json";
import orders from "./mocks/orders.json";
import invoice from "./mocks/invoice.json";
import addresses from "./mocks/addresses.json";
import shippingMethods from "./mocks/shipping-methods.json";
import paymentMethods from "./mocks/payment-methods.json";
import user from "./mocks/user.json";
import bookings from "./mocks/bookings.json";
import events from "./mocks/events.json";
import availabilities from "./mocks/availabilities.json";
import dynamicForm from "./mocks/dynamic-form.json";
import walletBalance from "./mocks/wallet-balance.json";
import walletTransactions from "./mocks/wallet-transactions.json";
import shippingRates from "./mocks/shipping-rates.json";
import paymentCreate from "./mocks/payment-create.json";
import paymentAction from "./mocks/payment-action.json";
import uploadResponse from "./mocks/upload-response.json";
import booking from "./mocks/booking.json";

type MockRequest = {
  pathname: string;
  searchParams: URLSearchParams;
  method: string;
};

type MockResult = { status?: number; body: unknown };
type JsonObject = Record<string, unknown>;
type Fixture = JsonObject | unknown[];

const staticFixtures: Record<string, Fixture> = {
  "/api/v2/general/info": generalInfo,
  "/api/v1/trees/fetch_single": headerMenu,
  "/api/v2/regions": regions,
  "/api/v1/product_categories": categories,
  "/api/v1/cms_pages": cmsPages,
  "/api/v1/feedbacks": feedbackStatistics,
  "/api/v1/feedbacks/comments/details": feedbackReviews,
  "/api/v2/carts": cart,
  "/api/v1/orders": orders,
  "/api/v1/users": user,
  "/api/v1/users/wallet/balance": walletBalance,
  "/api/v1/wallet/transactions": walletTransactions,
  "/api/v1/scheduler/bookings": bookings,
  "/api/v1/scheduler/events": events,
  "/api/v1/scheduler/availabilities": availabilities,
  "/api/v1/dynamic_form/1": dynamicForm,
  "/api/v2/shipping_methods": shippingMethods,
};

function isMockModeEnabled() {
  return (
    process.env.SAZITO_USE_MOCKS?.trim() === "true" ||
    process.env.NEXT_PUBLIC_SAZITO_USE_MOCKS?.trim() === "true"
  );
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function jsonResult(body: unknown, status = 200): MockResult {
  return { body, status };
}

function pageValue(request: MockRequest, name: string, fallback: number) {
  const value = Number(
    request.searchParams.get(name) ??
      request.searchParams.get(name.replace("page", "page_")),
  );
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function paginatedFixture(fixture: Fixture, request: MockRequest) {
  const page = pageValue(request, "page", 1);
  const pageSize = pageValue(request, "pageSize", 20);
  const items = Array.isArray(fixture)
    ? fixture
    : Array.isArray(fixture.items)
      ? fixture.items
      : [];
  return {
    ...(typeof fixture === "object" && !Array.isArray(fixture) ? fixture : {}),
    items: items ?? [],
    page,
    pageSize,
    total: items?.length ?? 0,
  };
}

function productFixture(request: MockRequest) {
  const page = pageValue(request, "page", 1);
  const pageSize = pageValue(request, "pageSize", products.items.length);
  const items = Array.from({ length: pageSize }, (_, index) => {
    const item = clone(products.items[0]) as unknown as {
      id: number;
      name: string;
      url: string;
      variants: Record<string, unknown>[];
      [key: string]: unknown;
    };
    const id = (page - 1) * pageSize + index + 1;
    item.id = id;
    item.name = `محصول نمونه ${id}`;
    item.url = `/product/sample-product-${id}`;
    item.variants = item.variants.map((variant: Record<string, unknown>) => ({
      ...variant,
      id: id * 10,
      productId: id,
    }));
    return item;
  });
  return { items, page, pageSize, total: 24, totalPages: 3 };
}

function entityRoute(pathname: string) {
  if (pathname.startsWith("/product/")) {
    const item = clone(products.items[0]);
    item.url = pathname;
    item.name = pathname.split("/").pop()?.replace(/-/g, " ") ?? "محصول نمونه";
    return { entityType: "product", entityId: item.id, entity: item };
  }
  if (pathname.startsWith("/category/")) {
    const category = clone(categories.categories[0]);
    category.url = pathname;
    return { entityType: "product_category", entityId: category.id, entity: category };
  }
  const page = clone(pathname.startsWith("/blog/") ? blogPages.items[0] : cmsPages.items[0]);
  page.url = pathname;
  return { entityType: "cms_page", entityId: page.id, entity: page };
}

function searchFixture(request: MockRequest) {
  const result = clone(search) as unknown as JsonObject;
  result.query = request.searchParams.get("query") ?? "";
  result.products = productFixture(request);
  result.cmsPages = paginatedFixture(cmsPages, request);
  result.blogPages = paginatedFixture(blogPages, request);
  result.productCategories = paginatedFixture(categories.categories, request);
  return result;
}

function addressFixture(id = 1) {
  const address = clone(addresses.addresses[0]);
  address.id = id;
  address.identifier = `نشانی-نمونه-${id}`;
  return address;
}

function eventFixture(id = 1) {
  const event = clone(events.items[0]);
  event.id = id;
  event.entityId = id;
  return event;
}

function feedbackSeed(orderIdentifier: string) {
  const seed = clone(feedbackSeedFixture);
  seed.orderIdentifier = orderIdentifier;
  return seed;
}

export function mockSazitoResponse(request: MockRequest): MockResult | null {
  if (!isMockModeEnabled()) return null;

  const { pathname } = request;
  const entityId = Number(pathname.split("/").pop()) || 1;

  if (pathname.startsWith("/api/v1/product_categories/")) {
    return jsonResult({ productCategory: clone(categories.categories[0]) });
  }
  if (pathname.startsWith("/api/v1/dynamic_form/")) return jsonResult(clone(dynamicForm));
  if (pathname.startsWith("/api/v1/feedbacks/seed/")) {
    return jsonResult(feedbackSeed(pathname.split("/").pop() ?? "سفارش-نمونه"));
  }
  if (pathname === "/api/v1/feedbacks/comments") return jsonResult({ id: "نظر-نمونه-۱" });
  if (pathname === "/api/v1/feedbacks/comments/details") return jsonResult(clone(feedbackReviews));
  if (pathname.startsWith("/api/v1/feedbacks/")) {
    return jsonResult({ id: 1, comment: "نظر نمونه", status: "approved" });
  }
  if (pathname.startsWith("/api/v2/carts")) return jsonResult(clone(cart));

  if (pathname.startsWith("/api/v2/invoices")) {
    if (pathname.endsWith("applicable_shipping_methods")) {
      return jsonResult(clone(shippingRates));
    }
    return jsonResult({ data: clone(invoice) });
  }

  if (pathname === "/api/v2/shipping_addresses") {
    return request.method === "GET" ? jsonResult(clone(addresses)) : jsonResult({ shippingAddress: addressFixture() });
  }
  if (pathname.startsWith("/api/v2/shipping_addresses/")) {
    return jsonResult({ shippingAddress: addressFixture(entityId) });
  }
  if (pathname === "/api/v2/shipping_methods") return jsonResult(clone(shippingMethods));

  if (pathname.startsWith("/api/v2/payments")) {
    if (pathname.endsWith("/list")) return jsonResult(clone(paymentMethods));
    if (pathname.endsWith("/process_payment_step")) {
      return jsonResult(clone(paymentAction));
    }
    return jsonResult(clone(paymentCreate));
  }

  if (pathname === "/api/v1/visits/add" || pathname === "/api/v1/pinch") {
    return jsonResult({ id: 1, ok: true, createdAt: "2026-01-01T00:00:00.000Z" });
  }
  if (pathname === "/api/v1/images" || pathname.startsWith("/api/v1/images/") || pathname.startsWith("/api/v1/service/filemanager/uploads/")) {
    return jsonResult(clone(uploadResponse));
  }

  if (pathname === "/api/v1/users/wallet/balance") return jsonResult(clone(walletBalance));
  if (pathname === "/api/v1/wallet/transactions") return jsonResult(staticFixtures[pathname]);
  if (pathname.startsWith("/api/v1/orders/")) {
    const order = orders.orders.find((item) => item.id === entityId) ?? orders.orders[0];
    return jsonResult(clone(order));
  }
  if (pathname.startsWith("/api/v1/users/") || pathname.startsWith("/api/v1/sessions/")) {
    if (pathname.endsWith("/current")) return jsonResult(clone(user));
    if (pathname.endsWith("/login") || pathname.endsWith("/login_request_verification")) return jsonResult({ jwt: "mock-token-2026", user: clone(user.user) });
    if (pathname.endsWith("/register") || pathname.endsWith("/update_mobile_phone_verification")) return jsonResult(clone(user));
    return jsonResult({ ok: true, message: "درخواست با موفقیت انجام شد." });
  }

  if (pathname.startsWith("/api/v1/scheduler/events/")) return jsonResult({ event: eventFixture(entityId) });
  if (pathname === "/api/v1/scheduler/events") return jsonResult(clone(events));
  if (pathname.endsWith("/cancel") && pathname.startsWith("/api/v1/scheduler/bookings/")) {
    return jsonResult({ ...clone(bookings.items[0]), status: "cancelled" });
  }
  if (pathname === "/api/v1/scheduler/bookings" && request.method !== "GET") return jsonResult(clone(booking));

  if (pathname === "/api/v1/products") return jsonResult(productFixture(request));
  if (pathname === "/api/v1/search") return jsonResult(searchFixture(request));
  if (pathname === "/api/v1/cms_pages") return jsonResult(paginatedFixture(request.searchParams.get("cmsPageTypes") === "blog" ? blogPages : cmsPages, request));
  if (pathname === "/api/v1/entity_route/route") return jsonResult(entityRoute(request.searchParams.get("url_part") ?? "/"));

  const fixture = staticFixtures[pathname];
  if (fixture) return jsonResult(clone(fixture));

  return jsonResult({ error: { type: "validation", message: `برای مسیر ${pathname} فیکسچر نمونه ثبت نشده است.` } }, 501);
}

export function createMockSazitoFetch(): typeof fetch {
  return async (input, init) => {
    const requestUrl = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const url = new URL(requestUrl, "http://localhost");
    const response = mockSazitoResponse({ pathname: url.pathname, searchParams: url.searchParams, method: (init?.method ?? "GET").toUpperCase() });
    if (!response) return fetch(input, init);
    return Response.json(response.body, { status: response.status ?? 200, headers: { "Cache-Control": "no-store" } });
  };
}
