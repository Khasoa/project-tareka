"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { useAuthStore } from "@/store/auth";
import type { UserRole } from "@/types";

function roleHome(role: UserRole): string {
  switch (role) {
    case "recycler":
      return "/recycler/dashboard";
    case "operator":
      return "/operator/quick-log";
    case "company_admin":
      return "/company/dashboard";
    case "platform_admin":
      return "/admin";
    default:
      return "/recycler/dashboard";
  }
}

function GuardSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-1 py-3">
      <div className="h-14 w-full animate-pulse rounded-lg bg-surface/80" />
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl border border-border bg-surface" />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-xl border border-border bg-surface" />
    </div>
  );
}

export default function OperatorLayout({ children }: { children: ReactNode }) {
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
      router.replace(`/auth/login?redirect=${encodeURIComponent("/operator/quick-log")}`);
      return;
    }
    if (user.role !== "operator") {
      router.replace(roleHome(user.role));
    }
  }, [ready, user, router]);

  if (!ready || !user || user.role !== "operator") {
    return (
      <AppShell>
        <GuardSkeleton />
      </AppShell>
    );
  }

  return <AppShell>{children}</AppShell>;
}
