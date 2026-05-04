"use client";

import { useEffect } from "react";

import { Button } from "@/components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { useThemeMode } from "@/hooks/useThemeMode";
import { useAuthStore } from "@/store/auth";

export default function SettingsPage() {
  const { user, loading, fetchCurrentUser, logout } = useAuthStore();
  const { theme, setDarkMode, setHybridMode, setLightMode } = useThemeMode();

  useEffect(() => {
    void fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-muted">Profile, appearance, and session.</p>
      </div>

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
              <dd className="text-foreground">{user.role.replace(/_/g, " ")}</dd>
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
          <p className="text-sm text-muted">You are not signed in.</p>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>
            Dark is default. Hybrid keeps navigation dark while content uses a light surface.
          </CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          <ThemeButton active={theme === "dark"} onClick={setDarkMode} label="Dark" />
          <ThemeButton active={theme === "hybrid"} onClick={setHybridMode} label="Hybrid" />
          <ThemeButton active={theme === "light"} onClick={setLightMode} label="Light" />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session</CardTitle>
          <CardDescription>Ends your browser session with the API cookies.</CardDescription>
        </CardHeader>
        <Button type="button" variant="secondary" onClick={() => void logout()} disabled={loading}>
          Sign out
        </Button>
      </Card>
    </div>
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
          ? "border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan"
          : "border-border text-muted hover:bg-elevated hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
