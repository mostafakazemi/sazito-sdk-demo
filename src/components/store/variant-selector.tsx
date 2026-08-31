"use client";

import * as React from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  CircleOff,
  Info,
  LoaderCircle,
  Minus,
  PackageCheck,
  Paperclip,
  Plus,
  RefreshCw,
  ShoppingBag,
  Upload,
} from "lucide-react";

import { useCommerce } from "@/components/commerce/commerce-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { clampCartQuantity } from "@/lib/sazito/cart";
import {
  dynamicFormAccept,
  initialDynamicFormValues,
  validateDynamicForm,
  type DynamicFormFieldView,
  type DynamicFormValues,
  type DynamicFormView,
} from "@/lib/sazito/dynamic-form";
import { formatPrice } from "@/lib/sazito/presenters";
import { sazitoErrorMessage } from "@/lib/sazito/error";
import type { ProductVariantView } from "@/lib/sazito/types";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-11 w-full rounded-xl border bg-card px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/25";

function DynamicField({
  field,
  value,
  error,
  isUploading,
  disabled,
  onChange,
  onUpload,
}: {
  field: DynamicFormFieldView;
  value: DynamicFormValues[string] | undefined;
  error?: string;
  isUploading: boolean;
  disabled: boolean;
  onChange(value: DynamicFormValues[string]): void;
  onUpload(file: File): void;
}) {
  const id = `product-form-${field.key}`;
  const label = field.label.trim() || "اطلاعات تکمیلی";
  const describedBy = error ? `${id}-error` : undefined;

  if (field.type === "Separator") {
    return (
      <div className="py-1">
        {field.label ? <p className="mb-2 text-sm font-bold">{field.label}</p> : null}
        <Separator />
      </div>
    );
  }

  if (field.type === "StatusBox") {
    return (
      <div className="rounded-xl bg-secondary/70 p-3 text-sm leading-7 text-secondary-foreground">
        {field.label || String(value ?? "")}
      </div>
    );
  }

  if (field.type === "Checkbox") {
    return (
      <div>
        <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm font-semibold">
          <input
            id={id}
            type="checkbox"
            checked={value === true}
            onChange={(event) => onChange(event.target.checked)}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className="mt-1 size-4 accent-primary"
          />
          <span>{label}{field.required ? <span className="mr-1 text-danger">*</span> : null}</span>
        </label>
        {error ? <p id={describedBy} className="mt-1 text-xs text-danger">{error}</p> : null}
      </div>
    );
  }

  const labelElement = (
    <label htmlFor={id} className="text-sm font-semibold">
      {label}{field.required ? <span className="mr-1 text-danger">*</span> : null}
    </label>
  );

  if (field.type === "Select") {
    return (
      <div className="grid gap-2">
        {labelElement}
        <select
          id={id}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          required={field.required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={fieldClass}
        >
          <option value="">انتخاب کنید</option>
          {field.inputOptions.map((option) => (
            <option key={`${option.value}-${option.label}`} value={option.value}>{option.label}</option>
          ))}
        </select>
        {error ? <p id={describedBy} className="text-xs text-danger">{error}</p> : null}
      </div>
    );
  }

  if (field.type === "TextArea") {
    return (
      <div className="grid gap-2">
        {labelElement}
        <textarea
          id={id}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          required={field.required}
          placeholder={field.placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(fieldClass, "min-h-28 resize-y py-3")}
        />
        {error ? <p id={describedBy} className="text-xs text-danger">{error}</p> : null}
      </div>
    );
  }

  if (field.type === "Uploader") {
    const uploaded = typeof value === "object" && value !== null ? value.fileName : null;
    return (
      <div className="grid gap-2">
        {labelElement}
        <label htmlFor={id} className={cn(fieldClass, "flex cursor-pointer items-center justify-center gap-2 border-dashed text-primary hover:bg-secondary/60", disabled && "pointer-events-none opacity-50")}>
          {isUploading ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {isUploading ? "در حال بارگذاری…" : uploaded ? "تغییر فایل" : "انتخاب فایل"}
        </label>
        <input
          id={id}
          type="file"
          className="sr-only"
          accept={dynamicFormAccept(field.allowedExtensions) || undefined}
          disabled={disabled || isUploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUpload(file);
            event.target.value = "";
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
        {uploaded ? <p className="flex items-center gap-1 text-xs text-primary"><Paperclip className="size-3.5" />{uploaded}</p> : null}
        {field.allowedExtensions.length ? <p className="text-xs text-muted-foreground">فرمت‌های مجاز: {field.allowedExtensions.join("، ")}</p> : null}
        {error ? <p id={describedBy} className="text-xs text-danger">{error}</p> : null}
      </div>
    );
  }

  const type = field.type === "Password" ? "password" : field.type === "Number" ? "number" : "text";
  const ltr = ["NationalId", "PhoneNumber", "IBAN", "Number"].includes(field.type);

  return (
    <div className="grid gap-2">
      {labelElement}
      <input
        id={id}
        type={type}
        value={typeof value === "number" || typeof value === "string" ? value : ""}
        onChange={(event) => onChange(field.type === "Number" && event.target.value ? Number(event.target.value) : event.target.value)}
        disabled={disabled}
        required={field.required}
        placeholder={field.placeholder}
        inputMode={ltr ? "numeric" : undefined}
        dir={ltr ? "ltr" : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={fieldClass}
      />
      {error ? <p id={describedBy} className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export function VariantSelector({
  variants,
  defaultVariantId,
}: {
  variants: ProductVariantView[];
  defaultVariantId: number | null;
}) {
  const { addItem, client, isMutating } = useCommerce();
  const [selectedId, setSelectedId] = React.useState(
    defaultVariantId ?? variants[0]?.id ?? null,
  );
  const [quantities, setQuantities] = React.useState<Record<number, number>>({});
  const [feedback, setFeedback] = React.useState<
    { type: "success" | "error"; message: string } | null
  >(null);
  const selected =
    variants.find((variant) => variant.id === selectedId) ?? variants[0] ?? null;
  const formId = selected?.dynamicFormId ?? null;
  const [form, setForm] = React.useState<DynamicFormView | null>(null);
  const [formValues, setFormValues] = React.useState<DynamicFormValues>({});
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const [formLoadError, setFormLoadError] = React.useState<string | null>(null);
  const [formReload, setFormReload] = React.useState(0);
  const [uploadingField, setUploadingField] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!formId) return;

    let active = true;

    void client.dynamicForms.getForm(formId, { cache: false }).then((response) => {
      if (!active) return;
      if (response.error || !response.data) {
        setFormLoadError(
          response.error
            ? sazitoErrorMessage(response.error, "فرم اطلاعات محصول دریافت نشد.")
            : "فرم اطلاعات محصول دریافت نشد.",
        );
      } else {
        const nextForm = response.data as DynamicFormView;
        setForm(nextForm);
        setFormValues(initialDynamicFormValues(nextForm));
      }
    }).catch(() => {
      if (!active) return;
      setFormLoadError("فرم اطلاعات محصول دریافت نشد.");
    });

    return () => {
      active = false;
    };
  }, [client, formId, formReload]);
  const formLoading = Boolean(formId && !form && !formLoadError);

  if (!selected) {
    return (
      <div className="rounded-2xl border bg-muted/45 p-4 text-sm text-muted-foreground">
        اطلاعات قیمت و تنوع این محصول ثبت نشده است.
      </div>
    );
  }

  const quantity = clampCartQuantity(
    quantities[selected.id] ?? selected.minQuantity,
    selected.minQuantity,
    selected.maxQuantity,
  );
  const setQuantity = (value: number) => {
    setFeedback(null);
    setQuantities((current) => ({
      ...current,
      [selected.id]: clampCartQuantity(
        value,
        selected.minQuantity,
        selected.maxQuantity,
      ),
    }));
  };
  const handleAddToCart = async () => {
    setFeedback(null);

    if (formId) {
      if (!form) {
        setFeedback({ type: "error", message: "ابتدا فرم اطلاعات محصول را دریافت و تکمیل کنید." });
        return;
      }
      const errors = validateDynamicForm(form, formValues);
      setFormErrors(errors);
      if (Object.keys(errors).length) {
        setFeedback({ type: "error", message: "فیلدهای الزامی فرم را تکمیل کنید." });
        return;
      }
    }

    const result = await addItem(selected.id, quantity, formId ? formValues : undefined);

    setFeedback(
      result.ok
        ? { type: "success", message: "محصول به سبد خرید اضافه شد." }
        : { type: "error", message: result.message },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        {selected.price.original ? (
          <p className="text-sm text-muted-foreground line-through">
            {formatPrice(selected.price.original)}
          </p>
        ) : null}
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <p className="text-2xl font-black sm:text-3xl">
            {formatPrice(selected.price.current)}
          </p>
          {selected.price.discounted ? <Badge variant="accent">قیمت ویژه</Badge> : null}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm font-semibold">
        {selected.available ? (
          <>
            <PackageCheck className="size-5 text-primary" />
            <span className="text-primary">موجود در فروشگاه</span>
          </>
        ) : (
          <>
            <CircleOff className="size-5 text-danger" />
            <span className="text-danger">در حال حاضر ناموجود</span>
          </>
        )}
        {selected.sku ? (
          <span className="mr-auto text-xs font-normal text-muted-foreground" dir="ltr">
            {selected.sku}
          </span>
        ) : null}
      </div>

      {variants.length > 1 || selected.attributes.length ? (
        <div>
          <p className="mb-3 text-sm font-bold">انتخاب ویژگی</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="تنوع محصول">
            {variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                role="radio"
                aria-checked={variant.id === selected.id}
                onClick={() => {
                  setSelectedId(variant.id);
                  setFeedback(null);
                  if (variant.dynamicFormId !== selected.dynamicFormId) {
                    setForm(null);
                    setFormValues({});
                    setFormErrors({});
                    setFormLoadError(null);
                    setUploadingField(null);
                  }
                }}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  variant.id === selected.id
                    ? "border-primary bg-secondary text-primary"
                    : "hover:border-primary/40",
                  !variant.available && "text-muted-foreground line-through",
                )}
              >
                {variant.id === selected.id ? <Check className="size-4" /> : null}
                {variant.attributes[0]?.extra ? (
                  <span
                    className="size-4 rounded-full border"
                    style={{ background: variant.attributes[0].extra }}
                    aria-hidden="true"
                  />
                ) : null}
                {variant.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {formId ? (
        <div className="rounded-2xl border bg-background/55 p-4 sm:p-5">
          {formLoading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <LoaderCircle className="size-5 animate-spin" />
              در حال دریافت فرم اطلاعات محصول…
            </div>
          ) : formLoadError ? (
            <div role="alert" className="space-y-3">
              <p className="text-sm text-danger">{formLoadError}</p>
              <Button type="button" size="sm" variant="outline" onClick={() => {
                setForm(null);
                setFormValues({});
                setFormErrors({});
                setFormLoadError(null);
                setFormReload((value) => value + 1);
              }}>
                <RefreshCw />تلاش دوباره
              </Button>
            </div>
          ) : form ? (
            <div className="space-y-4">
              <div>
                <p className="font-black">{form.title || "اطلاعات تکمیلی محصول"}</p>
                {form.description ? <p className="mt-1 text-xs leading-6 text-muted-foreground">{form.description}</p> : null}
                <p className="mt-1 text-xs text-muted-foreground">موارد ستاره‌دار الزامی‌اند.</p>
              </div>
              {form.fields.map((field) => (
                <DynamicField
                  key={field.key}
                  field={field}
                  value={formValues[field.name]}
                  error={formErrors[field.name]}
                  isUploading={uploadingField === field.name}
                  disabled={isMutating}
                  onChange={(value) => {
                    setFormValues((current) => ({ ...current, [field.name]: value }));
                    setFormErrors((current) => {
                      const next = { ...current };
                      delete next[field.name];
                      return next;
                    });
                    setFeedback(null);
                  }}
                  onUpload={(file) => {
                    setUploadingField(field.name);
                    setFormErrors((current) => {
                      const next = { ...current };
                      delete next[field.name];
                      return next;
                    });
                    void client.dynamicForms.uploadProductFormFile(file, { cache: false })
                      .then((response) => {
                        if (response.error || !response.data?.serveKey) {
                          setFormErrors((current) => ({
                            ...current,
                            [field.name]: response.error
                              ? sazitoErrorMessage(
                                  response.error,
                                  "بارگذاری فایل ناموفق بود.",
                                )
                              : "بارگذاری فایل ناموفق بود.",
                          }));
                          return;
                        }
                        setFormValues((current) => ({
                          ...current,
                          [field.name]: { serveKey: response.data!.serveKey, fileName: file.name },
                        }));
                      })
                      .catch(() => setFormErrors((current) => ({ ...current, [field.name]: "بارگذاری فایل ناموفق بود." })))
                      .finally(() => setUploadingField(null));
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <Separator />

      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
          <div
            className="flex h-13 items-center justify-between rounded-2xl border bg-card p-1"
            aria-label="تعداد محصول"
          >
            <button
              type="button"
              onClick={() => setQuantity(quantity - 1)}
              disabled={quantity <= selected.minQuantity || isMutating}
              aria-label="کم کردن تعداد"
              className="flex size-10 items-center justify-center rounded-xl text-primary outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-35"
            >
              <Minus className="size-4" />
            </button>
            <span className="min-w-10 text-center font-black" aria-live="polite">
              {quantity.toLocaleString("fa-IR")}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              disabled={
                isMutating ||
                (selected.maxQuantity !== null && quantity >= selected.maxQuantity)
              }
              aria-label="زیاد کردن تعداد"
              className="flex size-10 items-center justify-center rounded-xl text-primary outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-35"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <Button
            type="button"
            size="lg"
            disabled={!selected.available || isMutating || formLoading || Boolean(uploadingField)}
            onClick={() => void handleAddToCart()}
          >
            {isMutating ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <ShoppingBag />
            )}
            {selected.available ? "افزودن به سبد خرید" : "محصول ناموجود است"}
          </Button>
        </div>

        <div aria-live="polite" aria-atomic="true">
          {feedback ? (
            <div
              className={cn(
                "flex flex-wrap items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold",
                feedback.type === "success"
                  ? "bg-secondary text-primary"
                  : "bg-danger/10 text-danger",
              )}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <CircleOff className="size-4" />
              )}
              <span>{feedback.message}</span>
              {feedback.type === "success" ? (
                <Link
                  href="/checkout"
                  className="mr-auto rounded-lg px-2 py-1 underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  مشاهده سبد و تسویه
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl bg-secondary/70 p-4 text-sm leading-7 text-secondary-foreground">
        <Info className="mt-1 size-4 shrink-0" />
        <p>سبد خرید و مراحل ارسال و پرداخت مستقیماً با زیرساخت امن سازیتو انجام می‌شود.</p>
      </div>
    </div>
  );
}
