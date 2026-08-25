"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, PackageOpen } from "lucide-react";

import { CartButton } from "@/components/commerce/cart-button";
import { StoreLink } from "@/components/store/store-link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { StoreChrome } from "@/lib/sazito/types";

function Brand({ store }: { store: StoreChrome }) {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="صفحه اصلی">
      {store.logoUrl ? (
        <span className="relative block size-11 shrink-0 overflow-hidden rounded-xl border bg-white sm:h-12 sm:w-20">
          <Image
            src={store.logoUrl}
            alt={store.name}
            fill
            sizes="80px"
            className="object-contain p-1.5"
            priority
          />
        </span>
      ) : (
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <PackageOpen className="size-5" />
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-sm font-black sm:text-base">{store.name}</span>
        <span className="hidden truncate text-xs text-muted-foreground sm:block">فروشگاه آنلاین</span>
      </span>
    </Link>
  );
}

export function StoreHeader({ store }: { store: StoreChrome }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="site-container flex h-18 items-center justify-between gap-6 sm:h-20">
        <Brand store={store} />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="منوی اصلی">
          <Link
            href="/"
            className="rounded-xl px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent"
          >
            خانه
          </Link>
          {store.navigation.map((item) => (
            <StoreLink
              key={`${item.href}-${item.label}`}
              item={item}
              className="rounded-xl px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent"
            />
          ))}
        </nav>

        <div className="mr-auto flex items-center gap-2 lg:mr-0">
          <CartButton />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden" aria-label="باز کردن منو">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader className="pl-10">
              <SheetTitle>{store.name}</SheetTitle>
              <SheetDescription>{store.description}</SheetDescription>
            </SheetHeader>
            <nav className="mt-8 grid gap-2" aria-label="منوی موبایل">
              <SheetClose asChild>
                <Link href="/" className="rounded-xl bg-accent px-4 py-3 font-bold">
                  خانه
                </Link>
              </SheetClose>
              {store.navigation.map((item) => {
                const className =
                  "rounded-xl px-4 py-3 font-semibold transition-colors hover:bg-accent";

                return (
                  <SheetClose asChild key={`${item.href}-${item.label}`}>
                    {item.external ? (
                      <a href={item.href} className={className}>
                        {item.label}
                      </a>
                    ) : (
                      <Link href={item.href} className={className}>
                        {item.label}
                      </Link>
                    )}
                  </SheetClose>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
