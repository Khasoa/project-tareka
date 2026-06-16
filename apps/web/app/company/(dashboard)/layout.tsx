"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Button } from "@/components/button";
import { ErrorState } from "@/components/error-state";
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
    <div className="mx-auto max-w-5xl space-y-4 px-1 py-3">
      <div className="h-16 w-2/3 animate-pulse rounded-lg bg-surface/80" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-border bg-surface" />
        ))}
      </div>
    </div>
  );
}

export default function CompanyDashboardLayout({ children }: { children: ReactNode }) {
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
      router.replace(`/company/login?redirect=${encodeURIComponent("/company/dashboard")}`);
    }
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <AppShell>
        <GuardSkeleton />
      </AppShell>
    );
  }

  if (user.role !== "company_admin" && user.role !== "platform_admin") {
    const home = roleHome(user.role);
    return (
      <AppShell>
        <div className="mx-auto max-w-lg py-4">
          <ErrorState
            title="Access restricted"
            message="This operational workspace is for organization administrators. Your account uses a different console."
          />
          <div className="mt-4 flex justify-center">
            <Button href={home} variant="secondary" size="sm">
              Open your workspace
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Suspense fallback={<GuardSkeleton />}>{children}</Suspense>
    </AppShell>
  );
}
