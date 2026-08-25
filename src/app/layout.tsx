import type { Metadata } from "next";
import { Estedad } from "next/font/google";

import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";
import { getStoreChrome } from "@/lib/sazito/data";

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
    <html lang="fa" dir="rtl" className={estedad.variable}>
      <body className="flex min-h-screen flex-col antialiased">
        <StoreHeader store={store} />
        <main className="flex-1">{children}</main>
        <StoreFooter store={store} />
      </body>
    </html>
  );
}
