import { describe, expect, it } from "vitest";

import {
  bookingListErrorMessage,
  bookingStatusClassName,
  bookingStatusLabel,
  formatBookingDateTime,
} from "./booking";

describe("booking presentation", () => {
  it("translates known statuses and safely handles future values", () => {
    expect(bookingStatusLabel("pending")).toBe("در انتظار تأیید");
    expect(bookingStatusLabel("confirmed")).toBe("تأییدشده");
    expect(bookingStatusLabel("cancelled")).toBe("لغوشده");
    expect(bookingStatusLabel("rescheduled")).toBe("وضعیت نامشخص");
  });

  it("selects a visual tone for each booking state", () => {
    expect(bookingStatusClassName("confirmed")).toContain("text-primary");
    expect(bookingStatusClassName("cancelled")).toContain("text-danger");
    expect(bookingStatusClassName("pending")).toContain("text-highlight");
  });

  it("formats valid dates and omits malformed ones", () => {
    expect(formatBookingDateTime("2026-08-31T10:30:00Z")).not.toBe("");
    expect(formatBookingDateTime("not-a-date")).toBe("");
    expect(formatBookingDateTime()).toBe("");
  });

  it("shows a booking-specific permission message for 403 errors", () => {
    expect(
      bookingListErrorMessage({
        type: "api",
        status: 403,
        message: "Forbidden",
      }),
    ).toBe("اجازه مشاهده رزروها برای این حساب وجود ندارد.");
  });

  it("uses the shared error normalization for other booking errors", () => {
    expect(
      bookingListErrorMessage({
        type: "api",
        status: 500,
        message: "خطای آزمایشی",
      }),
    ).toBe("خطای آزمایشی");
  });
});
