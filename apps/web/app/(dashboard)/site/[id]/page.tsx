"use client";

import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useParams } from "next/navigation";

import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { ErrorState } from "@/components/error-state";
import { MapPlaceholder } from "@/components/map-placeholder";
import { queryKeys } from "@/lib/query-keys";
import { companyService } from "@/services/company.service";
import { impactService } from "@/services/impact.service";

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

  const impactQuery = useQuery({
    queryKey: queryKeys.companyImpact(id),
    queryFn: () => impactService.getCompanyImpact(id),
    enabled: Boolean(id) && Boolean(companyQuery.data),
  });

  if (!id) {
    return <p className="text-sm text-muted">Missing site identifier.</p>;
  }

  if (companyQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-10 w-2/3 animate-pulse rounded bg-elevated" />
        <div className="h-40 animate-pulse rounded-lg border border-border bg-surface" />
      </div>
    );
  }

  if (companyQuery.isError) {
    const msg =
      isAxiosError(companyQuery.error)
        ? String(companyQuery.error.response?.data?.error?.message ?? companyQuery.error.message)
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

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">{company.name}</h1>
            {company.is_verified ? <Badge variant="verified">Verified partner</Badge> : null}
          </div>
          <p className="mt-2 text-sm text-muted">
            Network partner · {company.slug.replace(/-/g, " ")} · Kenya
          </p>
        </div>
        <Button href="/directory" variant="secondary" size="sm">
          Directory
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About this collection partner</CardTitle>
          <CardDescription>
            Hours, accepted streams, and on-site rewards follow each partner&apos;s policy. Confirm
            details with the site team before travelling.
          </CardDescription>
        </CardHeader>
        <p className="text-sm leading-relaxed text-foreground">
          {company.description ??
            "This partner digitises intake on tareka. Ask staff which materials they are accepting today and how appreciation tokens or other benefits apply."}
        </p>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Materials & rewards</CardTitle>
            <CardDescription>
              Accepted categories and token rules are configured per partner. Operators confirm what
              they receive at the door.
            </CardDescription>
          </CardHeader>
          <ul className="list-inside list-disc text-sm text-muted">
            <li>Plastic, glass, metal, paper, e-waste — subject to site capacity</li>
            <li>Appreciation tokens only where the partner has them enabled</li>
          </ul>
        </Card>
        <MapPlaceholder label="Site map" />
      </div>

      {impactQuery.isLoading ? (
        <div className="h-24 animate-pulse rounded-lg bg-elevated" />
      ) : impactQuery.data ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estimated network totals for this partner</CardTitle>
            <CardDescription>
              Aggregates verified drop-offs attributed to this organisation. All figures are
              estimates.
            </CardDescription>
          </CardHeader>
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted">Verified drop-offs</dt>
              <dd className="font-heading text-xl font-semibold tabular-nums">
                {impactQuery.data.verified_dropoffs}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Weight diverted (est.)</dt>
              <dd className="font-heading text-xl font-semibold tabular-nums">
                {formatKg(impactQuery.data.total_estimated_weight_kg)} kg
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">CO₂ (est.)</dt>
              <dd className="font-heading text-xl font-semibold tabular-nums">
                {formatKg(impactQuery.data.total_estimated_co2_avoided_kg)} kg CO₂e
              </dd>
            </div>
          </dl>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button variant="primary" href="/directory">
          Drop off here
        </Button>
        <Button variant="secondary" href="/wallet">
          Review wallet
        </Button>
      </div>
    </div>
  );
}
