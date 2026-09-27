export const REVIEW_IMAGE_HOST =
  "sazito-file-manager-production-tajrobe.s3.ir-thr-at1.arvanstorage.ir";

export function reviewImageProxyUrl(source: string) {
  return `/api/review-image?url=${encodeURIComponent(source)}`;
}

export function isReviewImageUrl(source: URL) {
  return (
    source.protocol === "https:" &&
    source.hostname === REVIEW_IMAGE_HOST &&
    !source.port &&
    !source.username &&
    !source.password
  );
}

export function reviewImageContentType(source: URL) {
  const extension = source.pathname.split(".").pop()?.toLowerCase();

  return {
    avif: "image/avif",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  }[extension ?? ""];
}
