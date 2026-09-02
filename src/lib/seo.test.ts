import { describe, expect, it } from "vitest";

import type {
  CmsPageView,
  ProductDetailView,
  StoreChrome,
} from "./sazito/types";
import {
  absoluteStorefrontUrl,
  buildCmsPageJsonLd,
  buildContentListJsonLd,
  buildProductJsonLd,
  localStorefrontPath,
  resolveStorefrontOrigin,
  serializeJsonLd,
} from "./seo";

const store: StoreChrome = {
  name: "فروشگاه تست",
  description: "فروشگاه آنلاین تست",
  logoUrl: null,
  faviconUrl: null,
  navigation: [],
  socials: [],
  phones: [],
  searchEnabled: true,
  blogEnabled: true,
};

const product: ProductDetailView = {
  entityId: 17,
  name: "محصول تست",
  href: "/product/test",
  productType: "physical",
  images: [],
  categories: [],
  variants: [
    {
      id: 9,
      label: "محصول تست",
      sku: "SKU-9",
      available: true,
      price: { current: 125_000, original: null, discounted: false },
      attributes: [],
      imageId: null,
      minQuantity: 1,
      maxQuantity: null,
      dynamicFormId: null,
    },
  ],
  defaultVariantId: 9,
  descriptionHtml: "<p>توضیح محصول</p>",
  summary: "توضیح محصول",
  specifications: [],
  reviews: null,
  related: [],
  metaTitle: "محصول تست",
  metaDescription: "توضیح محصول",
  noIndex: false,
  canonicalHref: "/product/test",
};

const cmsPage: CmsPageView = {
  id: 2,
  title: "نوشته تست",
  href: "/blog/test",
  type: "blog",
  summary: "خلاصه نوشته",
  contentHtml: "<p>متن نوشته</p>",
  image: null,
  createdAt: "2026-08-01T00:00:00Z",
  updatedAt: "2026-08-02T00:00:00Z",
  metaTitle: "نوشته تست",
  metaDescription: "خلاصه نوشته",
  canonicalHref: "/blog/test",
  noIndex: false,
};

describe("storefront SEO URLs", () => {
  it("normalizes deployment origins and relative URLs", () => {
    expect(resolveStorefrontOrigin("shop.example.com/path")).toBe(
      "https://shop.example.com",
    );
    expect(
      absoluteStorefrontUrl("/product/test", "https://shop.example.com"),
    ).toBe("https://shop.example.com/product/test");
  });

  it("keeps only URLs that belong to the source storefront", () => {
    expect(
      localStorefrontPath(
        "https://testmosi.sazito.com/category/sample?q=1#ignored",
        "https://testmosi.sazito.com",
      ),
    ).toBe("/category/sample?q=1");
    expect(
      localStorefrontPath(
        "https://example.com/category/sample",
        "https://testmosi.sazito.com",
      ),
    ).toBeNull();
  });
});

describe("JSON-LD", () => {
  it("escapes markup-breaking characters before embedding JSON", () => {
    const serialized = serializeJsonLd({ name: "</script><script>alert(1)</script>" });

    expect(serialized).not.toContain("<script>");
    expect(serialized).toContain("\\u003c/script>");
  });

  it("publishes toman prices as their ISO rial equivalent", () => {
    const schema = buildProductJsonLd(product, store);

    expect(schema.offers).toMatchObject({
      "@type": "Offer",
      price: 1_250_000,
      priceCurrency: "IRR",
      availability: "https://schema.org/InStock",
    });
  });

  it("publishes CMS pages and blog indexes with native URLs", () => {
    const pageSchema = buildCmsPageJsonLd(cmsPage, store);
    const listSchema = buildContentListJsonLd("وبلاگ", [cmsPage]);

    expect(pageSchema).toMatchObject({
      "@type": "BlogPosting",
      name: "نوشته تست",
      datePublished: "2026-08-01T00:00:00Z",
    });
    expect(listSchema.itemListElement).toEqual([
      expect.objectContaining({
        position: 1,
        name: "نوشته تست",
      }),
    ]);
  });
});
