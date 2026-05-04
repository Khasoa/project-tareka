"use client";

import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { ErrorState } from "@/components/error-state";
import { MapPlaceholder } from "@/components/map-placeholder";
import { queryKeys } from "@/lib/query-keys";
import { companyService } from "@/services/company.service";
import { useGeolocation } from "@/hooks/useGeolocation";

const DEFAULT_CITY = "Nairobi";

export default function DirectoryPage() {
  const [city, setCity] = useState(DEFAULT_CITY);
  const [q, setQ] = useState("");
  const { coords, error: geoError, loading: geoLoading, request } = useGeolocation();

  const listParams = useMemo(
    () => ({
      country: "Kenya",
      city: city.trim() || undefined,
      nearLat: coords?.latitude,
      nearLng: coords?.longitude,
      radiusKm: 15,
    }),
    [city, coords?.latitude, coords?.longitude],
  );

  const companiesQuery = useQuery({
    queryKey: queryKeys.companies(listParams),
    queryFn: () => companyService.list(listParams),
  });

  const filtered =
    companiesQuery.data?.filter((c) => {
      if (!q.trim()) return true;
      const needle = q.toLowerCase();
      return (
        c.name.toLowerCase().includes(needle) ||
        (c.description?.toLowerCase().includes(needle) ?? false)
      );
    }) ?? [];

  const errMsg =
    companiesQuery.isError && isAxiosError(companiesQuery.error)
      ? String(companiesQuery.error.response?.data?.error?.message ?? companiesQuery.error.message)
      : companiesQuery.isError
        ? "Could not load directory."
        : null;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Nearby sites</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Location-aware directory: filter by city (default {DEFAULT_CITY}) and optionally use your
          position to prioritise partners operating collection points near you.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1 text-sm">
              <span className="mb-1 block text-muted">Search</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Partner name or description"
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-foreground outline-none ring-accent-cyan focus:ring-2"
              />
            </label>
            <label className="w-full text-sm sm:w-44">
              <span className="mb-1 block text-muted">City / area</span>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Nairobi"
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-foreground outline-none ring-accent-cyan focus:ring-2"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="secondary" size="sm" onClick={request} disabled={geoLoading}>
              {geoLoading ? "Locating…" : "Use my location"}
            </Button>
            {coords ? (
              <Badge variant="verified">Location on · refining nearby partners</Badge>
            ) : null}
            {geoError ? <span className="text-xs text-muted">{geoError}</span> : null}
          </div>

          {errMsg ? (
            <ErrorState message={errMsg} onRetry={() => void companiesQuery.refetch()} />
          ) : companiesQuery.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 animate-pulse rounded-lg border border-border bg-surface"
                />
              ))}
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {filtered.map((c) => (
                <li key={c.id}>
                  <Link href={`/site/${c.id}`}>
                    <Card className="h-full transition hover:border-accent-cyan/40">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{c.name}</CardTitle>
                        {c.is_verified ? <Badge variant="verified">Verified</Badge> : null}
                      </div>
                      <CardDescription className="mt-2 line-clamp-2">
                        {c.description ?? "Collection partner on the tareka network."}
                      </CardDescription>
                      <p className="mt-3 text-xs text-muted">
                        {coords
                          ? "Prioritised using your position and partner site coverage."
                          : `Listed for “${city || "Kenya"}”. Enable location for proximity ranking.`}
                      </p>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <MapPlaceholder className="lg:sticky lg:top-24" />
      </div>
    </div>
  );
}
