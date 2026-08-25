import Link from "next/link";
import { ArrowRight, PackageSearch } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="site-container flex min-h-[62vh] items-center justify-center py-16">
      <div className="max-w-lg text-center">
        <span className="mx-auto flex size-20 items-center justify-center rounded-[2rem] bg-secondary text-primary">
          <PackageSearch className="size-10" />
        </span>
        <p className="mt-7 text-sm font-bold text-highlight">خطای ۴۰۴</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">این محصول پیدا نشد</h1>
        <p className="mt-4 leading-8 text-muted-foreground">
          ممکن است محصول حذف شده باشد یا نشانی آن تغییر کرده باشد.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">
            <ArrowRight />
            بازگشت به فروشگاه
          </Link>
        </Button>
      </div>
    </div>
  );
}
