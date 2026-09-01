import { describe, expect, it, vi } from "vitest";

import {
  hasGuestCartCredentials,
  mergeGuestCartAfterLogin,
} from "./guest-cart-merge";

describe("guest cart merge after login", () => {
  it("requires a usable stored cart identifier", () => {
    expect(hasGuestCartCredentials(null)).toBe(false);
    expect(hasGuestCartCredentials({ identifier: "" })).toBe(false);
    expect(hasGuestCartCredentials({ identifier: "guest-cart" })).toBe(true);
  });

  it("does nothing when there is no guest cart", async () => {
    const mergeUser = vi.fn();
    const refreshCart = vi.fn();

    await expect(
      mergeGuestCartAfterLogin({
        shouldMerge: false,
        mergeUser,
        refreshCart,
      }),
    ).resolves.toBe("not-needed");
    expect(mergeUser).not.toHaveBeenCalled();
    expect(refreshCart).not.toHaveBeenCalled();
  });

  it("does not refresh or discard the local cart when merging fails", async () => {
    const refreshCart = vi.fn();

    await expect(
      mergeGuestCartAfterLogin({
        shouldMerge: true,
        mergeUser: vi.fn().mockResolvedValue({
          error: { type: "api", status: 409, message: "Merge failed" },
        }),
        refreshCart,
      }),
    ).resolves.toBe("failed");
    expect(refreshCart).not.toHaveBeenCalled();
  });

  it("refreshes the cart after a successful merge", async () => {
    const refreshCart = vi.fn().mockResolvedValue({ ok: true });

    await expect(
      mergeGuestCartAfterLogin({
        shouldMerge: true,
        mergeUser: vi.fn().mockResolvedValue({ data: {} }),
        refreshCart,
      }),
    ).resolves.toBe("merged");
    expect(refreshCart).toHaveBeenCalledOnce();
  });

  it("reports a failed reconciliation when cart refresh fails", async () => {
    await expect(
      mergeGuestCartAfterLogin({
        shouldMerge: true,
        mergeUser: vi.fn().mockResolvedValue({ data: {} }),
        refreshCart: vi.fn().mockResolvedValue({
          ok: false,
          message: "Refresh failed",
        }),
      }),
    ).resolves.toBe("failed");
  });
});
