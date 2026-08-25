import type { SazitoResponse } from "@sazito/client-sdk";

export class SazitoDataError extends Error {
  status?: number;
  kind: "network" | "api" | "validation";

  constructor(
    message: string,
    kind: "network" | "api" | "validation",
    status?: number,
  ) {
    super(message);
    this.name = "SazitoDataError";
    this.kind = kind;
    this.status = status;
  }
}

export function unwrapSazitoResponse<T>(
  response: SazitoResponse<T>,
  fallbackMessage: string,
): T {
  if (response.error) {
    throw new SazitoDataError(
      response.error.message || fallbackMessage,
      response.error.type,
      response.error.status,
    );
  }

  if (response.data === undefined) {
    throw new SazitoDataError(fallbackMessage, "api");
  }

  return response.data;
}
