import { Skeleton } from "@/components/ui/skeleton";

export function CatalogLoading() {
  return (
    <div className="site-container py-8 sm:py-12" aria-label="در حال دریافت محصولات">
      <Skeleton className="h-10 w-56" />
      <Skeleton className="mt-3 h-5 w-80 max-w-full" />
      <div className="mt-9 grid gap-6 lg:grid-cols-[17rem_1fr]">
        <Skeleton className="h-96 rounded-[1.5rem]" />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="aspect-[0.72] rounded-[1.5rem]" />
          ))}
        </div>
      </div>
    </div>
  );
}
