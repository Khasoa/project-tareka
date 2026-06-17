"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";

import { useI18n } from "@/lib/i18n/i18n-provider";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import {
  getPartnerCatalogueBySlug,
  listParticipatingProductCompanies,
} from "@/services/marketplace.service";
import {
  getMockPartnerCatalogue,
  MARKETPLACE_MOCK_PARTNERS,
} from "@/lib/data/marketplace-mock";
import { withApiFallback } from "@/lib/data/api-fallback";
import { walletService, type WalletCompanyProgram } from "@/services/wallet.service";
import { useAuthStore } from "@/store/auth";
import type { CompanyProductSummary, RewardListItem } from "@/types";

import { formatRewardModels } from "./reward-model-present";

const PAGE_SIZE = 12;

interface CatalogueBrowserProps {
  partnerSlug?: string;
  heroTitle?: string;
  heroSub?: string;
}

function VerifiedRibbon({ verified }: { verified: boolean }) {
  const { t } = useI18n();
  if (!verified) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-accent-sage/35 bg-accent-sage/12 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-accent-sage">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-sage" aria-hidden />
      {t("marketplace.verifiedPartnerRibbon")}
    </span>
  );
}

/** Focus ring sits on charcoal — avoids light-mode offset halo inside `.dark` marketing shell. */
const focusRingCard =
  "outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1011]";

function CardShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border",
        "bg-surface shadow-[0_22px_64px_-24px_rgba(0,0,0,0.55)]",
        "transition-[border-color,box-shadow] duration-200 hover:border-accent-sage/25",
        "hover:shadow-[0_24px_70px_-20px_rgba(143,178,174,0.12)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function RewardImage({
  url,
  label,
}: {
  url: string | null;
  label: string;
}) {
  const { t } = useI18n();
  if (!url) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#171717] via-surface to-elevated p-6 text-center">
        <p className="text-[11px] leading-relaxed text-dim">
          {t("marketplace.imagePlaceholder", { label })}
        </p>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt="" src={url} className="h-full w-full object-cover opacity-95 transition-opacity group-hover:opacity-100" />;
}

