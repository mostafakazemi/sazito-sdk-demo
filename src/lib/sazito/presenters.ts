import sanitizeHtml from "sanitize-html";
import type {
  MenuItem,
  Product,
  ProductAttribute,
  ProductCategory,
  ProductVariant,
} from "@sazito/client-sdk";

import type {
  CategoryView,
  HomePageData,
  ProductCardView,
  ProductDetailView,
  ProductImageView,
  ProductReviewSummary,
  ProductCollectionView,
  ProductVariantView,
  StoreChrome,
  StoreLink,
  StoreSocialType,
} from "./types";

const FALLBACK_STORE_NAME = "فروشگاه سازیتو";
const FALLBACK_STORE_DESCRIPTION = "انتخابی ساده و مطمئن برای خرید آنلاین";
const SEO_ATTRIBUTE_NAMES = new Set([
  "description",
  "metatitle",
  "metadescription",
  "metakeywords",
  "noindex",
  "canonical",
  "redirect",
]);

interface GeneralInfoInput {
  shop: {
    name: string;
    description: string;
    logo: { main: string; favicon: string };
    social: {
      bale?: string;
      eitaa?: string;
      facebook?: string;
      instagram?: string;
      phone1?: string;
      phone2?: string;
      phone_1?: string;
      phone_2?: string;
      rubika?: string;
      soroushPlus?: string;
      soroush_plus?: string;
      telegram?: string;
      twitter?: string;
      whatsapp?: string;
    };
  };
  settings?: {
    features?: {
      [featureName: string]: boolean | object | undefined;
    };
  };
}

interface ReviewCollectionInput {
  entities: Array<{
    productRate: number;
    userFirstName: string;
    userLastName: string;
    createdAt: string;
    text: string;
    recommendationStatus: string;
    pros: string[];
    cons: string[];
    isAnonymous: boolean;
    metadata?: { variantId?: string };
  }>;
  totalCount: number;
  averageRate: number;
  recommendations?: { recommendedPercentage: number };
}

interface ReviewStatisticsInput {
  productStatistics: {
    averageRate: number;
    totalCount?: number;
    total?: number;
    recommendations?: { recommendedPercentage: number };
  };
}

