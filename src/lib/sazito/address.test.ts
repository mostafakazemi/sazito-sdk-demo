import { describe, expect, it } from "vitest";
import type { ShippingAddress } from "@sazito/client-sdk";

import {
  addressLocation,
  addressRecipient,
  normalizeAddressInput,
  normalizePostalCodeInput,
  validateAddressInput,
  type AddressFormValues,
} from "./address";

const validValues: AddressFormValues = {
  firstName: "  مینا ",
  lastName: " احمدی  ",
  mobilePhone: "+98 (912) 345-6789",
  email: " mina@example.com ",
  regionId: "8",
  cityId: "81",
  postalCode: "۱۲۳۴۵-۶۷۸۹۰",
  address: "  خیابان نمونه، پلاک ۱۰ ",
  description: "  زنگ دوم ",
};

describe("saved address helpers", () => {
  it("normalizes an address form to the SDK contract", () => {
    expect(normalizeAddressInput(validValues)).toEqual({
      firstName: "مینا",
      lastName: "احمدی",
      mobilePhone: "09123456789",
      email: "mina@example.com",
      regionId: 8,
      cityId: 81,
      postalCode: "1234567890",
      address: "خیابان نمونه، پلاک ۱۰",
      description: "زنگ دوم",
    });
  });

  it("omits empty optional fields and invalid ids", () => {
    expect(
      normalizeAddressInput({
        ...validValues,
        email: " ",
        postalCode: " ",
        description: " ",
        regionId: "0",
        cityId: "not-a-number",
      }),
    ).toEqual({
      firstName: "مینا",
      lastName: "احمدی",
      mobilePhone: "09123456789",
      email: undefined,
      regionId: undefined,
      cityId: undefined,
      postalCode: undefined,
      address: "خیابان نمونه، پلاک ۱۰",
      description: undefined,
    });
  });

  it("validates the store-specific email and postal-code requirements", () => {
    const input = normalizeAddressInput({
      ...validValues,
      mobilePhone: "0912",
      email: "",
      postalCode: "",
      address: "",
    });
    const errors = validateAddressInput(input, {
      emailMandatory: true,
      postalCodeMandatory: true,
    });

    expect(errors.mobilePhone).toContain("معتبر");
    expect(errors.email).toContain("ایمیل");
    expect(errors.postalCode).toContain("کد پستی");
    expect(errors.address).toContain("نشانی");
  });

  it("formats recipients and locations from SDK addresses", () => {
    const address = {
      id: 1,
      identifier: "address-token",
      firstName: "مینا",
      lastName: "احمدی",
      city: { id: 81, name: "تهران" },
      region: { id: 8, name: "تهران" },
      address: "خیابان نمونه",
    } satisfies ShippingAddress;

    expect(addressRecipient(address)).toBe("مینا احمدی");
    expect(addressLocation(address)).toBe("تهران");
    expect(normalizePostalCodeInput("۱۲۳۴۵ ۶۷۸۹۰")).toBe("1234567890");
  });
});
