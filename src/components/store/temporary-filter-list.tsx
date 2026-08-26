"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

type TemporaryFilterOption = {
  label: string;
  value: string;
  color?: string;
};

export function TemporaryFilterList({
  label,
  options,
  defaultOpen = false,
}: {
  label: string;
  options: TemporaryFilterOption[];
  defaultOpen?: boolean;
}) {
  const [selected, setSelected] = React.useState<string[]>([]);

  const toggle = (value: string) => {
    setSelected((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  return (
    <details
      className="group overflow-hidden rounded-2xl border border-border/75 bg-background/55 open:border-primary/25 open:bg-secondary/25"
      open={defaultOpen || undefined}
    >
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-2.5 outline-none transition-colors hover:bg-secondary/45 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        <span className="font-bold">{label}</span>
        <span className="mr-auto text-[11px] text-muted-foreground">
          {selected.length
            ? `${selected.length.toLocaleString("fa-IR")} انتخاب`
            : "چندانتخابی"}
        </span>
        <ChevronDown
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>

      <fieldset
        className="filter-option-scroll h-[8.75rem] space-y-1 overflow-y-auto border-t border-border/65 p-1.5"
        aria-label={`${label}؛ انتخاب چند گزینه`}
      >
        {options.map((option) => {
          const checked = selected.includes(option.value);

          return (
            <label
              key={option.value}
              className={cn(
                "flex h-10 cursor-pointer items-center gap-2.5 rounded-xl px-2.5 text-sm outline-none transition-colors hover:bg-card has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/30",
                checked && "bg-card font-bold text-primary shadow-sm",
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(option.value)}
                className="sr-only"
              />
              {option.color ? (
                <span
                  className="size-5 shrink-0 rounded-md border border-black/15 shadow-sm"
                  style={{ backgroundColor: option.color }}
                  aria-hidden="true"
                />
              ) : (
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-md border bg-card text-transparent transition-colors",
                    checked && "border-primary bg-primary text-primary-foreground",
                  )}
                  aria-hidden="true"
                >
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
              )}
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              {option.color ? (
                <Check
                  className={cn(
                    "size-4 shrink-0 text-primary transition-opacity",
                    checked ? "opacity-100" : "opacity-0",
                  )}
                  strokeWidth={3}
                  aria-hidden="true"
                />
              ) : null}
            </label>
          );
        })}
      </fieldset>
    </details>
  );
}
