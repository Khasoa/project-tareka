"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { settingsPathForRole } from "@/lib/settings-routes";
import { useAuthStore } from "@/store/auth";

export default function LegacySettingsRedirectPage() {
  const router = useRouter();
  const { user, fetchCurrentUser } = useAuthStore();
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    void fetchCurrentUser().finally(() => setResolved(true));
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (!resolved) return;
    if (!user) {
      router.replace(`/auth/login?redirect=${encodeURIComponent("/settings")}`);
      return;
    }
    router.replace(settingsPathForRole(user.role));
  }, [resolved, user, router]);

  return (
    <AppShell>
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-sm text-dim">Opening your workspace settings…</p>
      </div>
    </AppShell>
  );
}
