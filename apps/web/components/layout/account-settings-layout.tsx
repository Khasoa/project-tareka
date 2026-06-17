"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { loginRedirectUrl, roleHomeRoute } from "@/lib/auth-routing";
import { useAuthStore } from "@/store/auth";

function GuardSkeleton() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="mx-auto h-4 w-48 animate-pulse rounded bg-elevated" />
    </div>
  );
}

const ACCOUNT_SETTINGS_ROLES = new Set(["recycler", "operator"]);

export function AccountSettingsLayout({ children }: { children: ReactNode }) {
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
      router.replace(loginRedirectUrl("/settings"));
      return;
    }
    if (!ACCOUNT_SETTINGS_ROLES.has(user.role)) {
      router.replace(roleHomeRoute(user.role));
    }
  }, [ready, user, router]);

  if (!ready || !user || !ACCOUNT_SETTINGS_ROLES.has(user.role)) {
    return (
      <AppShell>
        <GuardSkeleton />
      </AppShell>
    );
  }

  return <AppShell>{children}</AppShell>;
}
