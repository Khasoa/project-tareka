"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import { Button } from "@/components/button";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { getMyRedemptions, getProductReward, redeemProduct } from "@/services/marketplace.service";
import { getMockProductReward } from "@/lib/data/marketplace-mock";
import { withApiFallback } from "@/lib/data/api-fallback";
import { useAuthStore } from "@/store/auth";
import type { ProductRewardDetail } from "@/types";

export function RewardDetailView() {
  const { t } = useI18n();
  const params = useParams();
  const raw = params.id;
  const id = typeof raw === "string" ? decodeURIComponent(raw) : "";
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const rewardQuery = useQuery({
    queryKey: queryKeys.productReward(id),
    queryFn: () =>
      withApiFallback(
        "product reward detail",
        () => getProductReward(id),
        () => {
          const mock = getMockProductReward(id);
          if (!mock) throw new Error("Reward not found");
          return mock;
        },
      ),
    enabled: Boolean(id),
    placeholderData: id.startsWith("mock-r-") ? getMockProductReward(id) ?? undefined : undefined,
  });

  const historyPreview = useQuery({
    queryKey: queryKeys.myRedemptions(5, 0),
    queryFn: () => getMyRedemptions({ limit: 5, offset: 0 }),
    enabled: Boolean(user),
  });

  const redeemMut = useMutation({
    mutationFn: () => redeemProduct(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.productReward(id) });
      void queryClient.invalidateQueries({ queryKey: ["my-redemptions"] });
      void queryClient.invalidateQueries({ queryKey: ["wallet-program"] });
    },
  });

  const redemptionStatus = redeemMut.data ?? null;

  const tokenEligibility = useMemo(() => {
    const ctx = rewardQuery.data?.reward_context;
    if (!ctx?.rewards?.length) return null;
    return ctx.rewards.find((r) => r.reward_type === "tokens") ?? null;
  }, [rewardQuery.data?.reward_context]);

  const materialChips = useMemo(
    () => labelsFromMaterialsPayload(rewardQuery.data?.materials_used ?? null),
    [rewardQuery.data?.materials_used],
  );

  const handleRedeemPress = () => {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/marketplace/reward/${id}`)}`);
      return;
    }
    redeemMut.reset();
    redeemMut.mutate();
  };

  const showLoginHint = redeemMut.isError && isAxiosError(redeemMut.error) && redeemMut.error.response?.status === 401;

  if (!id) {
    return <p className="text-sm text-dim">Invalid reward link.</p>;
  }

  if (rewardQuery.isLoading) {
    return (
      <div className="mx-auto grid max-w-4xl animate-pulse gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="aspect-[4/3] rounded-2xl bg-elevated" />
        <div className="space-y-4">
          <div className="h-10 w-full rounded-xl bg-surface-focus/40" />
          <div className="h-4 w-full rounded bg-elevated" />
          <div className="h-4 w-5/6 rounded bg-elevated" />
        </div>
      </div>
    );
  }

  if (rewardQuery.isError) {
    return (
      <div className="rounded-2xl p-8 text-center telemetry-panel">
        <p className="font-heading text-lg font-semibold text-foreground">Reward unavailable</p>
        <p className="mt-2 text-sm text-dim">It may be unpublished or pending human review.</p>
        <Link
          href="/marketplace"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-accent-sage px-4 text-xs font-semibold text-[#161615] hover:bg-accent-sage-hover"
        >
          Back to marketplace
        </Link>
      </div>
    );
  }

  const r = rewardQuery.data as ProductRewardDetail;

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-24">
      <nav className="text-[11px] text-dim">
        <Link href="/marketplace" className="text-map-glow/90 hover:text-map-glow">
          Marketplace
        </Link>
        <span className="mx-2 opacity-50">/</span>
        <Link href={r.company_slug ? `/marketplace/${encodeURIComponent(r.company_slug)}` : "/marketplace"} className="hover:text-foreground">
          {r.company_name}
        </Link>
        <span className="mx-2 opacity-50">/</span>
        <span className="text-foreground">Offer</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
        <div className="telemetry-panel overflow-hidden rounded-2xl">
          <div className="relative aspect-[4/3] bg-elevated">
            {r.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-center text-sm text-dim">
                Visual reference will appear when the partner publishes artwork.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-sage">Verified offering</p>
            <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-foreground">{r.title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-dim">
              {r.short_description ?? "Sustainability partner benefit linked to verified participation."}
            </p>
          </div>

          <div className="rounded-xl border border-border border-map-glow/15 bg-background/35 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-map-glow/90">{t("marketplace.valueSnapshot")}</p>
            <ul className="mt-3 space-y-2 text-xs text-muted">
              {r.token_requirement != null ? (
                <li className="leading-relaxed">
                  <span className="text-foreground">{t("marketplace.tokenRequirementLine", { count: r.token_requirement })}</span>
                </li>
              ) : null}
              {r.price_kes ? (
                <li className="leading-relaxed">
                  <span className="text-dim">{t("marketplace.priceReferenceLine", { price: r.price_kes })}</span>
                </li>
              ) : null}
              {r.token_discount_value ? (
                <li className="leading-relaxed">
                  <span className="text-dim">
                    Token-adjusted value{" "}
                    <span className="tabular-nums text-foreground">{r.token_discount_value}</span>
                  </span>
                </li>
              ) : null}
              {r.is_discountable ? (
                <li className="leading-relaxed text-accent-sage">{t("marketplace.discountEligible")}</li>
              ) : null}
              {r.reward_context?.rewards?.length
                ? r.reward_context.rewards
                    .filter((rw) => rw.reward_type !== "tokens")
                    .map((rw, i) => (
                      <li key={`${rw.reward_type}-${i}`} className="leading-relaxed">
                        <span className={cn(rw.is_eligible ? "text-accent-sage" : "text-dim")}>{rw.label}</span>
                        {!rw.is_eligible && rw.reason ? (
                          <span className="block text-[11px] text-dim">{rw.reason}</span>
                        ) : null}
                      </li>
                    ))
                : null}
              {!r.token_requirement &&
              !r.price_kes &&
              !r.token_discount_value &&
              !r.is_discountable &&
              !(r.reward_context?.rewards && r.reward_context.rewards.filter((x) => x.reward_type !== "tokens").length) ? (
                <li className="text-dim">Reference-only or community benefit — coordinated with the partner.</li>
              ) : null}
            </ul>
          </div>

          {materialChips.length ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-dim">{t("marketplace.materialsLabel")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {materialChips.map((label, i) => (
                  <span
                    key={`${label}-${i}`}
                    className="rounded-md border border-border bg-surface-raised/50 px-2.5 py-1 text-[11px] text-muted"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-xl border border-border bg-surface-raised/60 p-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-medium text-foreground">{r.company_name}</span>
              {r.user_token_balance != null ? (
                <span className="rounded-md bg-accent-sage/12 px-2 py-1 text-xs font-semibold text-accent-sage">
                  Your balance: {r.user_token_balance} tokens
                </span>
              ) : (
                <span className="text-xs text-dim">Sign in to see appreciation token balance with this partner.</span>
              )}
            </div>
            {tokenEligibility ? (
              <p
                className={cn(
                  "mt-3 text-xs leading-relaxed",
                  tokenEligibility.is_eligible ? "text-accent-sage" : "text-dim",
                )}
              >
                {tokenEligibility.is_eligible
                  ? "You meet the published token requirement for this redemption."
                  : tokenEligibility.reason ?? "Eligibility could not be determined."}
              </p>
            ) : null}
          </div>

          {r.description ? (
            <div className="max-w-none text-sm text-muted leading-relaxed">
              <p className="whitespace-pre-wrap">{r.description}</p>
            </div>
          ) : null}

          {r.material_story ? (
            <div className="rounded-xl border border-border border-map-glow/20 bg-background/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-map-glow">Environmental note</p>
              <p className="mt-2 text-sm text-dim leading-relaxed">{r.material_story}</p>
            </div>
          ) : null}

          <AvailabilityList availability={r.availability} />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {r.is_redeemable && r.token_requirement != null ? (
              <Button
                type="button"
                variant="primary"
                className="min-h-[48px] min-w-[200px]"
                disabled={redeemMut.isPending}
                onClick={() => void handleRedeemPress()}
              >
                {redeemMut.isPending ? "Recording…" : `Redeem · ${r.token_requirement} tokens`}
              </Button>
            ) : (
              <p className="text-sm text-dim">This listing is informational or uses a non-token benefit pathway.</p>
            )}
            <Link
              href="/directory"
              className="text-center text-xs font-medium uppercase tracking-[0.12em] text-map-glow hover:text-map-glow/80 sm:text-left"
            >
              Plan a verified drop-off
            </Link>
          </div>

          {showLoginHint ? (
            <p className="text-xs text-accent-rose">Session expired — sign in again to redeem.</p>
          ) : null}
          {redeemMut.isError && !showLoginHint ? (
            <p className="text-xs text-accent-rose">{formatApiError(redeemMut.error)}</p>
          ) : null}

          {redemptionStatus ? (
            <div className="rounded-xl border border-accent-sage/35 bg-accent-sage/10 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-sage">Redemption recorded</p>
              <p className="mt-2 text-sm text-foreground">{redemptionStatus.message}</p>
              {redemptionStatus.instructions_snapshot ? (
                <p className="mt-3 text-xs leading-relaxed text-dim">{redemptionStatus.instructions_snapshot}</p>
              ) : null}
            </div>
          ) : null}

          {user && historyPreview.data?.items.length ? (
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-dim">Recent redemptions</p>
              <ul className="mt-3 space-y-2 text-xs text-muted">
                {historyPreview.data.items.map((h) => (
                  <li key={h.id} className="flex justify-between gap-3 border-b border-border/60 pb-2 last:border-0">
                    <span className="text-foreground">{h.product_title}</span>
                    <span className="shrink-0 tabular-nums text-accent-sage">{h.tokens_spent} tok</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function labelsFromMaterialsPayload(raw: unknown[] | null): string[] {
  if (!Array.isArray(raw) || !raw.length) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    let label: string | null = null;
    if (typeof item === "string") {
      const s = item.trim();
      label = s.length ? s : null;
    } else if (item && typeof item === "object") {
      const o = item as Record<string, unknown>;
      for (const key of ["material", "name", "label"]) {
        const v = o[key];
        if (typeof v === "string" && v.trim()) {
          label = v.trim();
          break;
        }
      }
    }
    if (label && label.length < 120 && !seen.has(label)) {
      seen.add(label);
      out.push(label);
    }
  }
  return out;
}

function formatApiError(err: unknown): string {
  if (!isAxiosError(err)) return "Could not complete redemption.";
  const data = err.response?.data as unknown;
  if (data && typeof data === "object" && "detail" in data) {
    const detail = (data as { detail?: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0] && typeof detail[0] === "object" && "msg" in detail[0]) {
      return String((detail[0] as { msg: unknown }).msg);
    }
  }
  return err.message;
}

function AvailabilityList({ availability }: { availability: unknown[] | null }) {
  if (!Array.isArray(availability) || !availability.length) {
    return (
      <p className="text-xs text-dim">
        Fulfilment details are coordinated directly with the partner — contact them after redemption if needed.
      </p>
    );
  }
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-dim">Pickup & fulfilment</p>
      <ul className="space-y-2 text-sm text-muted">
        {availability.map((slot, i) => {
          if (!slot || typeof slot !== "object") return null;
          const s = slot as Record<string, unknown>;
          const title = typeof s.name === "string" ? s.name : "Location";
          const loc = typeof s.location === "string" ? s.location : null;
          const contact = typeof s.contact === "string" ? s.contact : null;
          return (
            <li key={i} className="rounded-lg border border-border bg-surface-raised/50 px-3 py-2">
              <p className="font-medium text-foreground">{title}</p>
              {loc ? <p className="text-xs text-dim">{loc}</p> : null}
              {contact ? <p className="text-xs text-map-glow/90">{contact}</p> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
