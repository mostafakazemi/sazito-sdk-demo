import { Skeleton } from "@/components/ui/skeleton";

function AccountNavigationSkeleton() {
  return (
    <aside className="h-fit rounded-4xl border bg-card p-2 sm:p-3 lg:p-4">
      <div className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-3">
        <Skeleton className="size-10 rounded-xl lg:size-11 lg:rounded-2xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3 w-24 max-w-full" />
          <Skeleton className="hidden h-2.5 w-36 max-w-full lg:block" />
        </div>
      </div>
      <div className="mt-3 flex gap-1 overflow-hidden lg:grid lg:gap-2">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-9 w-20 shrink-0 rounded-2xl lg:h-11 lg:w-full" />
        ))}
      </div>
      <Skeleton className="mt-3 h-9 w-full rounded-xl" />
    </aside>
  );
}

function OrderCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-4xl border bg-card">
      <div className="space-y-3 border-b border-border/70 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-5 w-52 max-w-full" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="space-y-2 p-4 sm:p-5">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 rounded-2xl border p-2.5">
            <Skeleton className="size-12 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-40 max-w-full" />
              <Skeleton className="h-2.5 w-24 max-w-full" />
            </div>
            <Skeleton className="h-6 w-12 shrink-0 rounded-full" />
          </div>
        ))}
        <Skeleton className="mr-auto h-9 w-32 rounded-xl" />
      </div>
    </div>
  );
}

export function OrdersLoading() {
  return (
    <div className="site-container py-8 sm:py-12" aria-label="در حال دریافت سفارش‌ها">
      <div className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-6">
        <AccountNavigationSkeleton />
        <section className="min-w-0">
          <header className="mb-4 space-y-3 lg:mb-6">
            <Skeleton className="h-8 w-44 max-w-full" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </header>
          <div className="mb-5 flex min-h-20 items-center justify-between gap-4 rounded-3xl border bg-card p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="size-11 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-36 max-w-full" />
              </div>
            </div>
            <Skeleton className="h-3 w-24 max-w-[30%]" />
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </div>
        </section>
      </div>
    </div>
  );
}

export function OrdersListLoading() {
  return (
    <div className="space-y-4" role="status" aria-label="در حال دریافت سفارش‌ها">
      <div className="mb-5 flex min-h-20 items-center justify-between gap-4 rounded-3xl border bg-card p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36 max-w-full" />
          </div>
        </div>
        <Skeleton className="h-3 w-24 max-w-[30%]" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <OrderCardSkeleton />
        <OrderCardSkeleton />
      </div>
    </div>
  );
}

export function OrderDetailContentLoading() {
  return (
    <div className="grid gap-4" role="status" aria-label="در حال دریافت جزئیات سفارش">
      <Skeleton className="h-32 rounded-4xl" />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <Skeleton className="h-72 rounded-4xl" />
        <Skeleton className="h-56 rounded-4xl" />
      </div>
      <Skeleton className="h-48 rounded-4xl" />
    </div>
  );
}
