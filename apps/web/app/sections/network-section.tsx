"use client";

import Link from "next/link";
import { useState } from "react";

import { NetworkMap } from "@/components/network-map";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { cn } from "@/lib/utils";

import { NetworkPreview } from "./network-preview";

const MATERIALS = ["All materials", "Plastic", "Glass", "Electronics", "Metal", "Paper", "Textiles"];

export function NetworkSection() {
  const { t } = useI18n();
  const [active, setActive] = useState("All materials");

  return (
    <section className="py-12 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-accent-sage">
              {t("landing.network.kicker")}
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
              {t("landing.network.headline")}
            </h2>
            <p className="mt-2 text-sm text-muted">{t("landing.network.sub")}</p>
          </div>
          <Link
            href="/directory"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent-sage transition-colors hover:text-accent-sage-hover sm:mt-0 shrink-0"
          >
            {t("landing.network.viewDirectory")}
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4.5 3L8 6.5l-3.5 3.5" />
            </svg>
          </Link>
        </div>

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

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_300px]">
          <NetworkMap
            className="min-h-[320px] shadow-[0_24px_64px_-28px_rgba(0,0,0,0.72)] ring-1 ring-white/[0.06]"
            activeMaterial={active}
          />
          <NetworkPreview />
        </div>
      </div>
    </section>
  );
}
