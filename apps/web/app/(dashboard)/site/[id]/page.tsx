"use client";

import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useParams } from "next/navigation";

import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { ErrorState } from "@/components/error-state";
import { MapPlaceholder } from "@/components/map-placeholder";
import { inferMaterialsFromDescription, materialChipLabel } from "@/lib/directory-helpers";
import { queryKeys } from "@/lib/query-keys";
import { companyService } from "@/services/company.service";

function formatKg(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export default function SiteProfilePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const companyQuery = useQuery({
    queryKey: queryKeys.company(id),
    queryFn: () => companyService.getById(id),
    enabled: Boolean(id),
  });

  if (!id) {
    return <p className="text-sm text-muted">Missing site identifier.</p>;
  }

  if (companyQuery.isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="h-24 animate-pulse rounded-2xl border border-border bg-surface" />
        <div className="h-40 animate-pulse rounded-xl border border-border bg-surface" />
      </div>
    );
  }

  if (companyQuery.isError) {
    const msg = isAxiosError(companyQuery.error)
      ? String(
          (companyQuery.error.response?.data as { detail?: string })?.detail ??
            (companyQuery.error.response?.data as { error?: { message?: string } })?.error?.message ??
            companyQuery.error.message,
        )
      : "Unable to load partner.";
    return <ErrorState message={msg} onRetry={() => void companyQuery.refetch()} />;
  }

  const company = companyQuery.data;
  if (!company) {
    return (
      <div className="mx-auto max-w-xl">
        <ErrorState title="Partner not found" message="Check the link or return to the directory." />
        <div className="mt-4">
          <Button href="/directory" variant="secondary">
            Back to directory
          </Button>
        </div>
      </div>
    );
  }

  const materials = inferMaterialsFromDescription(company.description);

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-2">
      {/* Hero — operational hub */}
      <section className="rounded-2xl border border-border bg-gradient-to-b from-surface via-surface to-surface-raised/50 p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-accent-sage">
              Collection hub
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold tracking-[-0.02em] text-foreground">
                {company.name}
              </h1>
              {company.is_verified ? (
                <Badge variant="verified" className="text-[9px] uppercase tracking-[0.08em]">
                  Trusted partner
                </Badge>
              ) : (
                <span className="rounded border border-border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-dim">
                  Community site
                </span>
              )}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              Network partner · Kenya · slug <span className="text-dim">{company.slug}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {materials.map((m) => (
                <span
                  key={m}
                  className="rounded-md border border-border/80 bg-canvas/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.05em] text-secondary"
                >
                  {materialChipLabel(m)}
                </span>
              ))}
            </div>
          </div>
          <Button href="/directory" variant="secondary" size="sm">
            Directory
          </Button>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="space-y-4">
          <Card className="border-border bg-surface shadow-sm">
            <CardHeader className="mb-2">
              <CardTitle className="text-base">About this site</CardTitle>
              <CardDescription>
                Hours and accepted streams follow each partner&apos;s policy. Staff confirm what they
                can receive at the door — this page does not replace on-site verification.
              </CardDescription>
            </CardHeader>
            <p className="text-sm leading-relaxed text-secondary">
              {company.description ??
                "This partner records intake on tareka. Ask which materials they are accepting today and how appreciation tokens or other benefits apply."}
            </p>
          </Card>

          <Card className="border-border bg-surface shadow-sm">
            <CardHeader className="mb-2">
              <CardTitle className="text-base">Operating hours</CardTitle>
              <CardDescription>Live opening times are not synced here yet.</CardDescription>
            </CardHeader>
            <p className="text-sm text-secondary">
              Call or message the site before travelling. Operator schedules and public holidays change
              what they can accept.
            </p>
          </Card>

          <Card className="border-border bg-surface shadow-sm">
            <CardHeader className="mb-2">
              <CardTitle className="text-base">Materials &amp; rewards</CardTitle>
              <CardDescription>
                Categories above are inferred from this partner&apos;s description. Operators have the
                final word at intake.
              </CardDescription>
            </CardHeader>
            <ul className="space-y-1.5 text-sm text-secondary">
              <li className="flex gap-2">
                <span className="text-accent-sage" aria-hidden>
                  ·
                </span>
                Appreciation tokens only where the partner has enabled a program.
              </li>
              <li className="flex gap-2">
                <span className="text-accent-sage" aria-hidden>
                  ·
                </span>
                Estimated weights and CO₂ use network methodology — not lab certificates.
              </li>
            </ul>
          </Card>
        </div>

        <div className="space-y-4">
          <MapPlaceholder
            variant="network"
            label="Coverage context for this hub"
            className="min-h-[280px]"
          />

          <Card className="border-border bg-surface shadow-sm">
            <CardHeader className="mb-2">
              <CardTitle className="text-base">Verified intake (estimates)</CardTitle>
              <CardDescription>
                Public directory aggregate only — no recycler identities, ledgers, or contribution logs. Mass and CO₂ use
                network methodology, not lab certification.
              </CardDescription>
            </CardHeader>
            <dl className="grid gap-3 sm:grid-cols-3">
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-wide text-dim">Drop-offs</dt>
                <dd className="mt-0.5 font-heading text-lg font-semibold tabular-nums text-foreground">
                  {company.public_impact.verified_dropoffs}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-wide text-dim">
                  Weight ({company.public_impact.estimated_weight_label})
                </dt>
                <dd className="mt-0.5 font-heading text-lg font-semibold tabular-nums text-foreground">
                  {formatKg(company.public_impact.total_estimated_weight_kg)} kg
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-wide text-dim">
                  CO₂ ({company.public_impact.co2_estimate_label})
                </dt>
                <dd className="mt-0.5 font-heading text-lg font-semibold tabular-nums text-foreground">
                  {formatKg(company.public_impact.total_estimated_co2_avoided_kg)} kg
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button variant="primary" href="/directory">
          Plan a drop-off
        </Button>
        <Button variant="secondary" href="/recycler/wallet">
          Open wallet
        </Button>
      </div>
    </div>
  );
}
