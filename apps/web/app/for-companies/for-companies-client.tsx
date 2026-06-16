"use client";

import Link from "next/link";

import { Button } from "@/components/button";
import { useI18n } from "@/lib/i18n/i18n-provider";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.14em] text-dim">
      {children}
    </p>
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
      {/* ── Hero ── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
        <div className="max-w-2xl">
          <SectionLabel>{t("companies.heroKicker")}</SectionLabel>
          <h1 className="font-heading text-[2.25rem] font-semibold leading-[1.18] tracking-[-0.022em] text-foreground sm:text-5xl">
            {t("companies.heroTitle1")}
            <br />
            <span className="text-accent-sage-ink">{t("companies.heroTitleAccent")}</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {t("companies.heroBody")}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href="/company/request-access" variant="primary" size="lg" className="rounded-xl px-6">
              {t("companies.ctaRequest")}
            </Button>
            <Button href="/directory" variant="secondary" size="lg" className="rounded-xl px-6">
              {t("companies.ctaDirectory")}
            </Button>
          </div>
        </div>
      </section>

      {/* ── What tareka. helps companies do ── */}
      <section className="border-y border-border bg-surface-raised">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <SectionLabel>{t("companies.s1Kicker")}</SectionLabel>
          <h2 className="mb-8 font-heading text-2xl font-semibold tracking-[-0.018em] text-foreground sm:mb-10 sm:text-3xl">
            {t("companies.s1Title")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map(({ num, titleKey, bodyKey }) => (
              <div key={num} className="rounded-2xl border border-border bg-elevated p-6">
                <p className="mb-3 font-mono text-xs tracking-widest text-accent-sage-ink">{num}</p>
                <h3 className="mb-2 text-base font-semibold text-foreground">{t(titleKey)}</h3>
                <p className="text-sm leading-relaxed text-dim">{t(bodyKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Records your team can rely on ── */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionLabel>{t("companies.s2Kicker")}</SectionLabel>
            <h2 className="mb-4 font-heading text-2xl font-semibold tracking-[-0.018em] text-foreground sm:mb-5 sm:text-3xl">
              {t("companies.s2Title1")}<br />{t("companies.s2Title2")}
            </h2>
            <p className="text-sm leading-relaxed text-muted">{t("companies.s2Body")}</p>
          </div>
          <ul className="space-y-3">
            {bullets.map((key) => (
              <li key={key} className="flex items-start gap-3 rounded-xl border border-border bg-surface px-5 py-4">
                <span
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgba(161,201,152,0.18)]"
                  aria-hidden
                >
                  <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 text-accent-sage"
                    fill="none" stroke="currentColor" strokeWidth="1.6"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 5l2 2 4-4" />
                  </svg>
                </span>
                <span className="text-sm leading-snug text-muted">{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Access is reviewed before activation ── */}
      <section className="border-t border-border bg-surface-raised">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-xl text-center">
            <SectionLabel>{t("companies.s3Kicker")}</SectionLabel>
            <h2 className="mb-4 font-heading text-2xl font-semibold tracking-[-0.018em] text-foreground sm:text-3xl">
              {t("companies.s3Title")}
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-muted sm:text-base">{t("companies.s3Body")}</p>
            <Button href="/company/request-access" variant="primary" size="lg" className="rounded-xl px-6">
              {t("companies.s3Button")}
            </Button>
            <p className="mt-5 text-xs text-dim">
              {t("companies.s3FinePrint")}{" "}
              <Link href="/company/login" className="font-medium text-accent-sage-ink transition-opacity hover:opacity-85">
                {t("nav.companyLogin")}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}