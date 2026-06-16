"use client";

import { SiteCardCompact, SiteCardSkeleton } from "@/components/site-card";
import { useFeaturedSites } from "@/hooks/useFeaturedSites";

export function NetworkPreview() {
  const { data: sites, isLoading, isPending } = useFeaturedSites(2);
  const list = sites ?? [];

  if (isPending && list.length === 0) {
    return (
      <div className="flex flex-col gap-3" aria-label="Loading sites">
        <SiteCardSkeleton />
        <SiteCardSkeleton />
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-start justify-center gap-3 rounded-xl border border-border bg-surface/90 p-6 shadow-[0_20px_56px_-28px_rgba(0,0,0,0.65)]">
        <p className="text-sm font-medium text-foreground">No collection sites found</p>
        <p className="text-xs text-dim">
          Sites in the Nairobi area will appear here as partners join the network.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {list.map((site, i) => (
        <div
          key={site.id}
          className="rounded-xl shadow-[0_20px_56px_-28px_rgba(0,0,0,0.65)] ring-1 ring-white/[0.06]"
        >
          <SiteCardCompact site={site} className={i === 0 ? "" : "opacity-90"} />
        </div>
      ))}
      {isLoading ? (
        <p className="text-center text-[10px] text-dim" aria-live="polite">
          Refreshing live listings…
        </p>
      ) : null}
    </div>
  );
}
