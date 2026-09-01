import { describe, expect, it } from "vitest";

import {
  formatWalletAmount,
  walletAmountKind,
  walletTransactionLabel,
} from "./wallet";

describe("wallet presentation", () => {
  it("translates documented transaction reasons", () => {
    expect(walletTransactionLabel("redeem")).toBe("استفاده از اعتبار");
    expect(walletTransactionLabel("BirthdateGift")).toBe("هدیه تولد");
    expect(walletTransactionLabel("campaign:activity")).toBe("پاداش فعالیت");
    expect(walletTransactionLabel("future-reason")).toBe("تراکنش کیف پول");
  });

  it("classifies signed transaction amounts", () => {
    expect(walletAmountKind(10)).toBe("credit");
    expect(walletAmountKind(-10)).toBe("debit");
    expect(walletAmountKind(0)).toBe("neutral");
  });

  it("formats signed amounts in Persian تومان", () => {
    expect(formatWalletAmount(125_000)).toBe("+۱۲۵٬۰۰۰ تومان");
    expect(formatWalletAmount(-80_000)).toBe("−۸۰٬۰۰۰ تومان");
    expect(formatWalletAmount(0)).toBe("۰ تومان");
  });
});
