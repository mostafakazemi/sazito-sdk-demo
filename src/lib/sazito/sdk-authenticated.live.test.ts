import { createSazitoClient } from "@sazito/client-sdk";
import type { RequestOptions, SazitoResponse } from "@sazito/client-sdk";
import { beforeAll, describe, expect, it } from "vitest";

const storeDomain =
  process.env.SAZITO_STORE_DOMAIN?.trim() || "testmosi.sazito.com";
const testEmail = process.env.SAZITO_LIVE_TEST_EMAIL?.trim();
const testPassword = process.env.SAZITO_LIVE_TEST_PASSWORD;
const hasPartialCredentials = Boolean(testEmail) !== Boolean(testPassword);
const hasCredentials = Boolean(testEmail && testPassword);

if (hasPartialCredentials) {
  throw new Error(
    "Set both SAZITO_LIVE_TEST_EMAIL and SAZITO_LIVE_TEST_PASSWORD, or leave both empty.",
  );
}

const client = createSazitoClient({
  domain: storeDomain,
  timeout: 15_000,
  retry: {
    enabled: true,
    retries: 2,
    retryDelay: 700,
  },
  cache: {
    products: { enabled: false },
    categories: { enabled: false },
    entityRoutes: { enabled: false },
  },
});

let authToken = "";

function unwrapLiveResponse<T>(response: SazitoResponse<T>, operation: string): T {
  if (response.error) {
    const status = response.error.status ? ` HTTP ${response.error.status}` : "";
    throw new Error(
      `${operation} failed for ${storeDomain}: ${response.error.type}${status}: ${response.error.message}`,
    );
  }

  if (response.data === undefined) {
    throw new Error(`${operation} returned no data for ${storeDomain}.`);
  }

  return response.data;
}

function authenticatedOptions(): RequestOptions {
  if (!authToken) {
    throw new Error("The authenticated live-test token is not initialized.");
  }

  return {
    cache: false,
    headers: { Authorization: authToken },
  };
}

describe.skipIf(!hasCredentials)(
  `Sazito Client SDK authenticated live contract (${storeDomain})`,
  () => {
    beforeAll(async () => {
      const login = unwrapLiveResponse(
        await client.users.login(
          { email: testEmail!, password: testPassword! },
          { cache: false },
        ),
        "users.login",
      );

      expect(login.jwt).toEqual(expect.any(String));
      expect(login.jwt.trim()).not.toBe("");
      authToken = login.jwt;
    });

    it("returns the configured authenticated user", async () => {
      const user = unwrapLiveResponse(
        await client.users.getCurrentUser(authenticatedOptions()),
        "users.getCurrentUser",
      );

      expect(user.id ?? user.email ?? user.mobilePhone).toBeTruthy();
      if (user.email) {
        expect(user.email.toLocaleLowerCase("en-US")).toBe(
          testEmail!.toLocaleLowerCase("en-US"),
        );
      }
    });

    it("returns a normalized order collection without changing it", async () => {
      const result = unwrapLiveResponse(
        await client.orders.list(
          { pageNumber: 1, pageSize: 5 },
          authenticatedOptions(),
        ),
        "orders.list",
      );

      expect(result.orders).toBeInstanceOf(Array);
      expect(result.totalCount).toBeTypeOf("number");
      expect(result.totalCount).toBeGreaterThanOrEqual(result.orders.length);

      for (const order of result.orders) {
        expect(order.id).toBeTypeOf("number");
        expect(order.orderIdentifier).toEqual(expect.any(String));
        expect(order.invoice.invoiceItems).toBeInstanceOf(Array);
      }
    });

    it("returns the authenticated user's saved address snapshots", async () => {
      const addresses = unwrapLiveResponse(
        await client.shipping.listAddresses(authenticatedOptions()),
        "shipping.listAddresses",
      );

      expect(addresses).toBeInstanceOf(Array);
      for (const address of addresses) {
        expect(address.id).toBeTypeOf("number");
        expect(address.identifier).toEqual(expect.any(String));
        expect(address.city).toEqual(
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
          }),
        );
      }
    });

    it("returns wallet data when the store wallet is enabled", async () => {
      const [walletConfigResponse, balanceResponse, transactionsResponse] =
        await Promise.all([
          client.general.getWalletConfig({ cache: false }),
          client.wallet.getBalance(authenticatedOptions()),
          client.wallet.listTransactions(
            { pageNumber: 1, pageSize: 5 },
            authenticatedOptions(),
          ),
        ]);
      const walletConfig = unwrapLiveResponse(
        walletConfigResponse,
        "general.getWalletConfig",
      );

      if (!walletConfig.enabled && (balanceResponse.error || transactionsResponse.error)) {
        for (const error of [balanceResponse.error, transactionsResponse.error]) {
          if (error) expect(error.status).toBeOneOf([400, 403, 404]);
        }
        return;
      }

      const wallet = unwrapLiveResponse(balanceResponse, "wallet.getBalance");
      const transactions = unwrapLiveResponse(
        transactionsResponse,
        "wallet.listTransactions",
      );

      expect(wallet.enabled).toBeTypeOf("boolean");
      expect(wallet.balance).toBeTypeOf("number");
      expect(Number.isFinite(wallet.balance)).toBe(true);
      expect(transactions.transactions).toBeInstanceOf(Array);
      expect(transactions.totalCount ?? transactions.transactions.length).toBeGreaterThanOrEqual(
        transactions.transactions.length,
      );
    });
  },
);
