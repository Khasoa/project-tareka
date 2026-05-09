"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/badge";
import { MapPlaceholder } from "@/components/map-placeholder";
import { DIRECTORY_MOCK_LISTINGS, type DirectoryListing } from "@/lib/data/directory-mock";
import { inferMaterialsFromDescription } from "@/lib/directory-helpers";
import { queryKeys } from "@/lib/query-keys";
import { companyService } from "@/services/company.service";
import type { CompanyListItem } from "@/types";

import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/i18n-provider";

type MaterialFilter = "all" | "plastic" | "glass" | "paper";

function listingFromApi(c: CompanyListItem, cityLabel: string): DirectoryListing {
  return {
    ...c,
    city: cityLabel,
    materials: inferMaterialsFromDescription(c.description),
  };
}

function formatDistanceKm(km: number | undefined, demoSuffix: string): string | null {
  if (km == null) return null;
  if (km < 1) return `${Math.round(km * 1000)} m ${demoSuffix}`;
  return `${km.toFixed(1)} km ${demoSuffix}`;
}

function FilterChip({
  active,
  children,
  onClick,
  icon,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors",
        active
          ? "border-accent-sage/45 bg-accent-sage/10 text-foreground"
          : "border-border bg-surface-raised/40 text-secondary hover:border-border hover:bg-elevated/50",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function DirectoryCard({ listing }: { listing: DirectoryListing }) {
  const { t } = useI18n();
  const mats = listing.materials ?? inferMaterialsFromDescription(listing.description);
  const dist = formatDistanceKm(listing.distance_km_mock, t("directory.milesSuffix"));

  return (
    <Link href={`/site/${listing.id}`} className="group block h-full">
      <article
        className={cn(
          "flex h-full flex-col rounded-xl border bg-[#1C1C1C] p-4 transition-colors",
          "border-border hover:border-accent-sage/35 hover:bg-[#202020]",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-base font-semibold leading-snug tracking-tight text-foreground group-hover:text-[#E6E6E2]">
            {listing.name}
          </h3>
          {listing.is_verified ? (
            <Badge variant="verified" className="shrink-0 text-[9px] uppercase tracking-[0.08em]">
              {t("directory.badgeTrusted")}
            </Badge>
          ) : (
            <span className="shrink-0 rounded border border-border/80 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-dim">
              {t("directory.badgeCommunity")}
            </span>
          )}
        </div>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-secondary">
          {listing.description ?? t("directory.defaultDescription")}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-dim">
          <span>
            {[listing.area, listing.city].filter(Boolean).join(" · ")}
          </span>
          {dist ? <span className="text-dim tabular-nums">· {dist}</span> : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {mats.slice(0, 4).map((m) => (
            <span
              key={m}
              className="rounded border border-border/70 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.06em] text-secondary"
            >
              {m.replace(/_/g, " ").toUpperCase()}
            </span>
          ))}
        </div>

        <p className="mt-2 text-[10px] text-dim">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-sage/80 align-middle mr-1" aria-hidden />
          {t("directory.hoursNote")}
        </p>

        <span className="mt-auto pt-4 block w-full rounded-lg border border-border/60 bg-[#232323] py-2 text-center text-xs font-medium text-secondary transition-colors group-hover:border-accent-sage/25 group-hover:text-foreground">
          {t("directory.viewDetailsHours")}
        </span>
      </article>
    </Link>
  );
}

function CardGridSkeleton() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="h-56 animate-pulse rounded-xl border border-border bg-[#1C1C1C]" />
      ))}
    </ul>
  );
}

export function DirectoryView() {
  const { t } = useI18n();
  const [city, setCity] = useState("Nairobi");
  const [q, setQ] = useState("");
  const [material, setMaterial] = useState<MaterialFilter>("all");

  const cities = useMemo(() => {
    const set = new Set(DIRECTORY_MOCK_LISTINGS.map((l) => l.city));
    return Array.from(set).sort();
  }, []);

  const apiQuery = useQuery({
    queryKey: queryKeys.companies({ country: "Kenya", city: city || undefined }),
    queryFn: () => companyService.list({ country: "Kenya", city: city || undefined }),
    staleTime: 60_000,
  });

  const sourceListings = useMemo((): DirectoryListing[] => {
    if (apiQuery.isError) {
      return DIRECTORY_MOCK_LISTINGS;
    }
    if (apiQuery.data && apiQuery.data.length > 0) {
      const label = city || "Kenya";
      return apiQuery.data.map((c) => listingFromApi(c, label));
    }
    if (apiQuery.isSuccess) {
      return DIRECTORY_MOCK_LISTINGS;
    }
    return DIRECTORY_MOCK_LISTINGS;
  }, [apiQuery.data, apiQuery.isError, apiQuery.isSuccess, city]);

  const usingMockFallback =
    apiQuery.isError || (apiQuery.isSuccess && (apiQuery.data?.length ?? 0) === 0);

  const filtered = useMemo(() => {
    const cityNeedle = city.trim().toLowerCase();
    const qNeedle = q.trim().toLowerCase();
    return sourceListings.filter((c) => {
      if (cityNeedle && c.city.toLowerCase() !== cityNeedle) return false;
      if (material !== "all") {
        const mats = c.materials ?? inferMaterialsFromDescription(c.description);
        if (!mats.includes(material)) return false;
      }
      if (!qNeedle) return true;
      return (
        c.name.toLowerCase().includes(qNeedle) ||
        (c.description?.toLowerCase().includes(qNeedle) ?? false) ||
        c.city.toLowerCase().includes(qNeedle) ||
        (c.area?.toLowerCase().includes(qNeedle) ?? false)
      );
    });
  }, [city, material, q, sourceListings]);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header>
        <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.14em] text-accent-sage">
          {t("directory.pageKicker")}
        </p>
        <h1 className="font-heading text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-[1.65rem]">
          {t("directory.pageTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-secondary">
          {t("directory.pageSub")}
        </p>
        {usingMockFallback && apiQuery.isFetched ? (
          <p className="mt-2 max-w-2xl text-xs text-dim">
            {t("directory.mockHint")}
          </p>
        ) : null}
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,38%)] lg:gap-6 lg:items-start">
        <div className="space-y-4 min-w-0">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dim" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-70">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("directory.searchPlaceholder")}
              className="h-11 w-full rounded-lg border border-border bg-[#1C1C1C] pl-10 pr-3 text-sm text-foreground placeholder:text-dim outline-none ring-accent-sage focus:ring-2"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <FilterChip
                active={material === "plastic"}
                onClick={() => setMaterial(material === "plastic" ? "all" : "plastic")}
                icon={<span aria-hidden>♻</span>}
              >
                {t("directory.filterPlastic")}
              </FilterChip>
              <FilterChip
                active={material === "glass"}
                onClick={() => setMaterial(material === "glass" ? "all" : "glass")}
                icon={<span aria-hidden className="text-[10px]">◎</span>}
              >
                {t("directory.filterGlass")}
              </FilterChip>
              <FilterChip
                active={material === "paper"}
                onClick={() => setMaterial(material === "paper" ? "all" : "paper")}
                icon={<span aria-hidden className="text-[10px]">▤</span>}
              >
                {t("directory.filterPaper")}
              </FilterChip>
              <FilterChip active={material === "all"} onClick={() => setMaterial("all")}>
                {t("directory.filterAllShort")}
              </FilterChip>
            </div>
            <label className="flex w-full items-center gap-2 text-sm sm:w-auto sm:min-w-[11rem]">
              <span className="shrink-0 text-dim">{t("directory.cityLabel")}</span>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-[#1C1C1C] px-3 text-foreground outline-none ring-accent-sage focus:ring-2"
              >
                <option value="">{t("directory.cityAll")}</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {apiQuery.isLoading ? (
            <CardGridSkeleton />
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-border bg-[#1C1C1C] px-5 py-10 text-center">
              <p className="font-heading text-sm font-semibold text-foreground">{t("directory.emptyTitle")}</p>
              <p className="mt-1.5 text-sm text-secondary">{t("directory.emptyBody")}</p>
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setMaterial("all");
                }}
                className="mt-4 text-xs font-medium text-accent-sage hover:opacity-90"
              >
                {t("directory.clearFilters")}
              </button>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {filtered.map((c) => (
                <li key={c.id}>
                  <DirectoryCard listing={c} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <MapPlaceholder
          variant="network"
          label={t("directory.mapLabel")}
          className="min-h-[300px] lg:sticky lg:top-24 lg:min-h-[360px]"
        />
      </div>
    </div>
  );
}
