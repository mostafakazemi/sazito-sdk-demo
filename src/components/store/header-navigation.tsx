"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";

import { StoreLink } from "@/components/store/store-link";
import { SheetClose } from "@/components/ui/sheet";
import { isCurrentPath, isNavigationItemCurrent } from "@/lib/navigation";
import type { StoreLink as StoreLinkType } from "@/lib/sazito/types";
import { cn } from "@/lib/utils";

const desktopLinkClassName =
  "shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-[13px] font-bold text-muted-foreground outline-none transition-[color,background-color,box-shadow] hover:bg-card hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";

function DesktopSubmenu({
  items,
  pathname,
  depth = 0,
}: {
  items: StoreLinkType[];
  pathname: string;
  depth?: number;
}) {
  return (
    <ul className={cn("grid gap-1", depth > 0 && "mr-3 mt-1 border-r border-border/70 pr-3")}>
      {items.map((item, index) => {
        const active = isNavigationItemCurrent(item, pathname);
        const current = !item.external && isCurrentPath(pathname, item.href);

        return (
          <li key={`${item.href}-${item.label}-${index}`}>
            <StoreLink
              item={item}
              current={current}
              className={cn(
                "flex min-h-10 items-center rounded-xl px-3 py-2 text-sm font-semibold outline-none transition-colors hover:bg-secondary hover:text-primary focus-visible:ring-2 focus-visible:ring-ring",
                active && "bg-secondary text-primary",
              )}
            />
            {item.children.length > 0 ? (
              <DesktopSubmenu items={item.children} pathname={pathname} depth={depth + 1} />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function DesktopNavigationItem({ item, pathname }: { item: StoreLinkType; pathname: string }) {
  const [open, setOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState<{
    top: number;
    right: number;
    width: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const submenuId = "desktop-submenu-" + useId().replaceAll(":", "");
  const active = isNavigationItemCurrent(item, pathname);
  const current = !item.external && isCurrentPath(pathname, item.href);

  useEffect(() => {
    if (!open) return;

    function updatePanelPosition() {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const width = Math.min(352, window.innerWidth - 32);
      const maximumRight = Math.max(16, window.innerWidth - width - 16);
      const triggerRight = window.innerWidth - rect.right;

      setPanelPosition({
        top: rect.bottom + 8,
        right: Math.min(Math.max(16, triggerRight), maximumRight),
        width,
      });
    }

    function closeOnOutsideClick(event: PointerEvent) {
      const target = event.target as Node;
      if (
        !containerRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    updatePanelPosition();
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("scroll", updatePanelPosition, true);
    window.addEventListener("resize", updatePanelPosition);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("scroll", updatePanelPosition, true);
      window.removeEventListener("resize", updatePanelPosition);
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, [open]);

  function cancelScheduledClose() {
    if (closeTimerRef.current === null) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }

  function scheduleClose() {
    cancelScheduledClose();
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 140);
  }

  function closeWithKeyboard() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  if (item.children.length === 0) {
    return (
      <StoreLink
        item={item}
        current={current}
        className={cn(desktopLinkClassName, active && "bg-card text-primary shadow-sm")}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative shrink-0"
      onMouseEnter={() => {
        cancelScheduledClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(event) => {
        const relatedTarget = event.relatedTarget as Node | null;
        if (
          !event.currentTarget.contains(relatedTarget) &&
          !panelRef.current?.contains(relatedTarget)
        ) {
          setOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") closeWithKeyboard();
      }}
    >
      <div
        className={cn(
          "flex items-center rounded-xl text-muted-foreground transition-[color,background-color,box-shadow] hover:bg-card hover:text-foreground",
          (active || open) && "bg-card text-primary shadow-sm",
        )}
      >
        <StoreLink
          item={item}
          current={current}
          className="whitespace-nowrap rounded-r-xl py-2 pr-3 pl-1 text-[13px] font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          ref={triggerRef}
          type="button"
          className="flex size-8 shrink-0 items-center justify-center rounded-l-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={"نمایش زیرمجموعه‌های " + item.label}
          aria-expanded={open}
          aria-controls={submenuId}
          onClick={() => setOpen((value) => !value)}
        >
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform duration-200",
              open && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
      </div>

      {open && panelPosition
        ? createPortal(
            <div
              ref={panelRef}
              id={submenuId}
              style={panelPosition}
              className="fixed z-[60] origin-top-right rounded-2xl border border-border/80 bg-card p-2.5 shadow-[0_24px_70px_-26px_rgba(31,42,36,0.45)]"
              onMouseEnter={cancelScheduledClose}
              onMouseLeave={scheduleClose}
              onBlurCapture={(event) => {
                const relatedTarget = event.relatedTarget as Node | null;
                if (
                  !containerRef.current?.contains(relatedTarget) &&
                  !event.currentTarget.contains(relatedTarget)
                ) {
                  setOpen(false);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") closeWithKeyboard();
              }}
            >
              <div className="mb-2 border-b border-border/70 px-3 py-2 text-xs font-bold text-muted-foreground">
                زیرمجموعه‌های {item.label}
              </div>
              <div className="max-h-[min(65vh,30rem)] overflow-y-auto overscroll-contain pl-1">
                <DesktopSubmenu items={item.children} pathname={pathname} />
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

export function DesktopNavigation({
  items,
  pathname,
}: {
  items: StoreLinkType[];
  pathname: string;
}) {
  return items.map((item, index) => (
    <DesktopNavigationItem
      key={`${pathname}-${item.href}-${item.label}-${index}`}
      item={item}
      pathname={pathname}
    />
  ));
}

function MobileNavigationItem({
  item,
  pathname,
  depth = 0,
}: {
  item: StoreLinkType;
  pathname: string;
  depth?: number;
}) {
  const active = isNavigationItemCurrent(item, pathname);
  const current = !item.external && isCurrentPath(pathname, item.href);
  const [open, setOpen] = useState(active);
  const submenuId = `mobile-submenu-${useId().replaceAll(":", "")}`;
  const hasChildren = item.children.length > 0;
  const linkClassName = cn(
    "min-w-0 flex-1 rounded-xl px-3 py-3 font-semibold outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
    active && "text-primary",
  );

  const destination = item.external ? (
    <a href={item.href} className={linkClassName} aria-current={current ? "page" : undefined}>
      {item.label}
    </a>
  ) : (
    <Link href={item.href} className={linkClassName} aria-current={current ? "page" : undefined}>
      {item.label}
    </Link>
  );

  return (
    <li>
      <div
        className={cn(
          "flex items-center gap-1 rounded-2xl transition-colors",
          active && "bg-accent text-accent-foreground",
        )}
        style={{ marginInlineStart: `${depth * 0.75}rem` }}
      >
        <SheetClose asChild>{destination}</SheetClose>
        {hasChildren ? (
          <button
            type="button"
            className="ml-1 flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground outline-none transition-colors hover:bg-card hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`نمایش زیرمجموعه‌های ${item.label}`}
            aria-expanded={open}
            aria-controls={submenuId}
            onClick={() => setOpen((value) => !value)}
          >
            <ChevronDown
              className={cn("size-4 transition-transform duration-200", open && "rotate-180")}
              aria-hidden="true"
            />
          </button>
        ) : null}
      </div>

      {hasChildren ? (
        <div
          id={submenuId}
          aria-hidden={!open}
          inert={!open}
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-200",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <ul className="mt-1 grid gap-1 border-r border-border/70 pr-2">
              {item.children.map((child, index) => (
                <MobileNavigationItem
                  key={`${child.href}-${child.label}-${index}`}
                  item={child}
                  pathname={pathname}
                  depth={depth + 1}
                />
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </li>
  );
}

export function MobileNavigation({
  items,
  pathname,
}: {
  items: StoreLinkType[];
  pathname: string;
}) {
  return items.map((item, index) => (
    <MobileNavigationItem
      key={`${pathname}-${item.href}-${item.label}-${index}`}
      item={item}
      pathname={pathname}
    />
  ));
}
