"use client";

import type { CSSProperties } from "react";
import Image from "next/image";

import { Button } from "@/components/button";
import { LiveData } from "@/components/live-data";
import { SystemFlow } from "@/components/system-flow";
import { useI18n } from "@/lib/i18n/i18n-provider";

import { NetworkSection } from "./sections/network-section";

export function LandingPageClient() {
  return (
    <>
      {/* ── LIGHT band: hero + how-it-works + live data ── */}
      <div className="theme-light">
        <HeroSection />
        <HowItWorksSection />
        <LiveDataSection />
      </div>

      {/* ── DARK band: collection network (inherits .dark shell) ── */}
      <NetworkSection />

      {/* ── LIGHT band: value split / audience cards ── */}
      <div className="theme-light">
        <ValueSplit />
      </div>

      {/* ── DARK band: final CTA ── */}
      <FinalCTA />

      <div className="h-14 bg-dark-base" aria-hidden />
    </>
  );
}

/* ─── Hero — side-by-side ────────────────────────────────────────────────────── */

const MATERIALS = [
  { label: "Plastic", className: "bg-[#dbe6ee] text-[#2a5168]" },
  { label: "Glass",   className: "bg-[#dde7da] text-[#3f5d3d]" },
  { label: "Metal",   className: "bg-[#ece0c6] text-[#715619]" },
  { label: "Paper",   className: "bg-[#ecdcd6] text-[#8a4a3a]" },
] as const;

function HeroSection() {
  const { t } = useI18n();

  return (
    <section className="px-4 pb-16 pt-14 sm:px-6 lg:pt-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">

        {/* Left — text */}
        <div>
          <p className="inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.14em] text-accent-sage-ink">
            <span className="h-[7px] w-[7px] rounded-full bg-[color:var(--accent-sage-ink)]" aria-hidden />
            Nairobi · verified recycling
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {MATERIALS.map((m) => (
              <span key={m.label} className={`rounded-full px-3 py-1 text-xs font-medium ${m.className}`}>
                {m.label}
              </span>
            ))}
          </div>

          <h1 className="mt-5 font-heading text-[clamp(2.4rem,5vw,3.6rem)] font-bold leading-[1.04] tracking-[-0.022em] text-foreground">
            {t("landing.hero.line1")}{" "}
            <span className="text-accent-sage-ink">
              {t("landing.hero.line2Verb")} {t("landing.hero.line2Highlight")}
            </span>
          </h1>

          <p className="mt-4 max-w-[44ch] text-[17px] leading-relaxed text-muted">
            {t("landing.hero.intro")}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="/auth/register" variant="graphite" size="lg">
              {t("cta.startRecycling")}
            </Button>
            <Button href="/directory" variant="secondary" size="lg">
              {t("cta.findCollectionSite")}
            </Button>
          </div>
        </div>

        {/* Right — app image */}
        <div className="relative">
          <Image
            src="/marketing/hero-app.png"
            alt="The tareka. app open at a verified collection station, showing the map and impact record"
            width={1287}
            height={716}
            priority
            className="h-auto w-full rounded-2xl border border-border shadow-[0_18px_48px_rgba(22,22,21,0.12)]"
          />
        </div>

      </div>
    </section>
  );
}

/* ─── How it works ───────────────────────────────────────────────────────────── */

function HowItWorksSection() {
  const { t } = useI18n();
  return (
    <section className="px-4 pb-16 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <SystemFlow />
      </div>
    </section>
  );
}

/* ─── Live data ──────────────────────────────────────────────────────────────── */

function LiveDataSection() {
  return (
    <section className="px-4 pb-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="telemetry-panel relative rounded-2xl">
          <div className="pointer-events-none absolute left-6 top-0 h-px w-16 bg-accent-sage/25" aria-hidden />
          <LiveData />
        </div>
      </div>
    </section>
  );
}

/* ─── Value split ────────────────────────────────────────────────────────────── */

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
                {t("landing.value.recyclersHeadline")}<br />{t("landing.value.recyclersHeadlineBreak")}
              </h2>
              <p className="text-sm leading-relaxed text-muted">{t("landing.value.recyclersBody")}</p>
              <ul className="space-y-2.5">
                {recyclerBullets.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-sage-ink" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button href="/auth/register" variant="graphite">{t("cta.joinCommunity")}</Button>
            </div>
            <div className="space-y-4 lg:border-l lg:border-border lg:pl-12">
              <p className="text-[11px] font-medium uppercase tracking-[0.10em] text-dim">
                {t("landing.value.businessKicker")}
              </p>
              <h2 className="font-heading text-xl font-semibold tracking-[-0.018em] text-foreground sm:text-2xl">
                {t("landing.value.businessHeadline")}
              </h2>
              <p className="text-sm leading-relaxed text-muted">{t("landing.value.businessBody")}</p>
              <ul className="space-y-2.5">
                {businessBullets.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-sage-ink" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button href="/for-companies" variant="secondary">{t("cta.partnerWithUs")}</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA — dark band ──────────────────────────────────────────────────── */

function FinalCTA() {
  const { t } = useI18n();
  return (
    <section className="relative isolate overflow-hidden border-t border-white/[0.06] bg-dark-base">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{ background: "radial-gradient(ellipse 50% 70% at 26% 50%, rgba(161,201,152,0.13), transparent 60%)" }}
      />
      <div className="relative z-10 mx-auto grid max-w-[1120px] grid-cols-1 items-stretch md:grid-cols-2">
        <div className="self-center px-6 py-16 md:py-20 md:pr-12">
          <p className="inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.14em] text-accent-sage-ink">
            <span className="h-[7px] w-[7px] rounded-full bg-accent-sage shadow-[0_0_10px_var(--accent-sage)]" aria-hidden />
            {t("landing.finalCta.kicker")}
          </p>
          <h2 className="mt-3 font-heading text-[2.75rem] font-bold leading-tight tracking-[-0.022em] text-foreground">
            {t("landing.finalCta.headline")}
          </h2>
          <p className="mt-3 max-w-[36ch] text-base leading-relaxed text-muted">
            {t("landing.finalCta.body")}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="/auth/register" variant="primary" size="lg">{t("cta.getStarted")}</Button>
            <Button href="/directory" variant="secondary" size="lg">{t("cta.findCollectionSite")}</Button>
          </div>
        </div>
        <div className="relative min-h-[430px] overflow-hidden border-l border-white/[0.12]">
          <Image
            src="/marketing/cta-bin.png"
            alt="A person holding a recycling bin of sorted materials"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function CheckIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden>
      <path d="M3 8l3.5 3.5 6.5-7" />
    </svg>
  );
}