import { SazitoCheckout } from "@sazito/checkout/next/server";

export const { GET, POST } = SazitoCheckout({
  domain: process.env.SAZITO_STORE_DOMAIN!,
  checkoutPath: "/checkout",
}).handlers;
