import { describe, expect, it } from "vitest";
import type { Product, ProductVariant } from "@sazito/client-sdk";

import {
  attributeValue,
  formatPrice,
  isVariantAvailable,
  normalizeStoreHref,
  sanitizeProductDescription,
  selectDefaultVariant,
  toProductDetail,
  toProductSeo,
  toStoreChrome,
  toProductCard,
} from "./presenters";
import { SazitoDataError, unwrapSazitoResponse } from "./response";

function variant(overrides: Partial<ProductVariant> = {}): ProductVariant {
  return {
    id: 1,
    enabled: true,
    price: 399_000,
    stockQuantity: 0,
    isStockManaged: false,
    attributes: [],
    hasMaxOrder: false,
    maxOrderQuantity: 0,
    minOrderQuantity: 1,
    sortIndex: 0,
    createdAt: "2026-08-17T00:00:00Z",
    updatedAt: "2026-08-17T00:00:00Z",
    ...overrides,
  };
}

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: 17,
    name: "غذای خشک جوندگان",
    url: "/product/غذای-خشک-جوندگان",
    enabled: true,
    productType: "physical",
    attributes: [],
    images: [],
    variants: [variant()],
    categories: [],
    createdAt: "2026-08-17T00:00:00Z",
    updatedAt: "2026-08-17T00:00:00Z",
    ...overrides,
  };
}

describe("store URL routing", () => {
  it("keeps implemented storefront URLs inside Next.js", () => {
    expect(normalizeStoreHref("/")).toEqual({ href: "/", external: false });
    expect(normalizeStoreHref("/product/sample")).toEqual({
      href: "/product/sample",
      external: false,
    });
    expect(normalizeStoreHref("/category/sample")).toEqual({
      href: "/category/sample",
      external: false,
    });
    expect(normalizeStoreHref("/search?q=test")).toEqual({
      href: "/search?q=test",
      external: false,
    });
    expect(normalizeStoreHref("/account/orders")).toEqual({
      href: "/account/orders",
      external: false,
    });
  });

  it("keeps only known CMS destinations inside Next.js", () => {
    const localContent = new Set(["/blog/sample", "/درباره-ما"]);

    expect(
      normalizeStoreHref(
        "/blog/sample",
        "https://testmosi.sazito.com",
        localContent,
      ),
    ).toEqual({ href: "/blog/sample", external: false });
    expect(
      normalizeStoreHref(
        "https://testmosi.sazito.com/درباره-ما",
        "https://testmosi.sazito.com",
        localContent,
      ),
    ).toEqual({ href: "/درباره-ما", external: false });
  });

  it("adds one native blog index link beside home when blog posts exist", () => {
    const menu = [
      { name: "خانه", url: "/", children: [] },
      { name: "وبلاگ ۱", url: "/blog/وبلاگ-۱", children: [] },
    ];
    const chrome = toStoreChrome(
      undefined,
      menu,
      "https://testmosi.sazito.com",
      ["/blog/وبلاگ-۱"],
    );

    expect(chrome.navigation.map(({ label, href }) => ({ label, href }))).toEqual([
      { label: "خانه", href: "/" },
      { label: "وبلاگ", href: "/blog" },
      { label: "وبلاگ ۱", href: "/blog/وبلاگ-۱" },
    ]);
  });

  it("does not duplicate a blog index supplied by Sazito", () => {
    const chrome = toStoreChrome(
      undefined,
      [{ name: "وبلاگ", url: "/blog", children: [] }],
      "https://testmosi.sazito.com",
      ["/blog/وبلاگ-۱"],
    );

    expect(chrome.navigation.filter((item) => item.href === "/blog")).toHaveLength(1);
  });

  it("falls unsupported relative URLs back to the current Sazito theme", () => {
    expect(normalizeStoreHref("/blog/sample")).toEqual({
      href: "https://testmosi.sazito.com/blog/sample",
      external: true,
    });
  });

  it("normalizes Sazito relative upload URLs for store branding", () => {
    const chrome = toStoreChrome(
      {
        shop: {
          name: "فروشگاه تست",
          description: "توضیحات",
          logo: {
            main: "/uploads/image/logo.png",
            favicon: "/apiuploads/testmosi/favicon.png",
          },
          social: {
            facebook: "",
            instagram: "",
            phone1: "",
            phone2: "",
            telegram: "",
            twitter: "",
            whatsapp: "",
          },
        },
      },
      [],
      "https://testmosi.sazito.com",
    );

    expect(chrome.logoUrl).toBe(
      "https://oss.sazito.com/apiuploads/testmosi/uploads/image/logo.png",
    );
    expect(chrome.faviconUrl).toBe(
      "https://oss.sazito.com/apiuploads/testmosi/favicon.png",
    );
  });
});

