"use client";

import type { ReactNode } from "react";

import { useI18n } from "@/lib/i18n/i18n-provider";

// ─────────────────────────────────────────────────────────────────────────────
// System Flow — three-step pipeline.
// Renders inside .theme-light on the landing page.
// accent-sage-ink resolves to #3F6B3A on parchment (legible) and
// #A1C998 on dark shells (legible).
// ─────────────────────────────────────────────────────────────────────────────

export function SystemFlow() {
  const { t } = useI18n();

  return (
    <div>
      <div className="mb-10 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-dim">
          {t("landing.systemFlow.eyebrow")}
        </p>
        <span className="rounded-full border border-border/40 px-3 py-1 text-xs text-dim/60">
          {t("landing.systemFlow.previewBadge")}
        </span>
      </div>

      <div className="flex items-start justify-between gap-2 sm:gap-4">
        <FlowNode
          icon={<DropOffIcon />}
          label={t("landing.systemFlow.dropOff")}
          sublabel={t("landing.systemFlow.dropOffSub")}
        />
        <FlowConnector />
        <FlowNode
          icon={<VerifyIcon />}
          label={t("landing.systemFlow.verify")}
          sublabel={t("landing.systemFlow.verifySub")}
        />
        <FlowConnector />
        <FlowNode
          icon={<ImpactIcon />}
          label={t("landing.systemFlow.impact")}
          sublabel={t("landing.systemFlow.impactSub")}
        />
      </div>
    </div>
  );
}

function FlowNode({ icon, label, sublabel }: { icon: ReactNode; label: string; sublabel: string }) {
  return (
    <div className="group flex w-24 flex-col items-center text-center sm:w-36">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-background text-accent-sage-ink transition-all duration-300 group-hover:border-[color:var(--accent-sage-ink)]/40 group-hover:shadow-[0_0_22px_rgba(63,107,58,0.14)]">
        {icon}
      </div>
      <p className="mt-3 text-sm font-semibold leading-tight text-foreground sm:text-base">
        {label}
      </p>
      <p className="mt-1 text-[13px] leading-snug text-dim sm:text-sm">
        {sublabel}
      </p>
    </div>
  );
}

function FlowConnector() {
  return (
    /* mt-6 aligns the connector with the centre of the icon circle */
    <div className="mt-6 flex min-w-0 flex-1 items-center" aria-hidden>
      <div className="h-px w-full border-t border-dashed border-border/50 animate-flow-pulse" />
      {/* Visible chevron arrow */}
      <svg
        width="6"
        height="9"
        viewBox="0 0 6 9"
        fill="none"
        className="ml-0.5 shrink-0 text-dim/50"
      >
        <path
          d="M1 1l4 3.5L1 8"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function DropOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function VerifyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ImpactIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 14.4C2.5 12.5 2 10.6 2 9c0-3.3 2.2-6 5.5-6 1.9 0 3.6.9 4.5 2.3C12.9 3.9 14.6 3 16.5 3 19.8 3 22 5.7 22 9c0 4.8-4.3 9-9 12-1.5 1-3.2 1.8-5 2.5" />
      <path d="M12 22v-6" />
    </svg>
  );
}