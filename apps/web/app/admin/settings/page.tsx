"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  SettingsAppearanceCard,
  SettingsProfileCard,
  SettingsSessionCard,
} from "@/components/settings/shared-account-settings";
import { signOutDestination } from "@/lib/auth-routing";
import { useAuthStore } from "@/store/auth";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, loading, fetchCurrentUser, logout } = useAuthStore();

  useEffect(() => {
    void fetchCurrentUser();
  }, [fetchCurrentUser]);

  async function handleSignOut() {
    const role = user?.role;
    try {
      await logout();
    } catch {
      /* ignore */
    }
    router.replace(signOutDestination(role));
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 py-2">
      <header>
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.10em] text-accent-sage-ink">
          Platform
        </p>
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
          Administrator settings
        </h1>
        <p className="mt-0.5 text-sm text-dim">
          Session, appearance, and language for platform operations.
        </p>
      </header>

      <SettingsProfileCard user={user} loading={loading} />
      <SettingsAppearanceCard />
      <SettingsSessionCard loading={loading} onSignOut={() => void handleSignOut()} />
    </div>
  );
}
