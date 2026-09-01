export const STOREFRONT_VISIT_SESSION_KEY = "sazito:storefront-visit";

export type StorefrontVisitReservation = "reserved" | "skip" | "unavailable";

export interface VisitSessionStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function reserveStorefrontVisit(
  storage: VisitSessionStorage,
  doNotTrack?: string | null,
): StorefrontVisitReservation {
  if (doNotTrack === "1") return "skip";

  try {
    const state = storage.getItem(STOREFRONT_VISIT_SESSION_KEY);
    if (state === "pending" || state === "tracked") return "skip";

    storage.setItem(STOREFRONT_VISIT_SESSION_KEY, "pending");
    return "reserved";
  } catch {
    return "unavailable";
  }
}

export function completeStorefrontVisit(
  storage: VisitSessionStorage,
  succeeded: boolean,
) {
  try {
    if (succeeded) {
      storage.setItem(STOREFRONT_VISIT_SESSION_KEY, "tracked");
    } else if (storage.getItem(STOREFRONT_VISIT_SESSION_KEY) === "pending") {
      storage.removeItem(STOREFRONT_VISIT_SESSION_KEY);
    }
  } catch {
    // Visit tracking is best-effort and must never interrupt shopping.
  }
}
