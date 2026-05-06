import Link from "next/link";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import type { CompanyListItem } from "@/types";

import { Badge } from "./badge";
import { Button } from "./button";

interface SiteCardProps extends HTMLAttributes<HTMLDivElement> {
  site: CompanyListItem;
  featured?: boolean;
}

export function SiteCard({ site, featured = false, className, ...props }: SiteCardProps) {
  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-surface p-5 transition-all duration-200",
        featured
          ? "border-accent-sage/30 shadow-[0_0_0_1px_rgba(168,191,166,0.12)] hover:border-accent-sage/50"
          : "border-border hover:border-border/80 hover:bg-elevated",
        className,
      )}
      {...props}
    >
      {featured && (
        <div
          className="pointer-events-none absolute inset-0 rounded-xl opacity-40"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse at top left, rgba(168,191,166,0.06) 0%, transparent 70%)",
          }}
        />
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-heading text-base font-semibold text-foreground">
            {site.name}
          </h3>
          {site.description ? (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
              {site.description}
            </p>
          ) : (
            <p className="mt-1 text-sm text-dim">Collection partner on the tareka network.</p>
          )}
        </div>
        {site.is_verified ? (
          <Badge variant="sage" className="shrink-0">
            Verified
          </Badge>
        ) : null}
      </div>

      <div className="relative mt-4 flex items-center gap-2">
        <Button href={`/site/${site.id}`} variant="primary" size="sm">
          Get directions
        </Button>
        <Button href={`/site/${site.id}`} variant="secondary" size="sm">
          View site
        </Button>
      </div>
    </div>
  );
}

export function SiteCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-xl border border-border bg-surface p-5", className)}
      aria-hidden
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-elevated" />
          <div className="h-3 w-full rounded bg-elevated" />
          <div className="h-3 w-4/5 rounded bg-elevated" />
        </div>
        <div className="h-5 w-16 rounded-full bg-elevated" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-9 w-28 rounded-md bg-elevated" />
        <div className="h-9 w-20 rounded-md bg-elevated" />
      </div>
    </div>
  );
}

/** Compact list-style site card used in the landing network preview. */
export function SiteCardCompact({
  site,
  className,
}: {
  site: Pick<CompanyListItem, "id" | "name" | "description" | "is_verified">;
  className?: string;
}) {
  return (
    <Link
      href={`/site/${site.id}`}
      className={cn(
        "group block rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent-sage/30 hover:bg-elevated",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-heading text-sm font-semibold text-foreground group-hover:text-accent-sage transition-colors">
          {site.name}
        </span>
        {site.is_verified && (
          <Badge variant="sage" className="text-[10px]">
            Verified
          </Badge>
        )}
      </div>
      {site.description && (
        <p className="mt-1 line-clamp-1 text-xs text-dim">{site.description}</p>
      )}
      <span className="mt-2 inline-flex items-center gap-1 text-xs text-accent-sage">
        Get directions
        <ArrowRightIcon />
      </span>
    </Link>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" />
    </svg>
  );
}
