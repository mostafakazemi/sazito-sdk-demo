import type { Metadata } from "next";
import { Estedad } from "next/font/google";

import { CommerceProvider } from "@/components/commerce/commerce-provider";
import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";
import { sazitoStoreDomain } from "@/lib/sazito/client";
import { getStoreChrome } from "@/lib/sazito/data";

import "@sazito/checkout/styles.css";
import "./globals.css";

const estedad = Estedad({
  variable: "--font-estedad",
  subsets: ["arabic", "latin"],
  display: "swap",
  adjustFontFallback: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreChrome();

  return {
    title: {
      default: store.name,
      template: `%s | ${store.name}`,
    },
    description: store.description,
    icons: store.faviconUrl ? { icon: store.faviconUrl } : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const store = await getStoreChrome();

  return (
    <html
      lang="fa"
      dir="rtl"
      className={estedad.variable}
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-screen flex-col antialiased">
        <CommerceProvider domain={sazitoStoreDomain}>
          <StoreHeader store={store} />
          <main className="flex-1">{children}</main>
          <StoreFooter store={store} />
        </CommerceProvider>
      </body>
    </html>
  );
}
