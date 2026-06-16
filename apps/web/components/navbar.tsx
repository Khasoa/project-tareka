"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import type { UserRole } from "@/types";

import { Button } from "./button";
import { Logo } from "./logo";

const navLinkMarketing =
  "text-sm text-[color:var(--nav-chrome-muted)] transition-colors hover:text-nav-ink data-[active=true]:text-accent-sage-ink";
const navLinkApp =
  "text-sm text-muted transition-colors hover:text-foreground data-[active=true]:text-foreground";

function dashboardHref(role: UserRole): string {
  switch (role) {
    case "recycler":       return "/recycler/dashboard";
    case "operator":       return "/operator/quick-log";
    case "company_admin":  return "/company/dashboard";
    case "platform_admin": return "/admin";
    default:               return "/";
  }
}

function initialsFromName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function Navbar({
  variant = "marketing",
  marketingAudience = "general",
  className,
}: {
  variant?: "marketing" | "app";
  marketingAudience?: "general" | "companies";
  className?: string;
}) {
  const pathname = usePathname();
  const navLink = variant === "marketing" ? navLinkMarketing : navLinkApp;
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);

  const signedInMarketingExtras =
    user && variant === "marketing" ? (
      <Link
        href={dashboardHref(user.role)}
        className="flex max-w-[min(100%,14rem)] items-center gap-2 rounded-full border border-[rgba(232,237,234,0.10)] bg-[rgba(232,237,234,0.05)] py-1 pl-1 pr-2.5 transition-colors hover:border-[rgba(232,237,234,0.16)]"
      >
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-[#0F1011] text-[10px] font-semibold uppercase tracking-tight text-nav-ink"
          aria-hidden
        >
          {initialsFromName(user.fullName)}
        </span>
        <span className="hidden min-w-0 truncate text-xs font-medium text-[#E6E8E3] sm:inline">
          {user.fullName}
        </span>
      </Link>
    ) : null;

  return (
    /*
     * nav-chrome-fixed class is defined in globals.css and hard-locks the
     * background to rgba(17,17,17,0.95) so the nav stays graphite even when
     * floating over .theme-light parchment sections.
     */
    <header
      className={cn(
        "nav-chrome-fixed sticky top-0 z-50 border-b border-nav-line backdrop-blur-md",
        "bg-nav-chrome/95 text-nav-ink",
        variant === "app" && "border-border bg-background/80 text-foreground",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-8">
          {/* Logo always links to home — including on for-companies */}
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

          {variant === "marketing" && marketingAudience === "companies" ? (
            <>
              {signedInMarketingExtras}
              <Link
                href="/company/login"
                className="hidden text-sm text-nav-muted transition-colors hover:text-nav-ink sm:block"
              >
                {t("nav.companyLogin")}
              </Link>
              <Button href="/company/request-access" variant="primary" size="sm">
                {t("nav.requestCompanyAccess")}
              </Button>
            </>
          ) : variant === "marketing" ? (
            <>
              {signedInMarketingExtras}
              {user ? (
                <Button href={dashboardHref(user.role)} variant="secondary" size="sm">
                  {t("nav.dashboard")}
                </Button>
              ) : (
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
              )}
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
        <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  );
}