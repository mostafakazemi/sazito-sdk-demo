import { describe, expect, it } from "vitest";

import {
  extractPasswordResetToken,
  passwordResetErrorMessage,
  validatePasswordResetInput,
} from "./password-reset";

describe("password reset contract", () => {
  it("extracts only the documented camelCase token field", () => {
    expect(
      extractPasswordResetToken({ forgotPasswordToken: "  reset-token  " }),
    ).toBe("reset-token");
    expect(
      extractPasswordResetToken({
        forgotPasswordToken: ["first-token", "second-token"],
      }),
    ).toBe("first-token");
    expect(
      extractPasswordResetToken({ token: "undocumented" } as never),
    ).toBeNull();
  });

  it("rejects missing tokens, empty passwords, and mismatched confirmation", () => {
    expect(
      validatePasswordResetInput({
        forgotPasswordToken: "",
        password: "new-password",
        passwordConfirmation: "new-password",
      }),
    ).toContain("لینک بازیابی");
    expect(
      validatePasswordResetInput({
        forgotPasswordToken: "token",
        password: "",
        passwordConfirmation: "",
      }),
    ).toContain("رمز عبور جدید");
    expect(
      validatePasswordResetInput({
        forgotPasswordToken: "token",
        password: "new-password",
        passwordConfirmation: "different-password",
      }),
    ).toContain("یکسان نیست");
  });

  it("accepts a complete matching reset request", () => {
    expect(
      validatePasswordResetInput({
        forgotPasswordToken: "token",
        password: "new-password",
        passwordConfirmation: "new-password",
      }),
    ).toBeNull();
  });

  it("gives expired links an actionable message", () => {
    expect(
      passwordResetErrorMessage({
        type: "api",
        status: 403,
        message: "Forbidden",
      }),
    ).toContain("لینک تازه");
  });

  it("preserves useful validation messages from the API", () => {
    expect(
      passwordResetErrorMessage({
        type: "validation",
        status: 422,
        message: "رمز عبور انتخاب‌شده پذیرفته نشد.",
      }),
    ).toBe("رمز عبور انتخاب‌شده پذیرفته نشد.");
  });
});
