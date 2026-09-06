import type { ProductSort } from "@sazito/client-sdk";

type MockRequest = {
  pathname: string;
  searchParams: URLSearchParams;
  method: string;
  body?: unknown;
};

type MockResult = {
  status?: number;
  body: unknown;
};

function isMockModeEnabled() {
  return (
    process.env.SAZITO_USE_MOCKS?.trim() === "true" ||
    process.env.NEXT_PUBLIC_SAZITO_USE_MOCKS?.trim() === "true"
  );
}

function jsonResult(body: unknown, status = 200): MockResult {
  return { body, status };
}

function mockImage(id: number, seed: string) {
  return {
    id,
    src: `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1200&q=80`,
    alt: seed.replace(/[-_]/g, " "),
    width: 1200,
    height: 900,
  };
}

function mockPrice(current: number, original?: number) {
  const discounted = typeof original === "number" && original > current;
  return {
    current,
    original: discounted ? original : null,
    discounted,
  };
}

function mockProduct(id: number, overrides: Record<string, unknown> = {}) {
  const slug = `product-${id}`;
  return {
    id,
    name: `Mock Product ${id}`,
    url: `/product/${slug}`,
    image: mockImage(id, `mock-product-${id}`),
    category: "Mock Category",
    price: mockPrice(120000 + id * 2500, 140000 + id * 2500),
    available: true,
    variantId: id * 10,
    minQuantity: 1,
    canQuickAdd: true,
    variants: [
      {
        id: id * 10,
        label: "Default",
        sku: `SKU-${id}`,
        available: true,
        price: mockPrice(120000 + id * 2500, 140000 + id * 2500),
        attributes: [{ name: "Color", value: "Natural" }],
        imageId: id,
        minQuantity: 1,
        maxQuantity: 10,
        dynamicFormId: null,
      },
    ],
    summary: `Mock summary for product ${id}.`,
    description: `Mock description for product ${id}.`,
    ...overrides,
  };
}

function mockCategory(id: number) {
  return {
    id,
    name: `Mock Category ${id}`,
    url: `/category/mock-category-${id}`,
    count: 12 + id,
    description: `Mock category description ${id}.`,
  };
}

function mockCmsPage(id: number, type: "normal" | "blog") {
  const slug = type === "blog" ? `blog/mock-post-${id}` : `mock-page-${id}`;
  return {
    id,
    title: type === "blog" ? `Mock Blog Post ${id}` : `Mock Page ${id}`,
    url: type === "blog" ? `/blog/${slug}` : `/${slug}`,
    entityType: "cms_page",
    cmsPageType: type,
    enabled: true,
    summary: `Summary for ${slug}.`,
    content: `<p>Mock content for ${slug}.</p>`,
    image: mockImage(id, `mock-content-${id}`),
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    metaTitle: `Meta ${slug}`,
    metaDescription: `Meta description for ${slug}.`,
    canonicalUrl: type === "blog" ? `/blog/${slug}` : `/${slug}`,
    noIndex: false,
  };
}

function paginated<T>(items: T[], page = 1, pageSize = items.length) {
  return {
    items,
    page,
    pageSize,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / Math.max(1, pageSize))),
  };
}

function mockGeneralInfo() {
  return {
    result: {
        general: {
          name: "Mock Sazito Store",
          description: "A complete mock storefront for local development.",
          domain: { url: "mock-store.sazito.com" },
          logo: {
            main: "https://placehold.co/256x256/png?text=Mock+Logo",
            favicon: "https://placehold.co/64x64/png?text=M",
          },
          social: {
            instagram: "https://instagram.com/mock-store",
            telegram: "https://t.me/mock-store",
          },
        },
        shop: {
          name: "Mock Sazito Store",
          description: "A complete mock storefront for local development.",
          domain: { url: "mock-store.sazito.com" },
        },
        checkout: {
          addToCartAlert: true,
          dynamicForm: false,
          emailOptional: true,
          miniCart: true,
          postalCodeMandatory: false,
          quickAddToCart: true,
          minBasket: { enabled: false, minAmount: 0 },
        },
        features: {
          shopBlog: true,
          shopSearch: true,
          wallet: true,
          checkoutDynamicForm: false,
        },
        wallet: { enabled: true, useWithDiscount: true, minAmount: 0 },
        tajrobe: { enabled: true },
        domain: { url: "mock-store.sazito.com" },
        logo: {
          main: "https://placehold.co/256x256/png?text=Mock+Logo",
          favicon: "https://placehold.co/64x64/png?text=M",
        },
        social: {
          instagram: "https://instagram.com/mock-store",
          telegram: "https://t.me/mock-store",
        },
    },
  };
}

