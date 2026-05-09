"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useThemeMode } from "@/hooks/useThemeMode";
import { useAuthStore } from "@/store/auth";

import { SatsParticipationCard } from "./sats-participation-card";

function formatRole(raw: string): string {
  const map: Record<string, string> = {
    recycler: "Recycler",
    operator: "Operator",
    company_admin: "Company Admin",
    platform_admin: "Platform Admin",
  };
  return map[raw] ?? raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function RecyclerSettingsPage() {
  const router = useRouter();
  const { user, loading, fetchCurrentUser, logout } = useAuthStore();
  const { theme, setDarkMode, setLightMode } = useThemeMode();

  useEffect(() => {
    void fetchCurrentUser();
  }, [fetchCurrentUser]);

  async function handleSignOut() {
    try { await logout(); } catch { /* ignore */ }
    router.replace("/auth/login");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 py-2">
      <div>
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.10em] text-accent-sage">
          Account
        </p>
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-0.5 text-sm text-dim">Profile, appearance, and session.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Information from your authenticated session.</CardDescription>
        </CardHeader>
        {loading && !user ? (
          <div className="h-20 animate-pulse rounded bg-elevated" />
        ) : user ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Name</dt>
              <dd className="text-foreground">{user.fullName}</dd>
            </div>
            <div>
              <dt className="text-muted">Role</dt>
              <dd className="text-foreground">{formatRole(user.role)}</dd>
            </div>
            <div>
              <dt className="text-muted">Language</dt>
              <dd className="uppercase text-foreground">{user.language}</dd>
            </div>
            <div>
              <dt className="text-muted">Verification</dt>
              <dd className="text-foreground">{user.isVerified ? "Verified" : "Pending"}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-dim">You are not signed in.</p>
        )}
      </Card>

      {/* Optional Bitcoin Lightning / participation sats placeholders */}
      {user?.role === "recycler" ? <SatsParticipationCard /> : null}

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>
            Light mode uses a warm off-white surface. Dark mode uses deep charcoal.
          </CardDescription>
        </CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <ThemeButton active={theme === "light"} onClick={setLightMode} label="Light" />
          <ThemeButton active={theme === "dark"} onClick={setDarkMode} label="Dark" />
          <LanguageSwitcher variant="app" className="sm:ml-2" />
        </div>
      </Card>

      {/* Session */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session</CardTitle>
          <CardDescription>Ends your current browser session.</CardDescription>
        </CardHeader>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void handleSignOut()}
          disabled={loading}
        >
          Sign out
        </Button>
      </Card>
    </div>
  );
}

function ThemeButton({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-accent-sage/50 bg-accent-sage/10 text-foreground"
          : "border-border text-muted hover:bg-elevated hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
