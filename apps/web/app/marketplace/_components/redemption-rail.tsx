"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { useI18n } from "@/lib/i18n/i18n-provider";
import { queryKeys } from "@/lib/query-keys";
import { getMyRedemptions } from "@/services/marketplace.service";
import { useAuthStore } from "@/store/auth";

export function RedemptionRail() {
  const user = useAuthStore((s) => s.user);
  const { t } = useI18n();

  const redemptionsQuery = useQuery({
    queryKey: queryKeys.myRedemptions(12, 0),
    queryFn: () => getMyRedemptions({ limit: 12, offset: 0 }),
    enabled: Boolean(user),
  });

  if (!user) {
    return (
      <aside className="mb-12 rounded-2xl telemetry-panel px-5 py-8 sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-sage">{t("marketplace.redemptionGuestKicker")}</p>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-dim">
          {t("marketplace.redemptionGuestBody")}
        </p>
        <Link
          href={`/auth/login?redirect=${encodeURIComponent("/marketplace")}`}
          className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-lg border border-border px-4 text-sm font-medium text-foreground transition-colors hover:border-accent-sage/35"
        >
          {t("nav.signIn")}
        </Link>
      </aside>
    );
  }

  return (
    <aside className="mb-12 rounded-2xl telemetry-panel px-5 py-8 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-sage">{t("marketplace.redemptionSignedKicker")}</p>
          <p className="mt-1 text-sm text-dim">{t("marketplace.redemptionSignedSub")}</p>
        </div>
        <Link
          href="/history"
          className="text-xs font-medium uppercase tracking-[0.12em] text-map-glow hover:text-map-glow/80"
        >
          {t("marketplace.dropOffHistory")}
        </Link>
      </div>

      {redemptionsQuery.isLoading ? (
        <ul className="mt-6 space-y-3">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-14 animate-pulse rounded-lg bg-elevated/80" />
          ))}
        </ul>
      ) : redemptionsQuery.isError ? (
        <p className="mt-6 text-xs text-accent-rose">{t("marketplace.redemptionUnavailable")}</p>
      ) : !(redemptionsQuery.data?.items.length) ? (
        <p className="mt-6 text-sm leading-relaxed text-dim">{t("marketplace.redemptionEmpty")}</p>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-xl border border-border bg-background/30">
          {redemptionsQuery.data.items.map((row) => (
            <li key={row.id} className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link
                  href={`/marketplace/reward/${encodeURIComponent(row.product_id)}`}
                  className="font-medium text-foreground hover:text-accent-sage"
                >
                  {row.product_title}
                </Link>
                <p className="mt-0.5 text-xs text-dim">{row.company_name}</p>
              </div>
              <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                <span className="rounded-md bg-accent-sage/12 px-2 py-0.5 text-xs font-semibold text-accent-sage">
                  {row.tokens_spent} tokens
                </span>
                <span className="text-[10px] text-dim">
                  {new Date(row.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
