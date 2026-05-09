"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { queryKeys } from "@/lib/query-keys";
import { dropoffService } from "@/services/dropoff.service";
import { useAuthStore } from "@/store/auth";
import type { DropoffItem } from "@/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatMaterial(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatWeight(kg: number) {
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} t`;
  return `${kg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`;
}

function RowSkeleton() {
  return (
    <li className="flex items-start gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <div className="h-7 w-7 shrink-0 animate-pulse rounded-lg bg-elevated" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-32 animate-pulse rounded bg-elevated" />
        <div className="h-3 w-48 animate-pulse rounded bg-elevated" />
      </div>
      <div className="h-5 w-16 animate-pulse rounded-full bg-elevated" />
    </li>
  );
}

function DropoffRow({ item }: { item: DropoffItem }) {
  return (
    <li className="flex items-start gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-sage/10 text-xs text-accent-sage">
        ♻
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-sm font-medium text-foreground">
          {formatMaterial(item.material_type)}
        </p>
        <p className="text-xs text-dim">
          {item.item_count} {item.item_count === 1 ? "item" : "items"}
          {item.estimated_weight_kg != null
            ? ` · ~${formatWeight(item.estimated_weight_kg)}`
            : ""}
        </p>
      </div>
      <div className="shrink-0 text-right space-y-1">
        <div className="inline-flex items-center gap-1 rounded-full bg-accent-sage/10 px-2 py-0.5 text-[10px] font-medium text-accent-sage">
          ✓ Verified
        </div>
        <p className="text-[11px] text-dim">{formatDate(item.confirmed_at)}</p>
      </div>
    </li>
  );
}

export default function HistoryPage() {
  const user = useAuthStore((s) => s.user)!;

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.recyclerDropoffs(user.id, 50, 0),
    queryFn: () => dropoffService.listByRecycler(user.id, { limit: 50, offset: 0 }),
    staleTime: 60_000,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-5 py-2">
      <div>
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.10em] text-accent-sage">
          Activity
        </p>
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
          History
        </h1>
        <p className="mt-0.5 text-sm text-dim">
          All verified drop-offs on your impact record.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        {isPending ? (
          <ul>{[0,1,2,3,4].map((i) => <RowSkeleton key={i} />)}</ul>
        ) : isError ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-dim">Unable to load history.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 text-sm font-medium text-accent-sage transition-opacity hover:opacity-80"
            >
              Try again
            </button>
          </div>
        ) : !data?.items.length ? (
          <div className="px-5 py-10 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent-sage/10 text-accent-sage text-lg" aria-hidden>
              ♻
            </div>
            <p className="font-heading text-sm font-semibold text-foreground">
              No verified drop-offs yet
            </p>
            <p className="mt-1.5 text-xs text-dim">
              Find a collection site to start building your impact record.
            </p>
            <Link
              href="/directory"
              className="mt-4 inline-flex h-8 items-center justify-center rounded-lg bg-accent-sage px-4 text-xs font-medium text-[#161615] transition-colors hover:bg-accent-sage-hover"
            >
              Find a collection site
            </Link>
          </div>
        ) : (
          <ul>
            {data.items.map((item) => <DropoffRow key={item.id} item={item} />)}
          </ul>
        )}
      </div>
    </div>
  );
}
