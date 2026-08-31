import { toEnglishDigits } from "@sazito/client-sdk";
import type { ShippingAddress, ShippingAddressInput } from "@sazito/client-sdk";

import { isIranianMobile, normalizeMobileInput } from "./account";

export interface AddressFormValues {
  firstName: string;
  lastName: string;
  mobilePhone: string;
  email: string;
  regionId: string | number | null;
  cityId: string | number | null;
  postalCode: string;
  address: string;
  description: string;
}

export type AddressField = keyof AddressFormValues;
export type AddressFormErrors = Partial<Record<AddressField, string>>;

export interface AddressRequirements {
  emailMandatory?: boolean;
  postalCodeMandatory?: boolean;
}

function positiveId(value: string | number | null) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : undefined;
}

export function normalizePostalCodeInput(value: string) {
  return toEnglishDigits(value).replace(/[\s-]/g, "");
}

export function normalizeAddressInput(
  values: AddressFormValues,
): ShippingAddressInput {
  const email = values.email.trim();
  const postalCode = normalizePostalCodeInput(values.postalCode);
  const description = values.description.trim();

  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    mobilePhone: normalizeMobileInput(values.mobilePhone),
    email: email || undefined,
    regionId: positiveId(values.regionId),
    cityId: positiveId(values.cityId),
    address: values.address.trim(),
    postalCode: postalCode || undefined,
    description: description || undefined,
  };
}

export function validateAddressInput(
  input: ShippingAddressInput,
  requirements: AddressRequirements = {},
): AddressFormErrors {
  const errors: AddressFormErrors = {};

  if (!input.firstName) errors.firstName = "نام را وارد کنید.";
  if (!input.lastName) errors.lastName = "نام خانوادگی را وارد کنید.";
  if (!input.mobilePhone) {
    errors.mobilePhone = "شماره موبایل را وارد کنید.";
  } else if (!isIranianMobile(input.mobilePhone)) {
    errors.mobilePhone = "شماره موبایل معتبر وارد کنید.";
  }

  if (requirements.emailMandatory && !input.email) {
    errors.email = "ایمیل را وارد کنید.";
  } else if (
    input.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)
  ) {
    errors.email = "ایمیل معتبر وارد کنید.";
  }

  if (!input.regionId) errors.regionId = "استان را انتخاب کنید.";
  if (!input.cityId) errors.cityId = "شهر را انتخاب کنید.";
  if (!input.address) errors.address = "نشانی را وارد کنید.";
  if (requirements.postalCodeMandatory && !input.postalCode) {
    errors.postalCode = "کد پستی را وارد کنید.";
  }

  return errors;
}

export function addressRecipient(address: ShippingAddress) {
  const name = [address.firstName, address.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  return name || "گیرنده ثبت‌نشده";
}

export function addressLocation(address: ShippingAddress) {
  const names = [address.region?.name, address.city?.name]
    .map((part) => part?.trim())
    .filter(Boolean);

  return [...new Set(names)].join("، ") || "موقعیت ثبت‌نشده";
}
