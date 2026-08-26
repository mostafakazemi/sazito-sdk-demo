import { describe, expect, it } from "vitest";

import { catalogHref, paginationWindow, parseCatalogQuery } from "./catalog";

describe("catalog URL state", () => {
  it("normalizes pagination, sort, toggles, and price ranges", () => {
    expect(
      parseCatalogQuery({
        page: "3",
        sort: "price",
        available: "1",
        discounted: "1",
        priceMin: "200,000",
        priceMax: "100000",
      }),
    ).toEqual({
      page: 3,
      sort: "price",
      availableOnly: true,
      discountedOnly: true,
      priceMin: 100_000,
      priceMax: 200_000,
    });
  });

  it("falls back from invalid values", () => {
    expect(parseCatalogQuery({ page: "-2", sort: "unknown" })).toMatchObject({
      page: 1,
      sort: "newest",
      priceMin: null,
      priceMax: null,
    });
  });

  it("preserves filters while changing pages", () => {
    expect(
      catalogHref("/category/test", { sort: "discount", page: "2" }, { page: 3 }),
    ).toBe("/category/test?sort=discount&page=3");
  });

  it("keeps pagination compact around the current page", () => {
    expect(paginationWindow(6, 12)).toEqual([4, 5, 6, 7, 8]);
    expect(paginationWindow(1, 1)).toEqual([]);
  });
});
