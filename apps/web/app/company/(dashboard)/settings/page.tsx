"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import { Button } from "@/components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/card";
import {
  SettingsAppearanceCard,
  SettingsProfileCard,
  SettingsSessionCard,
} from "@/components/settings/shared-account-settings";
import { ErrorState } from "@/components/error-state";
import { queryKeys } from "@/lib/query-keys";
import { companyService } from "@/services/company.service";
import { useAuthStore } from "@/store/auth";
import type { User } from "@/types";

function resolveCompanyId(user: User, searchCompanyId: string | null): string | null {
  if (user.role === "platform_admin") {
    return searchCompanyId?.trim() || null;
  }
  if (user.role === "company_admin") {
    return user.companyId?.trim() || null;
  }
  return null;
}

export default function CompanyOrgSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchCompanyId = searchParams.get("companyId");

  const { user, loading, fetchCurrentUser, logout } = useAuthStore();

  useEffect(() => {
    void fetchCurrentUser();
  }, [fetchCurrentUser]);

  const companyId = useMemo(
    () => (user ? resolveCompanyId(user, searchCompanyId) : null),
    [user, searchCompanyId],
  );

  const companyQuery = useQuery({
    queryKey: companyId ? queryKeys.company(companyId) : ["company", "skip"],
    queryFn: () => companyService.getById(companyId!),
    enabled: Boolean(companyId),
  });

  async function handleSignOut() {
    try {
      await logout();
    } catch {
      /* ignore */
    }
    router.replace("/company/login");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 py-2">
      <header>
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.10em] text-accent-sage-ink">
          Organisation
        </p>
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-0.5 text-sm text-dim">
          Workspace profile, recognition programme, exports, and your session.
        </p>
      </header>

      <SettingsProfileCard user={user} loading={loading} />

      {!companyId ? (
        <ErrorState
          title={user?.role === "platform_admin" ? "Select an organisation" : "Company not linked"}
          message={
            user?.role === "platform_admin"
              ? "Append ?companyId=… to this URL (same as the operations dashboard), or open settings from a pinned workspace."
              : "Your administrator profile still needs a company_id assignment."
          }
        />
      ) : companyQuery.isLoading ? (
        <div className="h-32 animate-pulse rounded-xl bg-surface/80" />
      ) : companyQuery.isError || !companyQuery.data ? (
        <ErrorState title="Could not load organisation" message="Try again shortly." />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organisation profile</CardTitle>
            <CardDescription>Public-directory safe summary for your partner presence.</CardDescription>
          </CardHeader>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Name</dt>
              <dd className="text-foreground">{companyQuery.data.name}</dd>
            </div>
            <div>
              <dt className="text-muted">Slug</dt>
              <dd className="text-foreground">{companyQuery.data.slug}</dd>
            </div>
          </dl>
          <div className="mt-4">
            <Button href="/company/dashboard" variant="secondary" size="sm">
              Open operations dashboard
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recognition programme</CardTitle>
          <CardDescription>Configure appreciation rails used after verified intake.</CardDescription>
        </CardHeader>
        {user?.role === "company_admin" ? (
          <Button href="/company/rewards" variant="secondary">
            Edit reward programme
          </Button>
        ) : (
          <p className="text-sm text-dim">
            Sign in with the organisation&apos;s company administrator account to edit recognition rails, or use your
            platform tooling outside this workspace.
          </p>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Operators &amp; team</CardTitle>
          <CardDescription>Invite flows and roster governance.</CardDescription>
        </CardHeader>
        <p className="text-sm text-dim">
          Centralised seat management ships next — today, coordinate operators via your existing provisioning process.
        </p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exports &amp; reporting</CardTitle>
          <CardDescription>Operational extracts from the dashboard.</CardDescription>
        </CardHeader>
        <p className="text-sm text-dim">
          Contribution CSV and ESG snapshots are launched from the overview screen — defaults stay methodological until
          audited.
        </p>
        <div className="mt-3">
          <Button href="/company/dashboard" variant="secondary" size="sm">
            Go to exports
          </Button>
        </div>
      </Card>

      <SettingsAppearanceCard />

      <SettingsSessionCard loading={loading} onSignOut={() => void handleSignOut()} />
    </div>
  );
}
