"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { dropoffService } from "@/services/dropoff.service";
import { operatorService } from "@/services/operator.service";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

function formatMaterial(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SiteDropoffsPanel({
  title,
  description,
  recentHours = 168,
}: {
  title: string;
  description: string;
  recentHours?: number;
}) {
  const [siteId, setSiteId] = useState<string>("");

  const sitesQuery = useQuery({
    queryKey: queryKeys.operatorSites,
    queryFn: () => operatorService.listSites(),
    staleTime: 60_000,
  });

  const sites = sitesQuery.data ?? [];
  const activeSiteId = siteId || sites[0]?.id || "";

  const dropoffsQuery = useQuery({
    queryKey: queryKeys.siteDropoffs(activeSiteId, 40, 0),
    queryFn: () => dropoffService.listBySite(activeSiteId, { limit: 40, offset: 0 }),
    enabled: Boolean(activeSiteId),
    staleTime: 30_000,
  });

  const cutoff = Date.now() - recentHours * 60 * 60 * 1000;
  const rows = useMemo(() => {
    const items = dropoffsQuery.data?.items ?? [];
    return items.filter((d) => new Date(d.confirmed_at).getTime() >= cutoff);
  }, [cutoff, dropoffsQuery.data?.items]);

  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-surface p-4 sm:p-5",
        "shadow-[0_0_24px_rgba(161,201,152,0.06)]",
      )}
    >
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-accent-sage-ink">Operator</p>
          <h1 className="font-heading mt-1 text-lg font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        <label className="flex min-w-[12rem] flex-col gap-1 text-xs text-dim">
          Site
          <select
            value={activeSiteId}
            onChange={(e) => setSiteId(e.target.value)}
            className="h-10 rounded-lg border border-border bg-elevated px-3 text-sm text-foreground outline-none ring-accent-sage focus:ring-2"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </header>

      {sitesQuery.isError ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-dim">
          Unable to load assigned sites. Verify the API is reachable and your operator account is linked to a site.
        </p>
      ) : sitesQuery.isLoading ? (
        <ul className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="h-14 animate-pulse rounded-lg border border-border bg-elevated/60" />
          ))}
        </ul>
      ) : sites.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-dim">
          No sites are assigned to your operator account yet.
        </p>
      ) : dropoffsQuery.isError ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-dim">
          Unable to load drop-offs for this site. Try again shortly.
        </p>
      ) : dropoffsQuery.isLoading && !rows.length ? (
        <ul className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="h-14 animate-pulse rounded-lg border border-border bg-elevated/60" />
          ))}
        </ul>
      ) : rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-dim">
          No verified drop-offs in the last {recentHours} hours for this site.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {rows.map((row) => (
            <li key={row.id} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-3 py-2.5 text-sm">
              <span className="text-dim tabular-nums">{formatWhen(row.confirmed_at)}</span>
              <span className="font-medium text-foreground">{formatMaterial(row.material_type)}</span>
              <span className="text-muted tabular-nums">
                {row.estimated_weight_kg != null ? `${row.estimated_weight_kg.toFixed(1)} kg` : "—"}
              </span>
              <span className={cn("text-xs", row.reward_issued ? "text-accent-sage-ink" : "text-dim")}>
                {row.reward_issued ? "Reward issued" : "Pending reward"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
