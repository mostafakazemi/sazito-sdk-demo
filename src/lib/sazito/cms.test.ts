import { describe, expect, it } from "vitest";

import { sanitizeCmsContent, toCmsPageView } from "./cms";

describe("CMS presentation", () => {
  it("accepts the live SDK title field and extracts metadata", () => {
    const view = toCmsPageView(
      {
        id: 2,
        title: "درباره ما",
        url: "/درباره-ما",
        enabled: true,
        cmsPageType: "normal",
        content: "<p>معرفی فروشگاه</p>",
        attributes: [
          { name: "metaTitle", value: "عنوان سئو" },
          { name: "metaDescription", value: "توضیح سئو" },
          { name: "canonical", value: "/درباره-فروشگاه" },
          { name: "noindex", value: "true" },
        ],
        createdAt: "2026-08-01T00:00:00Z",
        updatedAt: "2026-08-02T00:00:00Z",
      },
      "https://testmosi.sazito.com",
    );

    expect(view).toMatchObject({
      title: "درباره ما",
      metaTitle: "عنوان سئو",
      metaDescription: "توضیح سئو",
      canonicalHref: "/درباره-فروشگاه",
      noIndex: true,
      type: "normal",
    });
  });

  it("sanitizes executable markup and normalizes Sazito images", () => {
    const html = sanitizeCmsContent(
      '<h1>عنوان داخلی</h1><script>alert(1)</script><img src="/apiuploads/testmosi/page.jpg" onerror="alert(1)"><a href="javascript:alert(1)">bad</a>',
    );

    expect(html).toContain("<h2>عنوان داخلی</h2>");
    expect(html).toContain('src="https://oss.sazito.com/apiuploads/testmosi/page.jpg"');
    expect(html).not.toContain("script");
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("javascript:");
  });

  it("rejects unsafe canonical attributes", () => {
    const view = toCmsPageView(
      {
        name: "صفحه",
        url: "/page",
        attributes: [{ name: "canonical", value: "javascript:alert(1)" }],
        createdAt: "2026-08-01T00:00:00Z",
        updatedAt: "2026-08-01T00:00:00Z",
      },
      "https://testmosi.sazito.com",
    );

    expect(view.canonicalHref).toBe("/page");
  });
});
