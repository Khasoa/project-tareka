"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { cn } from "@/lib/utils";

import { Button } from "./button";
import { Logo } from "./logo";

const navLinkMarketing =
  "text-sm text-[color:var(--nav-chrome-muted)] transition-colors hover:text-nav-ink data-[active=true]:text-accent-sage";
const navLinkApp =
  "text-sm text-muted transition-colors hover:text-foreground data-[active=true]:text-foreground";

export function Navbar({
  variant = "marketing",
  className,
}: {
  variant?: "marketing" | "app";
  className?: string;
}) {
  const pathname = usePathname();
  const navLink = variant === "marketing" ? navLinkMarketing : navLinkApp;
  const { t } = useI18n();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-nav-line bg-nav-chrome/95 text-nav-ink backdrop-blur-md",
        variant === "app" && "border-border bg-background/80 text-foreground",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-8">
          <Logo href="/" variant="chrome" />
          {variant === "marketing" ? (
            <nav className="hidden min-w-0 items-center gap-4 md:flex lg:gap-6" aria-label="Primary">
              <Link href="/network" className={navLink} data-active={pathname === "/network"}>
                {t("nav.networkImpact")}
              </Link>
              <Link href="/directory" className={navLink} data-active={pathname === "/directory"}>
                {t("nav.directory")}
              </Link>
              <Link href="/marketplace" className={navLink} data-active={pathname.startsWith("/marketplace")}>
                {t("nav.marketplace")}
              </Link>
              <Link href="/for-companies" className={navLink} data-active={pathname === "/for-companies"}>
                {t("nav.forCompanies")}
              </Link>
            </nav>
          ) : (
            <nav className="hidden items-center gap-6 md:flex" aria-label="App">
              <Link href="/recycler/dashboard" className={navLink} data-active={pathname.startsWith("/recycler")}>
                {t("nav.dashboard")}
              </Link>
              <Link href="/directory" className={navLink} data-active={pathname === "/directory"}>
                {t("nav.directory")}
              </Link>
              <Link href="/marketplace" className={navLink} data-active={pathname.startsWith("/marketplace")}>
                {t("nav.marketplace")}
              </Link>
            </nav>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitcher variant={variant === "marketing" ? "marketing" : "app"} />
          {variant === "marketing" ? (
            <>
              <Link
                href="/auth/login"
                className="hidden text-sm text-nav-muted transition-colors hover:text-nav-ink sm:block"
              >
                {t("nav.signIn")}
              </Link>
              <Button href="/auth/register" variant="primary" size="sm">
                {t("cta.startRecycling")}
              </Button>
            </>
          ) : (
            <Button href="/" variant="secondary" size="sm">
              {t("nav.home")}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

/** Lightweight mobile drawer trigger — placeholder for future mobile nav. */
export function MobileMenuButton({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      aria-label={t("nav.openMenu")}
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
