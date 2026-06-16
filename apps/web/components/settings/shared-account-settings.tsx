"use client";

import { Button } from "@/components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useThemeMode } from "@/hooks/useThemeMode";
import type { User } from "@/types";

export function formatRole(raw: string): string {
  const map: Record<string, string> = {
    recycler:       "Recycler",
    operator:       "Operator",
    company_admin:  "Company Admin",
    platform_admin: "Platform Admin",
  };
  return map[raw] ?? raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function SettingsProfileCard({ user, loading }: { user: User | null; loading: boolean }) {
  return (
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
  );
}

function ThemeButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
        active
          ? // accent-sage-ink resolves to #3F6B3A on light (legible ~5.3:1) and
            // #A1C998 on dark — correct in both shells
            "border-accent-sage/50 bg-[rgba(161,201,152,0.10)] text-foreground"
          : "border-border text-muted hover:bg-elevated hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

export function SettingsAppearanceCard() {
  const { theme, setDarkMode, setLightMode } = useThemeMode();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Appearance</CardTitle>
        <CardDescription>
          Light mode uses a warm off-white surface. Dark mode uses deep charcoal.
        </CardDescription>
      </CardHeader>
      <div className="flex flex-wrap items-center gap-2">
        <ThemeButton active={theme === "light"} onClick={setLightMode} label="Light" />
        <ThemeButton active={theme === "dark"}  onClick={setDarkMode}  label="Dark"  />
        <LanguageSwitcher variant="app" className="sm:ml-2" />
      </div>
    </Card>
  );
}

export function SettingsSessionCard({
  loading,
  onSignOut,
}: {
  loading: boolean;
  onSignOut: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Session</CardTitle>
        <CardDescription>Ends your current browser session.</CardDescription>
      </CardHeader>
      <Button type="button" variant="secondary" onClick={onSignOut} disabled={loading}>
        Sign out
      </Button>
    </Card>
  );
}