describe("product presentation", () => {
  it("formats SDK product prices as Persian toman values", () => {
    expect(formatPrice(399_000)).toBe("۳۹۹٬۰۰۰ تومان");
    expect(formatPrice(0)).toBe("۰ تومان");
  });

  it("selects an available variant before an unavailable one", () => {
    const unavailable = variant({
      id: 1,
      isStockManaged: true,
      stockQuantity: 0,
      isAvailable: false,
    });
    const available = variant({ id: 2, isAvailable: true });

    expect(selectDefaultVariant([unavailable, available])?.id).toBe(2);
    expect(isVariantAvailable(unavailable)).toBe(false);
  });

  it("preserves variant order limits for cart quantity controls", () => {
    const cardProduct = product({
      variants: [
        variant({
          minOrderQuantity: 2,
          hasMaxOrder: true,
          maxOrderQuantity: 4,
        }),
      ],
    });
    const detail = toProductDetail(
      17,
      cardProduct,
      "https://testmosi.sazito.com",
      [],
    );

    expect(detail.variants[0]).toMatchObject({
      minQuantity: 2,
      maxQuantity: 4,
    });
  });

  it("supports rich color attributes from the SDK", () => {
    expect(
      attributeValue({
        name: "رنگ",
        value: { value: "سبز", extra: "#2f6b57", fieldType: "color" },
      }),
    ).toBe("سبز");
  });

  it("preserves zero prices and exposes missing-image fallbacks", () => {
    const card = toProductCard(
      product({ variants: [variant({ price: 0 })], images: [] }),
    );

    expect(card.price?.current).toBe(0);
    expect(card.image).toBeNull();
    expect(card.available).toBe(true);
    expect(card.canQuickAdd).toBe(true);
    expect(card.variantId).toBe(1);
  });

  it("requires the product page when quick add needs a choice or form", () => {
    expect(
      toProductCard(product({ dynamicFormId: 3 })).canQuickAdd,
    ).toBe(false);
    expect(
      toProductCard(product({ variants: [variant(), variant({ id: 2 })] }))
        .canQuickAdd,
    ).toBe(false);
  });

  it("uses the product form as a fallback for variants without their own form", () => {
    const detail = toProductDetail(
      17,
      product({ dynamicFormId: 5 }),
      "https://testmosi.sazito.com",
      [],
    );

    expect(detail.variants[0].dynamicFormId).toBe(5);
  });

  it("accepts the live SDK statistics total field", () => {
    const detail = toProductDetail(
      17,
      product(),
      "https://testmosi.sazito.com",
      [],
      { productStatistics: { averageRate: 4.5, total: 2 } },
    );

    expect(detail.reviews).toMatchObject({
      average: 4.5,
      count: 2,
    });
  });
});

describe("content safety", () => {
  it("keeps useful product markup and removes executable content", () => {
    const sanitized = sanitizeProductDescription(
      '<p onclick="alert(1)">توضیح <strong>محصول</strong></p><script>alert(1)</script><a href="javascript:alert(1)">bad</a>',
    );

    expect(sanitized).toContain("<strong>محصول</strong>");
    expect(sanitized).not.toContain("onclick");
    expect(sanitized).not.toContain("script");
    expect(sanitized).not.toContain("javascript:");
  });
});

describe("product SEO presentation", () => {
  it("uses explicit metadata and canonical attributes when present", () => {
    const seo = toProductSeo(
      product({
        attributes: [
          { name: "metatitle", value: "عنوان سئو" },
          { name: "metadescription", value: "توضیح سئو" },
          { name: "canonical", value: "/product/canonical" },
          { name: "noindex", value: "true" },
        ],
      }),
      "https://testmosi.sazito.com",
    );

    expect(seo).toEqual({
      title: "عنوان سئو",
      description: "توضیح سئو",
      canonicalHref: "/product/canonical",
      noIndex: true,
    });
  });
});

describe("SDK response normalization", () => {
  it("unwraps successful responses", () => {
    expect(unwrapSazitoResponse({ data: { ok: true } }, "failed")).toEqual({
      ok: true,
    });
  });

  it("turns SDK errors into a typed data error", () => {
    expect(() =>
      unwrapSazitoResponse(
        { error: { message: "offline", type: "network" } },
        "failed",
      ),
    ).toThrow(SazitoDataError);
  });
});
