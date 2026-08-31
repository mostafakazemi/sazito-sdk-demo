import type { SazitoResponse } from "@sazito/client-sdk";

/** The documented error member returned by every Sazito SDK method. */
export type SazitoError = NonNullable<SazitoResponse<unknown>["error"]>;

export interface SazitoErrorPresentation {
  message: string;
  type: SazitoError["type"];
  status?: number;
  details?: unknown;
  isRetryable: boolean;
  requiresAuthentication: boolean;
}

const NETWORK_MESSAGE =
  "ارتباط با فروشگاه برقرار نشد. اتصال اینترنت را بررسی و دوباره تلاش کنید.";
const RATE_LIMIT_MESSAGE =
  "درخواست‌های زیادی ارسال شده است. کمی صبر کنید و دوباره تلاش کنید.";
const AUTHENTICATION_MESSAGE =
  "نشست شما منقضی شده یا اجازه دسترسی ندارید. دوباره وارد شوید.";

function responseMessage(error: SazitoError, fallbackMessage: string) {
  return error.message?.trim() || fallbackMessage;
}

/**
 * Converts Sazito's common `error` response shape into UI-safe, actionable
 * information. The original status, type and details remain available for
 * callers that need programmatic handling or diagnostics.
 */
export function normalizeSazitoError(
  error: SazitoError,
  fallbackMessage = "انجام درخواست ناموفق بود. دوباره تلاش کنید.",
): SazitoErrorPresentation {
  const status = error.status;
  const requiresAuthentication = status === 401 || status === 403;
  const isNetworkFailure =
    error.type === "network" ||
    status === 502 ||
    status === 503 ||
    status === 504;

  if (requiresAuthentication) {
    return {
      message: AUTHENTICATION_MESSAGE,
      type: error.type,
      status,
      details: error.details,
      isRetryable: false,
      requiresAuthentication: true,
    };
  }

  if (status === 429) {
    return {
      message: RATE_LIMIT_MESSAGE,
      type: error.type,
      status,
      details: error.details,
      isRetryable: true,
      requiresAuthentication: false,
    };
  }

  if (isNetworkFailure) {
    return {
      message: NETWORK_MESSAGE,
      type: error.type,
      status,
      details: error.details,
      isRetryable: true,
      requiresAuthentication: false,
    };
  }

  return {
    message: responseMessage(error, fallbackMessage),
    type: error.type,
    status,
    details: error.details,
    isRetryable: false,
    requiresAuthentication: false,
  };
}

export function sazitoErrorMessage(
  error: SazitoError,
  fallbackMessage?: string,
) {
  return normalizeSazitoError(error, fallbackMessage).message;
}

export function isSazitoAuthenticationError(error?: SazitoError | null) {
  return error?.status === 401 || error?.status === 403;
}

export function sazitoConnectionErrorMessage() {
  return NETWORK_MESSAGE;
}
