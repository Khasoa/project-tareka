"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/button";
import { queryKeys } from "@/lib/query-keys";
import { withApiFallback } from "@/lib/data/api-fallback";
import { NETWORK_MOCK_EXPERIENCE } from "@/lib/data/network-mock";
import { impactService } from "@/services/impact.service";
import { useAuthStore } from "@/store/auth";
import type { NetworkImpactExperience, UserRole } from "@/types";

function formatKg(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: n >= 1000 ? 0 : 1 });
}

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

function roleWorkspace(role: UserRole): { href: string; label: string } {
  switch (role) {
    case "recycler":
      return { href: "/dashboard", label: "Your recycler dashboard" };
    case "operator":
      return { href: "/operator/quick-log", label: "Operator console" };
    case "company_admin":
      return { href: "/company/dashboard", label: "Organisation workspace" };
    case "platform_admin":
      return { href: "/admin", label: "Platform operations" };
    default:
      return { href: "/auth/login", label: "Sign in" };
  }
}

function ConstellationField({ dense }: { dense?: boolean }) {
  const nodes: [number, number][] = dense
    ? [
        [10, 18], [28, 10], [48, 24], [68, 12], [88, 28], [22, 48], [55, 44], [78, 58],
      ]
    : [
        [8, 14], [24, 22], [42, 8], [58, 32], [76, 16], [92, 26], [18, 52], [48, 62], [72, 48],
        [34, 78], [62, 82],
      ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl" aria-hidden>
      {nodes.map(([l, t], i) => (
        <div
          key={i}
          className="absolute h-1 w-1 rounded-full opacity-80 shadow-[0_0_6px_var(--map-glow-sage)]"
          style={{
            left: `${l}%`,
            top: `${t}%`,
            background: "var(--map-glow-sage)",
          }}
        />
      ))}
      <div
        className="absolute left-[12%] top-[28%] h-px w-[42%] rotate-[9deg] opacity-40"
        style={{
          background: "linear-gradient(90deg, transparent, var(--map-glow-sage), transparent)",
        }}
      />
      <div
        className="absolute left-[40%] top-[58%] h-px w-[38%] rotate-[-6deg] opacity-35"
        style={{
          background: "linear-gradient(90deg, transparent, var(--map-glow-sage), transparent)",
        }}
      />
    </div>
  );
}

function ImpactStatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface/90 px-3 py-2.5 shadow-[0_18px_48px_-24px_rgba(0,0,0,0.55)] sm:px-3.5 sm:py-3">
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-[0.12] blur-md"
        style={{ background: "var(--map-glow-sage)" }}
        aria-hidden
      />
      <p className="relative text-[10px] font-medium uppercase tracking-[0.1em] text-dim">{label}</p>
      <p className="relative mt-0.5 font-heading text-lg font-semibold tabular-nums tracking-tight text-foreground sm:text-xl">
        {value}
      </p>
      {hint ? <p className="relative mt-0.5 text-[10px] leading-snug text-muted">{hint}</p> : null}
    </div>
  );
}

function MomentumLabel({ trend }: { trend: NetworkImpactExperience["momentum"]["trend"] }) {
  if (trend === "up") return <span className="text-accent-sage">Strengthening vs prior week</span>;
  if (trend === "down") return <span className="text-dim">Cooldown vs prior week</span>;
  return <span className="text-dim">Steady against prior week</span>;
}

