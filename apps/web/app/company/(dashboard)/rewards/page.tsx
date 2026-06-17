"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/button";
import { ErrorState } from "@/components/error-state";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { companyRewardsService } from "@/services/company-rewards.service";
import { useAuthStore } from "@/store/auth";
import type {
  CompanyMaterialRewardRule,
  CompanyRewardMode,
  CompanyRewardProgramme,
  CompanyRewardRedemptionSettings,
} from "@/types";

const MATERIAL_KEYS = ["plastic_bottle", "glass_bottle", "can", "paper", "ewaste"] as const;

type MaterialKey = (typeof MATERIAL_KEYS)[number];

function emptyRule(): CompanyMaterialRewardRule {
  return {};
}

function initialMaterials(): Record<MaterialKey, CompanyMaterialRewardRule> {
  return {
    plastic_bottle: emptyRule(),
    glass_bottle: emptyRule(),
    can: emptyRule(),
    paper: emptyRule(),
    ewaste: emptyRule(),
  };
}

function hydrateMaterials(from: CompanyRewardProgramme["material_rules"]) {
  const base = initialMaterials();
  for (const key of MATERIAL_KEYS) {
    const cell = from[key];
    if (cell && typeof cell === "object") {
      base[key] = {
        tokens_per_kg: cell.tokens_per_kg ?? undefined,
        sats_per_kg: cell.sats_per_kg ?? undefined,
        min_threshold_kg: cell.min_threshold_kg ?? undefined,
        monthly_cap_tokens: cell.monthly_cap_tokens ?? undefined,
      };
    }
  }
  return base;
}

function ruleHasValues(rule: CompanyMaterialRewardRule | undefined): boolean {
  if (!rule) return false;
  return Boolean(
    rule.tokens_per_kg ||
      rule.sats_per_kg ||
      rule.min_threshold_kg ||
      (rule.monthly_cap_tokens != null && rule.monthly_cap_tokens > 0),
  );
}

function serializeMaterialRules(materials: Record<MaterialKey, CompanyMaterialRewardRule>): Record<
  string,
  CompanyMaterialRewardRule | null
> {
  const out: Record<string, CompanyMaterialRewardRule | null> = {};
  for (const key of MATERIAL_KEYS) {
    const rule = materials[key];
    if (!rule || !ruleHasValues(rule)) {
      out[key] = null;
      continue;
    }
    const payload: CompanyMaterialRewardRule = {};
    if (rule.tokens_per_kg?.trim()) payload.tokens_per_kg = rule.tokens_per_kg.trim();
    if (rule.sats_per_kg?.trim()) payload.sats_per_kg = rule.sats_per_kg.trim();
    if (rule.min_threshold_kg?.trim()) payload.min_threshold_kg = rule.min_threshold_kg.trim();
    if (rule.monthly_cap_tokens != null && rule.monthly_cap_tokens > 0) {
      payload.monthly_cap_tokens = rule.monthly_cap_tokens;
    }
    out[key] = payload;
  }
  return out;
}

function previewMaterialLabel(materialType: string, translate: (key: string) => string): string {
  if ((MATERIAL_KEYS as readonly string[]).includes(materialType)) {
    return translate(`company.rewards.materials.${materialType}`);
  }
  return materialType;
}

const MODE_OPTIONS: { value: CompanyRewardMode; labelKey: string; hintKey: string }[] = [
  { value: "tareka_tokens", labelKey: "company.rewards.modeTokens", hintKey: "company.rewards.modeHintTokens" },
  { value: "sats_rewards", labelKey: "company.rewards.modeSats", hintKey: "company.rewards.modeHintSats" },
  {
    value: "discount_vouchers",
    labelKey: "company.rewards.modeDiscounts",
    hintKey: "company.rewards.modeHintDiscounts",
  },
  {
    value: "marketplace_redemption_only",
    labelKey: "company.rewards.modeMarketplaceOnly",
    hintKey: "company.rewards.modeHintMarketplace",
  },
  {
    value: "recognition_only",
    labelKey: "company.rewards.modeRecognitionOnly",
    hintKey: "company.rewards.modeHintRecognition",
  },
];

