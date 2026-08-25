export interface StoreLink {
  label: string;
  href: string;
  external: boolean;
  children: StoreLink[];
}

export interface StoreSocialLink {
  label: string;
  href: string;
}

export interface StoreChrome {
  name: string;
  description: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  navigation: StoreLink[];
  socials: StoreSocialLink[];
}

export interface ProductImageView {
  id: number;
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProductPriceView {
  current: number;
  original: number | null;
  discounted: boolean;
}

export interface ProductVariantView {
  id: number;
  label: string;
  sku: string | null;
  available: boolean;
  price: ProductPriceView;
  attributes: Array<{ name: string; value: string; extra?: string }>;
  imageId: number | null;
  minQuantity: number;
  maxQuantity: number | null;
}

export interface ProductCardView {
  id: number | null;
  name: string;
  href: string;
  image: ProductImageView | null;
  category: string | null;
  price: ProductPriceView | null;
  available: boolean;
}

export interface CategoryView {
  id: number | null;
  name: string;
  href: string;
  count: number | null;
}

export interface ProductReviewView {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  recommended: boolean | null;
  pros: string[];
  cons: string[];
}

export interface ProductReviewSummary {
  average: number;
  count: number;
  recommendedPercentage: number | null;
  items: ProductReviewView[];
}

export interface ProductDetailView {
  entityId: number;
  name: string;
  href: string;
  productType: string;
  images: ProductImageView[];
  categories: CategoryView[];
  variants: ProductVariantView[];
  defaultVariantId: number | null;
  descriptionHtml: string;
  summary: string;
  specifications: Array<{ name: string; value: string }>;
  reviews: ProductReviewSummary | null;
  related: ProductCardView[];
  metaTitle: string;
  metaDescription: string;
  noIndex: boolean;
}

export interface HomePageData {
  store: StoreChrome;
  heroProduct: ProductCardView | null;
  categories: CategoryView[];
  bestSellers: ProductCardView[];
  newest: ProductCardView[];
  discounted: ProductCardView[];
  hasCatalogError: boolean;
}
