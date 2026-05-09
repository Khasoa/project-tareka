"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";

import { useI18n } from "@/lib/i18n/i18n-provider";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import {
  getMarketplaceFeed,
  getPartnerCatalogueBySlug,
  listParticipatingProductCompanies,
} from "@/services/marketplace.service";
import type { CompanyProductSummary, MarketplaceListingItem, RewardListItem } from "@/types";

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

function CardShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border",
        "bg-surface telemetry-panel shadow-[0_22px_64px_-24px_rgba(0,0,0,0.55)]",
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
    mats.length > 0
      ? mats.slice(0, 4).join(" · ")
      : t("marketplace.cardFallbackDescription");

  return (
    <CardShell>
      <Link
        href={href}
        className="relative flex flex-1 flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
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
          <div className="absolute left-3 bottom-3 right-3 flex flex-wrap items-center gap-2">
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

function MarketplaceCard({ item }: { item: MarketplaceListingItem }) {
  const { t } = useI18n();
  const href = `/marketplace/reward/${encodeURIComponent(item.id)}`;
  return (
    <CardShell>
      <Link
        href={href}
        className="relative flex flex-1 flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="relative aspect-[16/11] bg-elevated">
          <RewardImage url={item.image_url} label={item.company_name} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent" />
          <div className="absolute left-3 bottom-3 right-3 flex flex-wrap items-center gap-2">
            <VerifiedRibbon verified={item.partner_verified} />
            {item.environmental_category ? (
              <span className="rounded-md border border-border bg-background/85 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-dim backdrop-blur-sm">
                {item.environmental_category}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-1 flex-col px-4 py-4">
          <p className="font-heading text-sm font-semibold leading-snug text-foreground">{item.title}</p>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-dim">
            {item.short_description ?? t("marketplace.cardFallbackDescription")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3 text-[11px] text-muted">
            <span className="truncate font-medium text-foreground">{item.company_name}</span>
            {item.token_requirement != null ? (
              <span className="rounded-md bg-accent-sage/14 px-2 py-1 font-semibold text-accent-sage">
                {item.token_requirement} tokens
              </span>
            ) : (
              item.is_discountable && (
                <span className="rounded-md bg-accent-sage/10 px-2 py-1 font-medium text-accent-sage">Benefit</span>
              )
            )}
          </div>
          {item.reward_models.length > 0 ? (
            <p className="mt-2 text-[10px] leading-relaxed text-dim">{formatRewardModels(item.reward_models)}</p>
          ) : null}
          {item.availability_summary ? (
            <p className="mt-2 text-[10px] text-dim">{item.availability_summary}</p>
          ) : null}
        </div>
      </Link>
    </CardShell>
  );
}

function PartnerRewardCard({
  partnerName,
  partnerVerified,
  item,
}: {
  partnerName: string;
  partnerVerified: boolean;
  item: RewardListItem;
}) {
  const { t } = useI18n();
  const href = `/marketplace/reward/${encodeURIComponent(item.id)}`;
  return (
    <CardShell>
      <Link
        href={href}
        className="flex h-full flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-accent-sage focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
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

function FeedSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardShell key={i} className="animate-pulse">
          <div className="aspect-[16/11] bg-elevated" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-[82%] rounded bg-elevated" />
            <div className="h-3 w-full rounded bg-elevated" />
            <div className="h-3 w-5/6 rounded bg-elevated" />
          </div>
        </CardShell>
      ))}
    </div>
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

export function CatalogueBrowser(props: CatalogueBrowserProps) {
  const { t } = useI18n();
  const { partnerSlug } = props;
  const slug = partnerSlug?.trim();

  const partnersStrip = useQuery({
    queryKey: queryKeys.marketplacePartnerStrip,
    queryFn: () => listParticipatingProductCompanies({ limit: 64, offset: 0 }),
    staleTime: 60_000,
    enabled: !slug,
  });

  const aggregated = useInfiniteQuery({
    queryKey: queryKeys.marketplaceInfinite(slug),
    enabled: !slug,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) =>
      getMarketplaceFeed({
        limit: PAGE_SIZE,
        offset: typeof pageParam === "number" ? pageParam : 0,
      }),
    getNextPageParam: (last, allPages, lastOffset) => {
      const fetched = allPages.flatMap((p) => p.items).length;
      return fetched < last.total ? fetched : undefined;
    },
  });

  const partnerCatalogue = useQuery({
    queryKey: queryKeys.partnerCatalogueSlug(slug ?? "~", PAGE_SIZE * 10, 0),
    enabled: Boolean(slug),
    queryFn: () => getPartnerCatalogueBySlug(slug!, { limit: PAGE_SIZE * 10, offset: 0 }),
  });

  const allItems = useMemo(() => {
    if (!aggregated.data || slug) return [];
    return aggregated.data.pages.flatMap((p) => p.items);
  }, [aggregated.data, slug]);

  const totals = aggregated.data?.pages.at(-1);

  const catalogueCompany = partnerCatalogue.data?.company;

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
          {partnersStrip.isLoading ? (
            <PartnerHubsSkeleton count={6} />
          ) : partnersStrip.isError ? (
            <p className="text-sm text-accent-rose">{t("marketplace.partnersLoadError")}</p>
          ) : !(partnersStrip.data?.items.length) ? (
            <p className="max-w-xl text-sm leading-relaxed text-dim">{t("marketplace.partnersEmpty")}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {partnersStrip.data.items.map((c) => (
                <ParticipatingPartnerCard key={c.id} company={c} />
              ))}
            </div>
          )}
        </section>
      ) : null}

      {slug ? (
        partnerCatalogue.isLoading ? (
          <FeedSkeleton count={8} />
        ) : partnerCatalogue.isError ? (
          <p className="text-sm text-accent-rose">This partner catalogue is unavailable.</p>
        ) : !(partnerCatalogue.data?.products.items.length) ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface px-10 py-16 text-center telemetry-panel">
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
            {partnerCatalogue.data!.products.items.map((p) => (
              <PartnerRewardCard
                key={p.id}
                partnerName={partnerCatalogue.data!.company.name}
                partnerVerified={partnerCatalogue.data!.company.is_verified}
                item={p}
              />
            ))}
          </div>
        )
      ) : (
        <section className="space-y-6" aria-labelledby="network-feed-heading">
          <h2 id="network-feed-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-dim">
            {t("marketplace.networkRewardsSectionTitle")}
          </h2>
          {aggregated.isLoading ? (
            <FeedSkeleton count={8} />
          ) : aggregated.isError ? (
            <p className="text-sm text-accent-rose">Rewards catalogue could not be loaded.</p>
          ) : allItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface px-10 py-16 text-center telemetry-panel">
              <p className="font-heading text-lg font-semibold text-foreground">No published civic rewards yet</p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-dim">
                When verified partners activate offerings, vouchers, refills, and community benefits appear without a
                traditional storefront.
              </p>
              <Link
                href="/directory"
                className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-accent-sage px-5 text-xs font-semibold text-[#161615] transition-colors hover:bg-accent-sage-hover"
              >
                Find a verified site
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {allItems.map((item) => (
                <MarketplaceCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      )}

      {!slug && aggregated.hasNextPage ? (
        <div className="mt-14 flex justify-center">
          <button
            type="button"
            disabled={aggregated.isFetchingNextPage}
            onClick={() => aggregated.fetchNextPage()}
            className="inline-flex min-h-[44px] items-center rounded-lg border border-border bg-nav-chrome px-6 text-sm font-medium text-nav-ink transition-colors hover:border-accent-sage/40 disabled:opacity-55"
          >
            {aggregated.isFetchingNextPage ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}

      {!slug && totals?.total !== undefined ? (
        <p className="mt-12 text-center text-[11px] text-dim">
          Surfaced{" "}
          <span className="tabular-nums text-accent-sage">{allItems.length}</span>
          {" of "}
          <span className="tabular-nums text-accent-sage">{totals.total}</span>
          {" verified network listings"}
        </p>
      ) : null}
    </div>
  );
}
