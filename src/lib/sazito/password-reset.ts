import { sazitoErrorMessage, type SazitoError } from "./error";

export interface PasswordResetSearchParams {
  forgotPasswordToken?: string | string[];
}

export interface PasswordResetInput {
  forgotPasswordToken: string;
  password: string;
  passwordConfirmation: string;
}

const INVALID_LINK_MESSAGE =
  "لینک بازیابی معتبر نیست یا منقضی شده است. یک لینک تازه درخواست کنید.";

export function extractPasswordResetToken(
  searchParams: PasswordResetSearchParams,
) {
  const value = searchParams.forgotPasswordToken;
  const token = Array.isArray(value) ? value[0] : value;
  const normalized = token?.trim();

  return normalized || null;
}

export function validatePasswordResetInput(input: PasswordResetInput) {
  if (!input.forgotPasswordToken.trim()) return INVALID_LINK_MESSAGE;
  if (!input.password) return "رمز عبور جدید را وارد کنید.";
  if (input.password !== input.passwordConfirmation) {
    return "تکرار رمز عبور با رمز عبور جدید یکسان نیست.";
  }

  return null;
}

export function passwordResetErrorMessage(error: SazitoError) {
  if ([401, 403, 404, 410].includes(error.status ?? 0)) {
    return INVALID_LINK_MESSAGE;
  }

  return sazitoErrorMessage(error, "تغییر رمز عبور انجام نشد.");
}
