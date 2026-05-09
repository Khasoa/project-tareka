"use client";

import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import Link from "next/link";

import { Button } from "@/components/button";
import { ErrorState } from "@/components/error-state";
import { queryKeys } from "@/lib/query-keys";
import { platformService } from "@/services/platform.service";
import type { PlatformOperationsSnapshot } from "@/types";

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMaterial(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-accent-sage">{children}</p>
  );
}

function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface px-2.5 py-2 shadow-sm">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-dim">{label}</p>
      <p className="mt-0.5 font-heading text-base font-semibold tabular-nums tracking-tight text-foreground sm:text-lg">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[10px] leading-snug text-dim">{hint}</p> : null}
    </div>
  );
}

function ConstellationBackdrop() {
  const nodes: [number, number][] = [
    [8, 12], [22, 28], [38, 9], [55, 32], [72, 14], [88, 26], [15, 62], [48, 58], [76, 68], [30, 82],
    [62, 88], [91, 54], [6, 44],
  ];
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg opacity-90"
      aria-hidden
    >
      {nodes.map(([l, t], i) => (
        <div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-accent-sage/35 shadow-[0_0_6px_rgba(0,0,0,0.15)]"
          style={{ left: `${l}%`, top: `${t}%` }}
        />
      ))}
      <div
        className="absolute left-[12%] top-[22%] h-px w-[38%] rotate-[12deg] bg-gradient-to-r from-transparent via-accent-sage/15 to-transparent"
        aria-hidden
      />
      <div
        className="absolute left-[40%] top-[55%] h-px w-[44%] rotate-[-8deg] bg-gradient-to-r from-transparent via-accent-sage/12 to-transparent"
        aria-hidden
      />
    </div>
  );
}

