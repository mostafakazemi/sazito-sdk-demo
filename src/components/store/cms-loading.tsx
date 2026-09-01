import { Skeleton } from "@/components/ui/skeleton";

export function CmsLoading() {
  return (
    <div className="site-container py-8 sm:py-12" aria-label="در حال دریافت محتوا">
      <Skeleton className="h-5 w-44" />
      <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4">
        <Skeleton className="h-7 w-32 rounded-full" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-5 w-2/3" />
      </div>
      <Skeleton className="mx-auto mt-10 h-96 max-w-4xl rounded-4xl" />
      <span className="sr-only">محتوای فروشگاه در حال بارگذاری است.</span>
    </div>
  );
}