export function NetworkImpactView() {
  const { user, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    void fetchCurrentUser();
  }, [fetchCurrentUser]);

  const netQuery = useQuery({
    queryKey: queryKeys.networkImpact,
    queryFn: () =>
      withApiFallback(
        "network impact",
        () => impactService.getNetworkExperience(),
        () => NETWORK_MOCK_EXPERIENCE,
      ),
    staleTime: 60_000,
    placeholderData: NETWORK_MOCK_EXPERIENCE,
  });

  const n = netQuery.data ?? NETWORK_MOCK_EXPERIENCE;
  const usingDemo = netQuery.isError;

  return (
    <div className="relative">
      <section className="relative border-b border-nav-line/80 bg-nav-chrome/35 px-4 py-10 sm:px-6 sm:py-12">
        <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden>
          <ConstellationField />
        </div>
        <div className="relative mx-auto max-w-4xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-accent-sage">Network intelligence</p>
          <h1 className="mt-1 font-heading text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
            Shared environmental momentum
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            Verified recycling activity across the tareka ecosystem — collective scale, not individual scores. All mass
            and CO₂ are <span className="text-foreground/90">methodological estimates</span>.
          </p>
          {usingDemo ? (
            <p className="mt-2 text-xs text-dim">Showing representative Nairobi network data while live telemetry syncs.</p>
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-4 px-4 py-6 sm:px-6 sm:py-8">
        {user ? (
          <div className="rounded-xl border border-border bg-surface-raised/50 px-3 py-2.5 sm:flex sm:items-center sm:justify-between sm:px-4">
            <p className="text-xs text-muted">
              Signed in — open your <span className="text-foreground">operational view</span> for personal or
              organisation-level detail.
            </p>
            <Button href={roleWorkspace(user.role).href} variant="secondary" size="sm" className="mt-2 shrink-0 sm:mt-0">
              {roleWorkspace(user.role).label}
            </Button>
          </div>
        ) : (
          <p className="text-center text-[11px] text-dim sm:text-left">
            <Link href="/auth/login" className="text-accent-sage hover:opacity-90">
              Sign in
            </Link>{" "}
            for role-specific dashboards; this page stays open to everyone.
          </p>
        )}

        {netQuery.isLoading && !netQuery.data ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl border border-border bg-surface" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <ImpactStatCard
                label="Verified contributions"
                value={n.verified_dropoffs.toLocaleString()}
                hint="Network-wide operator-confirmed intake"
              />
              <ImpactStatCard
                label="Active recyclers"
                value={n.active_recyclers.toLocaleString()}
                hint="Accounts participating in the network"
              />
              <ImpactStatCard
                label="Participating businesses"
                value={n.active_companies.toLocaleString()}
                hint="Active collection partners"
              />
              <ImpactStatCard
                label="Est. material recovery"
                value={`${formatKg(n.total_estimated_weight_kg)} kg`}
                hint={`${n.estimated_weight_label} · network total`}
              />
              <ImpactStatCard
                label="Est. CO₂ avoided"
                value={`${formatKg(n.total_estimated_co2_avoided_kg)} kg`}
                hint={`${n.co2_estimate_label} · not certification`}
              />
              <ImpactStatCard
                label="Operational hubs"
                value={n.operational_hubs.toLocaleString()}
                hint="Active sites on the directory"
              />
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="relative overflow-hidden rounded-xl border border-border bg-surface px-3 py-3 sm:px-4">
                <ConstellationField dense />
                <div className="relative">
                  <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-accent-sage">Ecosystem momentum</p>
                  <p className="mt-1 text-xs text-muted">
                    Last 7 days:{" "}
                    <span className="tabular-nums text-foreground">{n.momentum.last_7d_verified_dropoffs}</span> verified
                    contributions · prior 7 days:{" "}
                    <span className="tabular-nums text-foreground">{n.momentum.prior_7d_verified_dropoffs}</span>.{" "}
                    <MomentumLabel trend={n.momentum.trend} />.
                  </p>
                  <ul className="mt-3 space-y-2 border-t border-border pt-3">
                    {n.milestones.length === 0 ? (
                      <li className="text-xs text-dim">Milestones will appear as the network records verified intake.</li>
                    ) : (
                      n.milestones.map((m, i) => (
                        <li key={i} className="text-xs leading-relaxed text-muted">
                          <span className="font-medium text-foreground">{m.title}.</span> {m.body}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface px-3 py-3 sm:px-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-accent-sage">
                  Regional participation (30d)
                </p>
                <p className="mt-0.5 text-[10px] text-dim">Verified drop-offs by hub city · editorial summary</p>
                {n.regional_momentum.length === 0 ? (
                  <p className="mt-3 text-xs text-dim">No regional breakdown yet.</p>
                ) : (
                  <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs sm:max-h-48">
                    {n.regional_momentum.map((r) => {
                      const max = Math.max(...n.regional_momentum.map((x) => x.verified_dropoffs), 1);
                      const w = Math.round((r.verified_dropoffs / max) * 100);
                      return (
                        <li key={r.city} className="flex items-center gap-2 text-muted">
                          <span
                            className="h-1 shrink-0 rounded-full bg-accent-sage/35"
                            style={{ width: `${Math.max(12, w)}%`, maxWidth: "72px" }}
                          />
                          <span className="min-w-0 flex-1 truncate">{r.city}</span>
                          <span className="shrink-0 tabular-nums text-dim">{r.verified_dropoffs}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface px-3 py-3 sm:px-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-accent-sage">Recent verified intake</p>
              <p className="mt-0.5 text-[10px] text-dim">
                Public journal — city, material, and partner only (no individual recycler identities).
              </p>
              {n.recent_verified_activity.length === 0 ? (
                <p className="mt-3 text-xs text-dim">Activity will appear as hubs confirm contributions.</p>
              ) : (
                <ul className="mt-2 divide-y divide-border text-xs">
                  {n.recent_verified_activity.map((row, idx) => (
                    <li key={`${row.confirmed_at}-${idx}`} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2 text-muted">
                      <span className="text-dim">{formatWhen(row.confirmed_at)}</span>
                      <span className="min-w-0 text-foreground">
                        {row.city} · {formatMaterial(row.material_type)}
                      </span>
                      <span className="max-w-[200px] truncate text-dim sm:max-w-xs">{row.partner_name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="text-center text-[10px] text-dim sm:text-left">
              Refreshed {formatWhen(n.generated_at)} · high-level telemetry; deeper metrics live in role dashboards.
            </p>

            <div className="flex flex-wrap justify-center gap-2 pb-8 sm:justify-start">
              <Button href="/directory" variant="primary" size="sm">
                Find a hub
              </Button>
              <Button href="/for-companies" variant="secondary" size="sm">
                For partners
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
