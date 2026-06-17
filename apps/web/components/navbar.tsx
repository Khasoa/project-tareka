"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LanguageSwitcher } from "@/components/language-switcher";
import { roleHomeRoute } from "@/lib/auth-routing";
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
  return roleHomeRoute(role);
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
        <span className="truncate text-xs font-medium text-nav-ink">{user.fullName}</span>
      </Link>
    ) : null;

  return (
    <header
      className={cn(
        "nav-chrome-fixed sticky top-0 z-50 border-b border-nav-line bg-nav-chrome/95 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Logo href="/" variant="chrome" />
          <nav className="hidden items-center gap-5 md:flex" aria-label="Primary">
            {variant === "marketing" ? (
              <>
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
              </>
            ) : (
              <>
                <Link href="/dashboard" className={navLink} data-active={pathname === "/dashboard"}>
                  {t("nav.dashboard")}
                </Link>
                <Link href="/directory" className={navLink} data-active={pathname === "/directory"}>
                  {t("nav.directory")}
                </Link>
                <Link href="/marketplace" className={navLink} data-active={pathname.startsWith("/marketplace")}>
                  {t("nav.marketplace")}
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitcher variant="marketing" />
          {signedInMarketingExtras}
          {marketingAudience === "companies" ? (
            <>
              <Button
                href="/company/login"
                variant="secondary"
                size="sm"
                className="hidden sm:inline-flex"
              >
                {t("nav.companyLogin")}
              </Button>
              <Button href="/company/request-access" variant="primary" size="sm">
                {t("nav.requestCompanyAccess")}
              </Button>
            </>
          ) : user ? (
            <>
              {variant === "marketing" ? null : (
                <Button href={dashboardHref(user.role)} variant="secondary" size="sm">
                  {t("nav.dashboard")}
                </Button>
              )}
            </>
          ) : (
            <Button
              href="/auth/login"
              variant="secondary"
              size="sm"
              className="hidden sm:inline-flex"
            >
              {t("nav.signIn")}
            </Button>
          )}
          {marketingAudience === "companies" ? null : (
            <Button href="/" variant="secondary" size="sm" className="md:hidden">
              {t("nav.home")}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
