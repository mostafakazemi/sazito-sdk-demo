"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";

export function BackToTopLink() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1 font-semibold hover:text-primary"
      onClick={(event) => {
        event.preventDefault();
        if (pathname !== "/") router.push("/", { scroll: false });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      بازگشت به ابتدای فروشگاه
      <ArrowUp className="size-3" aria-hidden="true" />
    </Link>
  );
}
