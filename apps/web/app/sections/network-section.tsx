"use client";

import Link from "next/link";
import { useState } from "react";

import { NetworkMap } from "@/components/network-map";
import { cn } from "@/lib/utils";

import { NetworkPreview } from "./network-preview";

const MATERIALS = ["All materials", "Plastic", "Glass", "Electronics", "Metal", "Paper", "Textiles"];

export function NetworkSection() {
  const [active, setActive] = useState("All materials");

  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-accent-sage">
              Collection network
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
              Nairobi and surrounding areas
            </h2>
            <p className="mt-2 text-sm text-muted">
              Verified collection sites across the region. Filter by material type.
            </p>
          </div>
          <Link
            href="/directory"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent-sage transition-colors hover:text-accent-sage-hover sm:mt-0 shrink-0"
          >
            View full directory
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4.5 3L8 6.5l-3.5 3.5" />
            </svg>
          </Link>
        </div>

        {/* Interactive filter chips */}
        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by material">
          {MATERIALS.map((mat) => (
            <button
              key={mat}
              type="button"
              onClick={() => setActive(mat)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200",
                active === mat
                  ? "border-accent-sage/50 bg-accent-sage/10 text-accent-sage"
                  : "border-border/60 text-dim hover:border-border hover:text-muted",
              )}
            >
              {mat}
            </button>
          ))}
        </div>

        {/* Map + site list */}
        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_300px]">
          <NetworkMap className="min-h-[320px]" activeMaterial={active} />
          <NetworkPreview />
        </div>

      </div>
    </section>
  );
}
