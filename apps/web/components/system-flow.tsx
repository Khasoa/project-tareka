"use client";

import type { ReactNode } from "react";

import { useI18n } from "@/lib/i18n/i18n-provider";

// ─────────────────────────────────────────────────────────────────────────────
// System Flow — three-step pipeline rendered directly on the page background.
// ─────────────────────────────────────────────────────────────────────────────

export function SystemFlow() {
  const { t } = useI18n();

  return (
    <div>
      <div className="mb-10 flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-dim">
          {t("landing.systemFlow.eyebrow")}
        </p>
        <span className="rounded-full border border-border/40 px-2.5 py-0.5 text-[10px] text-dim/60">
          {t("landing.systemFlow.previewBadge")}
        </span>
      </div>

      <div className="flex items-start justify-between gap-1 sm:gap-2">
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

function FlowNode({
  icon,
  label,
  sublabel,
}: {
  icon: ReactNode;
  label: string;
  sublabel: string;
}) {
  return (
    <div className="group flex w-20 flex-col items-center text-center sm:w-28">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background text-accent-sage transition-all duration-300 group-hover:border-accent-sage/40 group-hover:shadow-[0_0_22px_rgba(168,191,166,0.11)]">
        {icon}
      </div>
      <p className="mt-3 text-[11px] font-semibold leading-tight text-foreground sm:text-xs">{label}</p>
      <p className="mt-0.5 text-[10px] leading-snug text-dim">{sublabel}</p>
    </div>
  );
}

function FlowConnector() {
  return (
    <div className="mt-5 flex flex-1 items-center" aria-hidden>
      <div className="h-px w-full border-t border-dashed border-border/40 animate-flow-pulse" />
      <svg width="5" height="7" viewBox="0 0 5 7" fill="none" className="shrink-0 text-dim/35">
        <path d="M1 1l3 2.5L1 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function DropOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function VerifyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ImpactIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 14.4C2.5 12.5 2 10.6 2 9c0-3.3 2.2-6 5.5-6 1.9 0 3.6.9 4.5 2.3C12.9 3.9 14.6 3 16.5 3 19.8 3 22 5.7 22 9c0 4.8-4.3 9-9 12-1.5 1-3.2 1.8-5 2.5" />
      <path d="M12 22v-6" />
    </svg>
  );
}
