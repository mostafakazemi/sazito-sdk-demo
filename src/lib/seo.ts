import sanitizeHtml from "sanitize-html";

import type {
  ProductCardView,
  ProductDetailView,
  StoreChrome,
} from "./sazito/types";

type JsonLdObject = Record<string, unknown>;

function fallbackStorefrontUrl() {
  const domain = process.env.SAZITO_STORE_DOMAIN?.trim();
  return domain ? `https://${domain}` : "http://localhost:3000";
}

export function resolveStorefrontOrigin(
  value = process.env.STOREFRONT_URL,
  fallback = fallbackStorefrontUrl(),
) {
  const candidate = value?.trim() || fallback;
  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(candidate)
    ? candidate
    : `https://${candidate}`;
  const url = new URL(withProtocol);

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error("STOREFRONT_URL must use http or https.");
  }

  return url.origin;
}

export const storefrontOrigin = resolveStorefrontOrigin();

export function absoluteStorefrontUrl(
  href: string,
  origin = storefrontOrigin,
) {
  return new URL(href, `${origin}/`).toString();
}

export function localStorefrontPath(href: string, sourceOrigin: string) {
  try {
    const source = new URL(sourceOrigin);
    const resolved = new URL(href, source);

    if (resolved.origin !== source.origin) return null;

    return `${resolved.pathname}${resolved.search}`;
  } catch {
    return null;
  }
}

export function plainText(value: string, maxLength?: number) {
  const text = sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, " ")
    .trim();

  return maxLength ? text.slice(0, maxLength).trim() : text;
}

export function serializeJsonLd(value: JsonLdObject | JsonLdObject[]) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function buildStoreJsonLd(store: StoreChrome): JsonLdObject {
  const sameAs = store.socials
    .map((social) => social.href)
    .filter((href) => /^https?:\/\//i.test(href));

  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": `${storefrontOrigin}/#store`,
    name: store.name,
    description: plainText(store.description),
    url: absoluteStorefrontUrl("/"),
    ...(store.logoUrl ? { logo: store.logoUrl, image: store.logoUrl } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

function productOffers(product: ProductDetailView, store: StoreChrome) {
  return product.variants.map((variant) => ({
    "@type": "Offer",
    url: absoluteStorefrontUrl(product.href),
    price: variant.price.current * 10,
    priceCurrency: "IRR",
    availability: variant.available
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    itemCondition: "https://schema.org/NewCondition",
    ...(variant.sku ? { sku: variant.sku } : {}),
    seller: {
      "@type": "Organization",
      "@id": `${storefrontOrigin}/#store`,
      name: store.name,
    },
  }));
}

export function buildProductJsonLd(
  product: ProductDetailView,
  store: StoreChrome,
): JsonLdObject {
  const reviews = product.reviews?.items.slice(0, 5).map((review) => ({
    "@type": "Review",
    author: { "@type": "Person", name: review.author },
    datePublished: review.date,
    reviewBody: plainText(review.text),
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
  }));
  const offers = productOffers(product, store);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${absoluteStorefrontUrl(product.href)}#product`,
    name: product.name,
    url: absoluteStorefrontUrl(product.href),
    description: product.metaDescription,
    ...(product.images.length
      ? { image: product.images.map((image) => image.src) }
      : {}),
    ...(product.categories.length
      ? { category: product.categories.map((category) => category.name).join("، ") }
      : {}),
    ...(offers.length ? { offers: offers.length === 1 ? offers[0] : offers } : {}),
    ...(product.reviews && product.reviews.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.reviews.average,
            reviewCount: product.reviews.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(reviews?.length ? { review: reviews } : {}),
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; href: string }>,
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteStorefrontUrl(item.href),
    })),
  };
}

export function buildProductListJsonLd(
  name: string,
  products: ProductCardView[],
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: absoluteStorefrontUrl(product.href),
      ...(product.image ? { image: product.image.src } : {}),
    })),
  };
}
