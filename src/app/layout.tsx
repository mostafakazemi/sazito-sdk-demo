import type { Metadata } from "next";

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

  return (
    <html lang="fa" dir="rtl" data-scroll-behavior="smooth">
      <body className="flex min-h-screen flex-col antialiased">
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