function RegionalHeat({ rows }: { rows: PlatformOperationsSnapshot["regional_intake"] }) {
  const maxD = Math.max(1, ...rows.map((r) => r.verified_dropoffs));
  return (
    <div className="relative rounded-lg border border-border bg-surface p-2.5">
      <ConstellationBackdrop />
      <div className="relative">
        <PanelTitle>Regional intake (verified)</PanelTitle>
        <p className="mt-0.5 text-[10px] text-dim">By hub city · drop-off count (est. mass secondary)</p>
        {rows.length === 0 ? (
          <p className="mt-2 text-[11px] text-dim">No regional series yet.</p>
        ) : (
          <ul className="mt-2 max-h-36 space-y-1 overflow-y-auto text-[11px]">
            {rows.map((r) => (
              <li key={r.city} className="flex items-center gap-2 text-secondary">
                <span
                  className="h-1.5 rounded-sm bg-accent-sage/28"
                  style={{ width: `${Math.max(8, (r.verified_dropoffs / maxD) * 100)}%`, maxWidth: "100%" }}
                  title={`${r.estimated_kg.toFixed(1)} kg est.`}
                />
                <span className="flex min-w-0 flex-1 justify-between gap-2">
                  <span className="truncate">{r.city}</span>
                  <span className="shrink-0 tabular-nums text-dim">
                    {r.verified_dropoffs} · {r.estimated_kg.toFixed(0)} kg
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function PlatformAdminDashboardPage() {
  const snapQuery = useQuery({
    queryKey: queryKeys.platformOperations,
    queryFn: () => platformService.getOperationsSnapshot(),
  });

  if (snapQuery.isError) {
    const detail = isAxiosError(snapQuery.error)
      ? (snapQuery.error.response?.data as { detail?: string } | undefined)?.detail
      : undefined;
    const forbidden = isAxiosError(snapQuery.error) && snapQuery.error.response?.status === 403;
    return (
      <div className="mx-auto max-w-lg py-4">
        <ErrorState
          title={forbidden ? "Access denied" : "Could not load network operations"}
          message={
            forbidden
              ? "Platform operations require a platform_admin session."
              : detail ?? "Confirm the API is running and you are signed in."
          }
          onRetry={() => void snapQuery.refetch()}
        />
      </div>
    );
  }

  const snap = snapQuery.data;

  return (
    <div className="relative mx-auto max-w-6xl space-y-3 px-0.5 pb-6">
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-2">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-accent-sage">
            Platform operations
          </p>
          <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Tareka network infrastructure
          </h1>
          <p className="mt-1 max-w-3xl text-xs leading-snug text-secondary">
            Internal console for collection network oversight — approvals, verification load, auth telemetry, and
            verified intake signals. Figures are live from the API; no synthetic KPIs.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button href="/directory" variant="secondary" size="sm" className="text-xs">
            Directory
          </Button>
          <Button href="/company/dashboard" variant="secondary" size="sm" className="text-xs">
            Org workspace
          </Button>
        </div>
      </header>

      {snapQuery.isLoading || !snap ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg border border-border bg-surface" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            <KpiCard label="Active recyclers" value={snap.users.active_recyclers.toLocaleString()} hint="Accounts · active" />
            <KpiCard
              label="Active businesses"
              value={snap.companies.active_businesses.toLocaleString()}
              hint="Company records"
            />
            <KpiCard
              label="Operational hubs"
              value={snap.sites.operational_hubs.toLocaleString()}
              hint="Active sites"
            />
            <KpiCard
              label="Pending approvals"
              value={(
                snap.onboarding.pending_company_access_requests + snap.companies.pending_network_approval
              ).toLocaleString()}
              hint={`Access req · ${snap.onboarding.pending_company_access_requests} · Net · ${snap.companies.pending_network_approval}`}
            />
            <KpiCard
              label="Flagged intake"
              value={snap.risk_signals.automated_flagged_dropoffs == null ? "—" : String(snap.risk_signals.automated_flagged_dropoffs)}
              hint="No automated moderation queue in API"
            />
          </div>

          <div className="grid gap-2 lg:grid-cols-12">
            <div className="relative overflow-hidden rounded-lg border border-border bg-elevated/25 p-2.5 lg:col-span-4">
              <ConstellationBackdrop />
              <div className="relative">
                <PanelTitle>Network health (est.)</PanelTitle>
                <p className="mt-0.5 text-[10px] text-dim">Cached platform aggregate · intake methodology</p>
                <dl className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <dt className="text-dim">Verified drop-offs</dt>
                    <dd className="font-heading text-base tabular-nums text-foreground">
                      {snap.platform_impact.verified_dropoffs.toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-dim">Active partners (dir.)</dt>
                    <dd className="font-heading text-base tabular-nums text-foreground">
                      {(snap.platform_impact.active_companies ?? "—").toString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-dim">Est. mass</dt>
                    <dd className="tabular-nums text-secondary">
                      {snap.platform_impact.total_estimated_weight_kg.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}{" "}
                      kg
                    </dd>
                  </div>
                  <div>
                    <dt className="text-dim">Est. CO₂ avoided</dt>
                    <dd className="tabular-nums text-secondary">
                      {snap.platform_impact.total_estimated_co2_avoided_kg.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}{" "}
                      kg
                    </dd>
                  </div>
                </dl>
                <p className="mt-2 text-[9px] text-dim">
                  Snapshot {formatDateShort(snap.generated_at)} · operational route only
                </p>
              </div>
            </div>

            <div className="lg:col-span-4">
              <RegionalHeat rows={snap.regional_intake} />
            </div>

            <div className="rounded-lg border border-border bg-surface p-2.5 lg:col-span-4">
              <PanelTitle>Operator verification load</PanelTitle>
              <p className="mt-0.5 text-[10px] text-dim">Directory operators pending identity flags</p>
              <p className="mt-2 font-heading text-xl font-semibold tabular-nums text-foreground">
                {snap.users.operators_pending_verification}
              </p>
              <p className="mt-0.5 text-[10px] text-dim">
                Active operators: {snap.users.active_operators.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-border bg-surface p-2.5">
              <PanelTitle>Partner access queue</PanelTitle>
              <p className="mt-0.5 text-[10px] text-dim">Inbound company access requests</p>
              {snap.onboarding.recent_requests.length === 0 ? (
                <p className="mt-2 text-[11px] text-dim">No pending requests.</p>
              ) : (
                <ul className="mt-1.5 max-h-40 space-y-1.5 overflow-y-auto text-[11px]">
                  {snap.onboarding.recent_requests.map((r) => (
                    <li key={r.id} className="border-b border-border/60 pb-1.5 text-secondary last:border-0 last:pb-0">
                      <span className="font-medium text-foreground">{r.company_name}</span>
                      <span className="text-dim"> · {r.contact_person}</span>
                      <div className="text-[10px] text-dim">{r.work_email}</div>
                      <div className="text-[10px] text-dim">{formatDateShort(r.created_at)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-lg border border-border bg-surface p-2.5">
              <PanelTitle>Auth risk tail</PanelTitle>
              <p className="mt-0.5 text-[10px] text-dim">
                {snap.risk_signals.note} Failed logins (7d):{" "}
                <span className="tabular-nums text-foreground">{snap.risk_signals.failed_logins_7d}</span>
              </p>
              {snap.risk_signals.recent_failed_logins.length === 0 ? (
                <p className="mt-2 text-[11px] text-dim">No recent failed logins.</p>
              ) : (
                <ul className="mt-1.5 space-y-1 text-[11px] text-secondary">
                  {snap.risk_signals.recent_failed_logins.map((e) => (
                    <li key={e.id} className="flex justify-between gap-2">
                      <span className="text-dim">{formatDateShort(e.created_at)}</span>
                      <span className="truncate font-mono text-[10px] text-dim">{e.entity_id}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-lg border border-border bg-surface p-2.5">
              <PanelTitle>Recent network intake</PanelTitle>
              <p className="mt-0.5 text-[10px] text-dim">Verified drop-offs · newest first</p>
              {snap.network_events.length === 0 ? (
                <p className="mt-2 text-[11px] text-dim">No events.</p>
              ) : (
                <ul className="mt-1.5 max-h-40 space-y-1 overflow-y-auto text-[11px]">
                  {snap.network_events.map((e) => (
                    <li key={e.id} className="text-secondary">
                      <span className="text-dim">{formatDateShort(e.confirmed_at)}</span> · {e.city}{" "}
                      <span className="text-dim">· {formatMaterial(e.material_type)}</span>
                      <div className="truncate text-[10px] text-dim">{e.company_name}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-lg border border-border bg-surface p-2.5">
              <PanelTitle>Moderation & approvals</PanelTitle>
              <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-secondary">
                <li>
                  · Businesses awaiting network approval:{" "}
                  <span className="tabular-nums text-foreground">{snap.companies.pending_network_approval}</span>
                </li>
                <li>· Drop-off fraud scoring is not exposed — review via ops process until models land.</li>
                <li>
                  · Open an organisation workspace with{" "}
                  <Link className="text-accent-sage hover:opacity-90" href="/company/dashboard">
                    Org workspace
                  </Link>{" "}
                  and <code className="rounded bg-elevated px-1 py-0.5 text-[10px]">?companyId=</code>.
                </li>
              </ul>
            </div>
          </div>

          <div className="grid gap-2 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-2.5">
              <PanelTitle>Partner growth</PanelTitle>
              <p className="mt-0.5 text-[10px] text-dim">Newest active company records</p>
              {snap.partner_growth.recent_companies.length === 0 ? (
                <p className="mt-2 text-[11px] text-dim">No companies yet.</p>
              ) : (
                <ul className="mt-1.5 max-h-44 space-y-1 overflow-y-auto text-[11px]">
                  {snap.partner_growth.recent_companies.map((c) => (
                    <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 text-secondary">
                      <span className="min-w-0 truncate font-medium text-foreground">{c.name}</span>
                      <div className="flex shrink-0 items-center gap-1">
                        <span className="text-[9px] uppercase text-dim">
                          {c.is_verified ? "verified" : "unverified"} · {c.is_approved ? "approved" : "pending"}
                        </span>
                        <Button href={`/company/dashboard?companyId=${c.id}`} variant="secondary" size="sm" className="text-[10px] px-2 py-0.5">
                          Ops
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-lg border border-border bg-surface p-2.5">
              <PanelTitle>Audit trail</PanelTitle>
              <p className="mt-0.5 text-[10px] text-dim">Latest security & intake events</p>
              <div className="mt-1.5 max-h-44 overflow-y-auto font-mono text-[10px] leading-relaxed text-secondary">
                {snap.audit_tail.length === 0 ? (
                  <p className="text-[11px] text-dim">No audit rows.</p>
                ) : (
                  <ul className="space-y-1">
                    {snap.audit_tail.map((a) => (
                      <li key={a.id}>
                        <span className="text-dim">{formatDateShort(a.created_at)}</span> {a.action}{" "}
                        <span className="text-dim">
                          {a.entity_type}:{a.entity_id.slice(0, 8)}…
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <p className="text-[10px] text-dim">
            Internal use only. No public navigation entry — access is role-gated via middleware and session validation.
          </p>
        </>
      )}
    </div>
  );
}
