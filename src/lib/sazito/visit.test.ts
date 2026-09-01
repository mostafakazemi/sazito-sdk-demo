import { describe, expect, it } from "vitest";

import {
  completeStorefrontVisit,
  reserveStorefrontVisit,
  STOREFRONT_VISIT_SESSION_KEY,
  type VisitSessionStorage,
} from "./visit";

function memoryStorage(): VisitSessionStorage & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

describe("storefront visit session", () => {
  it("reserves only one request per browser session", () => {
    const storage = memoryStorage();

    expect(reserveStorefrontVisit(storage)).toBe("reserved");
    expect(storage.values.get(STOREFRONT_VISIT_SESSION_KEY)).toBe("pending");
    expect(reserveStorefrontVisit(storage)).toBe("skip");

    completeStorefrontVisit(storage, true);
    expect(storage.values.get(STOREFRONT_VISIT_SESSION_KEY)).toBe("tracked");
    expect(reserveStorefrontVisit(storage)).toBe("skip");
  });

  it("allows a later retry after a failed request", () => {
    const storage = memoryStorage();

    expect(reserveStorefrontVisit(storage)).toBe("reserved");
    completeStorefrontVisit(storage, false);
    expect(storage.values.has(STOREFRONT_VISIT_SESSION_KEY)).toBe(false);
    expect(reserveStorefrontVisit(storage)).toBe("reserved");
  });

  it("respects the browser do-not-track preference", () => {
    const storage = memoryStorage();

    expect(reserveStorefrontVisit(storage, "1")).toBe("skip");
    expect(storage.values.size).toBe(0);
  });

  it("degrades safely when session storage is unavailable", () => {
    const storage: VisitSessionStorage = {
      getItem() {
        throw new Error("blocked");
      },
      setItem() {
        throw new Error("blocked");
      },
      removeItem() {
        throw new Error("blocked");
      },
    };

    expect(reserveStorefrontVisit(storage)).toBe("unavailable");
    expect(() => completeStorefrontVisit(storage, true)).not.toThrow();
  });
});
