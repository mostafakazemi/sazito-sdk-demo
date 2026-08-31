import type { SazitoResponse } from "@sazito/client-sdk";

import type { SazitoError } from "./error";

export class SazitoDataError extends Error {
  status?: number;
  kind: "network" | "api" | "validation";

  constructor(
    message: string,
    kind: "network" | "api" | "validation",
    status?: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = "SazitoDataError";
    this.kind = kind;
    this.status = status;
  }
}

export function toSazitoDataError(
  error: SazitoError,
  fallbackMessage: string,
) {
  return new SazitoDataError(
    error.message?.trim() || fallbackMessage,
    error.type,
    error.status,
    error.details,
  );
}

export function unwrapSazitoResponse<T>(
  response: SazitoResponse<T>,
  fallbackMessage: string,
): T {
  if (response.error) {
    throw toSazitoDataError(response.error, fallbackMessage);
  }

  if (response.data === undefined) {
    throw new SazitoDataError(fallbackMessage, "api");
  }

  return response.data;
}
