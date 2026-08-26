"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="site-container flex min-h-[62vh] items-center justify-center py-16">
      <div className="max-w-lg rounded-4xl border bg-card p-8 text-center shadow-sm sm:p-12">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-highlight/15 text-highlight">
          <AlertCircle className="size-7" />
        </span>
        <h1 className="mt-6 text-2xl font-black">مشکلی پیش آمد</h1>
        <p className="mt-3 leading-8 text-muted-foreground">
          دریافت اطلاعات از فروشگاه کامل نشد. اتصال خود را بررسی کنید و دوباره
          تلاش کنید.
        </p>
        <Button className="mt-7" onClick={reset}>
          <RefreshCw />
          تلاش دوباره
        </Button>
      </div>
    </div>
  );
}
