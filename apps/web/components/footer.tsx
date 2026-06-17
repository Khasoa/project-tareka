"use client";

import Link from "next/link";

import { Logo } from "@/components/logo";
import { useI18n } from "@/lib/i18n/i18n-provider";

const link = "text-sm text-nav-muted transition-colors hover:text-nav-ink";
const colHead = "mb-5 text-[10px] font-medium uppercase tracking-[0.16em] text-nav-muted/70";

export function MarketingFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-nav-line bg-nav-chrome text-nav-ink">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">

          <div className="sm:col-span-2 lg:col-span-1">
            {/* Logo component handles the tareka. wordmark with correct accent */}
            <Logo href="/" variant="chrome" className="text-xl" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-nav-muted">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <p className={colHead}>{t("footer.colProduct")}</p>
            <ul className="space-y-3">
              <li><Link href="/directory"           className={link}>{t("footer.linkDirectory")}</Link></li>
              <li><Link href="/dashboard" className={link}>{t("footer.linkDashboard")}</Link></li>
              <li><Link href="/for-companies"        className={link}>{t("footer.linkBusinessConsole")}</Link></li>
            </ul>
          </div>

          <div>
            <p className={colHead}>{t("footer.colCompany")}</p>
            <ul className="space-y-3">
              <li><Link href="/" className={link}>{t("footer.linkStory")}</Link></li>
              <li><Link href="/" className={link}>{t("footer.linkHelp")}</Link></li>
            </ul>
          </div>

          <div>
            <p className={colHead}>{t("footer.colLegal")}</p>
            <ul className="space-y-3">
              <li><span className="text-sm text-nav-muted/45">{t("footer.privacy")}</span></li>
              <li><span className="text-sm text-nav-muted/45">{t("footer.terms")}</span></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar — tareka. wordmark with accent, year, location */}
      <div className="border-t border-nav-line/40 px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <p className="text-xs text-nav-muted/50">
            <span className="tabular-nums">{t("footer.copyright")} {year}</span>{" "}
            {/* Inline wordmark — accent-sage-ink resolves to pale sage on .dark */}
            <span className="font-heading font-semibold tracking-tight">
              <span className="text-nav-muted/50">ta</span>
              <span className="text-accent-sage-ink">re</span>
              <span className="text-nav-muted/50">ka</span>
              <span className="text-accent-sage-ink">.</span>
            </span>
          </p>
          <p className="text-xs text-nav-muted/40">{t("footer.location")}</p>
        </div>
      </div>
    </footer>
  );
}