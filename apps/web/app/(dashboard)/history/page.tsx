"use client";

import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { ErrorState } from "@/components/error-state";
import { queryKeys } from "@/lib/query-keys";
import { dropoffService } from "@/services/dropoff.service";
import { useAuthStore } from "@/store/auth";

const MATERIALS = ["all", "plastic_bottle", "glass_bottle", "can", "paper", "ewaste"] as const;

export default function HistoryPage() {
  const [material, setMaterial] = useState<(typeof MATERIALS)[number]>("all");
  const [from, setFrom] = useState("");
  const { user, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    void fetchCurrentUser();
  }, [fetchCurrentUser]);

  const recyclerId = user?.role === "recycler" ? user.id : null;

  const dropoffsQuery = useQuery({
    queryKey: recyclerId ? queryKeys.recyclerDropoffs(recyclerId, 100, 0) : ["dropoffs", "skip"],
    queryFn: () => dropoffService.listByRecycler(recyclerId!, { limit: 100, offset: 0 }),
    enabled: Boolean(recyclerId),
  });

  const filtered = useMemo(() => {
    const items = dropoffsQuery.data?.items ?? [];
    const fromTs = from ? new Date(from).getTime() : null;
    return items.filter((d) => {
      if (material !== "all" && d.material_type !== material) return false;
      if (fromTs && new Date(d.confirmed_at).getTime() < fromTs) return false;
      return true;
    });
  }, [dropoffsQuery.data?.items, material, from]);

  if (!user) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="font-heading text-2xl font-semibold">History</h1>
        <p className="mt-2 text-sm text-muted">Sign in as a recycler to load your verified timeline.</p>
      </div>
    );
  }

  if (user.role !== "recycler") {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="font-heading text-2xl font-semibold">History</h1>
        <p className="mt-2 text-sm text-muted">Recycler timeline is available for recycler accounts.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Drop-off history</h1>
        <p className="mt-2 text-sm text-muted">
          Filter by material and date. CO₂ and weight values remain labelled as estimates from the
          operator confirmation.
        </p>
      </header>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="text-sm">
            <span className="mb-1 block text-muted">Material</span>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value as (typeof MATERIALS)[number])}
              className="h-10 w-full rounded-md border border-border bg-surface px-3 text-foreground sm:w-48"
            >
              <option value="all">All materials</option>
              <option value="plastic_bottle">Plastic bottles</option>
              <option value="glass_bottle">Glass bottles</option>
              <option value="can">Cans</option>
              <option value="paper">Paper</option>
              <option value="ewaste">E-waste</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted">From date</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-surface px-3 text-foreground sm:w-48"
            />
          </label>
          <Button type="button" variant="ghost" size="sm" onClick={() => {
            setMaterial("all");
            setFrom("");
          }}>
            Reset filters
          </Button>
        </div>
      </Card>

      {dropoffsQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg border border-border bg-surface" />
          ))}
        </div>
      ) : dropoffsQuery.isError ? (
        <ErrorState
          message={
            isAxiosError(dropoffsQuery.error)
              ? String(
                  dropoffsQuery.error.response?.data?.error?.message ?? dropoffsQuery.error.message,
                )
              : "Could not load history."
          }
          onRetry={() => void dropoffsQuery.refetch()}
        />
      ) : (
        <ol className="space-y-4">
          {filtered.map((d, index) => (
            <li key={d.id} className="flex gap-4">
              <div className="flex w-4 shrink-0 flex-col items-center pt-2">
                <span className="h-3 w-3 rounded-full border border-accent-cyan/40 bg-accent-cyan/80" />
                {index < filtered.length - 1 ? (
                  <span className="mt-2 min-h-[2rem] w-px flex-1 bg-border" aria-hidden />
                ) : null}
              </div>
              <Card className="min-w-0 flex-1">
                <CardHeader>
                  <CardTitle className="text-base">
                    {d.material_type.replace(/_/g, " ")} · {d.item_count} items
                  </CardTitle>
                  <CardDescription>
                    {new Date(d.confirmed_at).toLocaleString()} · Verified
                  </CardDescription>
                </CardHeader>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted">Weight ({d.estimated_weight_label})</dt>
                    <dd className="tabular-nums text-foreground">
                      {d.estimated_weight_kg != null ? `${d.estimated_weight_kg} kg` : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">CO₂ ({d.co2_estimate_label})</dt>
                    <dd className="tabular-nums text-foreground">
                      {d.co2_avoided_kg != null ? `${d.co2_avoided_kg} kg CO₂e` : "—"}
                    </dd>
                  </div>
                </dl>
              </Card>
            </li>
          ))}
        </ol>
      )}

      {!dropoffsQuery.isLoading && !dropoffsQuery.isError && filtered.length === 0 ? (
        <p className="text-center text-sm text-muted">No events match these filters.</p>
      ) : null}
    </div>
  );
}
