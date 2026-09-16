import { cn } from "@/lib/utils";

interface AttributeSwatchProps {
  /** Validated CSS color from `attributeColor()`. */
  color: string;
  /** Accessible name, e.g. "رنگ: سبز". Omit when a visible label sits next to it. */
  label?: string;
  className?: string;
}

/**
 * Circular color chip for SDK attributes whose `fieldType` is `color`.
 * The inset ring keeps very light swatches (e.g. #ffffff, #f5f5dc)
 * visible on card backgrounds without changing the color itself.
 */
export function AttributeSwatch({ color, label, className }: AttributeSwatchProps) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      title={label}
      className={cn(
        "inline-block shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.14)]",
        className,
      )}
      style={{ backgroundColor: color }}
    />
  );
}
