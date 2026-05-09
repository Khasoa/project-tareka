"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useI18n } from "@/lib/i18n/i18n-provider";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import type { UserRole } from "@/types";

type NavItem = { href: string; labelKey: string };

function linksForRole(role: UserRole | undefined): readonly NavItem[] {
  switch (role) {
    case "operator":
      return [
        { href: "/operator/quick-log", labelKey: "dashboard.nav.quickLog" },
        { href: "/directory", labelKey: "dashboard.nav.directory" },
        { href: "/settings", labelKey: "dashboard.nav.settings" },
      ] as const;
    case "company_admin":
      return [
        { href: "/company/dashboard", labelKey: "dashboard.nav.overview" },
        { href: "/directory", labelKey: "dashboard.nav.directory" },
        { href: "/settings", labelKey: "dashboard.nav.settings" },
      ] as const;
    case "platform_admin":
      return [
        { href: "/admin", labelKey: "dashboard.nav.networkOps" },
        { href: "/company/dashboard", labelKey: "dashboard.nav.orgWorkspace" },
        { href: "/directory", labelKey: "dashboard.nav.directory" },
        { href: "/settings", labelKey: "dashboard.nav.settings" },
      ] as const;
    default:
      return [
        { href: "/recycler/dashboard", labelKey: "dashboard.nav.home" },
        { href: "/recycler/dashboard", labelKey: "dashboard.nav.dashboard" },
        { href: "/directory", labelKey: "dashboard.nav.directory" },
        { href: "/marketplace", labelKey: "nav.marketplace" },
        { href: "/recycler/wallet", labelKey: "dashboard.nav.wallet" },
        { href: "/recycler/history", labelKey: "dashboard.nav.history" },
        { href: "/recycler/settings", labelKey: "dashboard.nav.settings" },
      ] as const;
  }
}

function isActive(pathname: string, href: string, role: UserRole | undefined): boolean {
  if (href === "/recycler/dashboard") {
    return pathname === "/recycler/dashboard";
  }
  if (href === "/marketplace") {
    return pathname === "/marketplace" || pathname.startsWith("/marketplace/");
  }
  if (href === "/company/dashboard" || href === "/operator/quick-log") {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  if (href === "/admin") {
    return pathname === "/admin" || pathname.startsWith("/admin/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const links = linksForRole(user?.role);
  const { t } = useI18n();

  return (
    <aside
      className={cn(
        "hidden w-52 shrink-0 border-r border-nav-line bg-nav-chrome md:flex md:flex-col",
        className,
      )}
    >
      <nav className="flex flex-1 flex-col gap-0.5 px-2 py-3" aria-label="App navigation">
        {links.map((link, idx) => {
          const active = isActive(pathname, link.href, user?.role);
          const label = t(link.labelKey);
          const key = `${link.href}-${label}-${idx}`;

          return (
            <Link
              key={key}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm transition-colors",
                "text-[color:var(--nav-chrome-muted)] hover:bg-white/[0.06] hover:text-nav-ink",
                active && "bg-accent-sage/15 font-medium text-nav-ink",
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
