"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { useAuthStore } from "@/store/auth";
import type { UserRole } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Role → redirect target (non-recycler roles)
// ─────────────────────────────────────────────────────────────────────────────

function roleRedirect(role: UserRole): string {
  switch (role) {
    case "operator":       return "/operator/quick-log";
    case "company_admin":  return "/company/dashboard";
    case "platform_admin": return "/admin";
    default:               return "/recycler/dashboard";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Guard skeleton — shown while the auth check is in flight
// ─────────────────────────────────────────────────────────────────────────────

function GuardSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-4">
      <div className="h-6 w-44 animate-pulse rounded-lg bg-elevated" />
      <div className="h-4 w-72 animate-pulse rounded bg-elevated" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-surface border border-border" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="h-56 animate-pulse rounded-xl bg-surface border border-border lg:col-span-3" />
        <div className="h-56 animate-pulse rounded-xl bg-surface border border-border lg:col-span-2" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth guard layout
// Fetches current user once on mount; redirects if unauthenticated or wrong role.
// ─────────────────────────────────────────────────────────────────────────────

export default function RecyclerLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, fetchCurrentUser } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetchCurrentUser()
      .catch(() => {})
      .finally(() => setReady(true));
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace(
        `/auth/login?redirect=${encodeURIComponent("/recycler/dashboard")}`,
      );
      return;
    }
    if (user.role !== "recycler") {
      router.replace(roleRedirect(user.role));
    }
  }, [ready, user, router]);

  if (!ready || !user || user.role !== "recycler") {
    return (
      <AppShell>
        <GuardSkeleton />
      </AppShell>
    );
  }

  return <AppShell>{children}</AppShell>;
}
