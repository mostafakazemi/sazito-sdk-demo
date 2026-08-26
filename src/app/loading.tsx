import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="site-container space-y-12 py-8 sm:py-12">
      <Skeleton className="h-[30rem] rounded-4xl" />
      <div className="space-y-5">
        <Skeleton className="h-8 w-52" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-80 rounded-[1.5rem]" />
          ))}
        </div>
      </div>
    </div>
  );
}
