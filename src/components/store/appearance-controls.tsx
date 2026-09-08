"use client";

import * as React from "react";
import { Laptop, Moon, RotateCcw, Sun, Type, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type AppearanceSnapshot = {
  theme: "light" | "dark" | "system";
  fontScale: number;
  fontFamily: "estedad" | "vazirmatn" | "noto";
};

const defaultSnapshot: AppearanceSnapshot = {
  theme: "system",
  fontScale: 100,
  fontFamily: "estedad",
};
let clientSnapshot: AppearanceSnapshot | null = null;
const listeners = new Set<() => void>();

function readCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")[1];
}

function readSnapshot() {
  if (typeof window === "undefined") return defaultSnapshot;
  if (!clientSnapshot) {
    const storedScale = Number(readCookie("sazito-font-scale"));
    const storedTheme = readCookie("sazito-theme");
    const storedFamily = readCookie("sazito-font-family");
    clientSnapshot = {
      theme: storedTheme === "light" || storedTheme === "dark" ? storedTheme : "system",
      fontScale: storedScale >= 85 && storedScale <= 125 ? storedScale : 100,
      fontFamily:
        storedFamily === "vazirmatn" || storedFamily === "noto"
          ? storedFamily
          : "estedad",
    };
    applySnapshot(clientSnapshot);
  }
  return clientSnapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => {
    if (clientSnapshot) applySnapshot(clientSnapshot);
    listener();
  };
  media.addEventListener("change", handleChange);
  return () => {
    media.removeEventListener("change", handleChange);
    listeners.delete(listener);
  };
}

function applySnapshot(snapshot: AppearanceSnapshot) {
  const root = document.documentElement;
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  root.dataset.theme = snapshot.theme === "system" ? systemTheme : snapshot.theme;
  root.dataset.themePreference = snapshot.theme;
  root.style.fontSize = `${snapshot.fontScale}%`;
  root.style.setProperty(
    "--font-ui",
    snapshot.fontFamily === "vazirmatn"
      ? "Vazirmatn, sans-serif"
      : snapshot.fontFamily === "noto"
        ? "Noto Sans Arabic, sans-serif"
        : "var(--font-estedad), sans-serif",
  );
}

function updateSnapshot(patch: Partial<AppearanceSnapshot>) {
  const current = readSnapshot();
  clientSnapshot = { ...current, ...patch };
  document.cookie = `sazito-theme=${clientSnapshot.theme}; path=/; max-age=31536000; samesite=lax`;
  document.cookie = `sazito-font-scale=${clientSnapshot.fontScale}; path=/; max-age=31536000; samesite=lax`;
  document.cookie = `sazito-font-family=${clientSnapshot.fontFamily}; path=/; max-age=31536000; samesite=lax`;
  applySnapshot(clientSnapshot);
  listeners.forEach((listener) => listener());
}

function useAppearance() {
  return React.useSyncExternalStore(subscribe, readSnapshot, () => defaultSnapshot);
}

export function AppearanceControls() {
  const appearance = useAppearance();
  const controlsRef = React.useRef<HTMLDetailsElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const controls = controlsRef.current;
      if (controls?.open && event.target instanceof Node && !controls.contains(event.target)) {
        controls.open = false;
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      const controls = controlsRef.current;
      if (event.key === "Escape" && controls?.open) {
        controls.open = false;
        controls.querySelector<HTMLElement>("summary")?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <details
      ref={controlsRef}
      className="relative"
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-sm outline-none transition-colors hover:border-primary/40 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        <Type className="size-4" aria-hidden="true" />
        <span className="sr-only">تنظیمات نمایش</span>
      </summary>
      <div
        key={isOpen ? "appearance-open" : "appearance-closed"}
        className="appearance-panel absolute left-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card p-4 text-foreground shadow-xl"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-black">تنظیمات نمایش</p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg"
            onClick={() => {
              controlsRef.current!.open = false;
              controlsRef.current?.querySelector<HTMLElement>("summary")?.focus();
            }}
            aria-label="بستن تنظیمات نمایش"
            title="بستن"
          >
            <X />
          </Button>
        </div>
        <div className="mt-4 grid gap-2">
          <p className="text-xs font-bold text-muted-foreground">رنگ زمینه</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button
              type="button"
              size="sm"
              variant={appearance.theme === "light" ? "secondary" : "outline"}
              onClick={() => updateSnapshot({ theme: "light" })}
              aria-pressed={appearance.theme === "light"}
              className="min-w-0 justify-center px-2 text-xs"
            >
              <Sun />
              روشن
            </Button>
            <Button
              type="button"
              size="sm"
              variant={appearance.theme === "dark" ? "secondary" : "outline"}
              onClick={() => updateSnapshot({ theme: "dark" })}
              aria-pressed={appearance.theme === "dark"}
              className="min-w-0 justify-center px-2 text-xs"
            >
              <Moon />
              تیره
            </Button>
            <Button
              type="button"
              size="sm"
              variant={appearance.theme === "system" ? "secondary" : "outline"}
              onClick={() => updateSnapshot({ theme: "system" })}
              aria-pressed={appearance.theme === "system"}
              className="min-w-0 justify-center px-2 text-xs"
            >
              <Laptop />
              سیستم
            </Button>
          </div>
        </div>
        <div className="mt-4 grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold text-muted-foreground">اندازه نوشته</p>
            <div className="flex items-center gap-1">
              <output className="text-xs font-black text-primary">{appearance.fontScale}%</output>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 rounded-lg"
                onClick={() => updateSnapshot({ fontScale: 100 })}
                disabled={appearance.fontScale === 100}
                aria-label="بازنشانی اندازه نوشته"
                title="بازنشانی اندازه نوشته"
              >
                <RotateCcw />
              </Button>
            </div>
          </div>
          <input
            type="range"
            min="85"
            max="125"
            step="5"
            value={appearance.fontScale}
            onChange={(event) => updateSnapshot({ fontScale: Number(event.target.value) })}
            aria-label="اندازه نوشته"
            className="h-2 w-full cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[11px] text-muted-foreground" aria-hidden="true">
            <span>کوچک</span>
            <span>بزرگ</span>
          </div>
        </div>
        <div className="mt-4 grid gap-2">
          <p className="text-xs font-bold text-muted-foreground">نوع قلم</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {([
              ["estedad", "استعداد"],
              ["vazirmatn", "وزیرمتن"],
              ["noto", "نوتو عربی"],
            ] as const).map(([value, label]) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={appearance.fontFamily === value ? "secondary" : "outline"}
                onClick={() => updateSnapshot({ fontFamily: value })}
                aria-pressed={appearance.fontFamily === value}
                className="min-w-0 justify-center px-2 text-xs"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-3 w-full"
          onClick={() => updateSnapshot(defaultSnapshot)}
        >
          <RotateCcw />
          بازنشانی تنظیمات
        </Button>
      </div>
    </details>
  );
}
