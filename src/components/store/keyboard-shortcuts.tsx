"use client";

import * as React from "react";
import { Keyboard } from "lucide-react";
import { useRouter } from "next/navigation";

type Shortcut = {
  action: "search" | "home" | "cart" | "orders" | "bookings" | "addresses" | "profile" | "help";
  keys: string;
  label: string;
};

const shortcuts: Shortcut[] = [
  { action: "search", keys: "/  or  Ctrl/Cmd + K", label: "باز کردن جست‌وجو" },
  { action: "home", keys: "G → H", label: "رفتن به صفحه اصلی" },
  { action: "cart", keys: "G → C", label: "باز کردن سبد خرید" },
  { action: "orders", keys: "G → O", label: "رفتن به سفارش‌ها" },
  { action: "bookings", keys: "G → R", label: "رفتن به رزروها" },
  { action: "addresses", keys: "G → A", label: "رفتن به نشانی‌ها" },
  { action: "profile", keys: "G → P", label: "رفتن به پروفایل" },
  { action: "help", keys: "?", label: "نمایش میان‌برها" },
];

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

export function KeyboardShortcuts() {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = React.useState(false);
  const pendingKey = React.useRef(false);
  const pendingTimer = React.useRef<number | null>(null);

  const runShortcut = React.useCallback((action: Shortcut["action"]) => {
    const routes: Partial<Record<Shortcut["action"], string>> = {
      home: "/",
      orders: "/account/orders",
      bookings: "/account/bookings",
      addresses: "/account/addresses",
      profile: "/account/profile",
    };

    if (action === "search") {
      window.dispatchEvent(new Event("sazito:open-search"));
    } else if (action === "cart") {
      window.dispatchEvent(new Event("sazito:open-cart"));
    } else if (action === "help") {
      setHelpOpen(true);
    } else if (routes[action]) {
      router.push(routes[action]!);
    }
  }, [router]);

  React.useEffect(() => {
    const clearPending = () => {
      pendingKey.current = false;
      if (pendingTimer.current !== null) {
        window.clearTimeout(pendingTimer.current);
        pendingTimer.current = null;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHelpOpen(false);
        clearPending();
        return;
      }

      if (isEditableTarget(event.target)) return;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        runShortcut("search");
        clearPending();
        return;
      }

      if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key === "/") {
        event.preventDefault();
        runShortcut("search");
        clearPending();
        return;
      }

      if (pendingKey.current) {
        const actions: Record<string, Shortcut["action"]> = {
          h: "home",
          o: "orders",
          r: "bookings",
          a: "addresses",
          p: "profile",
        };
        const key = event.key.toLowerCase();

        if (key === "c") {
          event.preventDefault();
          runShortcut("cart");
        } else if (actions[key]) {
          event.preventDefault();
          runShortcut(actions[key]);
        } else if (key === "s") {
          event.preventDefault();
          runShortcut("search");
        }

        clearPending();
        return;
      }

      if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key.toLowerCase() === "g") {
        event.preventDefault();
        pendingKey.current = true;
        pendingTimer.current = window.setTimeout(clearPending, 900);
        return;
      }

      if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key === "?") {
        event.preventDefault();
        setHelpOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      clearPending();
    };
  }, [runShortcut]);

  React.useEffect(() => {
    const openHelp = () => setHelpOpen(true);
    window.addEventListener("sazito:open-shortcuts", openHelp);
    return () => window.removeEventListener("sazito:open-shortcuts", openHelp);
  }, []);

  if (!helpOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-foreground/25 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={() => setHelpOpen(false)}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="keyboard-shortcuts-title"
        className="w-full max-w-md rounded-3xl border border-border bg-card p-5 text-card-foreground shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-primary">دسترسی سریع</p>
            <h2 id="keyboard-shortcuts-title" className="mt-1 text-xl font-black">میان‌برهای صفحه‌کلید</h2>
          </div>
          <button
            type="button"
            onClick={() => setHelpOpen(false)}
            className="rounded-xl px-3 py-1.5 text-sm font-bold text-muted-foreground outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="بستن میان‌برها"
          >
            Esc
          </button>
        </div>
        <ul className="mt-5 divide-y divide-border/70 rounded-2xl border border-border/70 bg-background/45 px-2">
          {shortcuts.map((shortcut) => (
            <li key={shortcut.keys}>
              <button
                type="button"
                onClick={() => {
                  runShortcut(shortcut.action);
                  if (shortcut.action !== "help") setHelpOpen(false);
                }}
                className="flex w-full items-center justify-between gap-4 rounded-xl px-2 py-3 text-right text-sm outline-none transition-colors hover:bg-secondary/65 focus-visible:bg-secondary/65 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-muted-foreground">{shortcut.label}</span>
                <kbd dir="ltr" className="rounded-lg bg-secondary px-2 py-1 text-xs font-bold text-secondary-foreground">
                {shortcut.keys}
                </kbd>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function ShortcutButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("sazito:open-shortcuts"))}
      aria-label="نمایش میان‌برهای صفحه‌کلید"
      aria-keyshortcuts="?"
      className="hidden size-9 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-sm outline-none transition-colors hover:border-primary/40 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring lg:inline-flex lg:size-10"
    >
      <Keyboard className="size-4.5" />
    </button>
  );
}
