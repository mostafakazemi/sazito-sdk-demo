"use client";

import * as React from "react";
import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { ImageOff, LoaderCircle, Search } from "lucide-react";

import { useCommerce } from "@/components/commerce/commerce-provider";
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
import { formatPrice, toProductCard } from "@/lib/sazito/presenters";
import type { ProductCardView } from "@/lib/sazito/types";

export function StoreSearch() {
  const { client } = useCommerce();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<ProductCardView[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setError(false);

      try {
        const response = await client.search.query(
          term,
          { page: 1, pageSize: 6 },
          { cache: false, signal: controller.signal },
        );

        if (response.error) {
          setError(true);
          setResults([]);
        } else {
          setResults(
            (response.data?.products.items ?? [])
              .filter((product) => product.enabled)
              .map(toProductCard),
          );
        }
      } catch (searchError) {
        if (!(searchError instanceof DOMException && searchError.name === "AbortError")) {
          setError(true);
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [client, query]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full border-border/80 bg-card px-3 shadow-sm hover:shadow-sm sm:px-4"
          aria-label="جست‌وجوی محصولات"
        >
          <Search />
          <span className="hidden sm:inline">جست‌وجو</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="max-h-[90dvh] overflow-y-auto p-0">
        <div className="site-container py-7 sm:py-10">
          <SheetHeader className="pl-12">
            <SheetTitle>جست‌وجوی محصولات</SheetTitle>
            <SheetDescription>نام محصول را بنویسید؛ نتیجه‌ها هم‌زمان نمایش داده می‌شوند.</SheetDescription>
          </SheetHeader>

          <Form
            action="/search"
            className="relative mt-6"
            onSubmit={() => setOpen(false)}
          >
            <Search className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              value={query}
              onChange={(event) => {
                const value = event.target.value;
                setQuery(value);
                if (value.trim().length < 2) {
                  setResults([]);
                  setIsSearching(false);
                  setError(false);
                }
              }}
              autoFocus
              autoComplete="off"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={results.length > 0}
              aria-controls="store-search-results"
              placeholder="مثلاً غذای خشک"
              className="h-14 w-full rounded-2xl border bg-background pr-12 pl-32 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/25"
            />
            <Button type="submit" className="absolute left-1.5 top-1.5 h-11" disabled={!query.trim()}>
              نمایش همه
            </Button>
          </Form>

          <div id="store-search-results" role="listbox" className="mt-5">
            {isSearching ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <LoaderCircle className="size-5 animate-spin" />
                در حال جست‌وجو…
              </div>
            ) : error ? (
              <p role="alert" className="rounded-xl bg-danger/10 p-4 text-sm text-danger">
                جست‌وجو انجام نشد. کمی بعد دوباره تلاش کنید.
              </p>
            ) : query.trim().length >= 2 && !results.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">محصولی پیدا نشد.</p>
            ) : results.length ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((product) => (
                  <SheetClose asChild key={`${product.id}-${product.href}`}>
                    <Link
                      href={product.href}
                      role="option"
                      className="flex items-center gap-3 rounded-2xl border bg-card p-3 outline-none transition-colors hover:border-primary/40 hover:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
                        {product.image ? (
                          <Image src={product.image.src} alt="" fill sizes="64px" className="object-contain p-1" />
                        ) : (
                          <ImageOff className="size-5 text-muted-foreground" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="line-clamp-2 text-sm font-bold">{product.name}</span>
                        <span className="mt-1 block text-xs text-primary">
                          {product.price ? formatPrice(product.price.current) : "قیمت نامشخص"}
                        </span>
                      </span>
                    </Link>
                  </SheetClose>
                ))}
              </div>
            ) : (
              <p className="py-7 text-center text-sm text-muted-foreground">
                برای شروع دست‌کم دو حرف وارد کنید.
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