/** Root marketplace — partner hubs with catalogue entry point */
function ParticipatingPartnerCard({ company }: { company: CompanyProductSummary }) {
  const { t } = useI18n();
  const mats = company.materials_preview ?? [];
  const rewards = company.reward_offerings ?? [];
  const href = `/marketplace/${encodeURIComponent(company.slug)}`;
  const fallbackDesc =
    mats.length > 0 ? mats.slice(0, 4).join(" · ") : t("marketplace.cardFallbackDescription");

  return (
    <CardShell>
      <Link href={href} className={cn("relative flex flex-1 flex-col text-left", focusRingCard)}>
        <div className="relative flex aspect-[16/10] shrink-0 items-center justify-center overflow-hidden bg-elevated">
          {company.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-heading select-none text-3xl font-semibold text-accent-sage/55" aria-hidden>
              {company.name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/92 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-border/80 bg-background/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-dim backdrop-blur-sm">
              {t("marketplace.participationBadge")}
            </span>
            <VerifiedRibbon verified={company.is_verified} />
          </div>
        </div>
        <div className="flex flex-1 flex-col px-4 py-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-heading flex-1 text-sm font-semibold leading-snug text-foreground">{company.name}</p>
            {company.region_label ? (
              <span className="shrink-0 rounded-md border border-map-glow/22 bg-map-glow/[0.06] px-2 py-0.5 text-[10px] font-medium text-map-glow/90">
                {company.region_label}
              </span>
            ) : null}
          </div>
          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-dim">
            {company.description?.trim() || fallbackDesc}
          </p>
          {mats.length > 0 ? (
            <p className="mt-3 text-[10px] leading-relaxed text-muted">
              <span className="font-semibold text-dim">{t("marketplace.materialsLabel")}</span>{" "}
              {mats.slice(0, 5).join(" · ")}
            </p>
          ) : null}
          {rewards.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {rewards.map((label) => (
                <span
                  key={label}
                  className="rounded-md border border-border bg-surface-raised/60 px-2 py-0.5 text-[10px] text-muted"
                >
                  {label}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-[11px] text-muted">
            <span className="tabular-nums">
              {company.product_count === 1
                ? t("marketplace.offerCountSingular", { count: company.product_count })
                : t("marketplace.offerCountPlural", { count: company.product_count })}
            </span>
            <span className="font-semibold uppercase tracking-[0.1em] text-accent-sage">{t("marketplace.viewCatalogueCta")}</span>
          </div>
        </div>
      </Link>
    </CardShell>
  );
}

function RewardEligibilityHint({
  tokenRequirement,
  isDiscountable,
  walletLoading,
  walletProgram,
  personalized,
}: {
  tokenRequirement: number | null;
  isDiscountable: boolean;
  walletLoading: boolean;
  walletProgram: WalletCompanyProgram | undefined;
  personalized: boolean;
}) {
  const { t } = useI18n();

  if (!personalized) return null;

  if (walletLoading) {
    return <p className="mt-2 text-[10px] text-dim/80">{t("marketplace.eligibilityLoading")}</p>;
  }

  if (tokenRequirement == null) {
    if (isDiscountable) {
      return <p className="mt-2 text-[10px] text-dim">{t("marketplace.redeemablePartnerRewards")}</p>;
    }
    return null;
  }

  if (!walletProgram?.linked || walletProgram.token_balance == null) {
    return <p className="mt-2 text-[10px] text-dim">{t("marketplace.noProgramWallet")}</p>;
  }

  const bal = Number(walletProgram.token_balance);
  if (!Number.isFinite(bal)) return null;

  if (bal >= tokenRequirement) {
    return <p className="mt-2 text-[10px] font-medium text-accent-sage/95">{t("marketplace.eligibleWithBalance")}</p>;
  }

  const need = Math.max(0, Math.ceil(tokenRequirement - bal));
  return <p className="mt-2 text-[10px] text-dim">{t("marketplace.needsMoreTokens", { count: need })}</p>;
}

function PartnerRewardCard({
  partnerName,
  partnerVerified,
  item,
  walletLoading,
  walletProgram,
  personalized,
}: {
  partnerName: string;
  partnerVerified: boolean;
  item: RewardListItem;
  walletLoading: boolean;
  walletProgram: WalletCompanyProgram | undefined;
  personalized: boolean;
}) {
  const { t } = useI18n();
  const href = `/marketplace/reward/${encodeURIComponent(item.id)}`;
  return (
    <CardShell>
      <Link href={href} className={cn("flex h-full flex-col text-left", focusRingCard)}>
        <div className="relative aspect-[16/10] overflow-hidden bg-elevated">
          <RewardImage url={item.image_url} label={partnerName} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/92 to-transparent" />
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <VerifiedRibbon verified={partnerVerified} />
            {item.token_requirement != null ? (
              <span className="rounded-md bg-accent-sage/14 px-2 py-0.5 text-[10px] font-semibold text-accent-sage">
                {item.token_requirement} tokens
              </span>
            ) : item.is_discountable ? (
              <span className="rounded-md bg-accent-sage/10 px-2 py-0.5 text-[10px] font-semibold text-accent-sage">
                Discount pathway
              </span>
            ) : null}
          </div>
          <p className="font-heading text-sm font-semibold text-foreground">{item.title}</p>
          <p className="mt-2 line-clamp-2 flex-1 text-xs text-dim">{item.short_description ?? t("marketplace.cardPartnerOffer")}</p>
          <RewardEligibilityHint
            tokenRequirement={item.token_requirement}
            isDiscountable={item.is_discountable}
            walletLoading={walletLoading}
            walletProgram={walletProgram}
            personalized={personalized}
          />
          <Link
            href="/marketplace"
            prefetch={false}
            className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-map-glow/90 hover:text-map-glow"
          >
            <span aria-hidden>&larr;</span> {t("marketplace.backToMarketplace")}
          </Link>
        </div>
      </Link>
    </CardShell>
  );
}

function PartnerHubsSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardShell key={i} className="animate-pulse">
          <div className="aspect-[16/10] bg-elevated" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-[70%] rounded bg-elevated" />
            <div className="h-3 w-full rounded bg-elevated" />
            <div className="h-3 w-4/5 rounded bg-elevated" />
          </div>
        </CardShell>
      ))}
    </div>
  );
}

function PartnerRewardsSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardShell key={i} className="animate-pulse">
          <div className="aspect-[16/10] bg-elevated" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-[82%] rounded bg-elevated" />
            <div className="h-3 w-full rounded bg-elevated" />
          </div>
        </CardShell>
      ))}
    </div>
  );
}

