import { describe, expect, it } from "vitest";

import {
  dynamicFormAccept,
  initialDynamicFormValues,
  validateDynamicForm,
  type DynamicFormView,
} from "./dynamic-form";

const form: DynamicFormView = {
  id: 5,
  title: "فرم محصول",
  description: "",
  fields: [
    {
      key: "required",
      name: "field_required",
      type: "TextBox",
      label: "نام",
      placeholder: "",
      required: true,
      inputOptions: [],
      allowedExtensions: [],
    },
    {
      key: "file",
      name: "field_file",
      type: "Uploader",
      label: "فایل",
      placeholder: "",
      required: true,
      inputOptions: [],
      allowedExtensions: ["pdf", ".jpg"],
    },
  ],
};

describe("product dynamic forms", () => {
  it("reports required text and upload fields", () => {
    expect(validateDynamicForm(form, {})).toEqual({
      field_required: "تکمیل این فیلد الزامی است.",
      field_file: "تکمیل این فیلد الزامی است.",
    });
  });

  it("accepts uploaded file descriptors expected by the cart SDK", () => {
    expect(
      validateDynamicForm(form, {
        field_required: "مقدار",
        field_file: { serveKey: "private/key", fileName: "doc.pdf" },
      }),
    ).toEqual({});
  });

  it("preserves defaults and builds an input accept list", () => {
    expect(initialDynamicFormValues({
      ...form,
      fields: [{ ...form.fields[0], value: "پیش‌فرض" }],
    })).toEqual({ field_required: "پیش‌فرض" });
    expect(dynamicFormAccept(["pdf", ".jpg"])).toBe(".pdf,.jpg");
  });
});