function mockMenu() {
  return {
    tree: {
      treeStructure: {
        nodes: [
          {
            details: { title: "Home", url: "/" },
            entityType: "url",
            children: [],
          },
          {
            details: { title: "Products" },
            entityType: "url",
            children: [
              {
                entityType: "product_category",
                entity: { enabled: true, url: "/category/mock-category-1" },
                details: { title: "Mock Category 1" },
                children: [],
              },
            ],
          },
          {
            entityType: "cms_page",
            entity: { enabled: true, url: "/about" },
            details: { title: "About" },
            children: [],
          },
        ],
      },
    },
  };
}

function mockCategories() {
  const categories = [1, 2, 3, 4].map(mockCategory);
  return {
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      url: category.url,
      enabled: true,
      description: category.description,
    })),
    tree: {
      treeType: "product_categories",
      treeStructure: { nodes: [] },
    },
    total: categories.length,
  };
}

function mockProducts(page = 1, pageSize = 8, sort?: ProductSort | string) {
  const items = Array.from({ length: pageSize }, (_, index) =>
    mockProduct((page - 1) * pageSize + index + 1, {
      name:
        sort === "discount"
          ? `Discount Product ${(page - 1) * pageSize + index + 1}`
          : `Mock Product ${(page - 1) * pageSize + index + 1}`,
    }),
  );
  return {
    items,
    page,
    pageSize,
    total: 24,
    totalPages: 3,
  };
}

function mockEntityRoute(pathname: string) {
  if (pathname.startsWith("/product/")) {
    const slug = pathname.split("/").pop() ?? "mock-product";
    const id = Math.max(1, slug.length);
    return {
      entityType: "product",
      entityId: id,
      entity: {
        ...mockProduct(id, {
          name: slug.replace(/-/g, " "),
          url: pathname,
        }),
      },
    };
  }

  if (pathname.startsWith("/category/")) {
    const slug = pathname.split("/").pop() ?? "mock-category";
    const id = Math.max(1, slug.length);
    return {
      entityType: "product_category",
      entityId: id,
      entity: {
        ...mockCategory(id),
        url: pathname,
        name: slug.replace(/-/g, " "),
      },
    };
  }

  if (pathname.startsWith("/blog/")) {
    const slug = pathname.split("/").pop() ?? "mock-post";
    const id = Math.max(1, slug.length);
    return {
      entityType: "cms_page",
      entityId: id,
      entity: mockCmsPage(id, "blog"),
    };
  }

  return {
    entityType: "cms_page",
    entityId: 1,
    entity: mockCmsPage(1, "normal"),
  };
}

function mockSearch(query: string, page: number, pageSize: number) {
  return {
    products: mockProducts(page, pageSize),
    cmsPages: paginated([mockCmsPage(1, "normal")]),
    blogPages: paginated([mockCmsPage(1, "blog")]),
    productCategories: paginated([mockCategory(1)]),
    query,
  };
}

function mockCmsList(type: "normal" | "blog", page = 1, pageSize = 10) {
  const items = Array.from({ length: pageSize }, (_, index) =>
    mockCmsPage((page - 1) * pageSize + index + 1, type),
  );
  return { items, page, pageSize, total: 25 };
}

function mockFeedbackStatistics(entityId: string) {
  return {
    productStatistics: {
      productId: Number(entityId),
      averageRate: 4.7,
      totalCount: 18,
      recommendedPercentage: 92,
    },
  };
}

function mockFeedbackReviews(entityId: string, pageNumber = 1, pageSize = 6) {
  const entities = Array.from({ length: pageSize }, (_, index) => ({
    id: `${entityId}-${pageNumber}-${index + 1}`,
    author: `User ${index + 1}`,
    rate: 5,
    content: `Mock review ${index + 1} for product ${entityId}.`,
    createdAt: "2026-01-01T00:00:00.000Z",
    metadata: {
      productName: `Mock Product ${entityId}`,
      variantId: String(Number(entityId) * 10),
      variantOptions: [],
    },
    recommended: true,
  }));

  return {
    entities,
    pageNumber,
    pageSize,
    totalCount: 18,
    averageRate: 4.7,
    recommendations: {
      recommendedPercentage: 92,
      recommendedTotalCount: 16,
    },
  };
}