export function CatalogueBrowser(props: CatalogueBrowserProps) {
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const { partnerSlug } = props;
  const slug = partnerSlug?.trim();

  const partnersStrip = useQuery({
    queryKey: queryKeys.marketplacePartnerStrip,
    queryFn: () =>
      withApiFallback(
        "marketplace partners",
        async () => {
          const data = await listParticipatingProductCompanies({ limit: 64, offset: 0 });
          if (data.items.length > 0) return data;
          return {
            items: MARKETPLACE_MOCK_PARTNERS,
            limit: 64,
            offset: 0,
            count: MARKETPLACE_MOCK_PARTNERS.length,
          };
        },
        () => ({
          items: MARKETPLACE_MOCK_PARTNERS,
          limit: 64,
          offset: 0,
          count: MARKETPLACE_MOCK_PARTNERS.length,
        }),
      ),
    staleTime: 60_000,
    enabled: !slug,
    placeholderData: { items: MARKETPLACE_MOCK_PARTNERS, limit: 64, offset: 0, count: MARKETPLACE_MOCK_PARTNERS.length },
  });

  const partnerCatalogue = useQuery({
    queryKey: queryKeys.partnerCatalogueSlug(slug ?? "~", PAGE_SIZE * 10, 0),
    enabled: Boolean(slug),
    queryFn: () =>
      withApiFallback(
        "partner catalogue",
        async () => {
          const data = await getPartnerCatalogueBySlug(slug!, { limit: PAGE_SIZE * 10, offset: 0 });
          if (data.products.items.length > 0) return data;
          const mock = getMockPartnerCatalogue(slug!);
          if (mock) return mock;
          throw new Error("Partner not found");
        },
        () => {
          const mock = getMockPartnerCatalogue(slug!);
          if (!mock) throw new Error("Partner not found");
          return mock;
        },
      ),
    placeholderData: slug ? getMockPartnerCatalogue(slug) ?? undefined : undefined,
  });

  const catalogueCompany = partnerCatalogue.data?.company;
  const recyclerPersonalized = Boolean(user?.role === "recycler" && slug && catalogueCompany?.id);

  const walletProgramQuery = useQuery({
    queryKey: queryKeys.walletProgramForCompany(user?.id ?? "~", catalogueCompany?.id ?? "~"),
    queryFn: () => walletService.getMyWalletForCompany(catalogueCompany!.id),
    enabled: recyclerPersonalized && Boolean(catalogueCompany?.id && user?.id),
    staleTime: 20_000,
  });

  const editorialTitle = useMemo(() => {
    if (props.heroTitle) return props.heroTitle;
    if (slug && catalogueCompany) return catalogueCompany.name;
    if (slug) return t("marketplace.catalogueTitleHub");
    return t("marketplace.catalogueTitleNetwork");
  }, [props.heroTitle, slug, catalogueCompany, t]);

  const editorialSub = useMemo(() => {
    if (props.heroSub) return props.heroSub;
    if (slug && catalogueCompany?.description?.trim()) return catalogueCompany.description.trim();
    if (slug) return t("marketplace.editorialSubSlug");
    return t("marketplace.editorialSubNetwork");
  }, [props.heroSub, slug, catalogueCompany, t]);

  const hubKicker = slug
    ? partnerCatalogue.isLoading && !catalogueCompany
      ? t("marketplace.partnerHubLabel")
      : catalogueCompany?.name ?? slug
    : t("marketplace.rewardsKicker");

  const partnerItems = partnersStrip.data?.items ?? [];

  return (
    <div className="mx-auto max-w-7xl pb-24">
      <header className="relative mb-12 max-w-2xl pt-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-accent-sage">{hubKicker}</p>
        <h1 className="font-heading mt-4 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {editorialTitle}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-dim">{editorialSub}</p>
        {!slug ? <p className="mt-3 max-w-xl text-sm leading-relaxed text-dim/90">{t("marketplace.rootFlowHint")}</p> : null}
      </header>

      {!slug ? (
        <section className="mb-14" aria-labelledby="partners-heading">
          <h2 id="partners-heading" className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-dim">
            {t("marketplace.participatingSectionTitle")}
          </h2>
          {partnersStrip.isLoading && partnerItems.length === 0 ? (
            <PartnerHubsSkeleton count={6} />
          ) : partnerItems.length === 0 ? (
            <p className="max-w-xl text-sm leading-relaxed text-dim">{t("marketplace.partnersEmpty")}</p>
          ) : (
            <>
              {partnersStrip.isError ? (
                <p className="mb-3 text-xs text-dim">Showing Nairobi partner previews — live catalogue syncing.</p>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {partnerItems.map((c) => (
                  <ParticipatingPartnerCard key={c.id} company={c} />
                ))}
              </div>
            </>
          )}
        </section>
      ) : null}

      {slug ? (
        partnerCatalogue.isLoading && !partnerCatalogue.data ? (
          <PartnerRewardsSkeleton count={8} />
        ) : partnerCatalogue.isError && !partnerCatalogue.data ? (
          <p className="text-sm text-accent-rose">This partner catalogue is unavailable.</p>
        ) : !partnerCatalogue.data?.products.items.length ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface px-10 py-16 text-center">
            <p className="font-heading text-lg font-semibold text-foreground">No published rewards for this hub</p>
            <Link
              href="/marketplace"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-accent-sage px-5 text-xs font-semibold text-[#161615] transition-colors hover:bg-accent-sage-hover"
            >
              Return to marketplace
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {partnerCatalogue.data.products.items.map((p) => (
              <PartnerRewardCard
                key={p.id}
                partnerName={partnerCatalogue.data!.company.name}
                partnerVerified={partnerCatalogue.data!.company.is_verified}
                item={p}
                walletLoading={Boolean(recyclerPersonalized && walletProgramQuery.isLoading)}
                walletProgram={walletProgramQuery.data}
                personalized={recyclerPersonalized}
              />
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}
