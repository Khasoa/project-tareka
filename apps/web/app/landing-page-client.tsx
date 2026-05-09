"use client";

import type { CSSProperties } from "react";

import { Button } from "@/components/button";
import { HeroIllustration } from "@/components/hero-illustration";
import { LiveData } from "@/components/live-data";
import { SystemFlow } from "@/components/system-flow";
import { useI18n } from "@/lib/i18n/i18n-provider";

import { NetworkSection } from "./sections/network-section";

export function LandingPageClient() {
  return (
    <>
      <HeroAndFlow />
      <LiveDataSection />
      <NetworkSection />
      <ValueSplit />
      <FinalCTA />
      <div className="h-14 bg-dark-base" aria-hidden />
    </>
  );
}

function HeroAndFlow() {
  const { t } = useI18n();

  return (
    <section className="relative isolate overflow-hidden pb-20 pt-24 sm:pt-28 lg:pt-32">
      <HeroIllustration />

      <div className="pointer-events-none absolute inset-0 flex items-start justify-center" aria-hidden>
        <div
          className="mt-[-80px] h-[720px] w-[1040px] rounded-full opacity-[0.5] blur-[200px]"
          style={{
            background:
              "radial-gradient(ellipse, rgba(230,228,220,0.09) 0%, rgba(20,21,20,0.22) 45%, transparent 68%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h1 className="font-heading text-4xl font-semibold leading-[1.12] tracking-[-0.018em] text-foreground sm:text-5xl lg:text-[3.25rem]">
          {t("landing.hero.line1")} <br className="hidden sm:block" />
          {t("landing.hero.line2Verb")}{" "}
          <span className="text-accent-sage">{t("landing.hero.line2Highlight")}</span>
        </h1>

        <p className="mx-auto mt-8 max-w-md text-base leading-relaxed text-muted sm:text-lg">{t("landing.hero.intro")}</p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button href="/auth/register" variant="primary" size="lg">
            {t("cta.startRecycling")}
          </Button>
          <Button href="/directory" variant="secondary" size="lg">
            {t("cta.findCollectionSite")}
          </Button>
        </div>
      </div>

      <div className="relative mx-auto mt-20 max-w-4xl px-4 sm:px-6">
        <SystemFlow />
      </div>
    </section>
  );
}

function LiveDataSection() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="telemetry-panel relative rounded-2xl">
          <div
            className="pointer-events-none absolute left-6 top-0 h-px w-16 bg-accent-sage/25"
            aria-hidden
          />
          <LiveData />
        </div>
      </div>
    </section>
  );
}

function ValueSplit() {
  const { t } = useI18n();

  const recyclerBullets = [
    t("landing.value.recyclerBullet1"),
    t("landing.value.recyclerBullet2"),
    t("landing.value.recyclerBullet3"),
    t("landing.value.recyclerBullet4"),
  ];
  const businessBullets = [
    t("landing.value.businessBullet1"),
    t("landing.value.businessBullet2"),
    t("landing.value.businessBullet3"),
    t("landing.value.businessBullet4"),
  ];

  return (
    <section className="py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-border bg-surface-raised px-8 py-10 sm:px-11 sm:py-11 lg:px-14">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="space-y-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.10em] text-dim">
                {t("landing.value.recyclersKicker")}
              </p>
              <h2 className="font-heading text-xl font-semibold tracking-[-0.018em] text-foreground sm:text-2xl">
                {t("landing.value.recyclersHeadline")}
                <br />
                {t("landing.value.recyclersHeadlineBreak")}
              </h2>
              <p className="text-sm leading-relaxed text-secondary">{t("landing.value.recyclersBody")}</p>
              <ul className="space-y-2.5">
                {recyclerBullets.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-secondary">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-sage" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button href="/auth/register" variant="primary">
                {t("cta.joinCommunity")}
              </Button>
            </div>

            <div className="space-y-4 lg:border-l lg:border-border lg:pl-12">
              <p className="text-[11px] font-medium uppercase tracking-[0.10em] text-dim">
                {t("landing.value.businessKicker")}
              </p>
              <h2 className="font-heading text-xl font-semibold tracking-[-0.018em] text-foreground sm:text-2xl">
                {t("landing.value.businessHeadline")}
              </h2>
              <p className="text-sm leading-relaxed text-secondary">{t("landing.value.businessBody")}</p>
              <ul className="space-y-2.5">
                {businessBullets.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-secondary">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-sage" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button href="/for-companies" variant="secondary">
                {t("cta.partnerWithUs")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  const { t } = useI18n();

  return (
    <section className="relative isolate overflow-hidden py-28">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
        <div
          className="h-[460px] w-[660px] rounded-full opacity-[0.55] blur-[150px]"
          style={{
            background:
              "radial-gradient(ellipse, rgba(230,228,220,0.06) 0%, rgba(20,21,20,0.2) 50%, transparent 72%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-accent-sage">{t("landing.finalCta.kicker")}</p>
        <h2 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.025em] text-foreground sm:text-4xl">
          {t("landing.finalCta.headline")}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">{t("landing.finalCta.body")}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button href="/auth/register" variant="primary" size="lg">
            {t("cta.getStarted")}
          </Button>
          <Button href="/directory" variant="secondary" size="lg">
            {t("cta.findCollectionSite")}
          </Button>
        </div>
      </div>
    </section>
  );
}

function CheckIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
    >
      <path d="M3 8l3.5 3.5 6.5-7" />
    </svg>
  );
}
