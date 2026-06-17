"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { loginRedirectUrl, roleHomeRoute } from "@/lib/auth-routing";
import { useAuthStore } from "@/store/auth";

function GuardSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-4">
      <div className="h-6 w-44 animate-pulse rounded-lg bg-elevated" />
      <div className="h-4 w-72 animate-pulse rounded bg-elevated" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl border border-border bg-surface" />
        ))}
      </div>
    </div>
  );
}

export function RecyclerGuardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, fetchCurrentUser } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void fetchCurrentUser()
      .catch(() => {})
      .finally(() => setReady(true));
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace(loginRedirectUrl("/dashboard"));
      return;
    }
    if (user.role !== "recycler") {
      router.replace(roleHomeRoute(user.role));
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
