"use client";

import Link from "next/link";

import { Button } from "@/components/button";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { cn } from "@/lib/utils";

function SectionKicker({ children, variant = "light" }: { children: React.ReactNode; variant?: "light" | "dark" }) {
  const dotClass = variant === "dark" ? "bg-accent-sage shadow-[0_0_8px_var(--accent-sage)]" : "bg-[color:var(--accent-sage-ink)]";
  const textClass = variant === "dark" ? "text-accent-sage" : "text-accent-sage-ink";
  return (
    <p className={cn("inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.14em]", textClass)}>
      <span className={cn("h-[7px] w-[7px] rounded-full", dotClass)} aria-hidden />
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

const OPS_FLOW = [
  { step: "01", key: "companies.card1Title" as const, bodyKey: "companies.card1Body" as const },
  { step: "02", key: "companies.card2Title" as const, bodyKey: "companies.card2Body" as const },
  { step: "03", key: "companies.card3Title" as const, bodyKey: "companies.card3Body" as const },
] as const;

const AUDIT_STEPS = [
  { key: "companies.auditStep1" as const },
  { key: "companies.auditStep2" as const },
  { key: "companies.auditStep3" as const },
] as const;

export function ForCompaniesClient() {
  const { t } = useI18n();

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

      {/* Dark — infrastructure visibility (full-width canvas + contained console) */}
      <section className="relative border-y border-white/[0.06] bg-dark-base px-4 py-14 sm:px-6 sm:py-16">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 30% 30%, rgba(161,201,152,0.11), transparent 65%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl">
          <SectionKicker variant="dark">{t("companies.s1Kicker")}</SectionKicker>
          <h2 className="mt-4 max-w-2xl font-heading text-2xl font-semibold tracking-[-0.018em] text-foreground sm:text-3xl">
            {t("companies.s1Title")}
          </h2>

          <div
            className={cn(
              "mt-10 overflow-hidden rounded-3xl",
              "border border-white/[0.08] bg-[#0D0F10]/90",
              "shadow-[0_28px_72px_-28px_rgba(0,0,0,0.7)] ring-1 ring-white/[0.05]",
            )}
          >
            <div className="border-b border-white/[0.06] px-5 py-3.5 sm:px-7">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-accent-sage">
                {t("companies.infraConsoleLabel")}
              </p>
            </div>

            <div className="grid gap-0 lg:grid-cols-3">
              {OPS_FLOW.map(({ step, key, bodyKey }, idx) => (
                <div
                  key={step}
                  className={cn(
                    "relative px-5 py-6 sm:px-7 sm:py-7",
                    idx < OPS_FLOW.length - 1 && "border-b border-white/[0.06] lg:border-b-0 lg:border-r",
                  )}
                >
                  {idx < OPS_FLOW.length - 1 ? (
                    <span
                      className="pointer-events-none absolute right-0 top-1/2 hidden h-px w-6 -translate-y-1/2 translate-x-1/2 bg-accent-sage/30 lg:block"
                      aria-hidden
                    />
                  ) : null}
                  <p className="mb-3 font-mono text-xs tracking-widest text-accent-sage">{step}</p>
                  <h3 className="mb-2 text-base font-semibold text-foreground">{t(key)}</h3>
                  <p className="text-sm leading-relaxed text-muted">{t(bodyKey)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-white/[0.06] px-5 py-4 sm:px-7">
              <p className="text-xs leading-relaxed text-dim">{t("companies.infraNote")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Light business value */}
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

      {/* Dark — compliance & traceability (contained audit panel, distinct layout) */}
      <section className="relative border-t border-white/[0.06] bg-dark-base px-4 py-14 sm:px-6 sm:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(161,201,152,0.04) 50%, transparent 100%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start lg:gap-12">
            <div className="lg:pt-4">
              <SectionKicker variant="dark">{t("companies.s3Kicker")}</SectionKicker>
              <h2 className="mt-4 font-heading text-2xl font-semibold tracking-[-0.018em] text-foreground sm:text-3xl">
                {t("companies.s3Title")}
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
                {t("companies.s3Body")}
              </p>
            </div>

            <div
              className={cn(
                "rounded-2xl border border-dashed border-white/[0.12] bg-[#0D0F10]/80 p-6 sm:p-8",
                "shadow-[0_24px_56px_-28px_rgba(0,0,0,0.6)]",
              )}
            >
              <p className="mb-6 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-dim">
                {t("companies.auditTrailLabel")}
              </p>
              <ol className="relative space-y-0">
                {AUDIT_STEPS.map(({ key }, idx) => (
                  <li key={key} className="relative flex gap-4 pb-8 last:pb-0">
                    {idx < AUDIT_STEPS.length - 1 ? (
                      <span
                        className="absolute left-[11px] top-6 h-[calc(100%-12px)] w-px bg-accent-sage/25"
                        aria-hidden
                      />
                    ) : null}
                    <span
                      className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-sage/40 bg-surface text-[10px] font-semibold text-accent-sage"
                      aria-hidden
                    >
                      {idx + 1}
                    </span>
                    <p className="pt-0.5 text-sm leading-relaxed text-muted">{t(key)}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-6 border-t border-white/[0.06] pt-5 text-xs leading-relaxed text-dim">
                {t("companies.auditFootnote")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dark CTA — conversion (full-width, centered, no image) */}
      <section className="relative overflow-hidden border-t border-white/[0.06] bg-dark-base">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 45% 65% at 50% 100%, rgba(161,201,152,0.10), transparent 68%)",
          }}
        />
        <div className="relative mx-auto max-w-xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <SectionKicker variant="dark">{t("companies.s4Kicker")}</SectionKicker>
          <h2 className="mt-4 font-heading text-2xl font-semibold tracking-[-0.018em] text-foreground sm:text-3xl">
            {t("companies.s4Title")}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted sm:text-base">
            {t("companies.s4Body")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="/company/request-access" variant="primary" size="lg" className="rounded-xl px-6">
              {t("companies.s3Button")}
            </Button>
          </div>
          <p className="mt-5 text-xs text-dim">
            {t("companies.s3FinePrint")}{" "}
            <Link href="/company/login" className="font-medium text-accent-sage transition-opacity hover:opacity-85">
              {t("nav.companyLogin")}
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
