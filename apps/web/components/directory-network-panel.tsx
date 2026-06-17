"use client";

import type { HTMLAttributes } from "react";

import { NetworkMap } from "@/components/network-map";
import { cn } from "@/lib/utils";

/**
 * Directory sidebar — same network map as landing, with legend overlay.
 */
export function DirectoryNetworkPanel({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative isolate flex flex-col", className)}
      {...props}
    >
      <NetworkMap className="min-h-[min(72vh,420px)] w-full flex-1 shadow-[0_24px_64px_-28px_rgba(0,0,0,0.72)] ring-1 ring-white/[0.05]" />

      <div className="pointer-events-none absolute bottom-3 right-3 rounded-md border border-border/80 bg-[#171718]/95 px-2.5 py-2 text-left shadow-lg backdrop-blur-sm">
        <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-dim">Legend</p>
        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#A1C998]" aria-hidden />
          Trusted partner
        </div>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-muted">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#6a6d6a]" aria-hidden />
          Community site
        </div>
      </div>
    </div>
  );
}
