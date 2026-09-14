import { OrderDetailContentLoading } from "@/components/account/orders-loading";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="site-container py-8 sm:py-12">
      <header className="mb-4 space-y-3 lg:mb-6">
        <Skeleton className="h-8 w-44 max-w-full" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </header>
      <OrderDetailContentLoading />
    </div>
  );
}
