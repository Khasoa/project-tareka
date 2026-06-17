"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { ErrorState } from "@/components/error-state";
import { KPIGrid } from "@/components/kpi-grid";
import { StatCard as KpiStatCard, StatCardSkeleton } from "@/components/stat-card";
import { queryKeys } from "@/lib/query-keys";
import { platformService } from "@/services/platform.service";
import type { PlatformOperationsSnapshot } from "@/types";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOperationsPage() {
  const snapshotQuery = useQuery({
    queryKey: queryKeys.platformOperations,
    queryFn: () => platformService.getOperationsSnapshot(),
    staleTime: 30_000,
  });

  const data = snapshotQuery.data;

  if (snapshotQuery.isLoading) {
    return (
      <div className="space-y-5">
        <header>
          <p className="text-[11px] font-medium uppercase tracking-[0.10em] text-accent-sage-ink">
            Platform
          </p>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Network operations
          </h1>
        </header>
        <KPIGrid>
          {[0, 1, 2, 3].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </KPIGrid>
      </div>
    );
  }

  if (snapshotQuery.isError || !data) {
    return (
      <ErrorState
        title="Could not load platform snapshot"
        message="Verify the API is reachable and your account has platform administrator access."
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.10em] text-accent-sage-ink">
            Platform
          </p>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Network operations
          </h1>
          <p className="mt-1 text-sm text-dim">
            Snapshot generated {formatWhen(data.generated_at)}
          </p>
        </div>
        <Link
          href="/company/dashboard"
          className="text-sm text-accent-sage-ink transition-opacity hover:opacity-85"
        >
          Open organisation workspace →
        </Link>
      </header>

      <OverviewGrid data={data} />
      <PendingAccessCard data={data} />
      <RecentActivityCard data={data} />
    </div>
  );
}

function OverviewGrid({ data }: { data: PlatformOperationsSnapshot }) {
  const impact = data.platform_impact;
  return (
    <KPIGrid>
      <KpiStatCard label="Verified drop-offs" value={impact.verified_dropoffs.toLocaleString()} />
      <KpiStatCard
        label="Active recyclers"
        value={data.users.active_recyclers.toLocaleString()}
        hint={`${data.users.operators_pending_verification} operators pending verification`}
      />
      <KpiStatCard
        label="Operational hubs"
        value={data.sites.operational_hubs.toLocaleString()}
        hint={`${data.companies.active_businesses} active businesses`}
      />
      <KpiStatCard
        label="Pending access requests"
        value={data.onboarding.pending_company_access_requests.toLocaleString()}
      />
    </KPIGrid>
  );
}

function PendingAccessCard({ data }: { data: PlatformOperationsSnapshot }) {
  const rows = data.onboarding.recent_requests.slice(0, 6);
  if (rows.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Company access queue</CardTitle>
        <CardDescription>Recent partner onboarding requests awaiting review.</CardDescription>
      </CardHeader>
      <ul className="divide-y divide-border text-sm">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
            <div>
              <p className="font-medium text-foreground">{row.company_name}</p>
              <p className="text-xs text-dim">
                {row.contact_person} · {row.work_email}
              </p>
            </div>
            <span className="text-xs uppercase tracking-wide text-muted">{row.status}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function RecentActivityCard({ data }: { data: PlatformOperationsSnapshot }) {
  const events = data.network_events.slice(0, 8);
  if (events.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent verified activity</CardTitle>
        <CardDescription>Latest operator-confirmed intake across the network.</CardDescription>
      </CardHeader>
      <ul className="space-y-2 text-sm">
        {events.map((event) => (
          <li
            key={event.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/80 bg-surface/60 px-3 py-2"
          >
            <span className="text-foreground">
              {event.material_type.replace(/_/g, " ")} · {event.site_name}
            </span>
            <span className="text-xs text-dim">{formatWhen(event.confirmed_at)}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
