"use client";

import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { Button } from "@/components/button";
import { ErrorState } from "@/components/error-state";
import { queryKeys } from "@/lib/query-keys";
import { companyDashboardService } from "@/services/company-dashboard.service";
import { companyService } from "@/services/company.service";
import { dropoffService } from "@/services/dropoff.service";
import { payoutService } from "@/services/payout.service";
import { useAuthStore } from "@/store/auth";
import type {
  CompanyDashboardSummary,
  CompanyDropoffAdminItem,
  User,
} from "@/types";

function utcMondayDateString(d: Date = new Date()): string {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = x.getUTCDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  x.setUTCDate(x.getUTCDate() + mondayOffset);
  return x.toISOString().slice(0, 10);
}

function formatWeightKg(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} t (est.)`;
  return `${kg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg (est.)`;
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMaterial(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatKes(n: number): string {
  return `KES ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function resolveCompanyId(user: User, searchCompanyId: string | null): string | null {
  if (user.role === "platform_admin") {
    return searchCompanyId?.trim() || null;
  }
  if (user.role === "company_admin") {
    return user.companyId?.trim() || null;
  }
  return null;
}

function exportDropoffsCsv(items: CompanyDropoffAdminItem[]) {
  const headers = [
    "date",
    "site",
    "recycler",
    "material",
    "items",
    "estimated_kg",
    "reward_type",
    "status",
  ];
  const rows = items.map((r) => [
    r.confirmed_at,
    r.site_name.replace(/,/g, ";"),
    r.recycler_name.replace(/,/g, ";"),
    r.material_type,
    String(r.item_count),
    r.estimated_weight_kg != null ? String(r.estimated_weight_kg) : "",
    r.reward_type,
    r.reward_issued ? "reward_logged" : "pending_reward",
  ]);
  const body = [headers.join(","), ...rows.map((c) => c.join(","))].join("\n");
  const blob = new Blob([body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tareka-org-contribution-log-${utcMondayDateString()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportEsgSnapshot(params: {
  companyId: string;
  companyName: string;
  summary: CompanyDashboardSummary;
  dropoffs: CompanyDropoffAdminItem[];
}) {
  const { companyId, companyName, summary, dropoffs } = params;
  const payload = {
    kind: "tareka_organization_esg_snapshot",
    disclaimer:
      "Estimates use network methodology; not audited. Recycler/operator breakdowns may be partial (capped fetch).",
    generated_at: new Date().toISOString(),
    organization: { id: companyId, name: companyName },
    aggregates: {
      verified_dropoffs: summary.verified_dropoffs,
      total_estimated_weight_kg: summary.total_estimated_weight_kg,
      estimated_weight_label: summary.estimated_weight_label,
      total_estimated_co2_avoided_kg: summary.total_estimated_co2_avoided_kg,
      co2_estimate_label: summary.co2_estimate_label,
      distinct_recyclers: summary.distinct_recyclers,
      active_sites: summary.active_sites,
      pending_kes_obligations_week: summary.pending_kes_obligations_week,
      ledger_tip_hash: summary.ledger_tip_hash,
    },
    material_mix: summary.material_mix,
    weekly_intake: summary.weekly_intake,
    sites: summary.sites,
    recent_dropoffs_sample: dropoffs.slice(0, 40),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tareka-esg-snapshot-${companyId.slice(0, 8)}-${utcMondayDateString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function downloadWeeklyPayoutJson(companyId: string) {
  const weekOf = utcMondayDateString();
  const rows = await payoutService.getCompanyWeekly(companyId, weekOf);
  const payload = {
    source: "GET /payouts/company/:id/weekly",
    week_of_utc_iso_week: weekOf,
    generated_at: new Date().toISOString(),
    rows,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tareka-payout-week-${weekOf}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function recyclerLeaders(items: CompanyDropoffAdminItem[], limit: number) {
  const map = new Map<string, { name: string; count: number }>();
  for (const d of items) {
    const cur = map.get(d.recycler_id) ?? { name: d.recycler_name, count: 0 };
    cur.count += 1;
    map.set(d.recycler_id, cur);
  }
  return [...map.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([id, v]) => ({ id, ...v }));
}

function rewardRollup(items: CompanyDropoffAdminItem[]) {
  let issued = 0;
  let pending = 0;
  const byType = new Map<string, number>();
  for (const d of items) {
    if (d.reward_issued) issued += 1;
    else pending += 1;
    byType.set(d.reward_type, (byType.get(d.reward_type) ?? 0) + 1);
  }
  return { issued, pending, byType: [...byType.entries()].sort((a, b) => b[1] - a[1]) };
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

function IntakeTrendPanel({ summary }: { summary: CompanyDashboardSummary }) {
  const weeks = summary.weekly_intake;
  const maxKg = Math.max(1, ...weeks.map((w) => w.estimated_kg));
  return (
    <div className="rounded-lg border border-border bg-surface p-2.5">
      <PanelTitle>Contribution trend (est.)</PanelTitle>
      <p className="mt-0.5 text-[10px] text-dim">Verified intake by ISO week · UTC</p>
      <div className="mt-1.5 flex h-14 items-end gap-0.5">
        {weeks.length === 0 ? (
          <p className="text-[11px] text-dim">No weekly series yet.</p>
        ) : (
          weeks.map((w) => (
            <div key={w.week_start} className="flex flex-1 flex-col items-center justify-end gap-0.5">
              <div
                className="w-full min-h-[2px] rounded-sm bg-accent-sage/32"
                style={{
                  height: `${Math.max(3, Math.round((w.estimated_kg / maxKg) * 40))}px`,
                }}
                title={`${w.dropoff_count} · ${w.estimated_kg.toFixed(1)} kg est.`}
              />
              <span className="text-[8px] text-dim tabular-nums">{w.week_start.slice(5)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function LedgerTipPanel({ hash }: { hash: string | null }) {
  const preview = hash ? `${hash.slice(0, 10)}…${hash.slice(-8)}` : "—";
  return (
    <div className="rounded-lg border border-border bg-elevated/35 px-2.5 py-2">
      <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-dim">Verification anchor</p>
      <p className="mt-0.5 font-mono text-[10px] leading-snug text-secondary break-all">{preview}</p>
      <p className="mt-0.5 text-[9px] text-dim">Latest chained record hash for this org (audit trail tip).</p>
    </div>
  );
}

export default function CompanyDashboardPage() {
  const user = useAuthStore((s) => s.user)!;
  const searchParams = useSearchParams();
  const searchCompanyId = searchParams.get("companyId");

  const companyId = useMemo(
    () => resolveCompanyId(user, searchCompanyId),
    [user, searchCompanyId],
  );

  const companyQuery = useQuery({
    queryKey: queryKeys.company(companyId ?? ""),
    queryFn: () => companyService.getById(companyId!),
    enabled: Boolean(companyId),
  });

  const summaryQuery = useQuery({
    queryKey: queryKeys.companyDashboard(companyId ?? ""),
    queryFn: () => companyDashboardService.getSummary(companyId!),
    enabled: Boolean(companyId),
  });

  const dropoffsQuery = useQuery({
    queryKey: queryKeys.companyDropoffs(companyId ?? "", 40, 0),
    queryFn: () => dropoffService.listByCompany(companyId!, { limit: 40, offset: 0 }),
    enabled: Boolean(companyId),
  });

  const dropoffs = dropoffsQuery.data?.items ?? [];
  const leaders = useMemo(() => recyclerLeaders(dropoffs, 6), [dropoffs]);
  const rewards = useMemo(() => rewardRollup(dropoffs), [dropoffs]);
  const operatorCount = useMemo(() => new Set(dropoffs.map((d) => d.operator_id)).size, [dropoffs]);

  if (!companyId) {
    return (
      <div className="mx-auto max-w-lg space-y-3 py-4">
        {user.role === "platform_admin" ? (
          <div className="rounded-lg border border-border bg-surface px-6 py-8 text-center">
            <p className="font-heading text-lg font-semibold text-foreground">Select a company</p>
            <p className="mt-2 text-sm text-muted">
              Add <code className="rounded bg-elevated px-1 py-0.5 text-xs">?companyId=…</code> to this URL.
              Company IDs appear on directory site cards.
            </p>
            <div className="mt-4">
              <Button href="/directory" variant="secondary" size="sm">
                Open directory
              </Button>
            </div>
          </div>
        ) : (
          <ErrorState
            title="Company not linked"
            message="Your account has no company_id yet. Finish onboarding or contact support so we can attach your organisation."
          />
        )}
      </div>
    );
  }

  const axiosDetail =
    summaryQuery.isError && isAxiosError(summaryQuery.error)
      ? (summaryQuery.error.response?.data as { detail?: string } | undefined)?.detail
      : undefined;

  if (summaryQuery.isError) {
    const forbidden = isAxiosError(summaryQuery.error) && summaryQuery.error.response?.status === 403;
    return (
      <div className="mx-auto max-w-lg py-4">
        <ErrorState
          title={forbidden ? "Access denied" : "Could not load workspace"}
          message={
            forbidden
              ? "You can only view your organisation’s operational data."
              : axiosDetail ?? "Try again shortly or verify the API is running."
          }
        />
      </div>
    );
  }

  const summary = summaryQuery.data;
  const companyName = companyQuery.data?.name ?? "Organization";
  const slugNote = companyQuery.data?.slug?.replace(/-/g, " ");

  return (
    <div className="mx-auto max-w-6xl space-y-3 px-0.5 pb-6">
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-2">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-accent-sage">
            Private impact &amp; operations
          </p>
          <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {companyName}
          </h1>
          {slugNote ? (
            <p className="text-[11px] text-dim">
              Workspace · <span className="text-secondary">{slugNote}</span>
            </p>
          ) : null}
          <p className="mt-1 max-w-3xl text-xs leading-snug text-secondary">
            Monitor verified contributions, hubs, recycler participation, and estimate-based ESG metrics.
            Export logs for internal reporting — figures are methodological estimates unless separately audited.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="text-xs"
            disabled={!summary || !dropoffs.length}
            onClick={() => {
              if (summary)
                exportEsgSnapshot({
                  companyId,
                  companyName,
                  summary,
                  dropoffs,
                });
            }}
          >
            ESG snapshot
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="text-xs"
            disabled={!dropoffs.length}
            onClick={() => exportDropoffsCsv(dropoffs)}
          >
            Contribution CSV
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="text-xs"
            onClick={() => {
              downloadWeeklyPayoutJson(companyId).catch(() => {
                window.alert("Could not download payout report. Check network and permissions.");
              });
            }}
          >
            Payout week
          </Button>
          <Button href="/settings" variant="primary" size="sm" className="text-xs">
            Programs
          </Button>
        </div>
      </header>

      {/* Program / campaign strip — no separate campaign API */}
      <div className="rounded-lg border border-border bg-surface-raised/50 px-3 py-2">
        <p className="text-[11px] leading-snug text-secondary">
          <span className="font-medium text-foreground">Contribution programs:</span> appreciation and KES flows follow
          partner configuration and ledger rules. Connect reward policies under{" "}
          <Link href="/settings" className="text-accent-sage hover:opacity-90">
            Settings
          </Link>
          . No standalone campaign object is exposed in this API yet.
        </p>
      </div>

      {summaryQuery.isLoading || !summary ? (
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg border border-border bg-surface" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            <KpiCard
              label="Verified contributions"
              value={summary.verified_dropoffs.toLocaleString()}
              hint="Drop-offs on record"
            />
            <KpiCard
              label="Material recovery"
              value={formatWeightKg(summary.total_estimated_weight_kg)}
              hint={`${summary.estimated_weight_label} · estimate`}
            />
            <KpiCard
              label="Est. CO₂ diversion"
              value={`${summary.total_estimated_co2_avoided_kg.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg`}
              hint={`${summary.co2_estimate_label} · estimate`}
            />
            <KpiCard
              label="Recycler participation"
              value={summary.distinct_recyclers.toLocaleString()}
              hint="Distinct recyclers"
            />
            <KpiCard
              label="Collection hubs"
              value={summary.active_sites.toLocaleString()}
              hint="Active sites (directory)"
            />
            <KpiCard
              label="Pending KES (week)"
              value={formatKes(summary.pending_kes_obligations_week)}
              hint="UTC ledger · pending"
            />
          </div>

          <div className="grid gap-2 lg:grid-cols-12">
            <div className="space-y-2 lg:col-span-4">
              <IntakeTrendPanel summary={summary} />
              <LedgerTipPanel hash={summary.ledger_tip_hash} />
            </div>

            <div className="rounded-lg border border-border bg-surface p-2.5 lg:col-span-4">
              <PanelTitle>Material recovery mix</PanelTitle>
              {summary.material_mix.length === 0 ? (
                <p className="mt-2 text-[11px] text-dim">No mix yet.</p>
              ) : (
                <ul className="mt-1.5 max-h-32 space-y-1 overflow-y-auto text-[11px]">
                  {summary.material_mix.map((m) => (
                    <li key={m.material_type} className="flex justify-between gap-2 text-secondary">
                      <span>{formatMaterial(m.material_type)}</span>
                      <span className="shrink-0 tabular-nums text-dim">
                        {m.estimated_kg.toFixed(1)} kg (est.) · {m.dropoffs}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-lg border border-border bg-surface p-2.5 lg:col-span-4">
              <PanelTitle>Participating hubs</PanelTitle>
              {summary.sites.length === 0 ? (
                <p className="mt-2 text-[11px] text-dim">No hub intake yet.</p>
              ) : (
                <ul className="mt-1.5 max-h-32 space-y-1 overflow-y-auto text-[11px]">
                  {summary.sites.slice(0, 8).map((s) => (
                    <li key={s.site_id} className="flex justify-between gap-2 text-secondary">
                      <span className="min-w-0 truncate">{s.site_name}</span>
                      <span className="shrink-0 tabular-nums text-dim">
                        {s.dropoff_count} · {s.estimated_kg.toFixed(0)} kg (est.)
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Operational row: engagement, rewards, operators, queue */}
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-border bg-surface p-2.5">
              <PanelTitle>Recycler engagement</PanelTitle>
              <p className="mt-0.5 text-[10px] text-dim">
                Top recyclers by rows in current fetch (max 40) — not full population.
              </p>
              {dropoffsQuery.isLoading ? (
                <p className="mt-2 text-[11px] text-dim">Loading…</p>
              ) : leaders.length === 0 ? (
                <p className="mt-2 text-[11px] text-dim">No recent rows.</p>
              ) : (
                <ul className="mt-1.5 space-y-1 text-[11px]">
                  {leaders.map((r) => (
                    <li key={r.id} className="flex justify-between gap-2 text-secondary">
                      <span className="min-w-0 truncate">{r.name}</span>
                      <span className="shrink-0 tabular-nums text-dim">{r.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-lg border border-border bg-surface p-2.5">
              <PanelTitle>Reward / token issuance</PanelTitle>
              <p className="mt-0.5 text-[10px] text-dim">From recent contribution rows (same fetch).</p>
              {dropoffsQuery.isLoading ? (
                <p className="mt-2 text-[11px] text-dim">Loading…</p>
              ) : (
                <>
                  <p className="mt-1.5 text-[11px] text-secondary">
                    Logged: <span className="tabular-nums text-foreground">{rewards.issued}</span> · Pending:{" "}
                    <span className="tabular-nums text-foreground">{rewards.pending}</span>
                  </p>
                  <ul className="mt-1 space-y-0.5 text-[10px] text-dim">
                    {rewards.byType.map(([t, n]) => (
                      <li key={t} className="flex justify-between">
                        <span className="uppercase">{t}</span>
                        <span className="tabular-nums">{n}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className="rounded-lg border border-border bg-surface p-2.5">
              <PanelTitle>Operator activity</PanelTitle>
              <p className="mt-0.5 text-[10px] text-dim">Distinct operator IDs in recent fetch.</p>
              <p className="mt-2 font-heading text-xl font-semibold tabular-nums text-foreground">
                {dropoffs.length ? operatorCount : "—"}
              </p>
              <p className="mt-0.5 text-[10px] text-dim">
                Per-operator timelines require a dedicated endpoint — not exposed here yet.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface p-2.5">
              <PanelTitle>Review & verification</PanelTitle>
              <p className="mt-1.5 text-[11px] leading-relaxed text-secondary">
                All rows below are <span className="text-foreground">operator-verified</span> intake. A separate dispute
                queue is not connected — escalate outsides this UI or via your ops process until an API exists.
              </p>
            </div>
          </div>

          {/* ESG reporting summary */}
          <div className="rounded-lg border border-border bg-surface-raised/40 p-3">
            <PanelTitle>ESG reporting summary</PanelTitle>
            <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-secondary">
              <li>
                · Use <strong className="font-medium text-foreground">ESG snapshot</strong> for a JSON bundle suitable for
                internal data stores (includes methodology labels).
              </li>
              <li>
                · <strong className="font-medium text-foreground">Contribution CSV</strong> lists line-level intake for audit
                sampling (export capped to loaded rows).
              </li>
              <li>· CO₂ and mass are estimates — disclose methodology in your sustainability report.</li>
            </ul>
          </div>
        </>
      )}

      <div className="rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-2.5 py-2">
          <h2 className="font-heading text-sm font-semibold text-foreground">Verified contribution log</h2>
          {dropoffsQuery.isLoading ? (
            <span className="text-[10px] text-dim">Loading…</span>
          ) : null}
        </div>
        <div className="max-h-[min(240px,32vh)] overflow-x-auto overflow-y-auto">
          <table className="w-full min-w-[720px] text-left text-[11px]">
            <thead className="sticky top-0 bg-elevated/95 text-[9px] uppercase tracking-wide text-dim backdrop-blur-sm">
              <tr>
                <th className="px-2.5 py-1.5 font-medium">Date</th>
                <th className="px-2.5 py-1.5 font-medium">Hub</th>
                <th className="px-2.5 py-1.5 font-medium">Recycler</th>
                <th className="px-2.5 py-1.5 font-medium">Material</th>
                <th className="px-2.5 py-1.5 font-medium">Qty (est.)</th>
                <th className="px-2.5 py-1.5 font-medium">Reward</th>
                <th className="px-2.5 py-1.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {dropoffsQuery.isLoading ? (
                <tr>
                  <td colSpan={7} className="px-2.5 py-6 text-center text-dim">
                    Loading records…
                  </td>
                </tr>
              ) : dropoffsQuery.isError ? (
                <tr>
                  <td colSpan={7} className="px-2.5 py-5 text-center text-secondary">
                    Could not load contributions. Check access or API availability.
                  </td>
                </tr>
              ) : dropoffs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-2.5 py-6 text-center text-dim">
                    No verified contributions yet for this organization.
                  </td>
                </tr>
              ) : (
                dropoffs.map((r) => (
                  <tr key={r.id} className="border-t border-border text-secondary">
                    <td className="whitespace-nowrap px-2.5 py-1.5 text-foreground">{formatDateShort(r.confirmed_at)}</td>
                    <td className="max-w-[120px] truncate px-2.5 py-1.5">{r.site_name}</td>
                    <td className="max-w-[100px] truncate px-2.5 py-1.5">{r.recycler_name}</td>
                    <td className="whitespace-nowrap px-2.5 py-1.5">{formatMaterial(r.material_type)}</td>
                    <td className="whitespace-nowrap px-2.5 py-1.5 tabular-nums">
                      {r.item_count}
                      {r.estimated_weight_kg != null
                        ? ` · ~${r.estimated_weight_kg.toFixed(1)} kg`
                        : ""}
                    </td>
                    <td className="whitespace-nowrap px-2.5 py-1.5 uppercase text-dim">{r.reward_type}</td>
                    <td className="whitespace-nowrap px-2.5 py-1.5">
                      <span className="rounded bg-accent-sage/10 px-1 py-0.5 text-[9px] font-medium text-accent-sage">
                        Verified
                      </span>
                      <span className="ml-1 text-[9px] text-dim">{r.reward_issued ? "· issued" : "· pending"}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[10px] text-dim">
        Estimates are <span className="font-medium text-secondary">not</span> laboratory certifications. Exports reflect
        current API responses only — no fabricated success states.
      </p>

      <div className="flex flex-wrap gap-2 text-[11px]">
        <Link href="/directory" className="text-accent-sage hover:opacity-85">
          Network directory →
        </Link>
        {user.role === "platform_admin" ? <span className="text-dim">Platform · org {companyId}</span> : null}
      </div>
    </div>
  );
}
