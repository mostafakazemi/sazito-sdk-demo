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

function mockImage(id: number) {
  const source = [
    "photo-1542291026-7eec264c27ff",
    "photo-1495474472287-4d71bcdd2085",
    "photo-1523275335684-37898b6baf30",
  ][id % 3];

  return {
    id,
    src: `https://images.unsplash.com/${source}?auto=format&fit=crop&w=1200&q=80`,
    alt: "تصویر نمونه",
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
    name: `محصول نمونه ${id}`,
    url: `/product/${slug}`,
    image: mockImage(id),
    category: "دسته‌بندی نمونه",
    price: mockPrice(120000 + id * 2500, 140000 + id * 2500),
    available: true,
    variantId: id * 10,
    minQuantity: 1,
    canQuickAdd: true,
    variants: [
      {
        id: id * 10,
        label: "پیش‌فرض",
        sku: `SKU-${id}`,
        available: true,
        price: mockPrice(120000 + id * 2500, 140000 + id * 2500),
        attributes: [{ name: "رنگ", value: "طبیعی" }],
        imageId: id,
        minQuantity: 1,
        maxQuantity: 10,
        dynamicFormId: null,
      },
    ],
    summary: `خلاصه محصول نمونه شماره ${id}.`,
    description: `توضیحات محصول نمونه شماره ${id}.`,
    ...overrides,
  };
}

function mockCategory(id: number) {
  return {
    id,
    name: `دسته‌بندی نمونه ${id}`,
    url: `/category/sample-category-${id}`,
    count: 12 + id,
    description: `توضیحات دسته‌بندی نمونه شماره ${id}.`,
  };
}

function mockCmsPage(id: number, type: "normal" | "blog") {
    const slug = type === "blog" ? `blog/sample-post-${id}` : `sample-page-${id}`;
  return {
    id,
    title: type === "blog" ? `یادداشت نمونه ${id}` : `صفحه نمونه ${id}`,
    url: type === "blog" ? `/blog/${slug}` : `/${slug}`,
    entityType: "cms_page",
    cmsPageType: type,
    enabled: true,
    summary: `خلاصه ${slug}.`,
    content: `<p>محتوای نمونه برای ${slug}.</p>`,
    image: mockImage(id),
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    metaTitle: `عنوان متای ${slug}`,
    metaDescription: `توضیحات متای ${slug}.`,
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
          name: "فروشگاه نمونه سازیتو",
          description: "فروشگاه نمونه برای توسعه محلی.",
          domain: { url: "mock-store.sazito.com" },
          logo: {
            main: "https://placehold.co/256x256/png?text=لوگو+نمونه",
            favicon: "https://placehold.co/64x64/png?text=ن",
          },
          social: {
            instagram: "https://instagram.com/mock-store",
            telegram: "https://t.me/mock-store",
          },
        },
        shop: {
          name: "فروشگاه نمونه سازیتو",
          description: "فروشگاه نمونه برای توسعه محلی.",
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
          main: "https://placehold.co/256x256/png?text=لوگو+نمونه",
          favicon: "https://placehold.co/64x64/png?text=ن",
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
            details: { title: "خانه", url: "/" },
            entityType: "url",
            children: [],
          },
          {
            details: { title: "محصولات" },
            entityType: "url",
            children: [
              {
                entityType: "product_category",
                entity: { enabled: true, url: "/category/mock-category-1" },
                details: { title: "دسته‌بندی نمونه ۱" },
                children: [],
              },
            ],
          },
          {
            entityType: "cms_page",
            entity: { enabled: true, url: "/about" },
            details: { title: "درباره ما" },
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
          ? `محصول تخفیف‌دار ${(page - 1) * pageSize + index + 1}`
          : `محصول نمونه ${(page - 1) * pageSize + index + 1}`,
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
    author: `کاربر نمونه ${index + 1}`,
    rate: 5,
    content: `نظر نمونه ${index + 1} برای محصول ${entityId}.`,
    createdAt: "2026-01-01T00:00:00.000Z",
    metadata: {
      productName: `محصول نمونه ${entityId}`,
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
      identifier: "سبد-نمونه-۱",
      items: [],
      netTotal: 0,
      grossTotal: 0,
      needsShipping: false,
      minBasketLimitViolated: false,
    },
  };
}

function mockOrders() {
  return {
    orders: [],
    totalCount: 0,
    totalCountRaw: 0,
    totalNotSeen: 0,
    totalSeen: 0,
    pageNumber: 1,
    pageSize: 20,
  };
}

function mockWalletBalance() {
  return { balance: 250000 };
}

function mockWalletTransactions() {
  return { transactions: [], pageNumber: 1, pageSize: 20, totalCount: 0 };
}

function mockBookings() {
  return { items: [], page: 1, pageSize: 20, total: 0 };
}

