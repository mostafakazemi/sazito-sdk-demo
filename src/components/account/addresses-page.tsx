"use client";

import * as React from "react";
import type { SazitoClient, ShippingAddress } from "@sazito/client-sdk";
import {
  CheckCircle2,
  ChevronDown,
  Inbox,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCcw,
} from "lucide-react";

import { useAccount } from "@/components/account/account-provider";
import { AccountGate, AccountShell } from "@/components/account/account-shell";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  addressLocation,
  addressRecipient,
  normalizeAddressInput,
  validateAddressInput,
  type AddressField,
  type AddressFormErrors,
  type AddressFormValues,
  type AddressRequirements,
} from "@/lib/sazito/address";
import {
  isSazitoAuthenticationError,
  sazitoConnectionErrorMessage,
  sazitoErrorMessage,
} from "@/lib/sazito/error";
import { cn } from "@/lib/utils";

type RegionsData = NonNullable<
  Awaited<ReturnType<SazitoClient["regions"]["list"]>>["data"]
>;
type RegionWithCities = RegionsData[number];

const inputClassName =
  "h-12 w-full rounded-2xl border border-border/80 bg-background px-4 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-60";

const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

function toPersianDigits(value: string) {
  return value.replace(/\d/g, (digit) => persianDigits[Number(digit)]);
}

