"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, PackageOpen } from "lucide-react";

import { AccountButton } from "@/components/account/account-button";
import { CartButton } from "@/components/commerce/cart-button";
import { AppearanceControls } from "@/components/store/appearance-controls";
import { StoreSearch } from "@/components/store/store-search";
import { DesktopNavigation, MobileNavigation } from "@/components/store/header-navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { StoreChrome } from "@/lib/sazito/types";

function Brand({ store }: { store: StoreChrome }) {
  return (
    <Link
      href="/"
      className="group flex min-w-0 items-center gap-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      aria-label="صفحه اصلی"
    >
      {store.logoUrl ? (
        <span className="relative block h-11 w-14 shrink-0 overflow-hidden rounded-2xl border border-border/80 bg-white shadow-sm transition-[border-color,box-shadow,transform] group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-md sm:h-13 sm:w-18">
          <Image
            src={store.logoUrl}
            alt={store.name}
            fill
            sizes="72px"
            className="object-contain p-1.5"
            priority
          />
        </span>
      ) : (
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:-translate-y-0.5 sm:size-13">
          <PackageOpen className="size-5" />
        </span>
      )}
      <span className="min-w-0 max-w-40 sm:max-w-64">
        <span className="block truncate text-sm leading-6 font-black sm:text-base">{store.name}</span>
        <span className="hidden items-center gap-1.5 truncate text-xs text-muted-foreground sm:flex">
          <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          فروشگاه آنلاین
        </span>
      </span>
    </Link>
  );
}

export function StoreHeader({ store }: { store: StoreChrome }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-card/88 shadow-[0_8px_28px_-24px_rgba(31,42,36,0.7)] backdrop-blur-xl">
      <div className="site-container flex h-18 items-center gap-3 sm:h-20 lg:gap-5">
        <Brand store={store} />

        <nav
          className="relative mx-auto hidden min-w-0 flex-1 rounded-2xl bg-muted/55 xl:block"
          aria-label="منوی اصلی"
        >
          <div className="header-nav-scroll flex items-center justify-start gap-0.5 overflow-x-auto p-1">
            <DesktopNavigation items={store.navigation} pathname={pathname} />
          </div>
        </nav>

        <div className="mr-auto flex shrink-0 items-center gap-1.5 sm:gap-2 xl:mr-0">
          {store.searchEnabled ? <StoreSearch /> : null}
          <AppearanceControls />
          <AccountButton />
          <CartButton />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-border/80 bg-card shadow-sm xl:hidden"
              aria-label="باز کردن منو"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="overflow-y-auto p-0">
            <SheetHeader className="border-b bg-secondary/45 p-6 pl-12">
              <SheetTitle className="text-xl">{store.name}</SheetTitle>
              <SheetDescription>{store.description}</SheetDescription>
            </SheetHeader>
            <nav className="p-4" aria-label="منوی موبایل">
              <ul className="grid gap-1.5">
                <MobileNavigation items={store.navigation} pathname={pathname} />
              </ul>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
