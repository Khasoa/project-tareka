"use client";

import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useEffect } from "react";

import { ActivityList, type ActivityItem } from "@/components/activity-list";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { DashboardAnchor } from "@/components/dashboard-anchor";
import { ErrorState } from "@/components/error-state";
import { KPIGrid } from "@/components/kpi-grid";
import { StatCard, StatCardSkeleton } from "@/components/stat-card";
import { queryKeys } from "@/lib/query-keys";
import { dropoffService } from "@/services/dropoff.service";
import { impactService } from "@/services/impact.service";
import { useAuthStore } from "@/store/auth";

function formatKg(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export default function DashboardPage() {
  const { user, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    void fetchCurrentUser();
  }, [fetchCurrentUser]);

  const recyclerId = user?.role === "recycler" ? user.id : null;

  const impactQuery = useQuery({
    queryKey: recyclerId ? queryKeys.recyclerImpact(recyclerId) : ["impact", "skip"],
    queryFn: () => impactService.getRecyclerImpact(recyclerId!),
    enabled: Boolean(recyclerId),
  });

  const dropoffsQuery = useQuery({
    queryKey: recyclerId ? queryKeys.recyclerDropoffs(recyclerId, 10, 0) : ["dropoffs", "skip"],
    queryFn: () => dropoffService.listByRecycler(recyclerId!, { limit: 10, offset: 0 }),
    enabled: Boolean(recyclerId),
  });

  const impactError =
    impactQuery.isError && isAxiosError(impactQuery.error)
      ? impactQuery.error.response?.data?.error?.message ??
        impactQuery.error.message
      : impactQuery.isError
        ? "Unable to load impact."
        : null;

  const activityItems: ActivityItem[] =
    dropoffsQuery.data?.items.map((d) => ({
      id: d.id,
      title: `${d.material_type.replace(/_/g, " ")} · ${d.item_count} items`,
      subtitle: `Verified · weight (${d.estimated_weight_label})`,
      meta: new Date(d.confirmed_at).toLocaleDateString(),
      leading: "✓",
    })) ?? [];

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <header>
          <h1 className="font-heading text-xl font-semibold tracking-tight">Recycler dashboard</h1>
          <p className="mt-2 text-sm text-muted">
            Sign in on the API host to load your verified drop-offs and impact. This client uses
            HttpOnly cookies against{" "}
            <code className="rounded bg-elevated px-1 py-0.5 text-xs">NEXT_PUBLIC_API_BASE_URL</code>
            .
          </p>
        </header>
        <StatCard
          label="Session"
          value="Not signed in"
          hint="Configure the API URL, register, then log in via your auth flow."
        />
      </div>
    );
  }

  if (user.role !== "recycler") {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-sm text-muted">
          This surface is optimised for recyclers. Switch to a recycler account or use operator /
          company tools when they ship in the web app.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-0.5 text-sm text-muted">
            {user.fullName} · {user.isVerified ? "Verified recycler" : "Account pending verification"}
          </p>
        </div>
      </div>

      <DashboardAnchor />

      <Card className="border-border bg-surface p-4">
        <p className="text-sm font-medium text-foreground">Every recycle counts.</p>
        <p className="mt-1 text-sm text-muted">
          Your verified drop-offs build an auditable impact record. Appreciation tokens may apply
          where a partner has enabled them.
        </p>
      </Card>

      {impactError ? (
        <ErrorState message={String(impactError)} onRetry={() => void impactQuery.refetch()} />
      ) : impactQuery.isLoading ? (
        <KPIGrid>
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </KPIGrid>
      ) : impactQuery.data ? (
        <KPIGrid>
          <StatCard
            label="Verified drop-offs"
            value={impactQuery.data.verified_dropoffs}
            hint="Confirmed by operators on the network."
          />
          <StatCard
            label="Material tracked (est.)"
            value={`${formatKg(impactQuery.data.total_estimated_weight_kg)} kg`}
            hint={`Weights are ${impactQuery.data.estimated_weight_label}s.`}
          />
          <StatCard
            label="CO₂ (est.)"
            value={`${formatKg(impactQuery.data.total_estimated_co2_avoided_kg)} kg CO₂e`}
            hint={`${impactQuery.data.co2_estimate_label} · not a guarantee.`}
          />
          <StatCard
            label="Appreciation tokens"
            value="Per partner"
            subdued
            hint="Balances are scoped per organisation; open Wallet after drop-offs accrue."
          />
        </KPIGrid>
      ) : null}

      <section className="space-y-2">
        <CardHeader className="mb-0">
          <CardTitle className="text-base">Recent activity</CardTitle>
          <CardDescription>Latest verified drop-offs tied to your profile.</CardDescription>
        </CardHeader>
        {dropoffsQuery.isLoading ? (
          <div className="h-40 animate-pulse rounded-lg border border-border bg-surface" />
        ) : dropoffsQuery.isError ? (
          <ErrorState
            message={
              isAxiosError(dropoffsQuery.error)
                ? String(dropoffsQuery.error.response?.data?.error?.message ?? dropoffsQuery.error.message)
                : "Could not load drop-offs."
            }
            onRetry={() => void dropoffsQuery.refetch()}
          />
        ) : (
          <ActivityList items={activityItems} emptyLabel="No verified drop-offs yet." />
        )}
      </section>
    </div>
  );
}
