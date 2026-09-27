import { describe, expect, it } from "vitest";

import {
  isReviewImageUrl,
  reviewImageContentType,
  reviewImageProxyUrl,
} from "./review-image";

describe("review image proxy", () => {
  it("allows only the configured Tajrobe storage host", () => {
    expect(
      isReviewImageUrl(
        new URL(
          "https://sazito-file-manager-production-tajrobe.s3.ir-thr-at1.arvanstorage.ir/268571%2Fimage.jpeg",
        ),
      ),
    ).toBe(true);
    expect(isReviewImageUrl(new URL("https://example.com/image.jpeg"))).toBe(
      false,
    );
    expect(
      isReviewImageUrl(
        new URL(
          "http://sazito-file-manager-production-tajrobe.s3.ir-thr-at1.arvanstorage.ir/268571%2Fimage.jpeg",
        ),
      ),
    ).toBe(false);
  });

  it("maps supported file extensions to image MIME types", () => {
    expect(reviewImageContentType(new URL("https://example.com/image.jpeg"))).toBe(
      "image/jpeg",
    );
    expect(reviewImageContentType(new URL("https://example.com/image.png"))).toBe(
      "image/png",
    );
    expect(reviewImageContentType(new URL("https://example.com/image.avif"))).toBe(
      "image/avif",
    );
    expect(reviewImageContentType(new URL("https://example.com/image.txt"))).toBe(
      undefined,
    );
  });

  it("encodes the upstream URL for the proxy request", () => {
    const source =
      "https://sazito-file-manager-production-tajrobe.s3.ir-thr-at1.arvanstorage.ir/268571%2Fimage.jpeg";

    expect(reviewImageProxyUrl(source)).toBe(
      `/api/review-image?url=${encodeURIComponent(source)}`,
    );
  });
});
