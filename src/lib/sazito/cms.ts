import sanitizeHtml from "sanitize-html";
import type { CmsPage, ProductAttribute } from "@sazito/client-sdk";

import { plainText } from "../seo";
import { attributeValue, normalizeStoreAssetUrl } from "./presenters";
import type { CmsPageView } from "./types";

type CmsPageInput = Omit<CmsPage, "name"> & {
  name?: string;
  title?: string;
};

function nonEmpty(value: string | undefined | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function findAttribute(page: CmsPageInput, name: string) {
  return page.attributes?.find(
    (attribute) => attribute.name.toLocaleLowerCase("en-US") === name,
  );
}

function pageAttribute(page: CmsPageInput, name: string) {
  const attribute = findAttribute(page, name);
  return attribute ? nonEmpty(attributeValue(attribute as ProductAttribute)) : null;
}

function booleanAttribute(value: string | null) {
  return value ? ["1", "true", "yes"].includes(value.toLowerCase()) : false;
}

function safeCanonical(value: string | null, fallback: string) {
  if (!value) return fallback;
  if (value.startsWith("/") || /^https?:\/\//i.test(value)) return value;
  return fallback;
}

export function sanitizeCmsContent(
  value: string,
  storeOrigin = "https://testmosi.sazito.com",
) {
  return sanitizeHtml(value, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "ul",
      "ol",
      "li",
      "a",
      "h2",
      "h3",
      "h4",
      "blockquote",
      "pre",
      "code",
      "hr",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "figure",
      "figcaption",
      "img",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading", "decoding"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      h1: "h2",
      a: sanitizeHtml.simpleTransform("a", {
        rel: "nofollow noopener noreferrer",
      }),
      img: (tagName, attributes) => {
        const src = normalizeStoreAssetUrl(attributes.src, storeOrigin);
        if (!src || !/^https:\/\//i.test(src)) {
          return { tagName: "span", attribs: {}, text: "" };
        }

        return {
          tagName,
          attribs: {
            ...attributes,
            src,
            loading: "lazy",
            decoding: "async",
          },
        };
      },
    },
  });
}

export function toCmsPageView(
  page: CmsPageInput,
  storeOrigin: string,
): CmsPageView {
  const title = nonEmpty(page.title) ?? nonEmpty(page.name) ?? "صفحه بدون عنوان";
  const href = nonEmpty(page.url) ?? "/";
  const contentHtml = sanitizeCmsContent(page.content ?? "", storeOrigin);
  const summary = nonEmpty(page.summary) ?? plainText(contentHtml, 220);
  const metaDescription =
    pageAttribute(page, "metadescription") ?? summary ?? title;
  const imageSrc = normalizeStoreAssetUrl(page.image?.url, storeOrigin);

  return {
    id: page.id ?? null,
    title,
    href,
    type: page.cmsPageType === "blog" ? "blog" : "normal",
    summary: summary ?? "",
    contentHtml,
    image: imageSrc
      ? {
          id: page.image?.id ?? 0,
          src: imageSrc,
          alt: nonEmpty(page.image?.alt) ?? title,
          width: page.image?.width && page.image.width > 0 ? page.image.width : 1200,
          height:
            page.image?.height && page.image.height > 0 ? page.image.height : 675,
        }
      : null,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
    metaTitle: pageAttribute(page, "metatitle") ?? title,
    metaDescription,
    canonicalHref: safeCanonical(pageAttribute(page, "canonical"), href),
    noIndex: booleanAttribute(pageAttribute(page, "noindex")),
  };
}
