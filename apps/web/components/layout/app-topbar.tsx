"use client";

import { useRouter } from "next/navigation";

import { BrandMark } from "@/components/logo";
import { useAuthStore } from "@/store/auth";

// ─────────────────────────────────────────────────────────────────────────────
// App topbar — used inside AppShell (authenticated screens).
//
// The tareka. logo is intentionally NOT a link here; inside the dashboard
// shell it functions as brand identity only.  Navigation is handled by the
// sidebar.
// ─────────────────────────────────────────────────────────────────────────────

export function AppTopbar() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  async function handleSignOut() {
    try {
      await logout();
    } catch {
      /* ignore */
    }
    const dest = user?.role === "company_admin" ? "/auth/company/login" : "/auth/login";
    router.replace(dest);
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-nav-line bg-nav-chrome px-4 sm:px-6">
      {/* Brand identity — not navigable inside app shell */}
      <BrandMark className="text-base select-none" />

      {/* Sign out */}
      <button
        type="button"
        onClick={handleSignOut}
        className="rounded-lg border border-nav-line px-3 py-1.5 text-sm text-[color:var(--nav-chrome-muted)] transition-colors hover:border-accent-sage/35 hover:text-nav-ink"
      >
        Sign out
      </button>
    </header>
  );
}
