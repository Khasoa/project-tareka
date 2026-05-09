"use client";

import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import Link from "next/link";

import { Button } from "@/components/button";
import { ErrorState } from "@/components/error-state";
import { queryKeys } from "@/lib/query-keys";
import { companyService } from "@/services/company.service";
import { dropoffService } from "@/services/dropoff.service";
import { impactService } from "@/services/impact.service";
import { useAuthStore } from "@/store/auth";
import type { CompanyListItem, DropoffItem, ImpactTotals } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────────────────────────────────────

function firstName(fullName: string): string {
  const p = fullName.trim().split(/\s+/)[0];
  return p || "there";
}

function formatWeight(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} t`;
  return `${kg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function formatMaterial(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function materialSymbol(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("plastic")) return "♻";
  if (t.includes("glass")) return "◎";
  if (t.includes("metal")) return "▣";
  if (t.includes("paper") || t.includes("cardboard")) return "▤";
  if (t.includes("electronic") || t.includes("ewaste")) return "⬡";
  if (t.includes("textile") || t.includes("cloth")) return "▢";
  return "✓";
}

/** Partial sum from the loaded drop-off page only (not full ledger). */
function tokensFromDropoffs(items: DropoffItem[]): { sum: number; hasAny: boolean } {
  let sum = 0;
  let hasAny = false;
  for (const d of items) {
    if (d.reward_summary?.tokens != null && d.reward_summary.tokens !== "") {
      const n = Number(d.reward_summary.tokens);
      if (!Number.isNaN(n)) {
        sum += n;
        hasAny = true;
      }
    }
  }
  return { sum, hasAny };
}

// ─────────────────────────────────────────────────────────────────────────────
// Compact personal impact visual — path + nodes + soft ring (no extra deps)
// ─────────────────────────────────────────────────────────────────────────────

function PersonalImpactVisual({
  verifiedCount,
  targetHint,
}: {
  verifiedCount: number;
  targetHint: number;
}) {
  const pct = Math.min(100, Math.round((verifiedCount / Math.max(targetHint, 1)) * 100));
  const r = 36;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-surface via-surface to-elevated/50 px-3 py-2.5"
      role="img"
      aria-label={`Contribution trail, about ${pct} percent of a friendly milestone`}
    >
      <div className="flex items-center gap-3">
        <div className="relative h-[4.5rem] w-[4.5rem] shrink-0">
          <svg viewBox="0 0 88 88" className="h-full w-full -rotate-90" aria-hidden>
            <circle cx="44" cy="44" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-border/80" />
            <circle
              cx="44"
              cy="44"
              r={r}
              fill="none"
              stroke="#A8BFA6"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${c}`}
              className="opacity-90"
            />
          </svg>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="font-heading text-sm font-semibold tabular-nums text-foreground">{verifiedCount}</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-accent-sage">Your trail</p>
          <p className="mt-0.5 text-xs leading-snug text-secondary">
            Verified drop-offs on your record — ring is a simple milestone hint, not a target from the API.
          </p>
          <svg viewBox="0 0 240 36" className="mt-1.5 h-8 w-full text-foreground" aria-hidden>
            <path
              d="M8 22h52l28-10h64l36 8h48"
              stroke="currentColor"
              strokeOpacity={0.12}
              strokeWidth={1}
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M8 22h52l28-10h64l36 8h48"
              stroke="#A8BFA6"
              strokeOpacity={0.35}
              strokeWidth={1}
              fill="none"
              strokeLinecap="round"
              strokeDasharray="4 7"
            />
            <circle cx="68" cy="22" r="2.2" fill="#A8BFA6" fillOpacity={0.55} />
            <circle cx="152" cy="12" r="1.8" fill="currentColor" fillOpacity={0.2} />
            <circle cx="196" cy="20" r="2" fill="#A8BFA6" fillOpacity={0.45} />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UI primitives
// ─────────────────────────────────────────────────────────────────────────────

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface px-2.5 py-2 shadow-sm">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-dim">{label}</p>
      <p className="mt-0.5 font-heading text-base font-semibold tabular-nums tracking-tight text-foreground">{value}</p>
      {hint ? <p className="mt-0.5 text-[10px] leading-snug text-dim">{hint}</p> : null}
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface px-2.5 py-2">
      <div className="h-2.5 w-20 animate-pulse rounded bg-elevated" />
      <div className="mt-2 h-6 w-16 animate-pulse rounded bg-elevated" />
    </div>
  );
}

function DropoffRow({ item }: { item: DropoffItem }) {
  return (
    <li className="flex items-start gap-2.5 border-b border-border/80 px-3 py-2.5 last:border-b-0">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs bg-accent-sage/10 text-accent-sage">
        {materialSymbol(item.material_type)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-foreground">{formatMaterial(item.material_type)}</p>
        <p className="text-[11px] text-dim">
          {item.item_count} items
          {item.estimated_weight_kg != null
            ? ` · ~${formatWeight(item.estimated_weight_kg)} (${item.estimated_weight_label})`
            : ""}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <span className="inline-flex rounded-full bg-accent-sage/10 px-1.5 py-0.5 text-[9px] font-medium text-accent-sage">
          Verified
        </span>
        <p className="mt-0.5 text-[10px] text-dim">{formatDate(item.confirmed_at)}</p>
      </div>
    </li>
  );
}

function DropoffSkeleton() {
  return (
    <li className="flex gap-2.5 border-b border-border/80 px-3 py-2.5">
      <div className="h-6 w-6 shrink-0 animate-pulse rounded-md bg-elevated" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-24 animate-pulse rounded bg-elevated" />
        <div className="h-2.5 w-32 animate-pulse rounded bg-elevated" />
      </div>
    </li>
  );
}

function EmptyActivity() {
  return (
    <div className="px-4 py-6 text-center">
      <div
        className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-accent-sage/12 text-accent-sage"
        aria-hidden
      >
        ♻
      </div>
      <p className="font-heading text-sm font-semibold text-foreground">Nothing logged yet — room to grow</p>
      <p className="mx-auto mt-1 max-w-[240px] text-[11px] leading-relaxed text-dim">
        Your verified drop-offs will appear here. Nearby partners are ready when you are.
      </p>
      <Button href="/directory" variant="primary" size="sm" className="mt-4">
        Find a collection site
      </Button>
    </div>
  );
}

function NearbyRow({ company }: { company: CompanyListItem }) {
  return (
    <li className="flex items-center gap-2.5 border-b border-border/70 px-3 py-2 last:border-b-0">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent-sage/10 text-[10px] font-semibold text-accent-sage">
        {company.name.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-foreground">{company.name}</p>
        {company.is_verified ? (
          <p className="text-[10px] text-accent-sage">Verified partner</p>
        ) : null}
      </div>
      <Link
        href={`/site/${company.id}`}
        className="shrink-0 text-[10px] font-medium text-accent-sage transition-opacity hover:opacity-80"
      >
        View
      </Link>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function RecyclerDashboard() {
  const user = useAuthStore((s) => s.user)!;
  const welcome = firstName(user.fullName);

  const impactQuery = useQuery<ImpactTotals>({
    queryKey: queryKeys.recyclerImpact(user.id),
    queryFn: () => impactService.getRecyclerImpact(user.id),
    staleTime: 60_000,
  });

  const dropoffsQuery = useQuery({
    queryKey: queryKeys.recyclerDropoffs(user.id, 12, 0),
    queryFn: () => dropoffService.listByRecycler(user.id, { limit: 12, offset: 0 }),
    staleTime: 30_000,
  });

  const companiesQuery = useQuery({
    queryKey: queryKeys.companies({ country: "Kenya" }),
    queryFn: () => companyService.list({ country: "Kenya" }),
    staleTime: 120_000,
    select: (data) => data.slice(0, 4),
  });

  const impactError = impactQuery.isError
    ? isAxiosError(impactQuery.error)
      ? String(
          (impactQuery.error.response?.data as { detail?: string })?.detail ??
            (impactQuery.error.response?.data as { error?: { message?: string } })?.error?.message ??
            "Unable to load impact data.",
        )
      : "Unable to load impact data."
    : null;

  const dropItems = dropoffsQuery.data?.items ?? [];
  const { sum: tokenSum, hasAny: tokensFromRows } = tokensFromDropoffs(dropItems);
  const milestone = Math.max(8, Math.ceil((impactQuery.data?.verified_dropoffs ?? 0) / 4) * 4 || 8);

  return (
    <div className="mx-auto max-w-5xl rounded-2xl border border-border/80 bg-gradient-to-b from-surface via-surface to-surface-raised/65 p-3 shadow-sm sm:p-4 md:p-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border/60 pb-3">
        <div className="min-w-0">
          <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Welcome back, {welcome}.
          </h1>
          <p className="mt-0.5 text-xs leading-snug text-dim sm:text-sm">
            Track your verified recycling activity and nearby contribution options.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button href="/directory" variant="primary" size="sm" className="text-xs">
            Find a drop-off
          </Button>
          <Button href="/recycler/wallet" variant="secondary" size="sm" className="text-xs">
            Open wallet
          </Button>
        </div>
      </div>

      {/* KPI + visual row */}
      <div className="mt-3 grid gap-2 lg:grid-cols-12 lg:items-stretch">
        <div className="lg:col-span-8">
          {impactError ? (
            <ErrorState message={impactError} onRetry={() => void impactQuery.refetch()} />
          ) : impactQuery.isPending ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <KpiSkeleton />
              <KpiSkeleton />
              <KpiSkeleton />
              <KpiSkeleton />
            </div>
          ) : impactQuery.data ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Kpi
                label="Verified drop-offs"
                value={impactQuery.data.verified_dropoffs.toLocaleString()}
                hint="Operator-confirmed"
              />
              <Kpi
                label="Material diverted"
                value={formatWeight(impactQuery.data.total_estimated_weight_kg)}
                hint={`${impactQuery.data.estimated_weight_label} · not weighbridge`}
              />
              <Kpi
                label="CO₂ avoided"
                value={`${impactQuery.data.total_estimated_co2_avoided_kg.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg`}
                hint={`${impactQuery.data.co2_estimate_label} · methodology`}
              />
              <Kpi
                label="Recognition tokens"
                value={
                  tokensFromRows ? tokenSum.toLocaleString() : impactQuery.data.verified_dropoffs > 0 ? "—" : "0"
                }
                hint={
                  tokensFromRows
                    ? `Partial total from loaded activity (max ${dropItems.length} rows) · open Wallet for programs`
                    : "From rewards on your drop-offs · use Wallet when linked to a program"
                }
              />
            </div>
          ) : null}
        </div>
        <div className="lg:col-span-4">
          <PersonalImpactVisual
            verifiedCount={impactQuery.data?.verified_dropoffs ?? 0}
            targetHint={milestone}
          />
        </div>
      </div>

      {/* Main grid */}
      <div className="mt-3 grid gap-2 lg:grid-cols-12">
        <section className="rounded-xl border border-border/90 bg-surface/90 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-border/70 px-3 py-2">
            <h2 className="font-heading text-sm font-semibold text-foreground">Recent activity</h2>
            <Link href="/recycler/history" className="text-[11px] font-medium text-accent-sage hover:opacity-85">
              History →
            </Link>
          </div>
          <ul className="max-h-[min(240px,28vh)] overflow-y-auto">
            {dropoffsQuery.isPending ? (
              <>
                <DropoffSkeleton />
                <DropoffSkeleton />
                <DropoffSkeleton />
              </>
            ) : dropoffsQuery.isError ? (
              <li className="px-3 py-5">
                <ErrorState
                  title="Activity unavailable"
                  message="We couldn’t load your drop-offs. Try again."
                  onRetry={() => void dropoffsQuery.refetch()}
                />
              </li>
            ) : dropItems.length === 0 ? (
              <li className="list-none">
                <EmptyActivity />
              </li>
            ) : (
              dropItems.map((item) => <DropoffRow key={item.id} item={item} />)
            )}
          </ul>
        </section>

        <div className="flex flex-col gap-2 lg:col-span-5">
          <section className="rounded-xl border border-border/90 bg-surface/90">
            <div className="border-b border-border/70 px-3 py-2">
              <h2 className="font-heading text-sm font-semibold text-foreground">Nearby collection points</h2>
              <p className="text-[10px] text-dim">Partners in Kenya · from directory API</p>
            </div>
            {companiesQuery.isPending ? (
              <ul className="divide-y divide-border/50 px-0 py-1">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="px-3 py-2">
                    <div className="flex gap-2">
                      <div className="h-6 w-6 animate-pulse rounded-md bg-elevated" />
                      <div className="flex-1 space-y-1 pt-0.5">
                        <div className="h-3 w-28 animate-pulse rounded bg-elevated" />
                        <div className="h-2 w-16 animate-pulse rounded bg-elevated" />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : companiesQuery.isError ? (
              <p className="px-3 py-4 text-xs text-dim">Couldn’t load partners. Try the directory.</p>
            ) : !companiesQuery.data?.length ? (
              <p className="px-3 py-4 text-xs text-dim">No partners returned for this filter.</p>
            ) : (
              <ul className="divide-y divide-border/50">
                {companiesQuery.data.map((c) => (
                  <NearbyRow key={c.id} company={c} />
                ))}
              </ul>
            )}
            <div className="border-t border-border/70 px-3 py-2">
              <Link href="/directory" className="text-xs font-medium text-accent-sage hover:opacity-85">
                Browse full directory →
              </Link>
            </div>
          </section>

          <section className="rounded-xl border border-border/90 bg-elevated/35 px-3 py-2.5">
            <div className="flex items-start gap-2">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent-sage/12 text-accent-sage text-sm"
                aria-hidden
              >
                ★
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">Wallet &amp; rewards</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-dim">
                  Program balances use <code className="rounded bg-surface px-0.5 text-[10px]">GET /wallet/:id</code> when you
                  have a wallet id. This card stays descriptive until your wallet is wired in the UI.
                </p>
                <Button href="/recycler/wallet" variant="secondary" size="sm" className="mt-2 text-xs">
                  Open wallet
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <p className="mt-3 text-[10px] text-dim">
        Weight and CO₂ figures are <span className="font-medium text-secondary">estimates</span>. Token totals on this page may
        be incomplete — they only sum reward rows visible in the recent activity fetch.
      </p>
    </div>
  );
}
