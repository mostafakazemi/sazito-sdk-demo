import type { Metadata } from "next";
import { cookies } from "next/headers";
import Script from "next/script";

import { AccountProvider } from "@/components/account/account-provider";
import { CommerceProvider } from "@/components/commerce/commerce-provider";
import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";
import { StoreVisitTracker } from "@/components/store/store-visit-tracker";
import { storefrontOrigin } from "@/lib/seo";
import { sazitoStoreDomain } from "@/lib/sazito/client";
import { getStoreChrome } from "@/lib/sazito/data";

import "@sazito/checkout/styles.css";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreChrome();

  return {
    metadataBase: new URL(storefrontOrigin),
    title: {
      default: store.name,
      template: `%s | ${store.name}`,
    },
    description: store.description,
    applicationName: store.name,
    formatDetection: {
      address: false,
      email: false,
      telephone: false,
    },
    icons: store.faviconUrl ? { icon: store.faviconUrl } : undefined,
    openGraph: {
      type: "website",
      locale: "fa_IR",
      siteName: store.name,
      title: store.name,
      description: store.description,
      images: store.logoUrl
        ? [{ url: store.logoUrl, alt: `لوگوی ${store.name}` }]
        : undefined,
    },
    twitter: {
      card: store.logoUrl ? "summary_large_image" : "summary",
      title: store.name,
      description: store.description,
      images: store.logoUrl ? [store.logoUrl] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const store = await getStoreChrome();
  const cookieStore = await cookies();
  const themePreference = cookieStore.get("sazito-theme")?.value;
  const storedFontScale = Number(cookieStore.get("sazito-font-scale")?.value);
  const initialFontScale = storedFontScale >= 85 && storedFontScale <= 125 ? storedFontScale : 100;
  const storedFontFamily = cookieStore.get("sazito-font-family")?.value;
  const initialFontFamily =
    storedFontFamily === "vazirmatn" || storedFontFamily === "noto" ? storedFontFamily : "estedad";
  const initialFontCss =
    initialFontFamily === "vazirmatn"
      ? "Vazirmatn, sans-serif"
      : initialFontFamily === "noto"
        ? "Noto Sans Arabic, sans-serif"
        : '"Estedad", sans-serif';
  const initialTheme = themePreference === "dark" ? "dark" : "light";

  return (
    <html
      lang="fa"
      dir="rtl"
      data-scroll-behavior="smooth"
      data-theme={initialTheme}
      data-theme-preference={
        themePreference === "light" || themePreference === "dark" ? themePreference : "system"
      }
      style={{ fontSize: `${initialFontScale}%`, "--font-ui": initialFontCss } as React.CSSProperties}
      suppressHydrationWarning
    >
      <head>
        <Script id="sazito-theme-init" strategy="beforeInteractive">
          {`(() => {
  try {
    const readCookie = (name) => document.cookie.split("; ").find((cookie) => cookie.startsWith(name + "="))?.split("=")[1];
    const preference = readCookie("sazito-theme");
    const theme = preference === "light" || preference === "dark"
      ? preference
      : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.themePreference = preference === "light" || preference === "dark" ? preference : "system";
    const cookieScale = Number(readCookie("sazito-font-scale"));
    const legacyScale = Number(localStorage.getItem("sazito-font-scale"));
    const fontScale = cookieScale >= 85 && cookieScale <= 125
      ? cookieScale
      : legacyScale >= 85 && legacyScale <= 125 ? legacyScale : 100;
    const cookieFamily = readCookie("sazito-font-family");
    const legacyFamily = localStorage.getItem("sazito-font-family");
    const fontFamily = cookieFamily === "vazirmatn" || cookieFamily === "noto"
      ? cookieFamily
      : legacyFamily === "vazirmatn" || legacyFamily === "noto" ? legacyFamily : "estedad";
    const fontCss = fontFamily === "vazirmatn"
      ? "Vazirmatn, sans-serif"
      : fontFamily === "noto" ? "Noto Sans Arabic, sans-serif" : '"Estedad", sans-serif';
    document.documentElement.style.fontSize = fontScale + "%";
    document.documentElement.style.setProperty("--font-ui", fontCss);
    if (!readCookie("sazito-font-scale")) {
      document.cookie = "sazito-font-scale=" + fontScale + "; path=/; max-age=31536000; samesite=lax";
    }
    if (!readCookie("sazito-font-family")) {
      document.cookie = "sazito-font-family=" + fontFamily + "; path=/; max-age=31536000; samesite=lax";
    }
  } catch {
    document.documentElement.dataset.theme = "light";
    document.documentElement.dataset.themePreference = "system";
  }
})();`}
        </Script>
      </head>
      <body id="page-top" className="flex min-h-screen flex-col antialiased">
        <CommerceProvider domain={sazitoStoreDomain}>
          <AccountProvider>
            <StoreVisitTracker />
            <StoreHeader store={store} />
            <main className="flex-1">{children}</main>
            <StoreFooter store={store} />
          </AccountProvider>
        </CommerceProvider>
      </body>
    </html>
  );
}
