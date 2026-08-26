import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  catalogHref,
  paginationWindow,
  type CatalogSearchParams,
} from "@/lib/sazito/catalog";
import { cn } from "@/lib/utils";

export function CatalogPagination({
  pathname,
  searchParams,
  page,
  totalPages,
}: {
  pathname: string;
  searchParams: CatalogSearchParams;
  page: number;
  totalPages: number;
}) {
  const pages = paginationWindow(page, totalPages);
  if (!pages.length) return null;

  const linkClass =
    "flex size-10 items-center justify-center rounded-xl border bg-card text-sm font-bold outline-none transition-colors hover:border-primary/40 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 pt-4" aria-label="صفحه‌بندی محصولات">
      <Link
        href={catalogHref(pathname, searchParams, { page: page - 1 })}
        aria-label="صفحه قبل"
        aria-disabled={page <= 1}
        tabIndex={page <= 1 ? -1 : undefined}
        className={cn(linkClass, page <= 1 && "pointer-events-none opacity-35")}
      >
        <ChevronRight className="size-4" />
      </Link>
      {pages.map((number) => (
        <Link
          key={number}
          href={catalogHref(pathname, searchParams, { page: number })}
          aria-current={number === page ? "page" : undefined}
          className={cn(
            linkClass,
            number === page && "border-primary bg-primary text-primary-foreground",
          )}
        >
          {number.toLocaleString("fa-IR")}
        </Link>
      ))}
      <Link
        href={catalogHref(pathname, searchParams, { page: page + 1 })}
        aria-label="صفحه بعد"
        aria-disabled={page >= totalPages}
        tabIndex={page >= totalPages ? -1 : undefined}
        className={cn(linkClass, page >= totalPages && "pointer-events-none opacity-35")}
      >
        <ChevronLeft className="size-4" />
      </Link>
    </nav>
  );
}
