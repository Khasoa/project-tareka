"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Live Data — three headline metrics inside a neutral telemetry panel.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";

import { useI18n } from "@/lib/i18n/i18n-provider";

interface Metric {
  value: string;
  label: string;
}

interface LiveDataProps {
  metrics?: Metric[];
  noActivity?: boolean;
}

export function LiveData({ metrics, noActivity }: LiveDataProps) {
  const { t } = useI18n();

  const previewMetrics = useMemo<Metric[]>(
    () => [
      { value: "128", label: t("landing.liveData.verifiedDropoffs") },
      { value: "2.4t", label: t("landing.liveData.estCo2") },
      { value: "6", label: t("landing.liveData.activePartners") },
    ],
    [t],
  );

  const display = noActivity
    ? previewMetrics.map((m) => ({ ...m, value: "—" }))
    : (metrics ?? previewMetrics);

  const isPreview = !metrics && !noActivity;

  const footnote = noActivity
    ? t("landing.liveData.emptyFootnote")
    : isPreview
      ? t("landing.liveData.previewFootnote")
      : t("landing.liveData.liveFootnote");

  return (
    <div className="px-6 py-7 sm:px-9 sm:py-9">
      <dl className="grid grid-cols-3 divide-x divide-border/80">
        {display.map((m) => (
          <div key={m.label} className="flex flex-col items-center gap-2 px-3 text-center sm:px-6">
            <dd className="font-heading text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
              {m.value}
            </dd>
            <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-secondary">{m.label}</dt>
          </div>
        ))}
      </dl>

      <p className="mt-6 text-center text-[11px] font-medium text-dim">{footnote}</p>
    </div>
  );
}
