import type { FormAttributeValue } from "@sazito/client-sdk";

export type DynamicFormFieldType =
  | "TextBox"
  | "TextArea"
  | "Select"
  | "Checkbox"
  | "StatusBox"
  | "Number"
  | "Password"
  | "NationalId"
  | "PhoneNumber"
  | "IBAN"
  | "Separator"
  | "Uploader";

export interface DynamicFormFieldView {
  key: string;
  name: string;
  type: DynamicFormFieldType;
  label: string;
  value?: FormAttributeValue;
  placeholder: string;
  required: boolean;
  inputOptions: Array<{ value: string; label: string }>;
  allowedExtensions: string[];
}

export interface DynamicFormView {
  id: number;
  title: string;
  description: string;
  fields: DynamicFormFieldView[];
}

export type DynamicFormValues = Record<string, FormAttributeValue>;

export function initialDynamicFormValues(form: DynamicFormView): DynamicFormValues {
  return Object.fromEntries(
    form.fields
      .filter((field) => field.value !== undefined && field.value !== null)
      .map((field) => [field.name, field.value ?? null]),
  );
}

export function isDynamicFormValueEmpty(value: FormAttributeValue | undefined) {
  if (value === undefined || value === null || value === false) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (typeof value === "object") return !value.serveKey.trim();
  return false;
}

export function validateDynamicForm(
  form: DynamicFormView,
  values: DynamicFormValues,
) {
  const errors: Record<string, string> = {};

  for (const field of form.fields) {
    if (
      field.required &&
      field.type !== "Separator" &&
      field.type !== "StatusBox" &&
      isDynamicFormValueEmpty(values[field.name])
    ) {
      errors[field.name] = "تکمیل این فیلد الزامی است.";
    }
  }

  return errors;
}

export function dynamicFormAccept(extensions: string[]) {
  return extensions
    .map((extension) => extension.trim())
    .filter(Boolean)
    .map((extension) => (extension.startsWith(".") ? extension : `.${extension}`))
    .join(",");
}
