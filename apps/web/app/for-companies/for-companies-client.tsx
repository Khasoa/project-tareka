"use client";

import Link from "next/link";

import { Button } from "@/components/button";
import { useI18n } from "@/lib/i18n/i18n-provider";

function SectionKicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.14em] text-accent-sage-ink">
      <span className="h-[7px] w-[7px] rounded-full bg-[color:var(--accent-sage-ink)]" aria-hidden />
      {children}
    </p>
  );
}

function CheckRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-muted">
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 h-4 w-4 shrink-0 text-accent-sage-ink"
        aria-hidden
      >
        <path d="M3 8l3.5 3.5 6.5-7" />
      </svg>
      {children}
    </li>
  );
}

export function ForCompaniesClient() {
  const { t } = useI18n();

  const cards = [
    { num: "01", titleKey: "companies.card1Title" as const, bodyKey: "companies.card1Body" as const },
    { num: "02", titleKey: "companies.card2Title" as const, bodyKey: "companies.card2Body" as const },
    { num: "03", titleKey: "companies.card3Title" as const, bodyKey: "companies.card3Body" as const },
  ];

  const bullets = [
    "companies.trustBullet1",
    "companies.trustBullet2",
    "companies.trustBullet3",
    "companies.trustBullet4",
    "companies.trustBullet5",
  ] as const;

  return (
    <>
      {/* Light parchment hero */}
      <div className="theme-light">
        <section className="px-4 pb-16 pt-14 sm:px-6 lg:pt-20">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <SectionKicker>{t("companies.heroKicker")}</SectionKicker>
              <h1 className="mt-4 font-heading text-[clamp(2.2rem,4.5vw,3.4rem)] font-bold leading-[1.08] tracking-[-0.022em] text-foreground">
                {t("companies.heroTitle1")}{" "}
                <span className="text-accent-sage-ink">{t("companies.heroTitleAccent")}</span>
              </h1>
              <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted">
                {t("companies.heroBody")}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button href="/company/request-access" variant="graphite" size="lg">
                  {t("companies.ctaRequest")}
                </Button>
                <Button href="/directory" variant="secondary" size="lg">
                  {t("companies.ctaDirectory")}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Dark infrastructure — what tareka helps companies do */}
      <section className="relative border-y border-white/[0.06] bg-dark-base px-4 py-14 sm:px-6 sm:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 55% 60% at 18% 20%, rgba(161,201,152,0.10), transparent 62%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl">
          <SectionKicker>{t("companies.s1Kicker")}</SectionKicker>
          <h2 className="mt-4 max-w-2xl font-heading text-2xl font-semibold tracking-[-0.018em] text-foreground sm:text-3xl">
            {t("companies.s1Title")}
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map(({ num, titleKey, bodyKey }) => (
              <div
                key={num}
                className="rounded-2xl border border-white/[0.08] bg-surface/90 p-6 shadow-[0_22px_64px_-28px_rgba(0,0,0,0.55)]"
              >
                <p className="mb-3 font-mono text-xs tracking-widest text-accent-sage">{num}</p>
                <h3 className="mb-2 text-base font-semibold text-foreground">{t(titleKey)}</h3>
                <p className="text-sm leading-relaxed text-muted">{t(bodyKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Light business value — records your team can rely on */}
      <div className="theme-light">
        <section className="px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-3xl border border-border bg-surface-raised px-8 py-10 sm:px-11 sm:py-11 lg:px-14">
              <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.10em] text-dim">
                    {t("companies.s2Kicker")}
                  </p>
                  <h2 className="mt-3 font-heading text-2xl font-semibold tracking-[-0.018em] text-foreground sm:text-3xl">
                    {t("companies.s2Title1")}
                    <br />
                    {t("companies.s2Title2")}
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-muted">{t("companies.s2Body")}</p>
                </div>
                <ul className="space-y-3">
                  {bullets.map((key) => (
                    <CheckRow key={key}>{t(key)}</CheckRow>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Dark verification / compliance */}
      <section className="border-t border-white/[0.06] bg-dark-base px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
            <div>
              <SectionKicker>{t("companies.s3Kicker")}</SectionKicker>
              <h2 className="mt-4 font-heading text-2xl font-semibold tracking-[-0.018em] text-foreground sm:text-3xl">
                {t("companies.s3Title")}
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
                {t("companies.s3Body")}
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-surface/80 p-6 sm:p-8">
              <ul className="space-y-4 text-sm text-muted">
                {bullets.slice(0, 3).map((key) => (
                  <CheckRow key={key}>{t(key)}</CheckRow>
                ))}
              </ul>
              <p className="mt-6 text-xs leading-relaxed text-dim">
                Verified partner access is reviewed before activation. Operational data stays within your
                organisation workspace — no public payout identities on the directory.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dark CTA */}
      <section className="relative overflow-hidden border-t border-white/[0.06] bg-dark-base">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 50% 70% at 50% 50%, rgba(161,201,152,0.12), transparent 65%)",
          }}
        />
        <div className="relative mx-auto max-w-xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <SectionKicker>{t("companies.s3Kicker")}</SectionKicker>
          <h2 className="mt-4 font-heading text-2xl font-semibold tracking-[-0.018em] text-foreground sm:text-3xl">
            {t("companies.s3Title")}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted sm:text-base">
            {t("companies.s3FinePrint")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="/company/request-access" variant="primary" size="lg" className="rounded-xl px-6">
              {t("companies.s3Button")}
            </Button>
          </div>
          <p className="mt-5 text-xs text-dim">
            Already verified?{" "}
            <Link href="/company/login" className="font-medium text-accent-sage-ink transition-opacity hover:opacity-85">
              {t("nav.companyLogin")}
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
