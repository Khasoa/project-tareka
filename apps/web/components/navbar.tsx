"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { useThemeMode } from "@/hooks/useThemeMode";

import { Button } from "./button";
import { Logo } from "./logo";

const navLink =
  "text-sm text-nav-ink/80 transition hover:text-nav-ink data-[active=true]:text-accent-cyan";

export function Navbar({
  variant = "marketing",
  className,
}: {
  variant?: "marketing" | "app";
  className?: string;
}) {
  const pathname = usePathname();
  const { theme, setDarkMode, setHybridMode, setLightMode } = useThemeMode();

  const chrome = "border-b border-border bg-nav-chrome text-nav-ink";

  return (
    <header className={cn(chrome, className)}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo href="/" tone="chrome" />
          {variant === "marketing" ? (
            <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
              <Link href="/directory" className={navLink} data-active={pathname === "/directory"}>
                Directory
              </Link>
              <Link href="/dashboard" className={navLink} data-active={pathname === "/dashboard"}>
                Dashboard
              </Link>
            </nav>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <div
            className="mr-2 hidden items-center rounded-md border border-border bg-nav-chrome p-0.5 sm:flex"
            role="group"
            aria-label="Theme"
          >
            <ThemeChip active={theme === "dark"} onClick={setDarkMode} label="Dark" />
            <ThemeChip active={theme === "hybrid"} onClick={setHybridMode} label="Hybrid" />
            <ThemeChip active={theme === "light"} onClick={setLightMode} label="Light" />
          </div>
          <Button
            href={variant === "app" ? "/" : "/dashboard"}
            variant="secondary"
            size="sm"
            className="border-nav-chrome/30 bg-transparent text-nav-ink hover:bg-nav-chrome/80"
          >
            {variant === "app" ? "Marketing" : "Open app"}
          </Button>
        </div>
      </div>
    </header>
  );
}

function ThemeChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded px-2 py-1 text-xs font-medium text-nav-ink/70",
        active && "bg-accent-cyan/20 text-accent-cyan",
      )}
    >
      {label}
    </button>
  );
}