function mockInvoice() {
  return {
    id: 1,
    identifier: "فاکتور-نمونه-۱",
    invoiceItems: [],
    shippingItems: [],
    needsShipping: false,
    netTotal: 0,
    finalTotal: 0,
    vat: 0,
    vatPercent: 0,
    itemsDiscount: 0,
    discountTotal: 0,
    customerProfit: 0,
    customerProfitPercentage: 0,
    itemsTotalRawPrice: 0,
    couponTotal: 0,
    shippingTotal: 0,
    creditTotal: 0,
    discountUsages: [],
  };
}

function mockAddress(id = 1) {
  return {
    id,
    identifier: `نشانی-نمونه-${id}`,
    firstName: "کاربر",
    lastName: "نمونه",
    mobilePhone: "09120000000",
    email: "sample@example.com",
    region: { id: 1, name: "تهران" },
    city: { id: 11, name: "تهران", regionId: 1, latitude: 35.6892, longitude: 51.389 },
    address: "خیابان نمونه، کوچه سازیتو، پلاک ۱",
    postalCode: "1111111111",
    description: "نشانی پیش‌فرض نمونه",
  };
}

function mockPaymentMethods() {
  return [
    {
      id: 1,
      name: "پرداخت آنلاین",
      title: "درگاه پرداخت آنلاین",
      code: "online",
      type: "gateway",
      enabled: true,
    },
    {
      id: 2,
      name: "پرداخت در محل",
      title: "پرداخت هنگام تحویل",
      code: "cash",
      type: "cash",
      enabled: true,
    },
  ];
}

function mockShippingMethods() {
  return [
    { id: 1, name: "پست پیشتاز", type: "post" },
    { id: 2, name: "ارسال با پیک", type: "courier" },
  ];
}

function mockUser() {
  return {
    id: 1,
    email: "sample@example.com",
    mobilePhone: "09120000000",
    firstName: "کاربر",
    lastName: "نمونه",
    birthDate: "1370/01/01",
  };
}

function mockEvent(id = 1) {
  return {
    id,
    entityId: id,
    title: "مشاوره نمونه",
    description: "رزرو زمان برای مشاوره نمونه",
    startTime: "09:00",
    endTime: "17:00",
    durationsMinute: [30, 60],
    capacity: 10,
    bookedCount: 2,
    availableSlots: 8,
    price: 0,
    location: "آنلاین",
  };
}

function mockFeedbackSeed(orderIdentifier: string) {
  return {
    orderId: "1",
    orderIdentifier,
    hasCommentAlready: false,
    items: [
      {
        productId: "1",
        productVariantId: "10",
        productName: "محصول نمونه ۱",
        productAttributes: [{ name: "رنگ", value: "طبیعی" }],
        productImage: { url: mockImage(1).src, alt: "محصول نمونه ۱" },
      },
    ],
  };
}

function mockRegions() {
  return [
    {
      id: 1,
      name: "تهران",
      cities: [
        { id: 11, name: "تهران", latitude: 35.6892, longitude: 51.389 },
        { id: 12, name: "شمیران", latitude: 35.8, longitude: 51.43 },
      ],
    },
  ];
}

