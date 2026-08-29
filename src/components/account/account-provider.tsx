"use client";

import * as React from "react";
import type { User } from "@sazito/client-sdk";

import { useCommerce } from "@/components/commerce/commerce-provider";
import {
  accountErrorMessage,
  isIranianMobile,
  normalizeMobileInput,
  normalizeOtpInput,
} from "@/lib/sazito/account";

type AccountStatus = "loading" | "anonymous" | "authenticated";
type AccountResult = { ok: true } | { ok: false; message: string };

export interface AccountProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  birthDate?: string;
}

interface AccountContextValue {
  user: User | null;
  status: AccountStatus;
  loginWithPassword(email: string, password: string): Promise<AccountResult>;
  requestMobileOtp(mobilePhone: string): Promise<AccountResult>;
  verifyMobileOtp(mobilePhone: string, token: string): Promise<AccountResult>;
  updateProfile(input: AccountProfileInput): Promise<AccountResult>;
  refreshUser(): Promise<AccountResult>;
  logout(): void;
}

const AccountContext = React.createContext<AccountContextValue | null>(null);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const { client } = useCommerce();
  const [user, setUser] = React.useState<User | null>(null);
  const [status, setStatus] = React.useState<AccountStatus>("loading");

  const logout = React.useCallback(() => {
    client.clearAuth();
    setUser(null);
    setStatus("anonymous");
  }, [client]);

  const refreshUser = React.useCallback(async (): Promise<AccountResult> => {
    if (!client.isAuthenticated()) {
      setUser(null);
      setStatus("anonymous");
      return { ok: false, message: "برای ادامه وارد حساب کاربری شوید." };
    }

    const response = await client.users.getCurrentUser({ cache: false });

    if (response.error || !response.data) {
      if (response.error?.status === 401 || response.error?.status === 403) {
        client.clearAuth();
      }
      setUser(null);
      setStatus("anonymous");

      return {
        ok: false,
        message: response.error
          ? accountErrorMessage(response.error)
          : "اطلاعات حساب از فروشگاه دریافت نشد.",
      };
    }

    setUser(response.data);
    setStatus("authenticated");
    return { ok: true };
  }, [client]);

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (!client.isAuthenticated()) {
        setStatus("anonymous");
        return;
      }

      void refreshUser();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [client, refreshUser]);

  const finishLogin = React.useCallback(
    async (jwt: string, responseUser?: User): Promise<AccountResult> => {
      if (!jwt) {
        return { ok: false, message: "توکن ورود از فروشگاه دریافت نشد." };
      }

      client.setAuthToken(jwt);

      if (responseUser) {
        setUser(responseUser);
        setStatus("authenticated");
        return { ok: true };
      }

      return refreshUser();
    },
    [client, refreshUser],
  );

  const loginWithPassword = React.useCallback(
    async (email: string, password: string): Promise<AccountResult> => {
      const response = await client.users.login(
        { email: email.trim(), password },
        { cache: false },
      );

      if (response.error || !response.data?.jwt) {
        return {
          ok: false,
          message: response.error
            ? accountErrorMessage(response.error, "ورود انجام نشد.")
            : "توکن ورود از فروشگاه دریافت نشد.",
        };
      }

      return finishLogin(response.data.jwt, response.data.user);
    },
    [client, finishLogin],
  );

  const requestMobileOtp = React.useCallback(
    async (mobilePhone: string): Promise<AccountResult> => {
      const normalized = normalizeMobileInput(mobilePhone);
      if (!isIranianMobile(normalized)) {
        return { ok: false, message: "شماره موبایل معتبر وارد کنید." };
      }

      const response = await client.users.requestMobileOTP(
        { mobilePhone: normalized },
        { cache: false },
      );

      return response.error
        ? {
            ok: false,
            message: accountErrorMessage(
              response.error,
              "ارسال کد ورود انجام نشد.",
            ),
          }
        : { ok: true };
    },
    [client],
  );

  const verifyMobileOtp = React.useCallback(
    async (mobilePhone: string, token: string): Promise<AccountResult> => {
      const normalized = normalizeMobileInput(mobilePhone);
      const normalizedToken = normalizeOtpInput(token);
      if (!isIranianMobile(normalized) || !normalizedToken) {
        return { ok: false, message: "شماره موبایل و کد ورود را کامل کنید." };
      }

      const response = await client.users.verifyMobileOTP(
        { mobilePhone: normalized, token: normalizedToken },
        { cache: false },
      );

      if (response.error || !response.data?.jwt) {
        return {
          ok: false,
          message: response.error
            ? accountErrorMessage(response.error, "تأیید کد انجام نشد.")
            : "توکن ورود از فروشگاه دریافت نشد.",
        };
      }

      return finishLogin(response.data.jwt, response.data.user);
    },
    [client, finishLogin],
  );

  const updateProfile = React.useCallback(
    async (input: AccountProfileInput): Promise<AccountResult> => {
      if (!user?.id) {
        return { ok: false, message: "شناسه کاربر از فروشگاه دریافت نشد." };
      }

      const response = await client.users.updateProfile(user.id, input, {
        cache: false,
      });

      if (response.error || !response.data) {
        return {
          ok: false,
          message: response.error
            ? accountErrorMessage(response.error, "ذخیره پروفایل انجام نشد.")
            : "پروفایل به‌روزشده از فروشگاه دریافت نشد.",
        };
      }

      setUser(response.data);
      return { ok: true };
    },
    [client, user],
  );

  const value = React.useMemo<AccountContextValue>(
    () => ({
      user,
      status,
      loginWithPassword,
      requestMobileOtp,
      verifyMobileOtp,
      updateProfile,
      refreshUser,
      logout,
    }),
    [
      loginWithPassword,
      logout,
      refreshUser,
      requestMobileOtp,
      status,
      updateProfile,
      user,
      verifyMobileOtp,
    ],
  );

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}

export function useAccount() {
  const value = React.useContext(AccountContext);

  if (!value) {
    throw new Error("useAccount must be used inside AccountProvider.");
  }

  return value;
}
