export function getSazitoApiKey() {
  return process.env.SAZITO_API_KEY?.trim() || undefined;
}