export function mockSazitoResponse(request: MockRequest): MockResult | null {
  if (!isMockModeEnabled()) return null;

  const page = Number(request.searchParams.get("page") ?? 1);
  const pageSize = Number(request.searchParams.get("pageSize") ?? request.searchParams.get("page_size") ?? 10);
  const query = request.searchParams.get("query") ?? "";
  const entityId = Number(request.pathname.split("/").pop()) || 1;

  if (request.pathname.startsWith("/api/v1/product_categories/")) {
    return jsonResult({ productCategory: mockCategory(entityId) });
  }

  if (request.pathname.startsWith("/api/v1/dynamic_form/")) {
    return jsonResult({
      form: {
        id: entityId,
        title: "اطلاعات تکمیلی محصول",
        description: "لطفاً اطلاعات مورد نیاز را وارد کنید.",
        fields: [
          {
            key: "description",
            name: "description",
            type: "TextArea",
            label: "توضیحات",
            value: "",
            placeholder: "توضیحات خود را وارد کنید",
            required: false,
            inputOptions: [],
            allowedExtensions: [],
          },
        ],
      },
    });
  }

  if (request.pathname.startsWith("/api/v1/feedbacks/seed/")) {
    return jsonResult(mockFeedbackSeed(request.pathname.split("/").pop() ?? "نمونه"));
  }

  if (request.pathname === "/api/v1/feedbacks/comments") {
    return jsonResult({ id: "نظر-نمونه-۱" });
  }

  if (request.pathname === "/api/v1/feedbacks/comments/details") {
    return jsonResult(mockFeedbackReviews(request.searchParams.get("productId") ?? "1", page, pageSize));
  }

  if (request.pathname.startsWith("/api/v1/feedbacks/")) {
    return jsonResult({ id: 1, comment: "نظر نمونه", status: "approved" });
  }

  if (request.pathname.startsWith("/api/v2/carts")) {
    return jsonResult(mockCart());
  }

  if (request.pathname.startsWith("/api/v2/invoices")) {
    if (request.pathname.endsWith("applicable_shipping_methods")) {
      return jsonResult({
        shippingMethods: mockShippingMethods(),
        groupedShippingRates: {
          post: [{ id: 1, name: "پست پیشتاز", price: 65000, type: "post" }],
          courier: [{ id: 2, name: "ارسال با پیک", price: 85000, type: "courier" }],
        },
        itemsShippingRate: [],
      });
    }
    return jsonResult({ data: mockInvoice() });
  }

  if (request.pathname === "/api/v2/shipping_addresses") {
    return request.method === "GET"
      ? jsonResult({ addresses: [mockAddress()] })
      : jsonResult({ shippingAddress: mockAddress() });
  }

  if (request.pathname.startsWith("/api/v2/shipping_addresses/")) {
    return jsonResult({ shippingAddress: mockAddress(entityId) });
  }

  if (request.pathname === "/api/v2/shipping_methods") {
    return jsonResult(mockShippingMethods());
  }

  if (request.pathname.startsWith("/api/v2/payments")) {
    if (request.pathname.endsWith("/list")) return jsonResult(mockPaymentMethods());
    if (request.pathname.endsWith("/process_payment_step")) {
      return jsonResult({
        result: {
          action: "show_order",
          order: {
            id: 1,
            orderNumber: "۱۰۰۱",
            orderIdentifier: "سفارش-نمونه-۱",
            invoice: mockInvoice(),
          },
        },
      });
    }
    return jsonResult({
      result: {
        id: 1,
        payment_identifier: "پرداخت-نمونه-۱",
        payment_amount: 0,
        payment_type: { id: 1, reference_code: "online" },
      },
    });
  }

  if (request.pathname === "/api/v1/visits/add") {
    return jsonResult({ id: 1, createdAt: "2026-01-01T00:00:00.000Z" });
  }

  if (request.pathname === "/api/v1/pinch") {
    return jsonResult({ ok: true });
  }

  if (
    request.pathname === "/api/v1/images" ||
    request.pathname.startsWith("/api/v1/images/") ||
    request.pathname.startsWith("/api/v1/service/filemanager/uploads/")
  ) {
    return jsonResult({
      id: 1,
      url: "https://placehold.co/1200x900/png?text=تصویر+نمونه",
      filename: "sample-image.png",
      size: 1024,
      mime_type: "image/png",
      serveKey: "کلید-فایل-نمونه",
      images: [
        {
          id: "تصویر-نمونه-۱",
          url: "https://placehold.co/1200x900/png?text=تصویر+نمونه",
          alt: "تصویر نمونه",
          serveUrl: "https://placehold.co/1200x900/png?text=تصویر+نمونه",
          serveKey: "کلید-فایل-نمونه",
        },
      ],
    });
  }

  if (request.pathname === "/api/v1/users/wallet/balance") {
    return jsonResult({ balance: 250000, enabled: true });
  }

  if (request.pathname === "/api/v1/wallet/transactions") {
    return jsonResult(mockWalletTransactions());
  }

  if (request.pathname.startsWith("/api/v1/users/") || request.pathname.startsWith("/api/v1/sessions/")) {
    if (request.pathname.endsWith("/current")) return jsonResult({ user: mockUser() });
    if (request.pathname.endsWith("/login") || request.pathname.endsWith("/login_request_verification")) {
      return jsonResult({ jwt: "توکن-نمونه", user: mockUser() });
    }
    if (request.pathname.endsWith("/register") || request.pathname.endsWith("/update_mobile_phone_verification")) {
      return jsonResult({ user: mockUser() });
    }
    return jsonResult({ ok: true, message: "درخواست با موفقیت انجام شد." });
  }

  if (request.pathname.startsWith("/api/v1/scheduler/events/")) {
    return jsonResult({ event: mockEvent(entityId) });
  }

  if (request.pathname === "/api/v1/scheduler/events") {
    return jsonResult({ items: [mockEvent()], page: 1, pageSize, total: 1 });
  }

  if (request.pathname.endsWith("/cancel") && request.pathname.startsWith("/api/v1/scheduler/bookings/")) {
    return jsonResult({ ...mockEvent(entityId), status: "cancelled", bookingTime: "2026-01-10T10:00:00+03:30" });
  }

  if (request.pathname === "/api/v1/scheduler/availabilities") {
    return jsonResult({
      availableDays: [
        {
          date: "2026-01-10",
          timeSlots: [
            { startTimeLocal: "10:00", endTimeLocal: "10:30", isAvailable: true, remainingCapacity: 8 },
            { startTimeLocal: "11:00", endTimeLocal: "11:30", isAvailable: true, remainingCapacity: 6 },
          ],
        },
      ],
    });
  }

  if (request.pathname === "/api/v1/scheduler/bookings" && request.method !== "GET") {
    return jsonResult({
      id: 1,
      eventId: 1,
      event: mockEvent(),
      attendeeName: "کاربر نمونه",
      attendeeEmail: "sample@example.com",
      attendeePhone: "09120000000",
      status: "confirmed",
      bookingTime: "2026-01-10T10:00:00+03:30",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
  }

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
