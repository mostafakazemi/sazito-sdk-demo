"use client";

import * as React from "react";
import { SazitoProvider } from "@sazito/checkout/next";
import {
  createSazitoClient,
  type Cart,
  type SazitoClient,
} from "@sazito/client-sdk";

import { cartErrorMessage, cartItemCount } from "@/lib/sazito/cart";

type CartOperationResult =
  | { ok: true }
  | { ok: false; message: string };

interface CommerceContextValue {
  client: SazitoClient;
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  isMutating: boolean;
  addItem(variantId: number, quantity: number): Promise<CartOperationResult>;
  refreshCart(): Promise<void>;
  syncCart(cart: Cart | null): void;
}

const CommerceContext = React.createContext<CommerceContextValue | null>(null);

function createSazitoProxyFetch(domain: string): typeof fetch {
  return (input, init) => {
    const requestUrl =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    const target = new URL(requestUrl);

    if (target.hostname !== "api.sazito.com" && target.hostname !== domain) {
      return fetch(input, init);
    }

    const proxyUrl = `/api/sazito${target.pathname}${target.search}`;
    return fetch(proxyUrl, init);
  };
}

export function CommerceProvider({
  domain,
  children,
}: {
  domain: string;
  children: React.ReactNode;
}) {
  const client = React.useMemo(
    () =>
      createSazitoClient({
        domain,
        timeout: 15_000,
        retry: { enabled: false, retries: 0, retryDelay: 0 },
        cache: {
          cart: { enabled: false },
          orders: { enabled: false },
        },
        customFetchApi: createSazitoProxyFetch(domain),
      }),
    [domain],
  );
  const [cart, setCart] = React.useState<Cart | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isMutating, setIsMutating] = React.useState(false);

  const syncCart = React.useCallback((nextCart: Cart | null) => {
    setCart(nextCart);
  }, []);

  const refreshCart = React.useCallback(async () => {
    const credentials = client.getCredentialsManager().getCartCredentials();

    if (!credentials) {
      setCart(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const response = await client.cart.get({ cache: false });

    if (response.error) {
      if (response.error.status === 404) {
        client.cart.clearCart();
        setCart(null);
      }
    } else {
      setCart(response.data ?? null);
    }

    setIsLoading(false);
  }, [client]);

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void refreshCart();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [refreshCart]);

  const addItem = React.useCallback(
    async (variantId: number, quantity: number): Promise<CartOperationResult> => {
      setIsMutating(true);

      try {
        const response = await client.cart.addItemWithAttributes(
          variantId,
          quantity,
          undefined,
          { cache: false },
        );

        if (response.error) {
          return { ok: false, message: cartErrorMessage(response.error) };
        }

        if (!response.data) {
          return { ok: false, message: "سبد خرید از فروشگاه دریافت نشد." };
        }

        setCart(response.data);
        return { ok: true };
      } catch {
        return {
          ok: false,
          message: "ارتباط با فروشگاه برقرار نشد. دوباره تلاش کنید.",
        };
      } finally {
        setIsMutating(false);
      }
    },
    [client],
  );

  const value = React.useMemo<CommerceContextValue>(
    () => ({
      client,
      cart,
      itemCount: cartItemCount(cart),
      isLoading,
      isMutating,
      addItem,
      refreshCart,
      syncCart,
    }),
    [addItem, cart, client, isLoading, isMutating, refreshCart, syncCart],
  );

  return (
    <SazitoProvider client={client}>
      <CommerceContext.Provider value={value}>
        {children}
      </CommerceContext.Provider>
    </SazitoProvider>
  );
}

export function useCommerce() {
  const value = React.useContext(CommerceContext);

  if (!value) {
    throw new Error("useCommerce must be used inside CommerceProvider.");
  }

  return value;
}