export default function CompanyRewardsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const companyId = user?.companyId ?? null;

  const [programmeEnabled, setProgrammeEnabled] = useState(true);
  const [rewardMode, setRewardMode] = useState<CompanyRewardMode>("tareka_tokens");
  const [materials, setMaterials] = useState(initialMaterials);
  const [redemption, setRedemption] = useState<CompanyRewardRedemptionSettings>({
    allow_marketplace_redemption: true,
    allow_sats_payout: false,
    minimum_balance_tokens: 0,
    pending_verification_required: false,
  });

  const [previewMat, setPreviewMat] = useState<MaterialKey>("plastic_bottle");
  const [previewKg, setPreviewKg] = useState("5");
  const [previewResult, setPreviewResult] = useState<Awaited<
    ReturnType<typeof companyRewardsService.preview>
  > | null>(null);

  useEffect(() => {
    if (user && user.role !== "company_admin") {
      router.replace("/company/dashboard");
    }
  }, [user, router]);

  const rewardsQuery = useQuery({
    queryKey: companyId ? queryKeys.companyRewards(companyId) : ["company-rewards", "skip"],
    queryFn: () => companyRewardsService.get(companyId!),
    enabled: Boolean(companyId && user?.role === "company_admin"),
  });

  useEffect(() => {
    const data = rewardsQuery.data;
    if (!data) return;
    setProgrammeEnabled(data.programme_enabled);
    setRewardMode(data.reward_mode);
    setMaterials(hydrateMaterials(data.material_rules));
    setRedemption({ ...data.redemption });
  }, [rewardsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      companyRewardsService.update(companyId!, {
        programme_enabled: programmeEnabled,
        reward_mode: rewardMode,
        material_rules: serializeMaterialRules(materials),
        redemption,
      }),
    onSuccess: () => {
      if (!companyId) return;
      void qc.invalidateQueries({ queryKey: queryKeys.companyRewards(companyId) });
      void qc.invalidateQueries({ queryKey: queryKeys.companyDashboard(companyId) });
      void qc.invalidateQueries({ queryKey: ["operators"] });
      void qc.invalidateQueries({ queryKey: ["marketplace"] });
    },
  });

  const previewMutation = useMutation({
    mutationFn: (weightKg: number) =>
      companyRewardsService.preview(companyId!, {
        material_type: previewMat,
        weight_kg: weightKg,
      }),
    onSuccess: (data) => setPreviewResult(data),
  });

  if (!user || user.role !== "company_admin") {
    return (
      <div className="mx-auto max-w-lg py-8">
        <p className="text-sm text-dim">Checking access…</p>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="mx-auto max-w-lg py-8">
        <ErrorState title="No organisation linked" message="Your administrator profile needs a company assignment." />
      </div>
    );
  }

  if (rewardsQuery.isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-0.5 py-4">
        <div className="h-16 animate-pulse rounded-xl bg-surface/80" />
        <div className="h-40 animate-pulse rounded-xl bg-surface/80" />
      </div>
    );
  }

  if (rewardsQuery.isError) {
    return (
      <div className="mx-auto max-w-lg py-6">
        <ErrorState
          title="Could not load programme"
          message={
            isAxiosError(rewardsQuery.error)
              ? String(rewardsQuery.error.response?.data?.error?.message ?? rewardsQuery.error.message)
              : "Try again."
          }
          onRetry={() => void rewardsQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-0.5 pb-10">
      <header className="space-y-2 border-b border-border pb-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-accent-sage-ink">
          {t("dashboard.nav.companyRewards")}
        </p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">{t("company.rewards.title")}</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-dim">{t("company.rewards.subtitle")}</p>
        <p className="max-w-2xl text-xs leading-relaxed text-muted">{t("company.rewards.toneNote")}</p>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-4 shadow-[0_0_24px_rgba(161,201,152,0.05)] sm:p-5">
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-canvas px-4 py-4">
          <div>
            <p className="font-medium text-foreground">{t("company.rewards.programmeEnabled")}</p>
            <p className="mt-1 text-xs text-dim">{t("company.rewards.programmePausedHint")}</p>
          </div>
          <input
            type="checkbox"
            className="h-6 w-11 accent-accent-sage"
            checked={programmeEnabled}
            onChange={(e) => setProgrammeEnabled(e.target.checked)}
          />
        </label>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-foreground">{t("company.rewards.modeHeading")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {MODE_OPTIONS.map((opt) => {
            const active = rewardMode === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRewardMode(opt.value)}
                className={cn(
                  "rounded-2xl border px-4 py-4 text-left transition-all",
                  active
                    ? "border-accent-sage bg-accent-sage/[0.1] shadow-[0_0_18px_rgba(161,201,152,0.12)]"
                    : "border-border bg-canvas hover:border-accent-sage/30",
                )}
              >
                <span className="text-[15px] font-semibold text-foreground">{t(opt.labelKey)}</span>
                <span className="mt-2 block text-[11px] leading-snug text-dim">{t(opt.hintKey)}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-foreground">{t("company.rewards.materialsHeading")}</h2>
        <p className="mt-1 text-xs text-dim">
          Leave rows blank to fall back to network defaults (item-based appreciation factors).
        </p>
        <div className="mt-4 space-y-4">
          {MATERIAL_KEYS.map((key) => (
            <div
              key={key}
              className="rounded-xl border border-border bg-canvas p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
            >
              <p className="text-sm font-medium text-foreground">{t(`company.rewards.materials.${key}`)}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <label className="block text-xs">
                  <span className="mb-1 block text-dim">{t("company.rewards.tokensPerKg")}</span>
                  <input
                    value={materials[key].tokens_per_kg ?? ""}
                    onChange={(e) =>
                      setMaterials((m) => ({ ...m, [key]: { ...m[key], tokens_per_kg: e.target.value } }))
                    }
                    inputMode="decimal"
                    className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-accent-sage focus:ring-2"
                  />
                </label>
                <label className="block text-xs">
                  <span className="mb-1 block text-dim">{t("company.rewards.satsPerKg")}</span>
                  <input
                    value={materials[key].sats_per_kg ?? ""}
                    onChange={(e) =>
                      setMaterials((m) => ({ ...m, [key]: { ...m[key], sats_per_kg: e.target.value } }))
                    }
                    inputMode="decimal"
                    className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-accent-sage focus:ring-2"
                  />
                </label>
                <label className="block text-xs">
                  <span className="mb-1 block text-dim">{t("company.rewards.minKg")}</span>
                  <input
                    value={materials[key].min_threshold_kg ?? ""}
                    onChange={(e) =>
                      setMaterials((m) => ({ ...m, [key]: { ...m[key], min_threshold_kg: e.target.value } }))
                    }
                    inputMode="decimal"
                    className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-accent-sage focus:ring-2"
                  />
                </label>
                <label className="block text-xs">
                  <span className="mb-1 block text-dim">{t("company.rewards.monthlyCap")}</span>
                  <input
                    value={materials[key].monthly_cap_tokens ?? ""}
                    onChange={(e) =>
                      setMaterials((m) => ({
                        ...m,
                        [key]: {
                          ...m[key],
                          monthly_cap_tokens: e.target.value === "" ? undefined : Number(e.target.value),
                        },
                      }))
                    }
                    inputMode="numeric"
                    className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-accent-sage focus:ring-2"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-foreground">{t("company.rewards.redemptionHeading")}</h2>
        <div className="mt-4 space-y-4">
          <label className="flex items-center justify-between gap-4 rounded-xl border border-border bg-canvas px-4 py-3">
            <span className="text-sm text-foreground">{t("company.rewards.allowMarketplace")}</span>
            <input
              type="checkbox"
              className="h-5 w-10 accent-accent-sage"
              checked={redemption.allow_marketplace_redemption}
              onChange={(e) =>
                setRedemption((r) => ({ ...r, allow_marketplace_redemption: e.target.checked }))
              }
            />
          </label>
          {rewardMode === "tareka_tokens" ? (
            <label className="flex items-center justify-between gap-4 rounded-xl border border-border bg-canvas px-4 py-3">
              <div>
                <span className="text-sm text-foreground">{t("company.rewards.allowSatsPayout")}</span>
                <p className="mt-1 text-[11px] text-dim">{t("company.rewards.allowSatsPayoutHint")}</p>
              </div>
              <input
                type="checkbox"
                className="h-5 w-10 accent-accent-sage"
                checked={redemption.allow_sats_payout}
                onChange={(e) => setRedemption((r) => ({ ...r, allow_sats_payout: e.target.checked }))}
              />
            </label>
          ) : null}
          <label className="block text-sm">
            <span className="mb-1 block text-dim">{t("company.rewards.minReserve")}</span>
            <input
              inputMode="numeric"
              value={redemption.minimum_balance_tokens}
              onChange={(e) =>
                setRedemption((r) => ({
                  ...r,
                  minimum_balance_tokens: Math.max(0, Number(e.target.value.replace(/\D/g, "") || 0)),
                }))
              }
              className="min-h-11 w-full max-w-xs rounded-lg border border-border bg-background px-3 outline-none ring-accent-sage focus:ring-2"
            />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-xl border border-border bg-canvas px-4 py-3">
            <span className="text-sm text-foreground">{t("company.rewards.pendingVerification")}</span>
            <input
              type="checkbox"
              className="h-5 w-10 accent-accent-sage"
              checked={redemption.pending_verification_required}
              onChange={(e) =>
                setRedemption((r) => ({ ...r, pending_verification_required: e.target.checked }))
              }
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-[#161615] p-4 text-[#e8edea] sm:p-5">
        <h2 className="text-sm font-semibold">{t("company.rewards.previewHeading")}</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <select
            value={previewMat}
            onChange={(e) => setPreviewMat(e.target.value as MaterialKey)}
            className="min-h-11 rounded-lg border border-white/10 bg-black/30 px-3 text-sm outline-none ring-accent-sage focus:ring-2"
          >
            {MATERIAL_KEYS.map((k) => (
              <option key={k} value={k}>
                {t(`company.rewards.materials.${k}`)}
              </option>
            ))}
          </select>
          <input
            value={previewKg}
            onChange={(e) => setPreviewKg(e.target.value)}
            inputMode="decimal"
            className="min-h-11 w-28 rounded-lg border border-white/10 bg-black/30 px-3 text-sm tabular-nums outline-none ring-accent-sage focus:ring-2"
          />
          <Button
            type="button"
            variant="secondary"
            className="min-h-11"
            disabled={previewMutation.isPending}
            onClick={() => {
              const w = Number(previewKg.replace(",", "."));
              if (!Number.isFinite(w) || w <= 0) return;
              previewMutation.mutate(w);
            }}
          >
            {t("company.rewards.previewRun")}
          </Button>
        </div>
        {previewResult ? (
          <div className="mt-4 rounded-xl bg-white/[0.06] px-4 py-3 text-sm">
            <p>
              {t("company.rewards.previewBody", {
                weight: String(previewResult.weight_kg),
                material: previewMaterialLabel(previewResult.material_type, t),
              })}
            </p>
            <p className="mt-2 tabular-nums text-accent-sage-ink">
              ~{previewResult.estimated_tokens} appreciation tokens · {previewResult.estimated_sats} sats (if enabled)
            </p>
            <p className="mt-2 text-[11px] text-[#9aa59d]">{previewResult.notes}</p>
          </div>
        ) : (
          <p className="mt-4 text-xs text-[#9aa59d]">{t("company.rewards.previewEmpty")}</p>
        )}
      </section>

      {saveMutation.isError ? (
        <p className="rounded-xl border border-[#b06060]/35 bg-[#b06060]/10 px-4 py-3 text-sm text-[#f0c4c4]">
          {isAxiosError(saveMutation.error)
            ? String(saveMutation.error.response?.data?.error?.message ?? saveMutation.error.message)
            : "Save failed"}
        </p>
      ) : null}
      {saveMutation.isSuccess ? (
        <p className="rounded-xl border border-accent-sage/30 bg-accent-sage/10 px-4 py-3 text-sm text-[#dce8d9]">
          {t("company.rewards.saved")}
        </p>
      ) : null}

      <Button
        type="button"
        variant="primary"
        size="lg"
        className="min-h-12 w-full sm:w-auto"
        disabled={saveMutation.isPending}
        onClick={() => saveMutation.mutate()}
      >
        {saveMutation.isPending ? t("company.rewards.saving") : t("company.rewards.save")}
      </Button>
    </div>
  );
}
