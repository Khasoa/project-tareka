"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { Button } from "./button";
import { Logo } from "./logo";

const navLink =
  "text-sm text-muted transition-colors hover:text-foreground data-[active=true]:text-foreground";

export function Navbar({
  variant = "marketing",
  className,
}: {
  variant?: "marketing" | "app";
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo href="/" />
          {variant === "marketing" ? (
            <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
              <Link href="/directory" className={navLink} data-active={pathname === "/directory"}>
                Directory
              </Link>
              <Link href="/companies" className={navLink} data-active={pathname === "/companies"}>
                For companies
              </Link>
            </nav>
          ) : (
            <nav className="hidden items-center gap-6 md:flex" aria-label="App">
              <Link href="/dashboard" className={navLink} data-active={pathname === "/dashboard"}>
                Dashboard
              </Link>
              <Link href="/directory" className={navLink} data-active={pathname === "/directory"}>
                Directory
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {variant === "marketing" ? (
            <>
              <Link
                href="/sign-in"
                className="hidden text-sm text-muted transition-colors hover:text-foreground sm:block"
              >
                Sign in
              </Link>
              <Button href="/dashboard" variant="primary" size="sm">
                Start recycling smarter
              </Button>
            </>
          ) : (
            <Button href="/" variant="secondary" size="sm">
              Home
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

/** Lightweight mobile drawer trigger — placeholder for future mobile nav. */
export function MobileMenuButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      aria-label="Open menu"
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted hover:text-foreground md:hidden",
        className,
      )}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M2 4h12M2 8h12M2 12h12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
