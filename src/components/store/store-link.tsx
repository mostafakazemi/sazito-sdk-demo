import Link from "next/link";

import type { StoreLink as StoreLinkType } from "@/lib/sazito/types";
import { cn } from "@/lib/utils";

export function StoreLink({
  item,
  className,
  children,
  current = false,
}: {
  item: Pick<StoreLinkType, "href" | "external" | "label">;
  className?: string;
  children?: React.ReactNode;
  current?: boolean;
}) {
  const content = children ?? item.label;

  if (item.external) {
    return (
      <a href={item.href} className={cn(className)} aria-current={current ? "page" : undefined}>
        {content}
      </a>
    );
  }

  return (
    <Link href={item.href} className={cn(className)} aria-current={current ? "page" : undefined}>
      {content}
    </Link>
  );
}
