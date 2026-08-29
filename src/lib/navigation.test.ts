import { describe, expect, it } from "vitest";

import { isCurrentPath, isNavigationItemCurrent } from "./navigation";
import type { StoreLink } from "./sazito/types";

function menuItem(overrides: Partial<StoreLink> = {}): StoreLink {
  return {
    label: "دسته‌بندی",
    href: "/category/parent",
    external: false,
    children: [],
    ...overrides,
  };
}

describe("navigation route matching", () => {
  it("matches exact and nested local paths without matching similarly named routes", () => {
    expect(isCurrentPath("/category/parent", "/category/parent")).toBe(true);
    expect(isCurrentPath("/category/parent/child", "/category/parent")).toBe(true);
    expect(isCurrentPath("/category/parenting", "/category/parent")).toBe(false);
  });

  it("matches URI-encoded Persian menu destinations", () => {
    expect(isCurrentPath("/category/لباس", "/category/%D9%84%D8%A8%D8%A7%D8%B3")).toBe(true);
  });

  it("marks a parent active when any nested child is active", () => {
    const item = menuItem({
      href: "https://testmosi.sazito.com/catalog",
      external: true,
      children: [
        menuItem({
          label: "فرزند",
          href: "/category/child",
          children: [menuItem({ label: "نوه", href: "/category/grandchild" })],
        }),
      ],
    });

    expect(isNavigationItemCurrent(item, "/category/grandchild")).toBe(true);
    expect(isNavigationItemCurrent(item, "/category/unrelated")).toBe(false);
  });

  it("does not treat an external parent destination as a local active route", () => {
    expect(
      isNavigationItemCurrent(
        menuItem({ href: "https://testmosi.sazito.com/blog", external: true }),
        "/blog",
      ),
    ).toBe(false);
  });
});