function mockCart() {
  return {
    result: {
      id: 1,
      items: [],
      netTotal: 0,
      grossTotal: 0,
      needsShipping: false,
      minBasketLimitViolated: false,
    },
  };
}

function mockOrders() {
  return { orders: [], totalCount: 0, pageNumber: 1, pageSize: 20 };
}

function mockWalletBalance() {
  return { balance: 250000 };
}

function mockWalletTransactions() {
  return { items: [], pageNumber: 1, pageSize: 20, totalCount: 0 };
}

function mockBookings() {
  return { items: [] };
}

function mockRegions() {
  return [
    {
      id: 1,
      name: "Tehran",
      cities: [
        { id: 11, name: "Tehran", latitude: 35.6892, longitude: 51.389 },
        { id: 12, name: "Shemiran", latitude: 35.8, longitude: 51.43 },
      ],
    },
  ];
}

export function mockSazitoResponse(request: MockRequest): MockResult | null {
  if (!isMockModeEnabled()) return null;

  const page = Number(request.searchParams.get("page") ?? 1);
  const pageSize = Number(request.searchParams.get("pageSize") ?? request.searchParams.get("page_size") ?? 10);
  const query = request.searchParams.get("query") ?? "";

  switch (request.pathname) {
    case "/api/v2/general/info":
      return jsonResult(mockGeneralInfo());
    case "/api/v1/trees/fetch_single":
      return jsonResult(mockMenu());
    case "/api/v2/regions":
      return jsonResult(mockRegions());
    case "/api/v1/product_categories":
      return jsonResult(mockCategories());
    case "/api/v1/products":
      return jsonResult(mockProducts(page, pageSize, request.searchParams.get("sort") ?? undefined));
    case "/api/v1/entity_route/route":
      return jsonResult(mockEntityRoute(request.searchParams.get("url_part") ?? "/"));
    case "/api/v1/search":
      return jsonResult(mockSearch(query, page, pageSize));
    case "/api/v1/cms_pages":
      return jsonResult(
        mockCmsList(
          request.searchParams.get("cmsPageTypes") === "blog" ? "blog" : "normal",
          page,
          pageSize,
        ),
      );
    case "/api/v1/feedbacks":
      return jsonResult(mockFeedbackStatistics(request.searchParams.get("productId") ?? "1"));
    case "/api/v1/feedbacks/comments/details":
      return jsonResult(mockFeedbackReviews(request.searchParams.get("productId") ?? "1", page, pageSize));
    case "/api/v2/carts":
      if (request.method === "GET" || request.method === "POST" || request.method === "PUT" || request.method === "PATCH" || request.method === "DELETE") {
        return jsonResult(mockCart());
      }
      break;
    case "/api/v1/orders":
      return jsonResult(mockOrders());
    case "/api/v1/users":
      return jsonResult({ data: { user: null } });
    case "/api/v1/users/wallet/balance":
      return jsonResult(mockWalletBalance());
    case "/api/v1/wallet/transactions":
      return jsonResult(mockWalletTransactions());
    case "/api/v1/scheduler/bookings":
      return jsonResult(mockBookings());
    case "/api/v1/scheduler/events":
      return jsonResult({ items: [] });
    case "/api/v1/scheduler/availabilities":
      return jsonResult({ availableDays: [] });
    case "/api/v1/dynamic_form/1":
      return jsonResult({
        form: {
          id: 1,
          title: "Mock Dynamic Form",
          description: "Used for local development.",
          fields: [],
        },
      });
    default:
      return jsonResult(
        {
          error: {
            type: "validation",
            message: `No mock response is registered for ${request.method} ${request.pathname}.`,
          },
        },
        501,
      );
  }

  return null;
}

export function createMockSazitoFetch(): typeof fetch {
  return async (input, init) => {
    const requestUrl =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    const url = new URL(requestUrl, "http://localhost");
    const response = mockSazitoResponse({
      pathname: url.pathname,
      searchParams: url.searchParams,
      method: (init?.method ?? "GET").toUpperCase(),
    });

    if (!response) {
      return fetch(input, init);
    }

    return Response.json(response.body, {
      status: response.status ?? 200,
      headers: { "Cache-Control": "no-store" },
    });
  };
}
