import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="site-container space-y-8 py-8">
      <Skeleton className="h-5 w-56" />
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-[2rem]" />
        <Skeleton className="min-h-[30rem] rounded-[2rem]" />
      </div>
    </div>
  );
}