function nonEmpty(value: string | undefined | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function decodedPathname(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function normalizeStoreAssetUrl(
  value: string | undefined | null,
  storeOrigin: string,
) {
  const asset = nonEmpty(value);
  if (!asset) return null;
  if (/^https?:\/\//i.test(asset)) return asset;
  if (asset.startsWith("//")) return `https:${asset}`;

  try {
    const storeHost = new URL(storeOrigin).hostname;
    const storeKey = storeHost.split(".")[0];
    const path = asset.startsWith("/") ? asset : `/${asset}`;

    if (path.startsWith("/apiuploads/")) {
      return `https://oss.sazito.com${path}`;
    }

    if (path.startsWith("/uploads/")) {
      return `https://oss.sazito.com/apiuploads/${storeKey}${path}`;
    }

    return new URL(path, storeOrigin).toString();
  } catch {
    return asset;
  }
}

export function attributeValue(attribute: ProductAttribute) {
  if (typeof attribute.value === "string") {
    return attribute.value;
  }

  return attribute.value.value;
}

function attributeExtra(attribute: ProductAttribute) {
  return typeof attribute.value === "string" ? undefined : attribute.value.extra;
}

export function normalizeStoreHref(
  url: string,
  storeOrigin = "https://testmosi.sazito.com",
  localContentPaths: ReadonlySet<string> = new Set(),
): Pick<StoreLink, "href" | "external"> {
  const trimmed = url.trim() || "/";

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const resolved = new URL(trimmed);
      const store = new URL(storeOrigin);
      const pathname = decodedPathname(resolved.pathname);
      if (
        resolved.origin === store.origin &&
        localContentPaths.has(pathname)
      ) {
        return {
          href: `${pathname}${resolved.search}${resolved.hash}`,
          external: false,
        };
      }
    } catch {
      // The original URL remains an external fallback.
    }
    return { href: trimmed, external: true };
  }

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const pathname = path.split(/[?#]/, 1)[0];
  const local =
    path === "/" ||
    path === "/search" ||
    path.startsWith("/search?") ||
    path.startsWith("/product/") ||
    path.startsWith("/category/") ||
    path === "/account" ||
    path.startsWith("/account/") ||
    path === "/checkout" ||
    path === "/blog" ||
    localContentPaths.has(pathname);

  return local
    ? { href: path, external: false }
    : { href: `${storeOrigin}${path}`, external: true };
}

function toStoreLink(
  item: MenuItem,
  storeOrigin: string,
  localContentPaths: ReadonlySet<string>,
): StoreLink {
  return {
    label: item.name,
    ...normalizeStoreHref(item.url, storeOrigin, localContentPaths),
    children: item.children.map((child) =>
      toStoreLink(child, storeOrigin, localContentPaths),
    ),
  };
}

function hasNavigationHref(items: StoreLink[], href: string): boolean {
  return items.some(
    (item) =>
      item.href === href || hasNavigationHref(item.children, href),
  );
}

function withBlogIndexLink(
  items: StoreLink[],
  localContentPaths: ReadonlySet<string>,
) {
  const hasBlogPosts = [...localContentPaths].some((path) =>
    path.startsWith("/blog/"),
  );
  if (!hasBlogPosts || hasNavigationHref(items, "/blog")) return items;

  const blogIndex: StoreLink = {
    label: "وبلاگ",
    href: "/blog",
    external: false,
    children: [],
  };
  const homeIndex = items.findIndex((item) => item.href === "/");
  const insertionIndex = homeIndex >= 0 ? homeIndex + 1 : 0;

  return [
    ...items.slice(0, insertionIndex),
    blogIndex,
    ...items.slice(insertionIndex),
  ];
}

function withoutBlogLinks(items: StoreLink[]): StoreLink[] {
  return items.flatMap((item) => {
    let pathname = item.href;
    try {
      pathname = new URL(item.href, "https://storefront.local").pathname;
    } catch {
      // Keep the original value for the path check below.
    }

    if (pathname === "/blog" || pathname.startsWith("/blog/")) return [];

    return [
      {
        ...item,
        children: withoutBlogLinks(item.children),
      },
    ];
  });
}

export function toStoreChrome(
  info: GeneralInfoInput | undefined,
  menu: MenuItem[] | undefined,
  storeOrigin: string,
  localContentUrls: string[] = [],
): StoreChrome {
  const localContentPaths = new Set(
    localContentUrls.map((url) => decodedPathname(url.split(/[?#]/, 1)[0])),
  );
  const searchEnabled = info?.settings?.features?.searchEnabled !== false;
  const blogEnabled = info?.settings?.features?.blogEnabled !== false;
  const menuLinks = (menu ?? []).map((item) =>
    toStoreLink(item, storeOrigin, localContentPaths),
  );
  const socialLabels: Record<string, string> = {
    instagram: "اینستاگرام",
    telegram: "تلگرام",
    whatsapp: "واتساپ",
    twitter: "ایکس",
    facebook: "فیسبوک",
    bale: "بله",
    eitaa: "ایتا",
    rubika: "روبیکا",
    soroushPlus: "سروش‌پلاس",
    soroush_plus: "سروش‌پلاس",
    phone1: "تلفن فروشگاه",
    phone2: "تلفن دوم",
    phone_1: "تلفن فروشگاه",
    phone_2: "تلفن دوم",
  };

  const socialTypes: Record<string, StoreSocialType> = {
    instagram: "instagram",
    telegram: "telegram",
    whatsapp: "whatsapp",
    twitter: "x",
    facebook: "facebook",
    bale: "bale",
    eitaa: "eitaa",
    rubika: "rubika",
    soroushPlus: "soroush_plus",
    soroush_plus: "soroush_plus",
  };

  const socialEntries = Object.entries(info?.shop.social ?? {}).flatMap(
    ([key, value]) => {
      const normalizedValue = nonEmpty(value);
      return normalizedValue ? [[key, normalizedValue] as const] : [];
    },
  );
  const phones = socialEntries
    .filter(
      ([key]) =>
        key === "phone1" ||
        key === "phone2" ||
        key === "phone_1" ||
        key === "phone_2",
    )
    .map(([, value]) => ({
      value,
      href: `tel:${value}`,
    }));
  const socials = socialEntries
    .filter(([key]) => !key.startsWith("phone"))
    .map(([key, value]) => ({
      label: socialLabels[key] ?? key,
      type: socialTypes[key] ?? "unknown",
      href: key === "whatsapp" && !/^https?:\/\//i.test(value)
          ? `https://wa.me/${value.replace(/^\+/, "")}`
          : value,
    }));

  return {
    name: nonEmpty(info?.shop.name) ?? FALLBACK_STORE_NAME,
    description:
      nonEmpty(info?.shop.description) ?? FALLBACK_STORE_DESCRIPTION,
    logoUrl: normalizeStoreAssetUrl(info?.shop.logo.main, storeOrigin),
    faviconUrl: normalizeStoreAssetUrl(info?.shop.logo.favicon, storeOrigin),
    navigation: blogEnabled
      ? withBlogIndexLink(menuLinks, localContentPaths)
      : withoutBlogLinks(menuLinks),
    socials,
    phones,
    searchEnabled,
    blogEnabled,
  };
}

function toImage(
  image: Product["images"][number] | undefined,
  productName: string,
): ProductImageView | null {
  if (!image?.url) return null;

  return {
    id: image.id,
    src: image.url,
    alt: nonEmpty(image.alt) ?? productName,
    width: image.width && image.width > 0 ? image.width : 900,
    height: image.height && image.height > 0 ? image.height : 900,
  };
}

export function isVariantAvailable(variant: ProductVariant) {
  if (!variant.enabled) return false;
  if (variant.isAvailable !== undefined) return variant.isAvailable;
  return !variant.isStockManaged || variant.stockQuantity > 0;
}

export function selectDefaultVariant(variants: ProductVariant[]) {
  return (
    variants.find(isVariantAvailable) ??
    variants.find((variant) => variant.enabled) ??
    variants[0] ??
    null
  );
}

function toPrice(variant: ProductVariant) {
  const original =
    variant.originalPrice !== undefined && variant.originalPrice > variant.price
      ? variant.originalPrice
      : null;

  return {
    current: variant.price,
    original,
    discounted: original !== null,
  };
}

function toVariant(
  variant: ProductVariant,
  productName: string,
  productDynamicFormId?: number,
): ProductVariantView {
  const attributes = variant.attributes.map((attribute) => ({
    name: attribute.name,
    value: attributeValue(attribute),
    extra: attributeExtra(attribute),
  }));
  const label = attributes.length
    ? attributes.map((attribute) => attribute.value).join("، ")
    : productName;
  const minQuantity = Math.max(1, variant.minOrderQuantity || 1);
  const maximums = [
    variant.hasMaxOrder && variant.maxOrderQuantity > 0
      ? variant.maxOrderQuantity
      : null,
    variant.isStockManaged && variant.stockQuantity > 0
      ? variant.stockQuantity
      : null,
  ].filter((value): value is number => value !== null);
  const maxQuantity = maximums.length
    ? Math.max(minQuantity, Math.min(...maximums))
    : null;

  return {
    id: variant.id,
    label,
    sku: nonEmpty(variant.sku),
    available: isVariantAvailable(variant),
    price: toPrice(variant),
    attributes,
    imageId: variant.imageId ?? null,
    minQuantity,
    maxQuantity,
    dynamicFormId:
      (variant.dynamicFormId && variant.dynamicFormId > 0
        ? variant.dynamicFormId
        : productDynamicFormId && productDynamicFormId > 0
          ? productDynamicFormId
          : null),
  };
}

export function toProductCard(product: Product): ProductCardView {
  const defaultVariant = selectDefaultVariant(product.variants);
  const dynamicFormId = defaultVariant?.dynamicFormId || product.dynamicFormId;

  return {
    id: product.id ?? null,
    name: product.name,
    href: normalizeStoreHref(product.url).href,
    image: toImage(product.images[0], product.name),
    category: product.categories[0]?.name ?? null,
    price: defaultVariant ? toPrice(defaultVariant) : null,
    available: defaultVariant ? isVariantAvailable(defaultVariant) : false,
    variantId: defaultVariant?.id ?? null,
    minQuantity: Math.max(1, defaultVariant?.minOrderQuantity || 1),
    canQuickAdd: Boolean(
      defaultVariant &&
        isVariantAvailable(defaultVariant) &&
        product.variants.filter((variant) => variant.enabled).length === 1 &&
        !dynamicFormId &&
        !product.eventEntityId,
    ),
  };
}

export function toCategory(
  category: ProductCategory,
  storeOrigin: string,
): CategoryView {
  return {
    id: category.id ?? null,
    name: category.name,
    href: normalizeStoreHref(category.url, storeOrigin).href,
    count: category.productsCount ?? null,
    description: nonEmpty(category.description) ?? undefined,
  };
}

export function toProductCollection(input: {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}): ProductCollectionView {
  const pageSize = Math.max(1, input.pageSize || input.items.length || 1);

  return {
    items: input.items.filter((product) => product.enabled).map(toProductCard),
    total: Math.max(0, input.total),
    page: Math.max(1, input.page),
    pageSize,
    totalPages: Math.max(1, Math.ceil(Math.max(0, input.total) / pageSize)),
  };
}

export function sanitizeProductDescription(value: string) {
  return sanitizeHtml(value, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "ul",
      "ol",
      "li",
      "a",
      "h2",
      "h3",
      "blockquote",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "nofollow noopener noreferrer",
      }),
    },
  });
}

function stripMarkup(value: string) {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}

function findAttribute(product: Product, name: string) {
  return product.attributes?.find(
    (attribute) => attribute.name.toLocaleLowerCase("en-US") === name,
  );
}

export function toProductSeo(product: Product, storeOrigin: string) {
  const description = findAttribute(product, "description");
  const metaTitle = findAttribute(product, "metatitle");
  const metaDescription = findAttribute(product, "metadescription");
  const noIndex = findAttribute(product, "noindex");
  const canonical = findAttribute(product, "canonical");
  const summary = description
    ? stripMarkup(attributeValue(description)).slice(0, 190)
    : "";
  const canonicalValue = nonEmpty(
    canonical ? attributeValue(canonical) : null,
  );

  return {
    title: nonEmpty(metaTitle ? attributeValue(metaTitle) : null) ?? product.name,
    description:
      nonEmpty(metaDescription ? attributeValue(metaDescription) : null) ??
      (summary || `مشاهده جزئیات ${product.name}`),
    noIndex: ["true", "1", "yes"].includes(
      (noIndex ? attributeValue(noIndex) : "").toLocaleLowerCase("en-US"),
    ),
    canonicalHref: canonicalValue
      ? normalizeStoreHref(canonicalValue, storeOrigin).href
      : normalizeStoreHref(product.url, storeOrigin).href,
  };
}

function toReviews(
  statistics: ReviewStatisticsInput | undefined,
  reviews: ReviewCollectionInput | undefined,
): ProductReviewSummary | null {
  const stats = statistics?.productStatistics;
  const count = reviews?.totalCount ?? stats?.totalCount ?? stats?.total ?? 0;

  if (!count && !reviews?.entities.length) return null;

  return {
    average: reviews?.averageRate ?? stats?.averageRate ?? 0,
    count,
    recommendedPercentage:
      reviews?.recommendations?.recommendedPercentage ??
      stats?.recommendations?.recommendedPercentage ??
      null,
    items: (reviews?.entities ?? []).map((review, index) => ({
      id: `${review.metadata?.variantId ?? "review"}-${review.createdAt}-${index}`,
      author: review.isAnonymous
        ? "خریدار ناشناس"
        : nonEmpty(`${review.userFirstName} ${review.userLastName}`) ?? "خریدار",
      rating: review.productRate,
      date: review.createdAt,
      text: review.text,
      recommended:
        review.recommendationStatus === "RECOMMENDED"
          ? true
          : review.recommendationStatus === "NOT-RECOMMENDED"
            ? false
            : null,
      pros: review.pros ?? [],
      cons: review.cons ?? [],
    })),
  };
}

export function toProductDetail(
  entityId: number,
  product: Product,
  storeOrigin: string,
  relatedProducts: Product[],
  statistics?: ReviewStatisticsInput,
  reviews?: ReviewCollectionInput,
): ProductDetailView {
  const descriptionValue = findAttribute(product, "description");
  const descriptionHtml = descriptionValue
    ? sanitizeProductDescription(attributeValue(descriptionValue))
    : "";
  const seo = toProductSeo(product, storeOrigin);
  const specifications = (product.attributes ?? [])
    .filter(
      (attribute) =>
        !SEO_ATTRIBUTE_NAMES.has(attribute.name.toLocaleLowerCase("en-US")) &&
        Boolean(nonEmpty(attributeValue(attribute))),
    )
    .map((attribute) => ({
      name: attribute.name,
      value: attributeValue(attribute),
    }));
  const variants = product.variants.map((variant) =>
    toVariant(variant, product.name, product.dynamicFormId),
  );
  const defaultVariant = selectDefaultVariant(product.variants);
  const summary = stripMarkup(descriptionHtml).slice(0, 190);

  return {
    entityId,
    name: product.name,
    href: normalizeStoreHref(product.url).href,
    productType: product.productType,
    images: product.images
      .map((image) => toImage(image, product.name))
      .filter((image): image is ProductImageView => image !== null),
    categories: product.categories.map((category) =>
      toCategory(category, storeOrigin),
    ),
    variants,
    defaultVariantId: defaultVariant?.id ?? null,
    descriptionHtml,
    summary,
    specifications,
    reviews: toReviews(statistics, reviews),
    related: relatedProducts
      .filter((item) => item.url !== product.url)
      .slice(0, 4)
      .map(toProductCard),
    metaTitle: seo.title,
    metaDescription: seo.description,
    noIndex: seo.noIndex,
    canonicalHref: seo.canonicalHref,
  };
}

export function toHomePageData(input: {
  store: StoreChrome;
  categories?: ProductCategory[];
  bestSellers?: Product[];
  newest?: Product[];
  discounted?: Product[];
  hasCatalogError: boolean;
  storeOrigin: string;
}): HomePageData {
  const bestSellers = (input.bestSellers ?? [])
    .filter((product) => product.enabled)
    .map(toProductCard);
  const newest = (input.newest ?? [])
    .filter((product) => product.enabled)
    .map(toProductCard);
  const discounted = (input.discounted ?? [])
    .filter((product) => product.enabled)
    .map(toProductCard);
  const heroProduct =
    bestSellers.find((product) => product.image) ??
    newest.find((product) => product.image) ??
    null;

  return {
    store: input.store,
    heroProduct,
    categories: (input.categories ?? [])
      .filter((category) => category.enabled !== false)
      .slice(0, 10)
      .map((category) => toCategory(category, input.storeOrigin)),
    bestSellers,
    newest,
    discounted,
    hasCatalogError: input.hasCatalogError,
  };
}

export function formatPrice(value: number) {
  return `${new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 0,
  }).format(value)} تومان`;
}

export function formatPersianDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
