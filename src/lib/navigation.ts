import type { StoreLink } from "@/lib/sazito/types";

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

  return decodedPathname === decodedHref || decodedPathname.startsWith(`${decodedHref}/`);
}

export function isNavigationItemCurrent(item: StoreLink, pathname: string): boolean {
  if (!item.external && isCurrentPath(pathname, item.href)) return true;

  return item.children.some((child) => isNavigationItemCurrent(child, pathname));
}