function FormField({
  name,
  label,
  error,
  optional = false,
  children,
}: {
  name: AddressField;
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold" htmlFor={`address-${name}`}>
      <span>
        {label}
        {optional ? (
          <span className="mr-1 text-xs font-normal text-muted-foreground">
            (اختیاری)
          </span>
        ) : null}
      </span>
      {children}
      {error ? (
        <span id={`address-${name}-error`} className="text-xs text-danger">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function fieldAccessibility(name: AddressField, error?: string) {
  return {
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": error ? `address-${name}-error` : undefined,
  };
}

function AddressCard({ address }: { address: ShippingAddress }) {
  const phone = address.mobilePhone || address.phoneNumber;

  return (
    <article className="rounded-3xl border bg-card p-5 shadow-[0_12px_40px_-32px_rgba(31,42,36,0.5)]">
      <header className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
          <MapPin className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-black">{addressRecipient(address)}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {addressLocation(address)}
          </p>
        </div>
      </header>

      <p className="mt-4 text-sm leading-7">{address.address}</p>

      {address.description ? (
        <p className="mt-2 rounded-2xl bg-muted/55 px-3 py-2 text-xs leading-6 text-muted-foreground">
          {address.description}
        </p>
      ) : null}

      <dl className="mt-4 grid gap-2 border-t pt-4 text-xs sm:grid-cols-2">
        {phone ? (
          <div className="flex items-center gap-2">
            <Phone className="size-4 text-primary" />
            <dt className="sr-only">شماره موبایل</dt>
            <dd dir="ltr">{toPersianDigits(phone)}</dd>
          </div>
        ) : null}
        {address.postalCode ? (
          <div className="flex items-center gap-2 sm:justify-end">
            <span className="font-bold text-muted-foreground">کد پستی</span>
            <dt className="sr-only">کد پستی</dt>
            <dd dir="ltr">{toPersianDigits(address.postalCode)}</dd>
          </div>
        ) : null}
        {address.email ? (
          <div className="flex min-w-0 items-center gap-2 sm:col-span-2">
            <Mail className="size-4 shrink-0 text-primary" />
            <dt className="sr-only">ایمیل</dt>
            <dd className="truncate" dir="ltr">
              {address.email}
            </dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}

function AddressesContent() {
  const { client } = useCommerce();
  const { user, logout } = useAccount();
  const [addresses, setAddresses] = React.useState<ShippingAddress[]>([]);
  const [regions, setRegions] = React.useState<RegionWithCities[]>([]);
  const [requirements, setRequirements] =
    React.useState<AddressRequirements>({});
  const [regionId, setRegionId] = React.useState("");
  const [cityId, setCityId] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [regionsError, setRegionsError] = React.useState<string | null>(null);
  const [formErrors, setFormErrors] = React.useState<AddressFormErrors>({});
  const [message, setMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const loadAddresses = React.useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setLoadError(null);
      setRegionsError(null);

      try {
        const [addressResponse, regionResponse, checkoutResponse] =
          await Promise.all([
            client.shipping.listAddresses({ cache: false, signal }),
            client.regions.list({ cache: false, signal }),
            client.general.getCheckoutConfig({ cache: false, signal }),
          ]);

        if (signal?.aborted) return;

        if (addressResponse.error || !addressResponse.data) {
          if (isSazitoAuthenticationError(addressResponse.error)) {
            logout();
            return;
          }

          setLoadError(
            addressResponse.error
              ? sazitoErrorMessage(
                  addressResponse.error,
                  "نشانی‌ها از فروشگاه دریافت نشد.",
                )
              : "نشانی‌ها از فروشگاه دریافت نشد.",
          );
          return;
        }

        setAddresses(addressResponse.data);

        if (regionResponse.error || !regionResponse.data) {
          setRegions([]);
          setRegionsError(
            regionResponse.error
              ? sazitoErrorMessage(
                  regionResponse.error,
                  "استان‌ها و شهرها دریافت نشدند.",
                )
              : "استان‌ها و شهرها دریافت نشدند.",
          );
        } else {
          setRegions(regionResponse.data);
        }

        if (checkoutResponse.data) {
          setRequirements({
            emailMandatory: !checkoutResponse.data.emailOptional,
            postalCodeMandatory: checkoutResponse.data.postalCodeMandatory,
          });
        }
      } catch {
        if (!signal?.aborted) {
          setLoadError(sazitoConnectionErrorMessage());
        }
      } finally {
        if (!signal?.aborted) setIsLoading(false);
      }
    },
    [client, logout],
  );

  React.useEffect(() => {
    const controller = new AbortController();
    const frame = window.requestAnimationFrame(() => {
      void loadAddresses(controller.signal);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      controller.abort();
    };
  }, [loadAddresses]);

  const selectedRegion = React.useMemo(
    () => regions.find((region) => String(region.id) === regionId),
    [regionId, regions],
  );

  const submit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const values: AddressFormValues = {
      firstName: String(form.get("firstName") ?? ""),
      lastName: String(form.get("lastName") ?? ""),
      mobilePhone: String(form.get("mobilePhone") ?? ""),
      email: String(form.get("email") ?? ""),
      regionId,
      cityId,
      postalCode: String(form.get("postalCode") ?? ""),
      address: String(form.get("address") ?? ""),
      description: String(form.get("description") ?? ""),
    };
    const input = normalizeAddressInput(values);
    const errors = validateAddressInput(input, requirements);

    setMessage(null);
    setFormErrors(errors);

    const firstError = Object.keys(errors)[0] as AddressField | undefined;
    if (firstError) {
      const field = formElement.elements.namedItem(firstError);
      if (field instanceof HTMLElement) field.focus();
      return;
    }

    startTransition(async () => {
      try {
        const response = await client.shipping.createAddress(input, {
          cache: false,
        });

        if (response.error || !response.data) {
          if (isSazitoAuthenticationError(response.error)) {
            logout();
            return;
          }

          setMessage({
            type: "error",
            text: response.error
              ? sazitoErrorMessage(response.error, "ثبت نشانی انجام نشد.")
              : "نشانی ثبت‌شده از فروشگاه دریافت نشد.",
          });
          return;
        }

        setAddresses((current) => [
          response.data!,
          ...current.filter((address) => address.id !== response.data!.id),
        ]);
        formElement.reset();
        setRegionId("");
        setCityId("");
        setFormErrors({});
        setMessage({ type: "success", text: "نشانی تازه ذخیره شد." });
      } catch {
        setMessage({ type: "error", text: sazitoConnectionErrorMessage() });
      }
    });
  };

  if (isLoading) {
    return (
      <div
        className="flex min-h-72 items-center justify-center gap-3 rounded-4xl border bg-card text-sm text-muted-foreground"
        role="status"
      >
        <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" />
        در حال دریافت نشانی‌ها…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-4xl border border-danger/25 bg-card p-8 text-center">
        <p role="alert" className="text-sm leading-7 text-danger">
          {loadError}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-5"
          onClick={() => void loadAddresses()}
        >
          <RefreshCcw />
          تلاش دوباره
        </Button>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)]">
      <section aria-labelledby="saved-addresses-title">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 id="saved-addresses-title" className="font-black">
              نشانی‌های ذخیره‌شده
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {addresses.length.toLocaleString("fa-IR")} نشانی
            </p>
          </div>
        </div>

        {addresses.length ? (
          <div className="grid gap-4">
            {addresses.map((address) => (
              <AddressCard
                key={`${address.id}-${address.identifier}`}
                address={address}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-4xl border bg-card p-8 text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary">
              <Inbox className="size-7" />
            </span>
            <p className="mt-5 font-black">هنوز نشانی‌ای ذخیره نشده است</p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              نخستین نشانی خود را از فرم روبه‌رو ثبت کنید.
            </p>
          </div>
        )}
      </section>

      <Card className="xl:sticky xl:top-24">
        <CardHeader>
          <span className="flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <Plus className="size-5" />
          </span>
          <CardTitle className="pt-2">ثبت نشانی تازه</CardTitle>
          <CardDescription className="leading-7">
            اطلاعات این فرم مستقیماً در حساب سازیتوی شما ذخیره می‌شود.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {regionsError ? (
            <div className="mb-5 rounded-2xl bg-danger/10 p-4 text-sm leading-7 text-danger">
              <p role="alert">{regionsError}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 bg-card"
                onClick={() => void loadAddresses()}
              >
                <RefreshCcw />
                دریافت دوباره
              </Button>
            </div>
          ) : null}

          <form className="grid gap-5" onSubmit={submit} noValidate>
            <fieldset className="grid gap-5" disabled={isPending || !regions.length}>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  name="firstName"
                  label="نام"
                  error={formErrors.firstName}
                >
                  <input
                    id="address-firstName"
                    name="firstName"
                    autoComplete="given-name"
                    defaultValue={user?.firstName ?? ""}
                    className={cn(
                      inputClassName,
                      formErrors.firstName && "border-danger",
                    )}
                    {...fieldAccessibility("firstName", formErrors.firstName)}
                  />
                </FormField>
                <FormField
                  name="lastName"
                  label="نام خانوادگی"
                  error={formErrors.lastName}
                >
                  <input
                    id="address-lastName"
                    name="lastName"
                    autoComplete="family-name"
                    defaultValue={user?.lastName ?? ""}
                    className={cn(
                      inputClassName,
                      formErrors.lastName && "border-danger",
                    )}
                    {...fieldAccessibility("lastName", formErrors.lastName)}
                  />
                </FormField>
              </div>

              <FormField
                name="mobilePhone"
                label="شماره موبایل"
                error={formErrors.mobilePhone}
              >
                <input
                  id="address-mobilePhone"
                  name="mobilePhone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  dir="ltr"
                  defaultValue={user?.mobilePhone || user?.phoneNumber || ""}
                  className={cn(
                    inputClassName,
                    "text-left",
                    formErrors.mobilePhone && "border-danger",
                  )}
                  {...fieldAccessibility(
                    "mobilePhone",
                    formErrors.mobilePhone,
                  )}
                />
              </FormField>

              <FormField
                name="email"
                label="ایمیل"
                optional={!requirements.emailMandatory}
                error={formErrors.email}
              >
                <input
                  id="address-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  dir="ltr"
                  defaultValue={user?.email ?? ""}
                  className={cn(
                    inputClassName,
                    "text-left",
                    formErrors.email && "border-danger",
                  )}
                  {...fieldAccessibility("email", formErrors.email)}
                />
              </FormField>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  name="regionId"
                  label="استان"
                  error={formErrors.regionId}
                >
                  <span className="relative">
                    <select
                      id="address-regionId"
                      name="regionId"
                      value={regionId}
                      onChange={(event) => {
                        setRegionId(event.target.value);
                        setCityId("");
                        setFormErrors((current) => ({
                          ...current,
                          regionId: undefined,
                          cityId: undefined,
                        }));
                      }}
                      className={cn(
                        inputClassName,
                        "appearance-none pl-10",
                        formErrors.regionId && "border-danger",
                      )}
                      {...fieldAccessibility("regionId", formErrors.regionId)}
                    >
                      <option value="">انتخاب استان</option>
                      {regions.map((region) => (
                        <option key={region.id} value={region.id}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </span>
                </FormField>
                <FormField
                  name="cityId"
                  label="شهر"
                  error={formErrors.cityId}
                >
                  <span className="relative">
                    <select
                      id="address-cityId"
                      name="cityId"
                      value={cityId}
                      disabled={!selectedRegion || isPending}
                      onChange={(event) => {
                        setCityId(event.target.value);
                        setFormErrors((current) => ({
                          ...current,
                          cityId: undefined,
                        }));
                      }}
                      className={cn(
                        inputClassName,
                        "appearance-none pl-10",
                        formErrors.cityId && "border-danger",
                      )}
                      {...fieldAccessibility("cityId", formErrors.cityId)}
                    >
                      <option value="">انتخاب شهر</option>
                      {selectedRegion?.cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </span>
                </FormField>
              </div>

              <FormField
                name="postalCode"
                label="کد پستی"
                optional={!requirements.postalCodeMandatory}
                error={formErrors.postalCode}
              >
                <input
                  id="address-postalCode"
                  name="postalCode"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  dir="ltr"
                  className={cn(
                    inputClassName,
                    "text-left",
                    formErrors.postalCode && "border-danger",
                  )}
                  {...fieldAccessibility("postalCode", formErrors.postalCode)}
                />
              </FormField>

              <FormField
                name="address"
                label="نشانی کامل"
                error={formErrors.address}
              >
                <textarea
                  id="address-address"
                  name="address"
                  autoComplete="street-address"
                  className={cn(
                    inputClassName,
                    "min-h-28 resize-y py-3 leading-7",
                    formErrors.address && "border-danger",
                  )}
                  {...fieldAccessibility("address", formErrors.address)}
                />
              </FormField>

              <FormField name="description" label="توضیحات" optional>
                <textarea
                  id="address-description"
                  name="description"
                  placeholder="برای نمونه: زنگ دوم"
                  className={`${inputClassName} min-h-24 resize-y py-3 leading-7`}
                />
              </FormField>
            </fieldset>

            {message ? (
              <p
                role={message.type === "error" ? "alert" : "status"}
                className={
                  message.type === "success"
                    ? "flex items-center gap-2 rounded-2xl bg-secondary p-3 text-sm text-primary"
                    : "rounded-2xl bg-danger/10 p-3 text-sm text-danger"
                }
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="size-4" />
                ) : null}
                {message.text}
              </p>
            ) : null}

            <Button
              type="submit"
              size="lg"
              disabled={isPending || !regions.length}
            >
              {isPending ? (
                <LoaderCircle className="animate-spin motion-reduce:animate-none" />
              ) : (
                <Plus />
              )}
              ثبت نشانی
            </Button>
          </form>

          <p className="mt-5 border-t pt-4 text-xs leading-6 text-muted-foreground">
            برای جلوگیری از تغییر اطلاعات سفارش‌های قبلی، نشانی ذخیره‌شده
            ویرایش نمی‌شود؛ در صورت تغییر، یک نشانی تازه ثبت کنید.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function AddressesPage() {
  return (
    <AccountGate>
      <AccountShell
        title="نشانی‌های من"
        description="نشانی‌های ذخیره‌شده را ببینید و نشانی تازه‌ای برای خریدهای بعدی ثبت کنید."
      >
        <AddressesContent />
      </AccountShell>
    </AccountGate>
  );
}
