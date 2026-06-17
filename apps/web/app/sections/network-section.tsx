"use client";

import Link from "next/link";
import { useState } from "react";

import { NetworkMap } from "@/components/network-map";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { cn } from "@/lib/utils";

import { NetworkPreview } from "./network-preview";

const MATERIALS = ["All materials", "Plastic", "Glass", "Electronics", "Metal", "Paper", "Textiles"];

function NetworkTelemetryStrip() {
  const { t } = useI18n();
  const metrics = [
    { value: "16", label: t("landing.network.metricSites") },
    { value: "3", label: t("landing.network.metricHubs") },
    { value: "6", label: t("landing.network.metricMaterials") },
  ];

  return (
    <div className="flex flex-col gap-3 border-b border-white/[0.06] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-sage shadow-[0_0_8px_var(--accent-sage)]"
          aria-hidden
        />
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-accent-sage">
          {t("landing.network.telemetryLabel")}
        </p>
      </div>
      <dl className="grid grid-cols-3 gap-4 sm:gap-8">
        {metrics.map((m) => (
          <div key={m.label} className="text-center sm:text-right">
            <dd className="font-heading text-lg font-semibold tabular-nums tracking-tight text-foreground sm:text-xl">
              {m.value}
            </dd>
            <dt className="text-[9px] font-medium uppercase tracking-[0.1em] text-dim">{m.label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function NetworkSection() {
  const { t } = useI18n();
  const [active, setActive] = useState("All materials");

  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="absolute inset-0 bg-dark-base" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        aria-hidden
        style={{
          background: [
            "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(161,201,152,0.14), transparent 58%)",
            "radial-gradient(ellipse 45% 40% at 85% 75%, rgba(161,201,152,0.06), transparent 55%)",
          ].join(", "),
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mb-8 max-w-xl">
          <p className="inline-flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-accent-sage">
            <span className="h-[6px] w-[6px] rounded-full bg-accent-sage shadow-[0_0_8px_var(--accent-sage)]" aria-hidden />
            {t("landing.network.kicker")}
          </p>
          <h2 className="mt-3 font-heading text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-[1.75rem]">
            {t("landing.network.headline")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t("landing.network.story")}</p>
        </header>

        <div
          className={cn(
            "relative overflow-hidden rounded-3xl",
            "border border-white/[0.08] bg-[#0D0F10]/92",
            "shadow-[0_32px_80px_-24px_rgba(0,0,0,0.75)] ring-1 ring-white/[0.05]",
          )}
        >
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-20 blur-3xl"
            style={{ background: "var(--accent-sage)" }}
            aria-hidden
          />

          <NetworkTelemetryStrip />

          <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.05] px-4 py-3 sm:px-6" role="group" aria-label="Filter by material">
            {MATERIALS.map((mat) => (
              <button
                key={mat}
                type="button"
                onClick={() => setActive(mat)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200",
                  active === mat
                    ? "border-accent-sage/50 bg-accent-sage/10 text-accent-sage"
                    : "border-white/[0.08] text-dim hover:border-white/[0.14] hover:text-muted",
                )}
              >
                {mat}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)]">
            <div className="relative min-h-[340px] p-4 sm:min-h-[420px] sm:p-5 lg:p-6">
              <NetworkMap
                className="h-full min-h-[300px] sm:min-h-[380px] shadow-[inset_0_0_48px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.04]"
                activeMaterial={active}
              />
              <p className="pointer-events-none absolute bottom-6 left-6 max-w-[14rem] text-[10px] leading-snug text-dim sm:bottom-8 sm:left-8">
                {t("landing.network.mapCaption")}
              </p>
            </div>

            <aside className="flex flex-col border-t border-white/[0.06] bg-surface/30 lg:border-l lg:border-t-0">
              <div className="border-b border-white/[0.05] px-4 py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-dim">
                  {t("landing.network.liveSitesLabel")}
                </p>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <NetworkPreview />
              </div>
            </aside>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/[0.06] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="max-w-lg text-xs leading-relaxed text-dim">{t("landing.network.infraNote")}</p>
            <Link
              href="/directory"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-accent-sage transition-colors hover:text-accent-sage-hover"
            >
              {t("landing.network.viewDirectory")}
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4.5 3L8 6.5l-3.5 3.5" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
