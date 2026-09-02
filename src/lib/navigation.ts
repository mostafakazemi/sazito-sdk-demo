import type { StoreLink } from "@/lib/sazito/types";

const EXACT_NAVIGATION_PATHS = new Set(["/blog"]);

export function isCurrentPath(pathname: string, href: string) {
  const cleanHref = href.split(/[?#]/, 1)[0];
  let decodedPathname = pathname;
  let decodedHref = cleanHref;

  try {
    decodedPathname = decodeURI(pathname);
    decodedHref = decodeURI(cleanHref);
  } catch {
    // Keep the original values when a malformed escape sequence is present.
  }

  if (!decodedHref.startsWith("/")) return false;
  if (decodedHref === "/") return decodedPathname === "/";
  if (EXACT_NAVIGATION_PATHS.has(decodedHref)) {
    return decodedPathname === decodedHref;
  }

  return decodedPathname === decodedHref || decodedPathname.startsWith(`${decodedHref}/`);
}

export function isNavigationItemCurrent(item: StoreLink, pathname: string): boolean {
  if (!item.external && isCurrentPath(pathname, item.href)) return true;

  return item.children.some((child) => isNavigationItemCurrent(child, pathname));
}
