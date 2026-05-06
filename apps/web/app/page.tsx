import type React from "react";

import { Button } from "@/components/button";
import { HeroIllustration } from "@/components/hero-illustration";
import { PublicShell } from "@/components/layout/public-shell";
import { LiveData } from "@/components/live-data";
import { SystemFlow } from "@/components/system-flow";
import { NetworkSection } from "./sections/network-section";

// ─────────────────────────────────────────────────────────────────────────────
// Landing page — section rhythm
//
//   All outer sections share #161615 (no colour transitions between them).
//   Contrast is achieved through COMPOSITION — contained sage panels — not fog.
//
//   Hero + System Flow   dark            atmospheric, full-width
//   Live Metrics         dark + panel    centered sage rounded card
//   Network Map          dark            infrastructure map, full-width
//   Recycler / Company   dark + panel    sage rounded container, inset
//   Final CTA            dark            atmospheric, full-width
//   Footer               #1d1e1b         graphite, subtle h-16 fade-in
// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <PublicShell>
      <HeroAndFlow />

      <LiveDataSection />

      <NetworkSection />

      <ValueSplit />

      <FinalCTA />
      <div className="h-16" style={{ background: "linear-gradient(to bottom, #161615, #1d1e1b)" }} aria-hidden />
    </PublicShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1 + 2. Hero + System Flow — single warm graphite section
// ─────────────────────────────────────────────────────────────────────────────

function HeroAndFlow() {
  return (
    <section className="relative isolate overflow-hidden pb-20 pt-24 sm:pt-28 lg:pt-32">
      {/* Geometric corner node clusters */}
      <HeroIllustration />

      {/* Ambient sage glow — spans headline and flow */}
      <div className="pointer-events-none absolute inset-0 flex items-start justify-center" aria-hidden>
        <div
          className="mt-[-80px] h-[720px] w-[1040px] rounded-full opacity-[0.14] blur-[210px]"
          style={{ background: "radial-gradient(ellipse, #A8BFA6 0%, rgba(120,145,112,0.6) 45%, transparent 70%)" }}
        />
      </div>

      {/* Headline + CTAs */}
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h1 className="font-heading text-4xl font-semibold leading-[1.12] tracking-[-0.018em] text-[#E6E8E3] sm:text-5xl lg:text-[3.25rem]">
          Track recycling.{" "}
          <br className="hidden sm:block" />
          See{" "}
          <span className="text-accent-sage">impact.</span>
        </h1>

        <p className="mx-auto mt-8 max-w-md text-base leading-relaxed text-muted sm:text-lg">
          Every verified drop-off contributes to your impact record,
          and may earn recognition tokens from participating companies.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button href="/dashboard" variant="primary" size="lg">
            Start recycling smarter
          </Button>
          <Button href="/directory" variant="secondary" size="lg">
            Find a collection site
          </Button>
        </div>
      </div>

      {/* System Flow — same atmospheric section, no divider */}
      <div className="relative mx-auto mt-20 max-w-4xl px-4 sm:px-6">
        <SystemFlow />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Live Metrics — dark outer, centered contained sage panel
// ─────────────────────────────────────────────────────────────────────────────

function LiveDataSection() {
  return (
    <section className="py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Contained sage analytics panel */}
        <div
          className="sage-panel rounded-2xl"
          style={{
            background: "#A8BFA6",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.20), inset 0 -3px 10px rgba(22,22,21,0.09), 0 16px 48px rgba(22,22,21,0.22)",
          }}
        >
          <LiveData />
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Value Split — dark outer, large inset sage container
// ─────────────────────────────────────────────────────────────────────────────

function ValueSplit() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Inset sage container — dark background naturally frames it */}
        <div
          className="sage-panel rounded-3xl px-8 py-12 sm:px-12 lg:px-14"
          style={{
            background: "#A8BFA6",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -2px 10px rgba(22,22,21,0.06), 0 16px 56px rgba(22,22,21,0.20)",
          }}
        >
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">

          {/* For recyclers */}
          <div className="space-y-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.10em]" style={{ color: "rgba(22,22,21,0.60)" }}>
              For recyclers
            </p>
            <h2 className="font-heading text-xl font-semibold tracking-[-0.018em] sm:text-2xl" style={{ color: "#161615" }}>
              Find recycling points easily.
              <br />
              See impact grow over time.
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(22,22,21,0.76)" }}>
              Every kilogram of waste diverted from landfill is logged and
              attributed to you. Where companies have recognition programmes
              configured, your record may qualify for appreciation tokens or
              local partner rewards.
            </p>
            <ul className="space-y-2.5">
              {[
                "Impact dashboard with verified drop-off history",
                "Community leaderboards",
                "Recognition where companies have it enabled",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(22,22,21,0.76)" }}>
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "#2a3328" }} />
                  {item}
                </li>
              ))}
            </ul>
            <Button href="/dashboard" variant="graphite">
              Join the community
            </Button>
          </div>

          {/* For companies */}
          <div className="space-y-5 lg:pl-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.10em]" style={{ color: "rgba(22,22,21,0.60)" }}>
              For businesses
            </p>
            <h2 className="font-heading text-xl font-semibold tracking-[-0.018em] sm:text-2xl" style={{ color: "#161615" }}>
              Infrastructure for ESG reporting you can stand behind
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(22,22,21,0.76)" }}>
              Track corporate environmental impact with verified data you can
              reference in sustainability reports. tareka's ledger of confirmed
              drop-offs gives you numbers you can defend — not modelled estimates.
            </p>
            <ul className="space-y-2.5">
              {[
                "Data collection infrastructure",
                "Verifiable impact reports",
                "Configure recognition programmes for recyclers",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(22,22,21,0.76)" }}>
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "#2a3328" }} />
                  {item}
                </li>
              ))}
            </ul>
            <Button
              href="/companies"
              variant="secondary"
              className="!border-[rgba(22,22,21,0.22)] !text-[#2a2f28] hover:!bg-[rgba(22,22,21,0.07)] hover:!text-[#161615]"
            >
              Partner with us
            </Button>
          </div>

        </div>
        </div>{/* /sage container */}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Final CTA — dark atmospheric
// ─────────────────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="relative isolate overflow-hidden py-28">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
        <div
          className="h-[460px] w-[660px] rounded-full opacity-[0.13] blur-[160px]"
          style={{ background: "radial-gradient(ellipse, #A8BFA6 0%, rgba(120,145,112,0.55) 45%, transparent 72%)" }}
        />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-accent-sage">
          Get started
        </p>
        <h2 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.025em] text-foreground sm:text-4xl">
          Start your impact journey
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
          Join recyclers and collection partners across Kenya building a
          verifiable record of their contribution.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button href="/dashboard" variant="primary" size="lg">
            Get started
          </Button>
          <Button href="/directory" variant="secondary" size="lg">
            Find a collection site
          </Button>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Icon
// ─────────────────────────────────────────────────────────────────────────────

function CheckIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden>
      <path d="M3 8l3.5 3.5 6.5-7" />
    </svg>
  );
}
