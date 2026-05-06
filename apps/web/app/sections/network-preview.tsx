"use client";

import { isAxiosError } from "axios";

import { Button } from "@/components/button";
import { SiteCardCompact, SiteCardSkeleton } from "@/components/site-card";
import { useFeaturedSites } from "@/hooks/useFeaturedSites";

export function NetworkPreview() {
  const { data: sites, isLoading, isError, error, refetch } = useFeaturedSites(2);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3" aria-label="Loading sites">
        <SiteCardSkeleton />
        <SiteCardSkeleton />
      </div>
    );
  }

  if (isError) {
    const message =
      isAxiosError(error)
        ? String(error.response?.data?.error?.message ?? error.message)
        : "Could not load collection sites.";

    return (
      <div className="flex flex-col items-start justify-center gap-4 rounded-xl border border-border bg-surface p-6">
        <div>
          <p className="text-sm font-medium text-foreground">Unable to load sites</p>
          <p className="mt-1 text-xs text-dim">{message}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => void refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!sites || sites.length === 0) {
    return (
      <div className="flex flex-col items-start justify-center gap-3 rounded-xl border border-dashed border-border bg-surface/40 p-6">
        <p className="text-sm font-medium text-foreground">No collection sites found</p>
        <p className="text-xs text-dim">
          Sites in the Nairobi area will appear here as partners join the network.
        </p>
        <Button href="/directory" variant="secondary" size="sm">
          Browse all sites
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {sites.map((site, i) => (
        <SiteCardCompact key={site.id} site={site} className={i === 0 ? "" : "opacity-80"} />
      ))}
    </div>
  );
}
